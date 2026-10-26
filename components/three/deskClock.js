import * as THREE from 'three';

/** Local Date access deliberately follows the visitor's browser time zone. */
export function getLocalClockAngles(date, smooth = true) {
  const seconds = date.getSeconds() + (smooth ? date.getMilliseconds() / 1000 : 0);
  const minutes = date.getMinutes() + seconds / 60;
  const hours = date.getHours() % 12 + minutes / 60;
  return { hour: -hours * Math.PI / 6, minute: -minutes * Math.PI / 30, second: -seconds * Math.PI / 30 };
}

export function createDeskClock(parent) {
  const group = new THREE.Group();
  group.name = 'Browser local time mantel clock';
  group.userData.action = 'clock';
  parent.add(group);
  const wood = new THREE.MeshStandardMaterial({ color: '#514038', roughness: .72 });
  const brass = new THREE.MeshStandardMaterial({ color: '#b49b73', metalness: .65, roughness: .35 });
  const dial = new THREE.MeshBasicMaterial({ color: '#f2eee4' });
  const ink = new THREE.MeshBasicMaterial({ color: '#202824' });
  const sweep = new THREE.MeshBasicMaterial({ color: '#80552e' });
  function add(geometry, material, x=0, y=0, z=0, into=group) {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; into.add(mesh); return mesh;
  }
  add(new THREE.BoxGeometry(1.65,.18,.75),wood,0,.1,0);
  add(new THREE.BoxGeometry(1.42,.12,.62),brass,0,.22,0);
  add(new THREE.BoxGeometry(1.28,1.2,.5),wood,0,.88,0);
  const arch=add(new THREE.CylinderGeometry(.64,.64,.5,48),wood,0,1.49,0);arch.rotation.x=Math.PI/2;
  const rim=add(new THREE.TorusGeometry(.535,.045,8,64),brass,0,1.43,.282);
  const face=add(new THREE.CircleGeometry(.51,48),dial,0,1.43,.292);
  face.castShadow=false;rim.castShadow=false;
  for(let i=0;i<60;i++) {
    const angle=i*Math.PI/30, major=i%5===0;
    const tick=add(new THREE.BoxGeometry(major?.027:.012,major?.082:.03,.009),ink,Math.sin(angle)*.45,1.43+Math.cos(angle)*.45,.301);
    tick.rotation.z=-angle;
  }
  // Raised cardinal numerals remain geometry in both the WebGL and SVG renderers.
  const numeral = (segments,x,y) => {
    for(const [dx,dy,w,h] of segments) add(new THREE.BoxGeometry(w,h,.008),ink,x+dx,1.43+y+dy,.309);
  };
  const one=[[0,0,.016,.09]];
  numeral(one,-.027,.325);numeral([[.006,.038,.042,.013],[.022,.017,.013,.04],[0,-.006,.044,.013],[-.018,-.027,.013,.04],[.004,-.046,.048,.013]],.027,.325);
  numeral([[0,.04,.043,.013],[.02,0,.013,.09],[0,0,.04,.013],[0,-.04,.043,.013]],.335,0);
  numeral([[0,.04,.04,.013],[-.02,0,.013,.09],[0,0,.04,.013],[.02,-.02,.013,.04],[0,-.04,.04,.013]],0,-.33);
  numeral([[0,.04,.04,.013],[-.02,.02,.013,.04],[0,0,.04,.013],[.02,0,.013,.09],[0,-.04,.04,.013]],-.335,0);
  function hand(length,width,material,z) {
    const pivot=new THREE.Group();pivot.position.set(0,1.43,z);group.add(pivot);
    const shape=new THREE.Shape();shape.moveTo(-width/2,-.06);shape.lineTo(-width/2,length*.7);shape.lineTo(0,length);shape.lineTo(width/2,length*.7);shape.lineTo(width/2,-.06);shape.closePath();
    add(new THREE.ShapeGeometry(shape),material,0,0,0,pivot);return pivot;
  }
  const hour=hand(.27,.047,ink,.326),minute=hand(.39,.03,ink,.34),second=hand(.405,.016,sweep,.354);
  hour.name='Local hour hand';minute.name='Local minute hand';second.name='Local second hand';
  add(new THREE.SphereGeometry(.035,10,8),brass,0,1.43,.369);
  const window=add(new THREE.PlaneGeometry(.56,.46),ink,0,.58,.259);window.castShadow=false;
  const pendulum=new THREE.Group();pendulum.position.set(0,.83,.28);group.add(pendulum);
  add(new THREE.BoxGeometry(.025,.34,.025),brass,0,-.18,0,pendulum);
  const bob=add(new THREE.CylinderGeometry(.105,.105,.035,24),brass,0,-.35,0,pendulum);bob.rotation.x=Math.PI/2;
  const formatter=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short',hourCycle:'h23'});
  let lastSecond=-1;
  return {
    group,
    update(date,animate,onReadout,motionTime=0,reducedMotion=false) {
      const angles=getLocalClockAngles(date,animate);
      hour.rotation.z=angles.hour;minute.rotation.z=angles.minute;second.rotation.z=angles.second;
      // Decorative time pauses independently of the real local clock.
      pendulum.rotation.z=reducedMotion?0:Math.sin(motionTime*Math.PI*2)*.16;
      const wholeSecond=Math.floor(date.getTime()/1000);
      if(wholeSecond!==lastSecond){lastSecond=wholeSecond;const parts=formatter.formatToParts(date);onReadout?.({label:formatter.format(date),time:parts.filter(part=>part.type!=='timeZoneName').map(part=>part.value).join('').trim(),zone:parts.find(part=>part.type==='timeZoneName')?.value||'',iso:date.toISOString(),...angles});}
    }
  };
}
