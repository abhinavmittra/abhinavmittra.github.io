import * as THREE from 'three';
import { createDeskClock } from './deskClock';
import { createColdBrewBottle } from './coldBrewBottle';
import { createMountainGeometry } from './travelDiorama';
import { deskPalette } from '../../content/appearance';

/** Subject-specific, editable geometry shared by the hardware and SVG scene. */
export function createWorkspaceModels({world, software, makeStation, tools, accentMat, accentSoft, glowMat, layers, animated, flows, onUpdate}) {
  const {material,mesh,box,rounded,ring,cylinder,line,texture}=tools;
  const p=deskPalette;
  const dark=material(p.graphite,{roughness:.38,metalness:.5}),silver=material(p.metal,{roughness:.35,metalness:.75}),copper=material(p.sand,{roughness:.42,metalness:.7}),paper=material(p.paper,{roughness:.9,metalness:0});
  const d=makeStation('discovery',3.65,2.6);
  const rack=box(.72,1.38,.66,dark,d,1.1,.94,.12);
  for(let i=0;i<5;i++){box(.57,.028,.025,silver,rack,0,-.5+i*.23,.34);mesh(new THREE.SphereGeometry(.027,8,6),glowMat,rack,.23,-.44+i*.23,.36);}
  for(let i=0;i<3;i++){const page=rounded(1.1,.72,.025,paper,d,-.95,.62+i*.2,.15-i*.12,.04);page.rotation.y=-.15;layers.push({mesh:page,y:page.position.y,index:i+1});box(.65,.008,.012,accentMat,page,0,.018,-.12);box(.8,.008,.012,accentMat,page,0,.018,0);box(.45,.008,.012,accentMat,page,-.17,.018,.12);}
  const screen=new THREE.Group();screen.position.set(-.22,.8,-.92);screen.rotation.x=-.16;d.add(screen);box(2.3,1.35,.1,dark,screen,0,.7,0);const screenSurface=mesh(new THREE.PlaneGeometry(2.16,1.22),new THREE.MeshBasicMaterial(software?{color:'#1d3024'}:{map:texture('Engineering at Cisco','cisco')}),screen,0,.7,.056);screenSurface.castShadow=false;if(software){for(let i=0;i<3;i++){box(.48,.28,.015,accentMat,screen,-.72+i*.72,.65,.07);if(i<2)box(.24,.015,.018,silver,screen,-.36+i*.72,.65,.08);}box(1.1,.025,.02,silver,screen,-.35,1.12,.07);}box(.08,.6,.08,silver,screen,0,-.1,0);rounded(.75,.4,.05,dark,screen,0,-.37,0,.05);

  const keyboard=rounded(1.45,.48,.04,silver,d,-.25,.26,.78,.04);
  for(let row=0;row<3;row++)for(let col=0;col<11;col++)box(.095,.015,.075,dark,keyboard,-.61+col*.12,.027,-.13+row*.12);
  for(let i=0;i<5;i++)for(let j=0;j<4;j++)box(.055,.018,.014,dark,rack,-.2+j*.12,-.46+i*.23,.36);
  for(let i=0;i<2;i++){const cable=line([[1.38,.26,.4],[1.56,.25,.65],[.9,.24,.9],[.45,.24,.9]],i?accentMat:copper,d,.018);cable.name='Patch cable';}

  const a=makeStation('incident',2.95,2.1);
  const laptop=new THREE.Group();laptop.name='Agent runtime laptop';laptop.position.set(0,.32,.05);a.add(laptop);
  rounded(1.65,1.05,.065,silver,laptop,0,0,0,.06);
  const lid=new THREE.Group();lid.position.set(0,.04,-.46);lid.rotation.x=-.12;laptop.add(lid);
  rounded(1.65,.065,1.03,dark,lid,0,.5,0,.06);
  box(1.5,.88,.012,material(p.olive),lid,0,.5,.042);
  // A tool route and a separate review stop, rendered as actual scene geometry.
  for(let i=0;i<3;i++){
    box(.24,.18,.014,i===2?paper:accentMat,lid,-.48+i*.48,.55,.055);
    if(i<2)box(.18,.018,.014,silver,lid,-.24+i*.48,.55,.06);
  }
  for(let row=0;row<4;row++)for(let col=0;col<10;col++)box(.105,.014,.07,dark,laptop,-.65+col*.145,.045,-.25+row*.12);
  rounded(.46,.22,.008,dark,laptop,0,.045,.35,.025);
  for(let i=0;i<2;i++){
    const checkpoint=new THREE.Group();checkpoint.name=i?'Human review card':'Persisted checkpoint';checkpoint.position.set(i?.95:-.95,.55,.5);checkpoint.rotation.set(-.25,0,i?-.13:.13);a.add(checkpoint);
    box(.5,.72,.04,paper,checkpoint);
    box(.19,.06,.055,silver,checkpoint,0,.34,.02);
    for(let row=0;row<4;row++)box(row===3?.24:.32,.018,.008,i?copper:accentMat,checkpoint,-.025,.16-row*.11,.03);
    layers.push({mesh:checkpoint,y:checkpoint.position.y,index:i+1});
  }
  const feedback=new THREE.CatmullRomCurve3([new THREE.Vector3(-1.05,.4,-.55),new THREE.Vector3(0,1.6,-.8),new THREE.Vector3(1.05,.4,-.55),new THREE.Vector3(0,.4,.8)],true);
  mesh(new THREE.TubeGeometry(feedback,64,.012,5,true),accentMat,a);
  for(let i=0;i<3;i++){const packet=mesh(new THREE.SphereGeometry(.045,8,6),glowMat,a);flows.push({mesh:packet,curve:feedback,phase:i/3,speed:.12,station:'incident'});}

  const n=makeStation('integrations',3.25,2.3);
  // Two compute boards distinguish the inference experiments from the Cisco rack.
  for(let i=0;i<2;i++){
    const board=new THREE.Group();board.position.set(-.55,.48+i*.6,-.3);n.add(board);
    box(1.65,.4,.65,dark,board);
    box(1.82,.045,.7,material(p.olive),board,0,-.24,0);
    for(let j=0;j<10;j++)box(.045,.025,.18,copper,board,-.68+j*.14,-.27,.29);
    for(let j=0;j<8;j++)box(.016,.18,.025,silver,board,.84,-.02,-.25+j*.07);
    for(let j=0;j<2;j++){
      const fan=new THREE.Group();fan.position.set(-.44+j*.85,0,.35);board.add(fan);
      const rim=mesh(new THREE.TorusGeometry(.16,.025,6,24),silver,fan);
      cylinder(.05,.05,copper,fan).rotation.x=Math.PI/2;
      for(let k=0;k<7;k++){const angle=k*Math.PI*2/7;const blade=box(.065,.12,.024,silver,fan,Math.sin(angle)*.08,Math.cos(angle)*.08,.014);blade.rotation.z=-angle+.4;}
      animated.push({mesh:fan,type:'rotateZ',speed:1.1});
    }
    for(let j=0;j<8;j++)box(.018,.035,.5,copper,board,-.65+j*.18,.23,0);
    layers.push({mesh:board,y:board.position.y,index:i+1});
  }
  const storage=new THREE.Group();storage.name='Solid state checkpoint storage';storage.position.set(.95,.32,.48);n.add(storage);
  for(let j=0;j<3;j++){
    const drive=rounded(.65,.82,.1,j===1?paper:silver,storage,0,j*.15,0,.05);
    box(.34,.006,.35,j===1?accentMat:dark,drive,0,.056,-.05);
    box(.24,.035,.012,copper,drive,0,0,.42);
    layers.push({mesh:drive,y:drive.position.y,index:j+1});
  }
  const network=box(.85,.16,.38,dark,n,.85,.32,-.7);
  for(let port=0;port<4;port++)box(.12,.075,.012,copper,network,-.3+port*.2,0,.2);
  line([[.85,.26,-.5],[1.25,.25,-.3],[1.25,.25,.3],[.95,.27,.35]],accentMat,n,.018);


  const f=makeStation('fieldnotes',3.25,2.55);
  const mountainMaterial=material('#ffffff',{roughness:1,metalness:0,vertexColors:true,flatShading:true});
  for(const [x,z,h,r,seed] of [[-.55,-.48,2.5,.76,1],[.38,-.58,1.85,.65,3],[1.0,-.28,1.25,.46,5]]){
    const peak=mesh(createMountainGeometry(h,r,seed),mountainMaterial,f,x,.25,z);peak.name='Snow-lined mountain ridge';
  }
  for(const [x,z,h] of [[-1.30,-.22,.62],[1.2,-.75,.48],[-.35,-.94,.43]]){cylinder(.025,h*.4,copper,f,x,.28+h*.2,z);mesh(new THREE.ConeGeometry(h*.27,h*.8,7),material(p.olive),f,x,.3+h*.6,z);}
  const cup=new THREE.Group();cup.position.set(.96,.40,.82);cup.scale.setScalar(1.4);f.add(cup);mesh(new THREE.CylinderGeometry(.22,.17,.32,32,1,true),material(p.paper,{roughness:.3}),cup,0,.1,0);cylinder(.192,.015,material('#211a12'),cup,0,.235,0);const handle=mesh(new THREE.TorusGeometry(.12,.035,8,24),copper,cup,.23,.1,0);handle.rotation.y=Math.PI/2;
  cup.name='Trail coffee cup';layers.push({mesh:cup,y:cup.position.y,index:2});
  for(let i=0;i<2;i++){const steam=line([[0,0,0],[.06,.14,.03],[-.04,.3,0],[.03,.46,-.03]],new THREE.MeshBasicMaterial({color:p.paper,transparent:true,opacity:.25}),cup,.008);steam.position.set(i*.08-.04,.25,0);animated.push({mesh:steam,type:'steam',phase:i});}
  // Camera, route notebook and coffee form a clear front row beneath the mountains.
  const notebook=box(.64,.07,.78,material(p.olive),f,-.02,.33,.82);notebook.name='Travel notebook';notebook.rotation.y=-.08;box(.54,.015,.68,paper,notebook,0,.04,0);box(.025,.025,.74,copper,notebook,-.23,.05,0);

  const map=rounded(.86,.6,.016,paper,f,-.02,.42,.82,.015);map.name='Folded route map';map.rotation.y=-.08;
  line([[-.32,.02,.15],[-.12,.02,-.1],[.12,.02,.08],[.34,.02,-.17]],material(p.olive),map,.008);
  for(const [x,z] of [[-.32,.15],[.12,.08],[.34,-.17]])cylinder(.025,.018,copper,map,x,.025,z);
  const camera=new THREE.Group();camera.name='Backpacking camera';camera.position.set(-1.17,.56,.82);camera.scale.setScalar(1.5);camera.rotation.y=.18;f.add(camera);
  rounded(.48,.24,.3,dark,camera,0,0,0,.04);
  rounded(.09,.28,.32,dark,camera,.22,-.005,.02,.025);
  box(.44,.035,.22,silver,camera,0,.15,0);
  const lens=cylinder(.12,.19,dark,camera,-.035,0,.19);lens.rotation.x=Math.PI/2;
  for(const z of [.13,.21,.27]){const rim=mesh(new THREE.TorusGeometry(.12,.012,5,24),silver,camera,-.035,0,z);rim.name='Camera lens ring';}
  const lensGlass=cylinder(.092,.012,material(p.periwinkle,{roughness:.15,metalness:.35}),camera,-.035,0,.29);lensGlass.rotation.x=Math.PI/2;
  box(.14,.095,.17,dark,camera,-.025,.195,-.015);
  cylinder(.037,.025,copper,camera,.16,.19,0);
  cylinder(.032,.025,silver,camera,-.16,.19,0);
  for(let i=0;i<4;i++)box(.045,.011,.012,silver,camera,.235,-.08+i*.045,.166);
  line([[-.23,.07,0],[-.36,-.04,.03],[-.34,-.14,.15],[-.23,-.1,.17]],dark,camera,.012);

  const deskBottle=createColdBrewBottle({software,onUpdate,detail:"desk"});deskBottle.group.scale.setScalar(.43);deskBottle.group.position.set(-.06,.29,.83);deskBottle.group.userData.station='coldbrew';f.add(deskBottle.group);
  layers.push({mesh:deskBottle.group,y:deskBottle.group.position.y,index:3});
  layers.push({mesh:map,y:map.position.y,index:1});
  const deskClock=createDeskClock(world);deskClock.group.position.set(5.05,-.1,1.15);deskClock.group.rotation.y=.6;deskClock.group.scale.setScalar(1.08);

  // A few deliberate material details around the physical board.
  for(let i=0;i<10;i++)box(.013,.008,i%2===0?.18:.09,silver,world,-5.7+i*.15,-.09,3.7);
  const pot=cylinder(.34,.4,dark,world,5.2,.06,-3.05);for(let i=0;i<7;i++){const leaf=mesh(new THREE.SphereGeometry(.22,10,8),material(p.olive),world,5.2+Math.sin(i*2.4)*.2,.58+i*.055,-3.05+Math.cos(i*2.4)*.2);leaf.scale.set(.36,2.3,.5);leaf.rotation.z=Math.sin(i)*.5;}

  return {deskClock,deskBottle};
}
