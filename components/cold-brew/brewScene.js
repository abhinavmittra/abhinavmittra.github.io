import * as THREE from 'three';
import { createFrameScheduler } from '../three/frameScheduler';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCoffeeBeanGeometry } from '../three/coffeeBean';
import { createBrewMotion } from './brewMotion';
import { createLiquidSurface } from '../three/liquidSurface';
import { coldBrew } from '../../content/cold-brew';
import { createColdBrewBottle } from '../three/coldBrewBottle';

/** @param {HTMLElement} host @param {{onRenderer?: (name:string)=>void}} options */
export function createBrewScene(host,{onRenderer}={}) {
  const motion=createBrewMotion();
  let scheduler=null;let sampleTime=0,sampleFrames=0;
  const loose=[];
  const track=(object,response=1)=>{loose.push({object,response,x:0,z:0,position:object.position.clone(),rotation:object.rotation.clone()});return object;};
  const scene=new THREE.Scene();scene.background=new THREE.Color(coldBrew.palette.stage);
  const probe=document.createElement('canvas');let hasGL=false;try{hasGL=!!probe.getContext('webgl2',{antialias:false});}catch{}
  let renderer,software=false;
  if(hasGL)try{renderer=new THREE.WebGLRenderer({canvas:probe,antialias:false});}catch{probe.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();}
  if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<800?1:1.5));renderer.shadowMap.enabled=innerWidth>=800;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;}
  else{software=true;renderer=new SVGRenderer();renderer.setQuality('high');renderer.setPrecision(2);renderer.domElement.classList.add('software-scene');}
  let environmentTarget;
  if(!software){const generator=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();environmentTarget=generator.fromScene(room,.04);scene.environment=environmentTarget.texture;scene.environmentIntensity=.65;room.dispose();generator.dispose();}
  const media=matchMedia('(prefers-reduced-motion: reduce)');let gentle=media.matches,spin=false,disposed=false,last=performance.now();
  const camera=new THREE.PerspectiveCamera(35,1,.1,60);camera.position.set(4.2,3.25,6.5);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.35,0);controls.enablePan=false;controls.enableDamping=true;controls.minDistance=4.7;controls.maxDistance=10;controls.minPolarAngle=.35;controls.maxPolarAngle=Math.PI*.55;
  controls.autoRotateSpeed=.75;
  renderer.domElement.setAttribute('aria-label','3D A•WAKE cold brew flask. Drag to rotate, scroll to zoom. Use left and right arrows to rotate.');renderer.domElement.tabIndex=0;host.prepend(renderer.domElement);
  const ambient=new THREE.HemisphereLight(0xfff4df,0x6a4930,software?2:2.5);scene.add(ambient);
  const key=new THREE.DirectionalLight(0xffe9cc,software?.6:3);key.position.set(3,7,5);key.castShadow=true;key.shadow.mapSize.set(512,512);scene.add(key);
  const fill=new THREE.DirectionalLight(0xf0f4f5,software?.4:1.8);fill.position.set(-5,3,1);scene.add(fill);
  const model=createColdBrewBottle({software,onUpdate:()=>scheduler?.request()});model.group.rotation.y=.55;model.group.position.y=.165;scene.add(model.group);
  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.85,.2,64),new THREE.MeshStandardMaterial({color:'#aaa182',roughness:1,metalness:0}));plinth.position.y=.05;plinth.receiveShadow=true;scene.add(plinth);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(1.8,.018,6,64),new THREE.MeshStandardMaterial({color:coldBrew.palette.olive,metalness:.15,roughness:.8}));lip.rotation.x=Math.PI/2;lip.position.y=.16;scene.add(lip);
  // A serving table: a folded cloth, a glass with ice, and full-sized ingredients.
  const make=(geo,mat,parent,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const linen=new THREE.MeshStandardMaterial({color:coldBrew.palette.paper,roughness:1});
  const cloth=make(new THREE.BoxGeometry(1.45,.035,1.05,8,1,8),linen,scene,-.72,.18,.65);cloth.rotation.y=-.3;
  for(let i=0;i<7;i++){const stitch=make(new THREE.BoxGeometry(.005,.004,.94),new THREE.MeshStandardMaterial({color:'#c4b695',roughness:1}),cloth,-.65+i*.21,.02,0);}
  const tumbler=new THREE.Group();tumbler.position.set(-1.18,.22,.8);scene.add(tumbler);
  const glassMat=new THREE.MeshStandardMaterial({color:'#ddd2b6',roughness:.12,metalness:.1,transparent:!software,opacity:software?1:.26,side:THREE.DoubleSide,depthWrite:false});
  make(new THREE.CylinderGeometry(.35,.29,.91,32,1,true),glassMat,tumbler,0,.46,0);
  const coffeeMat=new THREE.MeshStandardMaterial({color:new THREE.Color('#3c2315').multiplyScalar(software?1:.35),roughness:.26});
  const drink=make(new THREE.CylinderGeometry(.317,.27,.61,32),coffeeMat,tumbler,0,.32,0);
  drink.name='Coffee surface responding to the turntable';
  const tiltDrink=createLiquidSurface(drink.geometry,.61);
  const rim=make(new THREE.TorusGeometry(.35,.016,6,40),new THREE.MeshStandardMaterial({color:'#d8cba9',roughness:.2}),tumbler,0,.92,0);rim.rotation.x=Math.PI/2;
  const ice=[];
  for(let i=0;i<3;i++){const cube=make(new THREE.BoxGeometry(.22,.2,.22),new THREE.MeshStandardMaterial({color:'#c5c6ac',roughness:.2,metalness:.05,transparent:!software,opacity:software?1:.72}),tumbler,Math.cos(i*2.1)*.13,.68+(i%2)*.035,Math.sin(i*2.1)*.13);cube.rotation.set(.12,i*1.3,.15);ice.push({cube,position:cube.position.clone(),rotation:cube.rotation.clone()});}
  const ingredientGroups={};
  // SVG has no environment map or tone mapping; only WebGL needs compensation.
  const roastLighting=software?1:.28;
  const brown=new THREE.MeshStandardMaterial({color:new THREE.Color('#56331f').multiplyScalar(roastLighting),roughness:.94,metalness:0,vertexColors:true,envMapIntensity:.3});
  const targetRoast=new THREE.Color('#56331f').multiplyScalar(roastLighting);
  const beanGeometry=createCoffeeBeanGeometry(software);
  function bean(parent,x,y,z,rotation=0,scale=1){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;g.scale.setScalar(scale);parent.add(g);
    const body=make(beanGeometry,brown,g);body.name='Coffee bean with a recessed centre crease';return track(g);
  }

  for(let i=0;i<17;i++){const t=i*2.399,r=1.28+(i%3)*.12;bean(scene,Math.cos(t)*r,.22,Math.sin(t)*r,t, .85+(i%4)*.13);}
  function cinnamon(parent,x,z,angle){
    const g=new THREE.Group();g.name='Rolled cinnamon bark';g.position.set(x,.36,z);g.rotation.y=angle;parent.add(g);
    // Cross-section is a rolled sheet, with the open spiral visible at each end.
    const shape=new THREE.Shape(),steps=80,point=(i,offset=0)=>{const t=i/steps*Math.PI*3.7;const r=.025+i/steps*.13+offset;return[Math.cos(t)*r,Math.sin(t)*r];};
    let q=point(0);shape.moveTo(...q);for(let i=1;i<=steps;i++)shape.lineTo(...point(i));for(let i=steps;i>=0;i--)shape.lineTo(...point(i,.017));shape.closePath();
    const bark=make(new THREE.ExtrudeGeometry(shape,{depth:1.18,bevelEnabled:false,curveSegments:6}),new THREE.MeshStandardMaterial({color:new THREE.Color('#995d32').multiplyScalar(software?1:.5),roughness:1,side:THREE.DoubleSide}),g);bark.rotation.y=Math.PI/2;bark.position.x=-.59;
    for(let i=0;i<8;i++){const t=i*Math.PI/4,r=.15;const path=new THREE.CatmullRomCurve3([new THREE.Vector3(-.58,Math.cos(t)*r,Math.sin(t)*r),new THREE.Vector3(0,Math.cos(t)*r*.96,Math.sin(t)*r*.97),new THREE.Vector3(.58,Math.cos(t)*r,Math.sin(t)*r)]);make(new THREE.TubeGeometry(path,10,.007,3,false),new THREE.MeshStandardMaterial({color:i%2?'#bb8550':'#6c3d25',roughness:1}),g);}
    track(g,.65);
  }
  function starAnise(parent,x,z,angle,scale=1){
    const star=new THREE.Group();star.name='Star anise: eight open woody follicles';star.position.set(x,.25,z);star.rotation.y=angle;star.scale.setScalar(scale);parent.add(star);
    const wood=new THREE.MeshStandardMaterial({color:new THREE.Color('#774324').multiplyScalar(software?1:.4),roughness:1,side:THREE.DoubleSide});
    const seedMat=new THREE.MeshStandardMaterial({color:new THREE.Color('#a77039').multiplyScalar(software?1:.45),roughness:.35});
    for(let i=0;i<8;i++){
      const lobe=new THREE.Group();lobe.rotation.y=i*Math.PI/4;star.add(lobe);
      const shell=new THREE.Shape();shell.moveTo(.035,0);shell.bezierCurveTo(.15,.14,.33,.15,.47,0);shell.bezierCurveTo(.34,-.14,.15,-.13,.035,0);
      const opening=new THREE.Path();opening.moveTo(.1,0);opening.bezierCurveTo(.19,-.075,.31,-.07,.38,0);opening.bezierCurveTo(.3,.07,.19,.075,.1,0);shell.holes.push(opening);
      const pod=make(new THREE.ExtrudeGeometry(shell,{depth:.055,bevelEnabled:true,bevelSize:.012,bevelThickness:.016,bevelSegments:1,curveSegments:8}),wood,lobe);pod.rotation.x=-Math.PI/2;
      const seed=make(new THREE.SphereGeometry(.046,10,6),seedMat,lobe,.25,.025,0);seed.scale.set(1.4,.7,.78);
    }
    const stem=make(new THREE.CylinderGeometry(.018,.025,.25,8),wood,star,-.05,-.005,0);stem.rotation.z=1.1;track(star,.8);
  }
  for(const kind of ['classic','cinnamon','anise']){
    const group=new THREE.Group();group.visible=kind==='classic';scene.add(group);ingredientGroups[kind]=group;
    if(kind==='classic'){bean(group,1.13,.25,.72,.6,1.6);bean(group,1.32,.25,.34,-.5,1.5);}
    if(kind==='cinnamon'){cinnamon(group,.9,.75,-.45);cinnamon(group,1.02,1.03,-.2);}
    if(kind==='anise'){starAnise(group,1.05,.83,.35,1.1);starAnise(group,.9,-.8,-.2,.85);starAnise(group,-.1,-1.25,.3,.65);}
  }
  // Honey is a serving suggestion, not an ingredient added to the bottled brew.
  const honeyPot=new THREE.Group();honeyPot.name='Optional honey with a wooden dipper';honeyPot.position.set(1.15,.18,-.72);scene.add(honeyPot);
  const honeyGlass=new THREE.MeshStandardMaterial({color:'#d5b983',roughness:.2,transparent:!software,opacity:software?.55:.3,depthWrite:false,side:THREE.DoubleSide});
  make(new THREE.CylinderGeometry(.25,.20,.4,24,1,true),honeyGlass,honeyPot,0,.20,0);
  const honey=make(new THREE.CylinderGeometry(.226,.18,.25,24),new THREE.MeshStandardMaterial({color:new THREE.Color('#aa6818').multiplyScalar(software?1:.45),roughness:.23,metalness:.05}),honeyPot,0,.14,0);
  honey.name='Honey surface';const tiltHoney=createLiquidSurface(honey.geometry,.25);
  const dipper=new THREE.Group();dipper.position.set(.05,.33,0);dipper.rotation.z=-.65;honeyPot.add(dipper);
  const wood=new THREE.MeshStandardMaterial({color:'#b9955a',roughness:.85});
  make(new THREE.CylinderGeometry(.025,.025,.65,12),wood,dipper,0,.23,0);
  for(let i=0;i<5;i++)make(new THREE.CylinderGeometry(.09,.09,.025,16),wood,dipper,0,-.06+i*.035,0);
  let ingredientAge=2,phase=0,honeyX=0,honeyZ=0;
  let interacting=false;
  const startInteraction=()=>{interacting=true;scheduler?.request();if(!gentle)motion.impulse(.38,-.24);};
  const endInteraction=()=>{interacting=false;scheduler?.request();};
  const wake=()=>scheduler?.request();
  controls.addEventListener('change',wake);controls.addEventListener('start',startInteraction);controls.addEventListener('end',endInteraction);
  let viewWidth=0,viewHeight=0;
  const resize=()=>{viewWidth=host.clientWidth;viewHeight=host.clientHeight;camera.aspect=viewWidth/Math.max(viewHeight,1);camera.updateProjectionMatrix();renderer.setSize(viewWidth,viewHeight);scheduler?.request();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let lastAzimuth=controls.getAzimuthalAngle(),lastPolar=controls.getPolarAngle();
  function applyInertia(dt=1/60) {
    const {x,z}=motion.state;
    const energy=Math.hypot(motion.state.vx,motion.state.vz);
    const ripple=gentle?0:Math.min(.012,energy*.016);
    tiltDrink(x,z,ripple,phase);
    const honeyBlend=1-Math.exp(-3*dt);
    honeyX=gentle?0:honeyX+(x*.5-honeyX)*honeyBlend;honeyZ=gentle?0:honeyZ+(z*.5-honeyZ)*honeyBlend;
    if(Math.abs(honeyX)+Math.abs(honeyZ)<.00001)honeyX=honeyZ=0;
    tiltHoney(honeyX,honeyZ,ripple*.2,phase*.45);
    // Flask liquid coordinates follow the bottle, while the glass stays on the table.
    const angle=model.group.rotation.y,c=Math.cos(angle),s=Math.sin(angle);
    model.setLiquidTilt(x*c-z*s,x*s+z*c,ripple*.5,phase);
    ice.forEach(({cube,position,rotation},i)=>{
      const drift=.32+i*.04;
      cube.position.set(position.x+x*drift,position.y+x*position.x+z*position.z+ripple*Math.sin(phase+i*2),position.z+z*drift);
      cube.rotation.set(rotation.x+z*1.2,rotation.y+x*.9,rotation.z-x*1.2);
    });
    loose.forEach(item=>{
      const {object,position,rotation,response}=item;
      const blend=1-Math.exp(-12*response*dt);
      item.x=gentle?0:item.x+(x-item.x)*blend;item.z=gentle?0:item.z+(z-item.z)*blend;
      if(Math.abs(item.x)+Math.abs(item.z)<.00001)item.x=item.z=0;
      object.position.set(position.x+item.x*.35,position.y+Math.abs(item.x)*.025,position.z+item.z*.35);
      object.rotation.set(rotation.x+item.z*.55,rotation.y+item.x*.9,rotation.z-item.x*.55);
    });
  }
  const keyboard=e=>{scheduler?.request();if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const direction=e.key==='ArrowLeft'?-1:1;model.group.rotation.y+=direction*.15;if(!gentle)motion.impulse(direction*.9,0);}if(e.key==='Home'){e.preventDefault();reset();}};
  renderer.domElement.addEventListener('keydown',keyboard);
  const onMedia=e=>{scheduler?.request();gentle=e.matches;controls.enableDamping=!gentle;if(gentle){motion.reset();honeyX=honeyZ=0;for(const item of loose)item.x=item.z=0;applyInertia();}};media.addEventListener('change',onMedia);
  controls.enableDamping=!gentle;
  function reset(){
    scheduler?.request();
    // Disabling damping for one update clears OrbitControls' pending angular delta.
    controls.autoRotate=false;controls.enableDamping=false;controls.update();
    camera.position.set(4.2,3.25,6.5);controls.target.set(0,1.35,0);model.group.rotation.y=.55;controls.update();controls.enableDamping=!gentle;
    lastAzimuth=controls.getAzimuthalAngle();lastPolar=controls.getPolarAngle();motion.reset();honeyX=honeyZ=0;for(const item of loose)item.x=item.z=0;applyInertia();
  }
  const ingredients=Object.values(ingredientGroups);
  function draw(now){
    if(disposed)return;
    const dt=Math.min((now-last)/1000,.1);last=now;
    controls.autoRotate=spin&&!gentle;controls.dampingFactor=1-Math.exp(-5*dt);controls.update(dt);
    const azimuth=controls.getAzimuthalAngle(),polar=controls.getPolarAngle();
    const deltaAngle=Math.atan2(Math.sin(azimuth-lastAzimuth),Math.cos(azimuth-lastAzimuth));
    const deltaPolar=polar-lastPolar;
    const inputGain=interacting?9:2.5;
    if(!gentle)motion.impulse((deltaAngle*Math.cos(azimuth)+deltaPolar*Math.sin(azimuth))*inputGain,(-deltaAngle*Math.sin(azimuth)+deltaPolar*Math.cos(azimuth))*inputGain);
    lastAzimuth=azimuth;lastPolar=polar;motion.update(dt,gentle);phase+=gentle?0:dt*9;applyInertia(dt);
    if(gentle)brown.color.copy(targetRoast);else brown.color.lerp(targetRoast,1-Math.exp(-9*dt));
    ingredientAge+=dt;
    for(const group of ingredients)group.position.y=gentle?0:Math.max(0,1-ingredientAge*2)*.28;
    model.updatePrint(camera,viewWidth,viewHeight);renderer.render(scene,camera);
    sampleTime+=dt;sampleFrames++;
    if(sampleTime>2){host.dataset.drawCalls=String(renderer.info?.render.calls||0);if(!software&&sampleFrames/sampleTime<45){renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;scene.traverse(object=>{if(object.material?.transmission>0){object.material.transmission=0;object.material.needsUpdate=true;}});}sampleTime=sampleFrames=0;}
    const energy=Math.abs(motion.state.x)+Math.abs(motion.state.z)+Math.abs(motion.state.vx)+Math.abs(motion.state.vz);
    const roastDiff=Math.abs(brown.color.r-targetRoast.r)+Math.abs(brown.color.g-targetRoast.g)+Math.abs(brown.color.b-targetRoast.b);
    return interacting||(!gentle&&(spin||energy>.0001||ingredientAge<.6||Math.abs(deltaAngle)+Math.abs(deltaPolar)>.00001||roastDiff>.0001));
  }
  scheduler=createFrameScheduler(host,draw);onRenderer?.(software?'Live geometry · compatibility':'Live 3D');
  return {
    select(flavour){host.dataset.flavour=flavour.key;model.select(flavour.name,flavour.color);for(const [key,group] of Object.entries(ingredientGroups))group.visible=key===flavour.key;ingredientAge=0;scheduler?.request();},
    setRoast(color){targetRoast.set(color).multiplyScalar(roastLighting);if(gentle)brown.color.copy(targetRoast);host.dataset.roastColor=color;scheduler?.request();},
    setSpin(value){spin=value;scheduler?.request();},
    reset,
    dispose(){disposed=true;scheduler?.dispose();observer.disconnect();media.removeEventListener('change',onMedia);renderer.domElement.removeEventListener('keydown',keyboard);controls.removeEventListener('change',wake);controls.removeEventListener('start',startInteraction);controls.removeEventListener('end',endInteraction);controls.dispose();model.dispose();const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const mat of object.material?(Array.isArray(object.material)?object.material:[object.material]):[]){materials.add(mat);for(const value of Object.values(mat))if(value?.isTexture)textures.add(value);}});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environmentTarget?.dispose();renderer.dispose?.();renderer.forceContextLoss?.();renderer.domElement.remove();}
  };
}
