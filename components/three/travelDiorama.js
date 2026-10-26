import * as THREE from 'three';

/** Uneven ridgelines and altitude-coloured rock, rather than repeated cone primitives. */
export function createMountainGeometry(height,radius,seed=0) {
  const sides=9,levels=[0,.24,.56,.80,1],radii=[1,.77,.44,.2,0];
  const points=[];
  for(let row=0;row<levels.length;row++)for(let i=0;i<sides;i++){
    const a=i/sides*Math.PI*2,variation=1+.17*Math.sin(i*2.7+seed);
    const r=radius*radii[row]*variation;
    points.push(new THREE.Vector3(Math.cos(a)*r-levels[row]*radius*.15,height*levels[row]*(row===4?1:1+.045*Math.sin(i*2+seed)),Math.sin(a)*r*.77+levels[row]*radius*.1));
  }
  const positions=[],colors=[],rock=new THREE.Color('#626b58'),ledge=new THREE.Color('#918872'),snow=new THREE.Color('#f2eee4');
  const triangle=(a,b,c)=>{for(const index of [a,b,c]){const p=points[index];positions.push(p.x,p.y,p.z);const altitude=p.y/height;const tint=altitude>.77+.035*Math.sin(p.x*8+seed)?snow:rock.clone().lerp(ledge,.25+.28*Math.sin(index*1.8+seed));colors.push(tint.r,tint.g,tint.b);}};
  for(let row=0;row<levels.length-1;row++)for(let i=0;i<sides;i++){const j=(i+1)%sides,a=row*sides+i,b=row*sides+j,c=(row+1)*sides+i,d=(row+1)*sides+j;triangle(a,c,b);if(row<levels.length-2)triangle(b,c,d);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();geometry.computeBoundingBox();return geometry;
}
