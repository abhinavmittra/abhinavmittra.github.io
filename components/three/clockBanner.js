import * as THREE from 'three';

/** A readable local-time label attached to the clock as the camera moves. */
export function createClockBanner(host,clock,button){
  let width=host.clientWidth,height=host.clientHeight,w=button.offsetWidth,h=button.offsetHeight;
  const point=new THREE.Vector3();
  const obstacle={x:0,y:0,w:0,h:0},obstacles=[obstacle],empty=[];
  let transform='';
  const observer=new ResizeObserver(()=>{width=host.clientWidth;height=host.clientHeight;w=button.offsetWidth;h=button.offsetHeight;});
  observer.observe(host);observer.observe(button);
  return {
    update(camera,show=true){
      if(!show){button.hidden=true;return empty;}
      clock.updateWorldMatrix(true,false);point.set(0,-.02,.4).applyMatrix4(clock.matrixWorld).project(camera);
      const px=(point.x+1)*width/2,py=(1-point.y)*height/2;
      button.hidden=!show||point.z>1||px<0||px>width||py<0||py>height;
      if(button.hidden)return empty;
      const x=Math.max(4,Math.min(width-w-4,px-w/2)),y=Math.max(4,Math.min(height-h-64,py+8));
      const next=`translate3d(${x}px,${y}px,0)`;
      if(next!==transform){button.style.transform=next;transform=next;}
      obstacle.x=x-8;obstacle.y=y-6;obstacle.w=w+16;obstacle.h=h+12;
      return obstacles;
    },
    dispose(){observer.disconnect();}
  };
}
