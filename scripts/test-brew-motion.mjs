import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createBrewMotion } from '../components/cold-brew/brewMotion.js';
import { createLiquidSurface } from '../components/three/liquidSurface.js';

// Violent input and throttled tabs must not throw ingredients off the plate.
const motion=createBrewMotion();
for(let i=0;i<2000;i++){
  motion.impulse(i%2?100:-100,100);
  const state=motion.update(i%3===0?5:1/60);
  assert.ok(Object.values(state).every(Number.isFinite));
  assert.ok(Math.abs(state.x)<=.14&&Math.abs(state.z)<=.14);
}
for(let i=0;i<600;i++)motion.update(1/60);
assert.deepEqual(motion.state,{x:0,z:0,vx:0,vz:0},'Settles exactly, without perpetual ice rotation');
motion.impulse(1,1);motion.update(.1,true);
assert.deepEqual(motion.state,{x:0,z:0,vx:0,vz:0},'Reduced motion clears pending impulses');
motion.impulse(NaN,Infinity);motion.update(NaN);assert.equal(motion.state.x,0);
const sample=fps=>{const m=createBrewMotion();m.impulse(.8,-.4);for(let i=0;i<fps/2;i++)m.update(1/fps);return m.state;};
const reference=sample(120);
for(const fps of [30,60,144])assert.ok(Math.abs(sample(fps).x-reference.x)<.001,'Frame-rate-independent decay');
for(const [top,bottom,height] of [[.317,.27,.61],[.232,.232,.18]]){
  const geometry=new THREE.CylinderGeometry(top,bottom,height,32);
  const original=geometry.attributes.position.array.slice();
  const tilt=createLiquidSurface(geometry,height);tilt(.14,-.14);
  const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    assert.equal(positions.getX(i),original[i*3]);assert.equal(positions.getZ(i),original[i*3+2]);
    if(original[i*3+1]<0)assert.equal(positions.getY(i),original[i*3+1]);
    assert.ok(Math.abs(positions.getY(i)-original[i*3+1])<.064,'Surface stays below the rim');
  }
  tilt(0,0);assert.deepEqual(positions.array,original,'Reset restores every vertex');geometry.dispose();
}
console.log('PASS: bounded impulses, frame-rate consistency, settling, reduced motion, vessel containment and reset');
// A ripple changes the top only; translated bottle fills also keep their base fixed.
const fill=new THREE.CylinderGeometry(.6,.6,2.28,32,3);fill.translate(0,1.2,0);
const rest=fill.attributes.position.array.slice(),ripple=createLiquidSurface(fill,2.28);
ripple(.1,-.08,.012,.7);
for(let i=0;i<fill.attributes.position.count;i++){
 const y=rest[i*3+1];assert.equal(fill.attributes.position.getX(i),rest[i*3]);assert.equal(fill.attributes.position.getZ(i),rest[i*3+2]);
 if(y<.061)assert.equal(fill.attributes.position.getY(i),y,'Translated fill base stays fixed');
 assert.ok(Math.abs(fill.attributes.position.getY(i)-y)<.12,'Ripple stays bounded');
}
ripple(0,0);assert.deepEqual(fill.attributes.position.array,rest,'Ripple reset restores the fill');fill.dispose();
