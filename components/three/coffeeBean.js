import * as THREE from 'three';

/** One closed bean surface: the centre crease is recessed into its volume. */
export function createCoffeeBeanGeometry(software=false) {
  const geometry=new THREE.SphereGeometry(1,software?16:40,software?12:24);
  const position=geometry.getAttribute('position');
  const shades=new Float32Array(position.count*3);
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
    const centre=.07*Math.sin(z*3);
    const groove=Math.exp(-Math.pow((x-centre)/.16,2))*Math.max(0,1-z*z);
    const top=Math.max(0,y);
    position.setXYZ(i,x*.113*(1+.055*Math.sin(z*4)),y*.078*(y<0?.8:1)-.027*groove*top,z*.166);
    const shade=1-.66*groove*top;
    shades.set([shade,shade,shade],i*3);
  }
  position.needsUpdate=true;
  geometry.setAttribute('color',new THREE.BufferAttribute(shades,3));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}
