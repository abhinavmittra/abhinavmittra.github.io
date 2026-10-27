import assert from 'node:assert/strict';
import * as THREE from 'three';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// A small DOM double tests the actual projection/collision code, not a copy of it.
let writes=0,compact=false,resize;
const element=()=>({
  hidden:false,dataset:{},parentElement:{hidden:false,prepend(){}},
  style:{getPropertyValue(){return '#39471f';},set transform(value){writes++;this.value=value;},get transform(){return this.value;}},
  classList:{add(){},toggle(){}},append(){},remove(){this.removed=true;},
  setAttribute(){writes++;},matches(){return false;},
  getBoundingClientRect(){return {width:140,height:44};},
});
globalThis.document={createElementNS:element};
globalThis.matchMedia=()=>({get matches(){return compact;}});
globalThis.ResizeObserver=class {constructor(callback){resize=callback;}observe(){}disconnect(){this.disconnected=true;}};
const {createStationLabels}=await import(process.argv[2]?pathToFileURL(resolve(process.argv[2])).href:'../components/three/stationLabels.js');
const host={clientWidth:1000,clientHeight:600,dataset:{}};
const stations={},buttons=[];
for(let i=0;i<6;i++){
  const key=String(i),group=new THREE.Group();
  group.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,1.8,1.3),new THREE.MeshBasicMaterial()));
  group.position.set((i%3-1)*3,0,(Math.floor(i/3)-.5)*3);stations[key]=group;
  const button=element();button.dataset.station=key;buttons.push(button);
}
const camera=new THREE.OrthographicCamera(-8,8,4.8,-4.8,.1,100);
camera.position.set(10,10,14);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const labels=createStationLabels(host,stations,buttons);
const update=()=>labels.update(camera,1/60,{obstacles:[]});
for(let i=0;i<240;i++) update();
for(const button of buttons){
  const [x,y]=button.style.transform.match(/-?\d+(?:\.\d+)?/g).slice(1).map(Number);
  assert(Number.isFinite(x)&&Number.isFinite(y));
  assert(x>=4&&x+140<=host.clientWidth-3);
  assert(y>=4&&y+44<=host.clientHeight-3);
}
const idleWrites=writes,layouts=host.dataset.labelLayouts;
const start=performance.now();for(let i=0;i<2000;i++) update();
const idle=performance.now()-start;
const idleWriteCount=writes-idleWrites;
if(!process.argv[2]){
  assert.equal(writes,idleWrites,'Settled labels must not write transforms or paths again.');
  assert.equal(host.dataset.labelLayouts,layouts,'Stationary camera must not rerun collision layouts.');
}
const moveStart=performance.now();
for(let i=0;i<1000;i++){camera.position.x=10+Math.sin(i*.01)*3;camera.lookAt(0,0,0);camera.updateMatrixWorld();update();}
const moving=performance.now()-moveStart;
assert.notEqual(writes,idleWrites,'Camera motion must move the labels.');
labels.update(camera,1/60,{snap:true,hovered:'0',obstacles:[{x:0,y:0,w:200,h:200}]});
const count=host.dataset.labelLayouts;
resize([]);update();
if(!process.argv[2]) assert.notEqual(host.dataset.labelLayouts,count,'Resize invalidates layout.');
compact=true;update();assert(buttons.every(button=>button.hidden));
assert.equal(labels.hit(20,20),null);
compact=false;update();assert(buttons.some(button=>!button.hidden));
labels.dispose();
for(const group of Object.values(stations))group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
console.log(`PASS: label projection, resize, camera movement and mobile dock. Synthetic CPU: 2000 idle updates ${idle.toFixed(1)}ms; 1000 moving updates ${moving.toFixed(1)}ms; idle DOM writes ${idleWriteCount}.`);
