import * as THREE from 'three';
import { OrbitControls } from '/legacy/vendor/OrbitControls.js';
import { SVGRenderer } from '/legacy/vendor/SVGRenderer.js';

export function initializeWorkspace(root, { profile, projects, stationCopy }) {
const $ = s => root.querySelector(s);
const $$ = s => [...root.querySelectorAll(s)];
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const defaults = {theme:'studio',accent:'#b6c7a3',light:100,speed:100,separation:0,gentle:matchMedia('(prefers-reduced-motion: reduce)').matches};
let saved={};try{saved=JSON.parse(localStorage.getItem('abhi-desk-look')||'{}');}catch{}
const settings={...defaults,...saved};
if(!['studio','dusk','daylight'].includes(settings.theme))settings.theme='studio';
if(!/^#[0-9a-f]{6}$/i.test(settings.accent))settings.accent=defaults.accent;
for(const [k,a,b] of [['light',50,160],['speed',20,200],['separation',0,100]])settings[k]=clamp(Number(settings[k])||defaults[k],a,b);
let flowOn=true,orbitOn=false,paused=false,selected=null,hovered=null,tourIndex=-1,workflowTimer=null,toastTimer;
let renderer,scene,camera,controls,world,keyLight,ambient,softAmbient,grid,ground,base,accentMat,accentSoft,glowMat,software=false;
const stations={},flows=[],floaters=[],rings=[],layers=[],animated=[];
const host=$('#scene');
let frameRequest=0,resizeObserver;
const previousTheme=document.body.dataset.theme;
const previousClasses=new Map(['gentle','focused','software-mode'].map(name=>[name,document.body.classList.contains(name)]));
const customProperties=['--bg','--panel','--text','--muted','--accent','--line'];
const previousCustomProperties=new Map(customProperties.map(name=>[name,document.documentElement.style.getPropertyValue(name)]));
const themes={studio:{bg:'#141a17',panel:'#1a211d',text:'#f0eee5',muted:'#9ba79d',base:'#26312b',floor:'#141a17',key:0xffe4c3},dusk:{bg:'#111923',panel:'#182330',text:'#e9f0f1',muted:'#94a8b9',base:'#24333e',floor:'#111923',key:0xc9ddff},daylight:{bg:'#e9e8dd',panel:'#f3f1e8',text:'#24332b',muted:'#65756b',base:'#c5c9b9',floor:'#e9e8dd',key:0xffefd6}};

const positions={discovery:new THREE.Vector3(-2.6,0,-1.35),incident:new THREE.Vector3(1.25,0,1.7),integrations:new THREE.Vector3(3.2,0,-1.65),fieldnotes:new THREE.Vector3(-3.45,0,2.35)};
const labelAnchors={discovery:[-.2,2.7,0],incident:[0,2,0],integrations:[.1,2.45,0],fieldnotes:[0,1.85,.2]};

function applyContent(){
  const fullName=profile.firstName+' '+profile.lastName;
  document.title=fullName+' — The Systems Desk';
  document.querySelector('#brand-name').textContent=fullName;
  const em=document.createElement('em');em.textContent=profile.lastName+'.';
  document.querySelector('#name').replaceChildren(document.createTextNode(profile.firstName),document.createElement('br'),em);
  const company=document.createElement('span');company.textContent='at '+profile.company;
  document.querySelector('.role').replaceChildren(document.createTextNode(profile.role+' '),company);
  document.querySelector('.intro-copy').replaceChildren(document.createTextNode(profile.intro),document.createElement('br'),document.createTextNode(profile.introNote));
  const facts=[profile.yearsAtCisco,profile.appCount];document.querySelectorAll('.facts strong').forEach((el,i)=>el.textContent=facts[i]);
  const foot=document.querySelectorAll('.intro-foot span');foot[0].textContent=('Based in '+profile.city+', '+profile.country).toUpperCase();foot[1].textContent='BUILDING SINCE '+profile.since;
  for(const button of document.querySelectorAll('.hotspot')){
    const copy=stationCopy[button.dataset.station];const target=button.querySelector('span:not(.hotspot-dot)');
    const parts=[];if(copy.eyebrow){const small=document.createElement('small');small.textContent=copy.eyebrow;parts.push(small);}parts.push(document.createTextNode(copy.label));target.replaceChildren(...parts);
  }
  for(const button of document.querySelectorAll('.project-dock [data-open]'))button.querySelector('span').textContent=stationCopy[button.dataset.open].nav;
}

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3600);}
function material(color,opts={}){return new THREE.MeshStandardMaterial({color,roughness:.66,metalness:.22,...opts});}
function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,mat,parent,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);}
function rounded(w,d,h,mat,parent,x=0,y=0,z=0,r=.15){const s=new THREE.Shape(),a=-w/2,b=-d/2;
  s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
  const g=software?new THREE.BoxGeometry(w,h,d,Math.max(2,Math.ceil(w*3)),1,Math.max(2,Math.ceil(d*3))):new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1});if(!software){g.rotateX(-Math.PI/2);g.translate(0,-h/2,0);}return mesh(g,mat,parent,x,y,z);
}
function ring(radius,tube,mat,parent,x=0,y=0,z=0){const m=mesh(new THREE.TorusGeometry(radius,tube,8,64),mat,parent,x,y,z);m.rotation.x=Math.PI/2;return m;}
function cylinder(radius,height,mat,parent,x=0,y=0,z=0){return mesh(new THREE.CylinderGeometry(radius,radius,height,40),mat,parent,x,y,z);}
function line(points,mat,parent=world,radius=.014){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),60,radius,6,false),mat,parent);}
function texture(text,sub=''){const c=document.createElement('canvas');c.width=768;c.height=440;const x=c.getContext('2d');x.fillStyle='#1d2a23';x.fillRect(0,0,768,440);x.strokeStyle='#8faaa3';x.lineWidth=2;x.strokeRect(24,24,720,392);x.fillStyle='#d4dfc6';x.font='24px monospace';x.fillText('abhi://'+sub,48,66);x.font='bold 47px Arial';x.fillText(text,48,140);x.strokeStyle='#9eb78e';x.lineWidth=4;for(let i=0;i<3;i++){x.strokeRect(55+i*230,240,180,68);if(i<2){x.beginPath();x.moveTo(235+i*230,274);x.lineTo(280+i*230,274);x.stroke();}}x.fillStyle='#a9bea3';x.font='17px monospace';['REQUIREMENTS','KNOWLEDGE','SOLUTION'].forEach((t,i)=>x.fillText(t,66+i*230,280));return new THREE.CanvasTexture(c);}
function makeStation(key,w,d){const g=new THREE.Group();g.position.copy(positions[key]);g.userData.station=key;g.userData.baseY=0;world.add(g);stations[key]=g;rounded(w,d,.17,material('#303c32'),g,0,.12,0);rounded(w+.09,d+.09,.055,accentMat,g,0,.02,0);return g;}

function createScene(){
  scene=new THREE.Scene();scene.background=new THREE.Color(themes[settings.theme].bg);scene.fog=new THREE.Fog(themes[settings.theme].bg,35,75);
  const probe=document.createElement('canvas');let hasGL=false;try{hasGL=!!probe.getContext('webgl2');}catch{}
  if(hasGL){renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.outputColorSpace=THREE.SRGBColorSpace;}
  else{software=true;renderer=new SVGRenderer();renderer.setQuality('high');renderer.setPrecision(2);renderer.domElement.classList.add('software-scene');document.body.classList.add('software-mode');$('.live-label').textContent='LIVE 3D / COMPATIBILITY';}
  renderer.domElement.setAttribute('aria-label','3D model of Abhinav’s engineering workbench. Drag to rotate, scroll to zoom.');renderer.domElement.tabIndex=0;host.prepend(renderer.domElement);
  camera=new THREE.OrthographicCamera(-8,8,6,-6,.1,150);camera.position.set(12,11,14);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.4,0);controls.enableDamping=true;controls.dampingFactor=.055;controls.minPolarAngle=.1;controls.maxPolarAngle=Math.PI*.46;controls.minZoom=.6;controls.maxZoom=2.3;controls.enablePan=true;controls.autoRotateSpeed=.55;
  controls.addEventListener('start',()=>{cameraMove=null;});
  ambient=new THREE.HemisphereLight(0xe2e8cf,0x22352c,2.1);scene.add(ambient);keyLight=new THREE.DirectionalLight(0xffe4c3,3.6);keyLight.position.set(-5,14,8);keyLight.castShadow=true;keyLight.shadow.mapSize.set(2048,2048);keyLight.shadow.camera.left=-12;keyLight.shadow.camera.right=12;keyLight.shadow.camera.top=12;keyLight.shadow.camera.bottom=-12;keyLight.shadow.normalBias=.035;scene.add(keyLight);
  const fill=new THREE.DirectionalLight(0x87aba0,2);fill.position.set(8,6,-6);scene.add(fill);
  if(software){softAmbient=new THREE.AmbientLight(0x87917e,1);scene.add(softAmbient);keyLight.intensity=.5;fill.intensity=.15;}
  world=new THREE.Group();scene.add(world);accentMat=material(settings.accent,{roughness:.35,metalness:.45,emissive:settings.accent,emissiveIntensity:.07});accentSoft=material(settings.accent,{transparent:true,opacity:.4,roughness:.22,metalness:.5});glowMat=new THREE.MeshBasicMaterial({color:settings.accent});
  ground=mesh(new THREE.PlaneGeometry(180,180),material(themes[settings.theme].floor,{roughness:1,metalness:0}),scene,0,-.7,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  base=rounded(12.9,8.2,.4,material(themes[settings.theme].base,{roughness:.85}),world,0,-.35,0,.35);
  rounded(13.04,8.34,.045,material('#66745c',{metalness:.55}),world,0,-.52,0,.37);
  grid=new THREE.GridHelper(12,36,0x78836d,0x78836d);grid.position.y=-.138;grid.scale.z=.62;grid.material.transparent=true;grid.material.opacity=.14;world.add(grid);
  const dotGeo=new THREE.SphereGeometry(.015,5,4),dotMat=new THREE.MeshBasicMaterial({color:0x71806c});const dots=new THREE.InstancedMesh(dotGeo,dotMat,391);let di=0;const matrix=new THREE.Matrix4();for(let x=-6;x<=6;x+=.5)for(let z=-3.5;z<=3.5;z+=.5){if(di<391){matrix.makeTranslation(x,-.117,z);dots.setMatrixAt(di++,matrix);}}dots.count=di;world.add(dots);

  const dark=material('#17241d',{roughness:.38,metalness:.5}),silver=material('#7b8b75',{roughness:.35,metalness:.75}),copper=material('#aa795b',{roughness:.42,metalness:.7}),paper=material('#b7c0ac',{roughness:.9,metalness:0});
  const d=makeStation('discovery',3.65,2.6);
  cylinder(.82,.13,dark,d,.48,.36,0);ring(.81,.035,copper,d,.48,.45,0);cylinder(.65,1.3,accentSoft,d,.48,1.06,0);
  for(let i=0;i<3;i++){const rr=ring(.69,.025,accentMat,d,.48,.54+i*.48,0);rings.push({mesh:rr,axis:'z',speed:.2+i*.1});}
  const core=mesh(new THREE.IcosahedronGeometry(.28,1),accentMat,d,.48,1.15,0);animated.push({mesh:core,type:'rotate',speed:.45});
  const orbitGroup=new THREE.Group();orbitGroup.position.set(.48,1.15,0);d.add(orbitGroup);for(let i=0;i<4;i++){const a=i*Math.PI/2;mesh(new THREE.SphereGeometry(.045,10,8),glowMat,orbitGroup,Math.cos(a)*.75,0,Math.sin(a)*.75);}animated.push({mesh:orbitGroup,type:'rotate',speed:.35});
  for(let i=0;i<3;i++){const page=rounded(1.1,.72,.025,paper,d,-.95,.62+i*.2,.15-i*.12,.04);page.rotation.y=-.15;layers.push({mesh:page,y:page.position.y,index:i+1});box(.65,.008,.012,accentMat,page,0,.018,-.12);box(.8,.008,.012,accentMat,page,0,.018,0);box(.45,.008,.012,accentMat,page,-.17,.018,.12);}
  const screen=new THREE.Group();screen.position.set(-.22,.8,-.92);screen.rotation.x=-.16;d.add(screen);box(2.3,1.35,.1,dark,screen,0,.7,0);const screenSurface=mesh(new THREE.PlaneGeometry(2.16,1.22),new THREE.MeshBasicMaterial(software?{color:'#1d3024'}:{map:texture(stationCopy.discovery.label,'discovery')}),screen,0,.7,.056);screenSurface.castShadow=false;if(software){for(let i=0;i<3;i++){box(.48,.28,.015,accentMat,screen,-.72+i*.72,.65,.07);if(i<2)box(.24,.015,.018,silver,screen,-.36+i*.72,.65,.08);}box(1.1,.025,.02,silver,screen,-.35,1.12,.07);}box(.08,.6,.08,silver,screen,0,-.1,0);rounded(.75,.4,.05,dark,screen,0,-.37,0,.05);

  const a=makeStation('incident',2.95,2.1);
  for(let i=0;i<2;i++){const x=i===0?-.62:.62;const processor=new THREE.Group();processor.position.set(x,.45,0);a.add(processor);cylinder(.35,.13,dark,processor,0,0,0);box(.54,.66,.54,dark,processor,0,.45,0);box(.48,.45,.014,accentSoft,processor,0,.48,.28);for(let k=0;k<3;k++)box(.27,.018,.02,accentMat,processor,0,.37+k*.1,.29);const top=mesh(new THREE.OctahedronGeometry(.23,0),i===0?accentMat:copper,processor,0,.98,0);animated.push({mesh:top,type:'rotate',speed:i===0?.4:-.3});layers.push({mesh:processor,y:.45,index:i+1});}
  const feedback=new THREE.CatmullRomCurve3([new THREE.Vector3(-.65,1.05,0),new THREE.Vector3(0,1.65,-.2),new THREE.Vector3(.65,1.05,0),new THREE.Vector3(0,.72,.7)],true);mesh(new THREE.TubeGeometry(feedback,80,.014,6,true),accentMat,a);for(let i=0;i<3;i++){const b=mesh(new THREE.SphereGeometry(.055,10,8),glowMat,a);flows.push({mesh:b,curve:feedback,phase:i/3,speed:.12,parent:a,station:'incident'});}

  const n=makeStation('integrations',3.25,2.3);
  for(let i=0;i<4;i++){const x=-.95+i*.53;const server=box(.42,1.3,.7,dark,n,x,.91,-.35);for(let j=0;j<4;j++){box(.3,.026,.012,silver,server,0,-.42+j*.23,.357);mesh(new THREE.SphereGeometry(.025,6,5),glowMat,server,.11,-.34+j*.23,.37);}layers.push({mesh:server,y:.91,index:i*.5+1});}
  for(let j=0;j<3;j++){cylinder(.4,.18,silver,n,.8,.42+j*.24,.62);ring(.4,.018,accentMat,n,.8,.51+j*.24,.62);}ring(.43,.025,copper,n,.8,1.05,.62);box(2.15,.07,.1,copper,n,-.1,1.75,-.58);

  const f=makeStation('fieldnotes',2.45,1.65);
  for(const [x,z,h,r] of [[-.42,-.35,1.3,.54],[.22,-.4,.85,.42],[.58,-.15,.63,.37]]){const mt=mesh(new THREE.ConeGeometry(r,h,5),material('#798875',{roughness:1,metalness:0}),f,x,.25+h/2,z);mt.rotation.y=.2;mesh(new THREE.ConeGeometry(r*.37,h*.28,5),paper,f,x,.25+h*.86,z);}
  for(const [x,z,h] of [[-.83,-.2,.48],[.8,-.49,.38],[-.2,-.68,.35]]){cylinder(.025,h*.4,copper,f,x,.28+h*.2,z);mesh(new THREE.ConeGeometry(h*.27,h*.8,7),material('#435f43'),f,x,.3+h*.6,z);}
  const cup=new THREE.Group();cup.position.set(.63,.38,.45);f.add(cup);mesh(new THREE.CylinderGeometry(.22,.17,.32,32,1,true),material('#a3b194',{roughness:.3}),cup,0,.1,0);cylinder(.192,.015,material('#211a12'),cup,0,.235,0);const handle=mesh(new THREE.TorusGeometry(.12,.035,8,24),copper,cup,.23,.1,0);handle.rotation.y=Math.PI/2;
  for(let i=0;i<2;i++){const steam=line([[0,0,0],[.06,.14,.03],[-.04,.3,0],[.03,.46,-.03]],new THREE.MeshBasicMaterial({color:0xb5c8ad,transparent:true,opacity:.25}),cup,.008);steam.position.set(i*.08-.04,.25,0);animated.push({mesh:steam,type:'steam',phase:i});}
  const notebook=box(.64,.07,.84,material('#967454'),f,-.5,.33,.53);notebook.rotation.y=-.22;box(.54,.015,.72,paper,notebook,0,.04,0);box(.025,.025,.8,copper,notebook,-.23,.05,0);

  const compass=new THREE.Group();compass.position.set(5.15,-.03,2.9);world.add(compass);cylinder(.42,.06,dark,compass);ring(.42,.025,copper,compass,0,.04,0);for(let i=0;i<12;i++){const tick=box(.012,.008,i%3===0?.12:.06,silver,compass,Math.sin(i*Math.PI/6)*.33,.04,Math.cos(i*Math.PI/6)*.33);tick.rotation.y=i*Math.PI/6;}const needle=mesh(new THREE.ConeGeometry(.055,.48,3),accentMat,compass,0,.075,0);needle.rotation.x=Math.PI/2;
  // A few deliberate material details around the physical board.
  for(let i=0;i<10;i++)box(.013,.008,i%2===0?.18:.09,silver,world,-5.7+i*.15,-.09,3.7);
  const pot=cylinder(.34,.4,dark,world,5.2,.06,-3.05);for(let i=0;i<7;i++){const leaf=mesh(new THREE.SphereGeometry(.22,10,8),material('#5f7959'),world,5.2+Math.sin(i*2.4)*.2,.58+i*.055,-3.05+Math.cos(i*2.4)*.2);leaf.scale.set(.36,2.3,.5);leaf.rotation.z=Math.sin(i)*.5;}

  const tracks=[{key:'discovery',p:[[-2.3,-.09,-2.7],[-2.3,-.09,-3.25],[3.2,-.09,-3.25],[3.2,-.09,-2.8]]},{key:'incident',p:[[-.8,-.09,-1.1],[-.25,-.09,-1.1],[-.25,-.09,.4],[1.25,-.09,.4]]},{key:'integrations',p:[[3.8,-.09,-.4],[4.75,-.09,-.4],[4.75,-.09,1.7],[2.8,-.09,1.7]]},{key:'fieldnotes',p:[[-2.5,-.09,2.3],[-1.7,-.09,2.3],[-1.7,-.09,3.15],[.6,-.09,3.15],[.6,-.09,2.8]]}];
  for(const t of tracks){const curve=new THREE.CatmullRomCurve3(t.p.map(p=>new THREE.Vector3(...p)),false,'centripetal');mesh(new THREE.TubeGeometry(curve,100,.014,6,false),accentMat,world);for(let i=0;i<3;i++){const b=mesh(new THREE.SphereGeometry(.035,8,6),glowMat,world);flows.push({mesh:b,curve,phase:i/3,speed:.055,station:t.key});}for(const p of [t.p[0],t.p.at(-1)])cylinder(.055,.015,accentMat,world,p[0],p[1],p[2]);}
  if(software){ground.visible=false;grid.visible=false;dots.visible=false;world.traverse(o=>{if(o.isMesh){o.material.flatShading=true;if(o.material.transparent&&o.material.opacity<.6)o.visible=false;}});}
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight,aspect=w/h;const span=Math.max(11.8,16.8/aspect);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();renderer.setSize(w,h);};resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
  bindCanvas();controls.update();applyLook();renderer.render(scene,camera);$('#loading').classList.add('done');frameRequest=requestAnimationFrame(frame);
}

let cameraMove=null,arrivalStart=performance.now(),last=performance.now(),clock=0,currentSeparation=0;
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function fly(target,offset,zoom=1){if(!camera)return;cameraMove={start:performance.now(),duration:settings.gentle?1:1150,from:camera.position.clone(),to:target.clone().add(offset),fromTarget:controls.target.clone(),target:target.clone(),fromZoom:camera.zoom,zoom};}
function overview(){selected=null;hovered=null;document.body.classList.remove('focused');$$('.project-dock button,.hotspot').forEach(b=>b.classList.remove('active','selected'));$('#scene-name').textContent='WORKSPACE / OVERVIEW';fly(new THREE.Vector3(0,.4,0),new THREE.Vector3(12,10.6,14),1);}
function focus(key){if(!stations[key])return;selected=key;document.body.classList.add('focused');$$('.project-dock button').forEach(b=>b.classList.toggle('active',b.dataset.open===key));$$('.hotspot').forEach(b=>b.classList.toggle('selected',b.dataset.station===key));$('#scene-name').textContent='WORKSPACE / '+projects[key].short.toUpperCase();const target=positions[key].clone().add(new THREE.Vector3(0,.6,0));if(!$('#detail-panel').hidden&&innerWidth>800)target.add(new THREE.Vector3(1.25,0,-.9));fly(target,new THREE.Vector3(9,7.5,11),innerWidth<800?1.25:1.45);}
function frame(now){const dt=clamp((now-last)/1000,0,.05);last=now;const moving=!paused&&!settings.gentle;if(moving)clock+=dt*(settings.speed/100);currentSeparation+=(settings.separation/100-currentSeparation)*Math.min(dt*5,1);
  if(cameraMove){const m=cameraMove,t=clamp((now-m.start)/m.duration,0,1),e=ease(t);camera.position.lerpVectors(m.from,m.to,e);controls.target.lerpVectors(m.fromTarget,m.target,e);camera.zoom=THREE.MathUtils.lerp(m.fromZoom,m.zoom,e);camera.updateProjectionMatrix();if(t===1)cameraMove=null;}
  for(const [i,[key,g]] of Object.entries(stations).entries()){const t=clamp(((now-arrivalStart)/1000-i*.09)/.95,0,1);const arrival=settings.gentle?0:Math.pow(1-t,3)*7;const lift=(hovered===key||selected===key)?.14:0;g.position.y+=(lift+arrival-g.position.y)*Math.min(dt*10,1);}
  for(const x of animated){if(x.type==='rotate'&&moving)x.mesh.rotation.y+=dt*x.speed*(settings.speed/100);if(x.type==='steam'){x.mesh.rotation.y=Math.sin(clock*.5+x.phase)*.5;x.mesh.material.opacity=.1+(Math.sin(clock*1.2+x.phase)+1)*.08;}}
  for(const x of rings){if(moving)x.mesh.rotation.z+=dt*x.speed;}
  for(const x of layers)x.mesh.position.y=x.y+currentSeparation*x.index*.46;
  for(const f of flows){f.mesh.visible=flowOn;const progress=((clock*f.speed+f.phase)%1+1)%1;f.mesh.position.copy(f.curve.getPointAt(clamp(progress,.000001,.999999)));f.mesh.scale.setScalar(selected===f.station?1.55:1);}
  controls.autoRotate=orbitOn&&moving&&!cameraMove;controls.update();renderer.render(scene,camera);
  const w=host.clientWidth,h=host.clientHeight;
  for(const b of $$('.hotspot')){const key=b.dataset.station,g=stations[key],v=new THREE.Vector3(...labelAnchors[key]);g.localToWorld(v);v.project(camera);const x=(v.x+1)*w/2,y=(-v.y+1)*h/2;const half=b.offsetWidth/2;b.style.transform=`translate(${clamp(x,half+4,w-half-4)-half}px,${clamp(y,35,h-95)}px)`;b.style.visibility=v.z>1?'hidden':'visible';}
  frameRequest=requestAnimationFrame(frame);
}
function bindCanvas(){const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,lastHover=0;const hit=e=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(Object.values(stations),true);for(const h of hits){let o=h.object;while(o){if(o.userData.station)return o.userData.station;o=o.parent;}}return null;};
  renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
  renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<7){const key=hit(e);if(key)openStation(key);}down=null;});
  renderer.domElement.addEventListener('pointermove',e=>{if(performance.now()-lastHover<65||down)return;lastHover=performance.now();hovered=hit(e);renderer.domElement.style.cursor=hovered?'pointer':'grab';});
  renderer.domElement.addEventListener('pointerleave',()=>{hovered=null;});
  renderer.domElement.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();overview();}if(e.key==='ArrowLeft')camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),-.08);if(e.key==='ArrowRight')camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),.08);});
}

function applyLook(){const t=themes[settings.theme];for(const [name,value] of Object.entries({bg:t.bg,panel:t.panel,text:t.text,muted:t.muted,accent:settings.accent,line:settings.theme==='daylight'?'#0000001a':'#ffffff18'}))document.documentElement.style.setProperty('--'+name,value);document.body.dataset.theme=settings.theme;document.body.classList.toggle('gentle',!!settings.gentle);$('#gentle').checked=!!settings.gentle;$('#accent').value=settings.accent;$('#accent-value').textContent=settings.accent.toUpperCase();for(const k of ['light','speed','separation'])$('#'+k).value=settings[k];$('#light-value').value=settings.light+'%';$('#speed-value').value=(settings.speed/100).toFixed(1)+'×';$('#separation-value').value=settings.separation+'%';$$('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===settings.theme));$('#explode-toggle').classList.toggle('active',settings.separation>0);$('#explode-toggle').setAttribute('aria-pressed',String(settings.separation>0));
  if(renderer&&base){scene.background.set(t.bg);scene.fog.color.set(t.bg);ground.material.color.set(t.floor);base.material.color.set(t.base);keyLight.color.set(t.key);keyLight.intensity=(software?.5:3.6)*settings.light/100;ambient.intensity=2.1*settings.light/100;if(softAmbient)softAmbient.color.set(0x87917e).multiplyScalar(settings.light/100);accentMat.color.set(settings.accent);accentMat.emissive.set(software?'#000000':settings.accent);accentSoft.color.set(settings.accent);glowMat.color.set(settings.accent);}
}
function panel(id,show=true){$('#'+id).hidden=!show;$('#customize').setAttribute('aria-expanded',String(!$('#custom-panel').hidden));}
function closeDetail(){clearInterval(workflowTimer);panel('detail-panel',false);overview();}
function stopTour(){tourIndex=-1;$('#tour-card').hidden=true;$('#tour').innerHTML='Take a guided tour <span>↗</span>';}
function openStation(key){if(!projects[key])return;stopTour();clearInterval(workflowTimer);panel('custom-panel',false);panel('detail-panel',true);const p=projects[key];
  $('#detail-content').innerHTML=`<div class="panel-top"><div><small>${key==='fieldnotes'?'OFF THE CLOCK':'INSIDE THE WORKSPACE'}</small><h2 id="detail-title">${p.title}</h2></div><button class="close" id="close-detail" aria-label="Close project">×</button></div><div class="detail-status">${p.status}</div><p class="detail-description">${p.description}</p><div class="tag-list">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><div class="detail-section"><h3>${key==='fieldnotes'?'ABOUT ME':'MY CONTRIBUTION'}</h3><p>${p.contribution}</p></div><div class="detail-section"><h3>${key==='fieldnotes'?'FIELD NOTES':'WHAT IT INVOLVES'}</h3><ul>${p.notes.map(t=>`<li>${t}</li>`).join('')}</ul></div>${p.steps?`<div class="detail-section"><h3>SEE THE WORKFLOW</h3><p class="demo-note">ILLUSTRATIVE WALKTHROUGH · FICTIONAL DATA</p><div class="workflow">${p.steps.map((s,i)=>`<div class="workflow-step" data-step="${i}"><small>${String(i+1).padStart(2,'0')}</small>${s}</div>`).join('')}</div><p id="demo-status" class="demo-note">${p.demo}</p><button id="play-demo" class="primary">Play example <span>→</span></button><button id="approve-demo" class="primary" hidden>Approve example <span>✓</span></button></div>`:`<div class="detail-section detail-links"><a href="${profile.youtube}" target="_blank" rel="noopener">Backpacking Abi on YouTube <span>↗</span></a><a href="${profile.github}" target="_blank" rel="noopener">Things I build on GitHub <span>↗</span></a></div>`}`;
  $('#close-detail').onclick=closeDetail;if(p.steps)$('#play-demo').onclick=()=>runDemo(key);focus(key);$('#close-detail').focus({preventScroll:true});
}
function runDemo(key){clearInterval(workflowTimer);const p=projects[key];let step=0;flowOn=true;$('#flow-toggle').classList.add('active');$('#flow-toggle').setAttribute('aria-pressed','true');$('#play-demo').hidden=true;const mark=()=>{$$('.workflow-step').forEach((el,i)=>{el.classList.toggle('current',i===step);el.classList.toggle('done',i<step);});$('#demo-status').textContent=p.steps[step]+' · simulated example';};
  const next=()=>{step++;if(step>=p.steps.length){clearInterval(workflowTimer);$$('.workflow-step').forEach(el=>{el.classList.remove('current');el.classList.add('done');});$('#demo-status').textContent=key==='incident'?'Feedback reaches the resolver for the next incident. The loop can repeat.':'Example complete. This is a conceptual walkthrough of the workflow.';$('#play-demo').hidden=false;$('#play-demo').innerHTML='Replay example <span>↻</span>';return;}
    mark();if(key==='discovery'&&step===3){clearInterval(workflowTimer);$('#demo-status').textContent='The example pauses here for a person to review the analysis.';$('#approve-demo').hidden=false;$('#approve-demo').onclick=()=>{$('#approve-demo').hidden=true;next();workflowTimer=setInterval(next,1450);};}}
  mark();workflowTimer=setInterval(next,1450);
}
function openJourney(){stopTour();clearInterval(workflowTimer);panel('custom-panel',false);panel('detail-panel',true);$('#detail-content').innerHTML=`<div class="panel-top"><div><small>BUILDING SINCE 2020</small><h2 id="detail-title">The journey so far.</h2></div><button class="close" id="close-detail" aria-label="Close journey">×</button></div><p class="detail-description">Six years at Cisco, growing across applications, enterprise integration, and applied AI.</p><div class="journey-item"><small>CURRENT · CISCO SYSTEMS</small><h3>Software Engineer 3</h3><p>Four Angular and Node.js applications. Enterprise APIs and data synchronization. Secure deployments on OpenShift. Now building finance discovery and incident resolution agents.</p></div><div class="journey-item"><small>JUN 2021 TO NOV 2023</small><h3>Software Engineer 2</h3><p>MuleSoft integrations, APIs for booking and reseller management, and a REST API for a BERT incident classification model.</p></div><div class="journey-item"><small>AUG 2020 TO JUN 2021</small><h3>Software Engineer</h3><p>Spring MVC services and a centralized monitoring dashboard for integration services.</p></div><div class="journey-item"><small>2016 TO 2020 · MAHE</small><h3>Computer Science</h3><p>Bachelor of Technology. Minor specialization in Big Data. CGPA 8.78.</p></div><div class="detail-section detail-links"><a href="/resume.pdf" target="_blank">Open résumé draft <span>↗</span></a></div>`;$('#close-detail').onclick=closeDetail;$('#close-detail').focus();fly(new THREE.Vector3(0,.5,0),new THREE.Vector3(11,14,12),.95);}
function openContact(){stopTour();panel('custom-panel',false);panel('detail-panel',true);$('#detail-content').innerHTML=`<div class="panel-top"><div><small>LET’S CONNECT</small><h2 id="detail-title">Start a conversation.</h2></div><button class="close" id="close-detail" aria-label="Close contact">×</button></div><p class="detail-description">Enterprise software, integrations, agentic AI, or a good trail. I’m happy to talk.</p><div class="detail-links"><a href="mailto:${profile.email}">Email Abhinav <span>↗</span></a><a href="${profile.linkedin}" target="_blank" rel="noopener">LinkedIn <span>↗</span></a><a href="${profile.github}" target="_blank" rel="noopener">GitHub <span>↗</span></a><a href="/resume.pdf" target="_blank">Résumé draft <span>↗</span></a></div>`;$('#close-detail').onclick=closeDetail;$('#close-detail').focus();}
const tourKeys=['discovery','incident','integrations','fieldnotes'];
function tourStep(index){clearInterval(workflowTimer);panel('custom-panel',false);panel('detail-panel',false);tourIndex=clamp(index,0,3);const key=tourKeys[tourIndex],p=projects[key];$('#tour-card').hidden=false;$('#tour-count').textContent=String(tourIndex+1).padStart(2,'0')+' / 04';$('#tour-title').textContent=p.title;$('#tour-copy').textContent=p.description;$('#tour-dots').innerHTML=tourKeys.map((_,i)=>`<i class="${i===tourIndex?'active':''}"></i>`).join('');$('#tour-next').textContent=tourIndex===3?'Back to overview ↗':'Next stop →';$('#tour-back').disabled=tourIndex===0;$('#tour').innerHTML='Tour in progress <span>↗</span>';focus(key);}

$$('[data-open]').forEach(b=>b.onclick=()=>b.dataset.open==='contact'?openContact():openStation(b.dataset.open));
$$('.hotspot').forEach(b=>{b.onclick=()=>openStation(b.dataset.station);b.onmouseenter=()=>hovered=b.dataset.station;b.onmouseleave=()=>hovered=null;});
$('#tour').onclick=()=>tourStep(0);$('#tour-next').onclick=()=>{if(tourIndex===3){stopTour();overview();}else tourStep(tourIndex+1);};$('#tour-back').onclick=()=>tourStep(tourIndex-1);$('#end-tour').onclick=()=>{stopTour();overview();};
$('#brand').onclick=$('#work-nav').onclick=$('#free-explore').onclick=()=>{stopTour();panel('detail-panel',false);panel('custom-panel',false);overview();};$('#journey-nav').onclick=openJourney;
$('#customize').onclick=()=>{stopTour();panel('detail-panel',false);panel('custom-panel',$('#custom-panel').hidden);};$$('[data-close]').forEach(b=>b.onclick=()=>panel(b.dataset.close,false));
$('#reset-view').onclick=()=>{stopTour();overview();};$('#zoom-in').onclick=()=>{if(camera){camera.zoom=clamp(camera.zoom*1.15,.6,2.3);camera.updateProjectionMatrix();}};$('#zoom-out').onclick=()=>{if(camera){camera.zoom=clamp(camera.zoom/1.15,.6,2.3);camera.updateProjectionMatrix();}};
$('#flow-toggle').onclick=()=>{flowOn=!flowOn;$('#flow-toggle').classList.toggle('active',flowOn);$('#flow-toggle').setAttribute('aria-pressed',String(flowOn));};
$('#explode-toggle').onclick=()=>{settings.separation=settings.separation>0?0:85;applyLook();};
$('#orbit-toggle').onclick=()=>{orbitOn=!orbitOn;$('#orbit-toggle').classList.toggle('active',orbitOn);$('#orbit-toggle').setAttribute('aria-pressed',String(orbitOn));};
$('#replay').onclick=()=>{arrivalStart=performance.now();if(settings.gentle)toast('Arrival animation is softened while reduced motion is enabled.');};
$('#pause-motion').onclick=()=>{paused=!paused;$('#pause-motion').textContent=paused?'▷':'Ⅱ';$('#pause-motion').setAttribute('aria-pressed',String(paused));$('#pause-motion').setAttribute('aria-label',paused?'Resume animations':'Pause animations');};
$$('[data-theme]').forEach(b=>b.onclick=()=>{settings.theme=b.dataset.theme;applyLook();});$$('[data-color]').forEach(b=>b.onclick=()=>{settings.accent=b.dataset.color;applyLook();});$('#accent').oninput=e=>{settings.accent=e.target.value;applyLook();};for(const key of ['light','speed','separation'])$('#'+key).oninput=e=>{settings[key]=+e.target.value;applyLook();};$('#gentle').onchange=e=>{settings.gentle=e.target.checked;applyLook();};
$$('[data-angle]').forEach(b=>b.onclick=()=>{$$('[data-angle]').forEach(x=>x.classList.toggle('active',x===b));const offsets={isometric:[12,10.6,14],overhead:[.01,21,.5],low:[14,5,16]};fly(controls?controls.target:new THREE.Vector3(),new THREE.Vector3(...offsets[b.dataset.angle]),camera?camera.zoom:1);});
$('#save-look').onclick=()=>{try{localStorage.setItem('abhi-desk-look',JSON.stringify(settings));toast('Your look is saved on this device.');}catch{toast('This browser could not save settings. Use Export settings instead.');}};
$('#export-look').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({name:'Abhinav Systems Desk',...settings},null,2)],{type:'application/json'}));a.download='abhinav-desk-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Settings exported.');};
$('#reset-look').onclick=()=>{Object.assign(settings,defaults);applyLook();overview();toast('Default look restored. Save it to replace your saved look.');};
$('#command-form').onsubmit=e=>{e.preventDefault();const v=$('#command').value.trim().toLowerCase();$('#command').value='';const first=v.split(/\s+/)[0];if(['tour','explore'].includes(first))tourStep(0);else if(['home','reset','overview','work'].includes(first)){stopTour();panel('detail-panel',false);overview();}else if(['discovery','finance'].includes(first))openStation('discovery');else if(['incident','agent'].includes(first))openStation('incident');else if(['integration','integrations','apis'].includes(first))openStation('integrations');else if(['about','coffee','fieldnotes','field'].includes(first))openStation('fieldnotes');else if(['journey','experience'].includes(first))openJourney();else if(first==='contact')openContact();else if(['customize','settings'].includes(first))$('#customize').click();else if(['explode','layers'].includes(first))$('#explode-toggle').click();else if(first==='orbit')$('#orbit-toggle').click();else if(first==='flow')$('#flow-toggle').click();else if(first==='help')toast('Commands: tour · discovery · incident · integrations · about · journey · contact · customize · explode · orbit · reset');else toast('Try discovery, incident, integrations, tour, or help.');};
const handleKeydown=e=>{if(e.key==='Escape'){stopTour();panel('custom-panel',false);panel('detail-panel',false);overview();$('#customize').focus();}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#command').focus();}};
root.addEventListener('keydown',handleKeydown);
applyContent();
applyLook();
try{createScene();}catch(error){console.error('3D initialization:',error);$('#loading').hidden=true;$('#fallback').hidden=false;$('#labels').hidden=true;$('#scene-name').textContent='WORKSPACE / PROJECT INDEX';toast('3D is unavailable here. Every project remains accessible in the project index.');}
return function cleanupWorkspace(){
  cancelAnimationFrame(frameRequest);
  resizeObserver?.disconnect();
  root.removeEventListener('keydown',handleKeydown);
  clearInterval(workflowTimer);
  clearTimeout(toastTimer);
  controls?.dispose();
  const geometries=new Set(),materials=new Set(),textures=new Set();
  scene?.traverse(object=>{
    if(object.geometry)geometries.add(object.geometry);
    const objectMaterials=Array.isArray(object.material)?object.material:object.material?[object.material]:[];
    for(const current of objectMaterials){
      materials.add(current);
      for(const value of Object.values(current))if(value?.isTexture)textures.add(value);
    }
  });
  textures.forEach(texture=>texture.dispose());
  materials.forEach(current=>current.dispose());
  geometries.forEach(geometry=>geometry.dispose());
  renderer?.dispose?.();
  renderer?.domElement.remove();
  for(const [name,present] of previousClasses)document.body.classList.toggle(name,present);
  if(previousTheme===undefined)delete document.body.dataset.theme;
  else document.body.dataset.theme=previousTheme;
  for(const [name,value] of previousCustomProperties){
    if(value)document.documentElement.style.setProperty(name,value);
    else document.documentElement.style.removeProperty(name);
  }
};
}
