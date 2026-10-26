import * as THREE from 'three';
import { SVGObject } from 'three/addons/renderers/SVGRenderer.js';
import { drawSpiceEngraving } from './brewLabelArtwork';
import { createLiquidSurface } from './liquidSurface';
import { coldBrew } from '../../content/cold-brew';

/** Real flask geometry, with the same supplied artwork in both renderers. */
export function createColdBrewBottle({software=false,color=coldBrew.palette.sand,name='Classic',onUpdate=()=>{},detail='studio'}={}) {
  const group=new THREE.Group();group.name='A•WAKE cold brew flask';
  const bodyGlass=software?new THREE.MeshStandardMaterial({color:'#21180f',roughness:.2,metalness:.1}):new THREE.MeshPhysicalMaterial({color:detail==='desk'?'#6b5443':'#a99a7b',roughness:.12,metalness:0,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:.1});
  const coffee=new THREE.MeshStandardMaterial({color:new THREE.Color('#160d09').multiplyScalar(software?1:.5),roughness:.2,metalness:.04});
  const glass=software?new THREE.MeshStandardMaterial({color:'#a89b78',roughness:.16,metalness:.12,transparent:true,opacity:.32,side:THREE.DoubleSide}):new THREE.MeshPhysicalMaterial({color:'#a89b78',roughness:.12,metalness:0,transmission:.72,thickness:.08,ior:1.48,clearcoat:1});
  const silver=new THREE.MeshStandardMaterial({color:detail==='desk'?'#d0d3cc':'#b6b5a7',roughness:.35,metalness:detail==='desk'?.35:software?.45:.8});
  const paper=new THREE.MeshBasicMaterial({color:'#f0eee5',toneMapped:false});
  const add=(geometry,material,parent=group,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};

  function outline(liquid=false){
    const s=new THREE.Shape();s.moveTo(-.56,.06);s.quadraticCurveTo(-.75,.06,-.75,.26);s.lineTo(-.75,1.97);s.quadraticCurveTo(-.75,2.19,-.55,2.25);
    if(liquid){s.quadraticCurveTo(0,2.28,.55,2.25);}
    else{s.quadraticCurveTo(-.33,2.29,-.25,2.34);s.lineTo(-.25,2.38);s.lineTo(.25,2.38);s.lineTo(.25,2.34);s.quadraticCurveTo(.33,2.29,.55,2.25);}
    s.quadraticCurveTo(.75,2.19,.75,1.97);s.lineTo(.75,.26);s.quadraticCurveTo(.75,.06,.56,.06);s.lineTo(-.56,.06);return s;
  }
  function flaskGeometry(shape,depth,bevel){const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:software?2:5,curveSegments:software?8:20});g.translate(0,0,-depth/2);return g;}
  const body=add(flaskGeometry(outline(),.5,.075),bodyGlass);body.name='Flattened glass flask';
  const fill=add(flaskGeometry(outline(true),.39,.045),coffee);fill.scale.set(.94,.94,1);fill.position.y=.06;fill.name='Cold brew inside the glass';
  const tiltFill=createLiquidSurface(fill.geometry,2.28);
  const neckGlass=glass.clone();neckGlass.transparent=true;neckGlass.opacity=.28;neckGlass.depthWrite=false;neckGlass.side=THREE.DoubleSide;
  if(!software)neckGlass.transmission=0;
  const neck=add(new THREE.CylinderGeometry(.25,.25,.34,32,1,true),neckGlass,group,0,2.48,0);
  // Deform the filled volume itself; a separate surface disc would poke through the shoulder.
  const setLiquidTilt=(x,z,ripple=0,phase=0)=>tiltFill(x*.65,z*.65,ripple*.5,phase);
  // Brushed aluminium cap, rolled lip, tamper ring and fine vertical knurling.
  const lid=add(new THREE.CylinderGeometry(.285,.285,.22,48),silver,group,0,2.79,0);lid.name='Silver screw cap';
  for(const y of [2.65,2.7,2.88])add(new THREE.CylinderGeometry(.293,.293,.025,48),silver,group,0,y,0);
  for(let i=0;i<48;i++){const angle=i*Math.PI/24;const rib=add(new THREE.BoxGeometry(.009,.075,.012),silver,group,Math.sin(angle)*.286,2.84,Math.cos(angle)*.286);rib.rotation.y=angle;}
  // Heavy clear base and the lower glass seam catch the light independently of the coffee.
  const base=add(new THREE.BoxGeometry(1.27,.045,.49),software?silver:glass,group,0,.075,0);base.name='Thick flask base';
  const label=add(new THREE.PlaneGeometry(1.17,1.56),paper,group,0,1.24,.327);label.name='A•WAKE paper label';label.castShadow=false;

  let printTexture,disposed=false,currentName=name;
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1200;
  const ctx=canvas.getContext('2d');
  const artwork=new Image();
  // Crop a view of the exact supplied mood board; never redraw or recolour its logo.
  const crop=coldBrew.logo;
  const namespace='http://www.w3.org/2000/svg';
  const svg=(tag,attributes={})=>{const node=document.createElementNS(namespace,tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));return node;};
  let svgPrint,printNode,triangles=[];
  if(software){
    label.renderOrder=2;
    printNode=svg('g',{'pointer-events':'none','data-brew-print':'awake'});
    const defs=svg('defs');printNode.append(defs);
    for(const points of ['0,0 900,0 0,1200','900,0 900,1200 0,1200']){
      const id='brew-'+THREE.MathUtils.generateUUID();
      const clip=svg('clipPath',{id,clipPathUnits:'userSpaceOnUse'});clip.append(svg('polygon',{points}));defs.append(clip);
      const transform=svg('g');const image=svg('image',{width:900,height:1200,'clip-path':`url(#${id})`});transform.append(image);printNode.append(transform);triangles.push({transform,image});
    }
    svgPrint=new SVGObject(printNode);svgPrint.position.set(0,1.24,.334);svgPrint.renderOrder=3;group.add(svgPrint);
  }

  function select(nextName,nextColor){
    if(disposed||!ctx)return;
    currentName=nextName;
    const kind=/cinnamon/i.test(nextName)?'cinnamon':/anise/i.test(nextName)?'anise':'classic';
    const flavour=coldBrew.flavours.find(item=>item.key===kind);
    const index=kind==='classic'?'01':kind==='cinnamon'?'02':'03'; // taste-skill-ignore: actual flavour identifiers supplied in the packaging reference.
    const ink=kind==='cinnamon'?coldBrew.palette.paper:coldBrew.palette.olive;
    group.userData.flavour=kind;group.userData.packaging=coldBrew.name;
    ctx.fillStyle=flavour.color;ctx.fillRect(0,0,900,1200);
    // The untouched logo sits on its original paper field on every flavour.
    if(artwork.complete&&artwork.naturalWidth){ctx.drawImage(artwork,crop.x,crop.y,crop.width,crop.height,160,30,580,558);}
    else{ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='bold 92px system-ui';ctx.fillText(coldBrew.name,450,360);}
    ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='42px system-ui, sans-serif';ctx.fillText(coldBrew.taglines.story,450,650);
    ctx.font='78px system-ui, sans-serif';ctx.fillText(index,450,755);
    ctx.font='54px system-ui, sans-serif';ctx.fillText(kind==='classic'?'CLASSIC':kind==='cinnamon'?'CINNAMON':'STAR ANISE',450,825);
    if(kind!=='classic'){
      drawSpiceEngraving(ctx,kind,kind==='cinnamon'?390:450,952,kind==='cinnamon'?.75:.8,ink);
      // Two lines preserve the supplied hook without squeezing the label's type.
      const split=coldBrew.taglines.ingredients.lastIndexOf(' Stay');
      ctx.fillStyle=ink;ctx.font='38px system-ui, sans-serif';ctx.fillText(coldBrew.taglines.ingredients.slice(0,split),450,1100);ctx.fillText(coldBrew.taglines.ingredients.slice(split+1),450,1150);
    }else{
      ctx.strokeStyle=ink;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(417,1040);ctx.bezierCurveTo(390,988,460,954,497,950);ctx.bezierCurveTo(501,1009,455,1054,417,1040);ctx.moveTo(411,1060);ctx.lineTo(475,976);ctx.stroke();
    }
    if(software){const url=canvas.toDataURL('image/png');for(const {image} of triangles)image.setAttribute('href',url);}
    else{printTexture?.dispose();printTexture=new THREE.CanvasTexture(canvas);printTexture.colorSpace=THREE.SRGBColorSpace;printTexture.anisotropy=4;label.material.map=printTexture;label.material.color.set('#ffffff');label.material.needsUpdate=true;}
  }

  const normal=new THREE.Vector3(),center=new THREE.Vector3(),eye=new THREE.Vector3(),projectedCenter=new THREE.Vector3();
  const corners=[new THREE.Vector3(-.585,2.02,.334),new THREE.Vector3(.585,2.02,.334),new THREE.Vector3(.585,.46,.334),new THREE.Vector3(-.585,.46,.334)];
  const projected=corners.map(()=>new THREE.Vector3());
  function updatePrint(camera,width,height){
    if(!software||disposed||!width||!height)return;
    group.updateWorldMatrix(true,false);camera.updateMatrixWorld();
    center.copy(svgPrint.position).applyMatrix4(group.matrixWorld);camera.getWorldPosition(eye);
    normal.set(0,0,1).transformDirection(group.matrixWorld);svgPrint.visible=normal.dot(eye.sub(center))>0;
    if(!svgPrint.visible)return;
    projectedCenter.copy(center).project(camera);projectedCenter.x*=width/2;projectedCenter.y*=-height/2;
    for(let i=0;i<4;i++){projected[i].copy(corners[i]).applyMatrix4(group.matrixWorld).project(camera);projected[i].x*=width/2;projected[i].y*=-height/2;}
    const [tl,tr,br,bl]=projected;
    const set=(node,a,b,c,d,e,f)=>node.setAttribute('transform',`matrix(${a} ${b} ${c} ${d} ${e} ${f})`);
    set(triangles[0].transform,(tr.x-tl.x)/900,(tr.y-tl.y)/900,(bl.x-tl.x)/1200,(bl.y-tl.y)/1200,tl.x-projectedCenter.x,tl.y-projectedCenter.y);
    const a=(br.x-bl.x)/900,b=(br.y-bl.y)/900,c=(br.x-tr.x)/1200,d=(br.y-tr.y)/1200;
    set(triangles[1].transform,a,b,c,d,tr.x-projectedCenter.x-a*900,tr.y-projectedCenter.y-b*900);
  }
  artwork.onload=()=>{if(!disposed){select(currentName);onUpdate();}};artwork.src=crop.src;
  select(name,color);
  return {group,select,updatePrint,setLiquidTilt,dispose(){disposed=true;artwork.onload=null;artwork.onerror=null;}};
}
