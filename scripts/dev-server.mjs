import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../out/', import.meta.url));
const port = Number(process.env.PORT || 4174);
const host = process.env.HOST || '127.0.0.1';
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};
try { await stat(root); } catch (error) {
  console.error('Cannot serve out/. Run npm run build first:', error.message);
  process.exit(1);
}

const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  try {
    let requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (basePath) {
      if (requested === basePath || requested === `${basePath}/`) requested = '/';
      else if (requested.startsWith(`${basePath}/`)) requested = requested.slice(basePath.length);
      else { res.writeHead(404); res.end('Not found'); return; }
    }
    let target = resolve(root, `.${requested === '/' ? '/index.html' : requested}`);
    if (target !== resolve(root) && !target.startsWith(resolve(root) + sep)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    try {
      if ((await stat(target)).isDirectory()) {
        const index = resolve(target, 'index.html');
        try { await stat(index); target = index; }
        catch (error) { if (error.code === 'ENOENT') target += '.html'; else throw error; }
      }
    } catch (error) {
      if (error.code === 'ENOENT' && !extname(target)) target += '.html';
      else throw error;
    }
    const body = await readFile(target);
    res.writeHead(200, {
      'Content-Type': mime[extname(target)] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    if (error instanceof URIError) { res.writeHead(400); res.end('Bad request'); return; }
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') { res.writeHead(404); res.end('Not found'); return; }
    console.error('Static preview request failed:', error);
    res.writeHead(500); res.end('Internal server error');
  }
});
server.listen(port, host, () => console.log(`Static export preview: http://${host}:${port}${basePath || '/'}\nRun npm run build to refresh it. Ctrl+C stops the server.`));
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Stop the existing server or set PORT.` : error.message);
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
