import * as THREE from 'three';
let visitSeat;
/** Stable for this document visit; a fresh visit chooses either chair again. */
export function chooseVisitorSeat(random=Math.random) { return visitSeat ??= random()<.5?0:1; }

export function createSeatedVisitor() {
  const person=new THREE.Group();person.name='Seated visitor: clean-shaven, dark hair';
  const material=color=>new THREE.MeshStandardMaterial({color,roughness:.85,metalness:0});
  const skin=material('#bd906f'),hair=material('#242523'),shirt=material('#7582a6'),trousers=material('#414b4e'),shoe=material('#292d2d'),sole=material('#d2c7ac');
  const mesh=(geometry,mat,x,y,z,scale)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;person.add(m);return m;};
  const oval=(mat,x,y,z,scale)=>mesh(new THREE.SphereGeometry(1,12,10),mat,x,y,z,scale);
  const limb=(from,to,radius,mat)=>{const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a);const m=mesh(new THREE.CapsuleGeometry(radius,Math.max(.01,delta.length()-radius*2),3,8),mat,...a.clone().add(b).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;};
  oval(trousers,0,.19,.02,[.29,.17,.24]);
  oval(shirt,0,.66,.04,[.30,.45,.22]);
  limb([0,1.02,.02],[0,1.18,-.01],.085,skin);
  oval(skin,0,1.35,-.025,[.18,.23,.17]);
  oval(skin,-.18,1.34,-.015,[.04,.065,.035]);oval(skin,.18,1.34,-.015,[.04,.065,.035]);
  const cap=mesh(new THREE.SphereGeometry(.188,14,10,0,Math.PI*2,0,Math.PI*.56),hair,0,1.395,-.005);cap.scale.set(1,1.16,1);
  oval(hair,-.13,1.47,-.10,[.11,.09,.105]);
  for(const x of [-.065,.065]){oval(hair,x,1.36,-.184,[.013,.018,.008]);limb([x-.026,1.40,-.174],[x+.018,1.405,-.18],.008,hair);}
  oval(skin,0,1.32,-.199,[.035,.045,.045]);
  limb([-.033,1.255,-.171],[.033,1.255,-.171],.006,material('#805d49'));
  for(const side of [-1,1]){
    limb([side*.17,.19,0],[side*.19,.10,-.60],.13,trousers);
    limb([side*.19,.10,-.60],[side*.21,-.74,-.68],.105,trousers);
    oval(shoe,side*.21,-.80,-.80,[.13,.105,.24]);oval(sole,side*.21,-.875,-.81,[.135,.025,.24]);
    limb([side*.25,.94,.03],[side*.37,.60,-.13],.105,shirt);
    limb([side*.37,.60,-.13],[side*.17,.36,-.46],.075,skin);
    oval(skin,side*.17,.35,-.47,[.075,.045,.10]);
  }
  return person;
}
