import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory=process.argv[2]||'public';
if(!['public','out'].includes(directory)){console.error('Usage: node scripts/dev-server.mjs [public|out]');process.exit(1);}
const root=fileURLToPath(new URL(`../${directory}/`,import.meta.url));
const port=Number(process.env.PORT||(directory==='out'?4174:4173));
const host=process.env.HOST||'127.0.0.1';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
try{await stat(root);}catch(error){console.error(`Cannot serve ${directory}:`,error.message);process.exit(1);}
const server=createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  try{
    const requestedPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const pathname=requestedPath==='/'&&directory==='public'?'/legacy/index.html':requestedPath;
    let target=resolve(root,'.'+pathname);
    if(target!==resolve(root)&&!target.startsWith(resolve(root)+sep)){res.writeHead(403);res.end('Forbidden');return;}
    if((await stat(target)).isDirectory())target=resolve(target,'index.html');
    const body=await readFile(target);
    res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch(error){
    if(error instanceof URIError){res.writeHead(400);res.end('Bad request');return;}
    if(error.code==='ENOENT'||error.code==='ENOTDIR'){res.writeHead(404);res.end('Not found');return;}
    console.error('Static file request failed:',error);
    res.writeHead(500);res.end('Internal server error');
  }
});
server.listen(port,host,()=>console.log(directory==='out'
  ?`Static export preview is ready at http://${host}:${port}\nRebuild with npm run build to update it. Ctrl+C stops the server.`
  :`Legacy Systems Desk is ready at http://${host}:${port}\nEdit public/legacy/content.js or public/legacy/style.css, then refresh the browser. Ctrl+C stops the server.`));
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is in use. Stop the existing server or set PORT.`:error.message);process.exitCode=1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
