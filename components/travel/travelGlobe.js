import * as THREE from 'three';
import { createFrameScheduler } from '../three/frameScheduler';
import {geoOrthographic,geoPath,geoGraticule10} from 'd3-geo';
import {geographicFeatures,countryColor,globePalette,mapProjection,mapPaths,visitedAt,globeVector} from './geography';

/** One geographic model drives the WebGL globe, projected SVG fallback, and world overview. */
export function createTravelGlobe(host,miniHost,records,visits,{onSelect,onInteract,onRenderer}={}) {
  let scheduler=null;
  const features=geographicFeatures(records),graticule=geoGraticule10();
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let gentle=media.matches,spin=!gentle,selected=visits[0].code,lon=visits[0].longitude,lat=visits[0].latitude,target=null,disposed=false,last=performance.now(),lastPaint=0,dirty=true;
  let width=host.clientWidth,height=host.clientHeight,pointer=null;
  const namespace='http://www.w3.org/2000/svg';
  const svg=(tag,attrs={})=>{const node=document.createElementNS(namespace,tag);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,String(v));return node;};
  const overview=svg('svg',{viewBox:'0 0 720 360',role:'img','aria-label':`World map highlighting all ${visits.length} countries visited`});
  overview.append(svg('rect',{width:720,height:360,fill:globePalette.ocean}));
  const mapNodes=mapPaths(features,720,360).map(({code,d})=>{const p=svg('path',{d,fill:countryColor(code,selected,visits),stroke:globePalette.border,'stroke-width':.4,'data-country':code});overview.append(p);return{code,node:p};});
  miniHost.append(overview);
  let renderer,camera,scene,globe,texture,marker,canvas,svgGlobe,paths=[],gridPath,selectionPoint;
  const probe=document.createElement('canvas');let hasGL=false;try{hasGL=!!probe.getContext('webgl2');}catch{}
  if(hasGL)try{renderer=new THREE.WebGLRenderer({canvas:probe,alpha:true,antialias:true});}catch{}
  const software=!renderer;
  const projection=geoOrthographic().clipAngle(90).precision(.3);
  if(renderer){
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-2.5,2.5,2.5,-2.5,.1,30);
    canvas=document.createElement('canvas');canvas.width=innerWidth<800?2048:4096;canvas.height=canvas.width/2;texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
    globe=new THREE.Mesh(new THREE.SphereGeometry(2,64,40),new THREE.MeshBasicMaterial({map:texture}));scene.add(globe);
    marker=new THREE.Mesh(new THREE.SphereGeometry(.027,12,8),new THREE.MeshBasicMaterial({color:'#15191d'}));scene.add(marker);
    host.append(renderer.domElement);
  }else{
    svgGlobe=svg('svg',{'data-renderer':'svg'});svgGlobe.append(svg('circle',{fill:globePalette.ocean,'data-ocean':'true'}));
    gridPath=svg('path',{fill:'none',stroke:'#8a9585','stroke-width':.5,opacity:.28});svgGlobe.append(gridPath);
    paths=features.map(feature=>{const node=svg('path',{fill:countryColor(feature.properties.code,selected,visits),stroke:globePalette.border,'stroke-width':.55,'data-country':feature.properties.code});svgGlobe.append(node);return{feature,node};});
    selectionPoint=svg('circle',{r:3.5,fill:'#15191d',stroke:globePalette.selected,'stroke-width':1.5});svgGlobe.append(selectionPoint);host.append(svgGlobe);
  }
  const surface=renderer?.domElement||svgGlobe;
  surface.tabIndex=0;surface.setAttribute('role','img');surface.setAttribute('aria-label','Interactive globe. Drag or use arrow keys to turn. Select a country from the flags above.');
  host.dataset.renderer=software?'svg':'webgl';onRenderer?.(software?'Projected globe':'3D globe');
  function paintTexture(){
    if(canvas){const ctx=canvas.getContext('2d');const path=geoPath(mapProjection(canvas.width,canvas.height),ctx);ctx.fillStyle=globePalette.ocean;ctx.fillRect(0,0,canvas.width,canvas.height);
      for(const feature of features){ctx.beginPath();path(feature);ctx.fillStyle=countryColor(feature.properties.code,selected,visits);ctx.fill();ctx.strokeStyle=globePalette.border;ctx.lineWidth=1.4;ctx.stroke();}
      ctx.beginPath();path(graticule);ctx.strokeStyle='#b6c7a326';ctx.lineWidth=1;ctx.stroke();texture.needsUpdate=true;
    }
    for(const{code,node}of mapNodes)node.setAttribute('fill',countryColor(code,selected,visits));
    for(const{feature,node}of paths)node.setAttribute('fill',countryColor(feature.properties.code,selected,visits));
    const country=visits.find(c=>c.code===selected);if(marker)marker.position.set(...globeVector(country.longitude,country.latitude,2.018));
    host.dataset.selected=selected;dirty=true;
  }
  function resize(){width=host.clientWidth;height=host.clientHeight;const radius=Math.min(width,height)*.445;projection.translate([width/2,height/2]).scale(radius);
    if(renderer){const aspect=width/Math.max(height,1),span=2.25*Math.max(1,1/aspect);camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();renderer.setSize(width,height);}
    else{svgGlobe.setAttribute('viewBox',`0 0 ${width} ${height}`);const ocean=svgGlobe.querySelector('circle');ocean.setAttribute('cx',width/2);ocean.setAttribute('cy',height/2);ocean.setAttribute('r',radius);}dirty=true;scheduler?.request();
  }
  const observer=new ResizeObserver(resize);observer.observe(host);resize();paintTexture();
  function render(){
    lon=((lon+180)%360+360)%360-180;
    projection.rotate([-lon,-lat,0]);
    if(renderer){camera.position.set(...globeVector(lon,lat,8));camera.lookAt(0,0,0);renderer.render(scene,camera);}
    else{const path=geoPath(projection);gridPath.setAttribute('d',path(graticule)||'');for(const{feature,node}of paths)node.setAttribute('d',path(feature)||'');const c=visits.find(c=>c.code===selected);const front=globeVector(c.longitude,c.latitude).reduce((sum,n,i)=>sum+n*globeVector(lon,lat)[i],0)>0;selectionPoint.style.display=front?'':'none';if(front){const point=projection([c.longitude,c.latitude]);selectionPoint.setAttribute('cx',point[0]);selectionPoint.setAttribute('cy',point[1]);}}
    host.dataset.longitude=lon.toFixed(4);host.dataset.latitude=lat.toFixed(4);dirty=false;
  }
  function interrupt(){target=null;spin=false;onInteract?.();}
  function down(e){if(e.button!==0||pointer)return;interrupt();pointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};surface.setPointerCapture(e.pointerId);}
  function move(e){if(!pointer||e.pointerId!==pointer.id)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer.moved ||= Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>5;lon-=dx*.35;lat=THREE.MathUtils.clamp(lat+dy*.35,-80,80);pointer.x=e.clientX;pointer.y=e.clientY;dirty=true;scheduler?.request();}
  function up(e){if(!pointer||e.pointerId!==pointer.id)return;const tap=!pointer.moved;pointer=null;if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId);if(tap){const r=surface.getBoundingClientRect();projection.rotate([-lon,-lat,0]);const x=e.clientX-r.left,y=e.clientY-r.top,rad=projection.scale();if(Math.hypot(x-width/2,y-height/2)<=rad){const code=visitedAt(features,visits,projection.invert([x,y]));if(code)onSelect?.(code);}}}
  function cancel(){pointer=null;}
  function key(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();interrupt();lon+=(e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0);lat=THREE.MathUtils.clamp(lat+(e.key==='ArrowUp'?10:e.key==='ArrowDown'?-10:0),-80,80);dirty=true;scheduler?.request();}
  surface.addEventListener('pointerdown',down);surface.addEventListener('pointermove',move);surface.addEventListener('pointerup',up);surface.addEventListener('pointercancel',cancel);surface.addEventListener('keydown',key);
  const onMedia=e=>{gentle=e.matches;if(gentle&&target){lon=target.lon;lat=target.lat;target=null;}dirty=true;scheduler?.request();};media.addEventListener('change',onMedia);
  function draw(now){if(disposed)return;const dt=Math.min((now-last)/1000,software?.25:.05);last=now;
    if(!document.hidden){if(target){const delta=((target.lon-lon+540)%360)-180,a=1-Math.exp(-6*dt);lon+=delta*a;lat+=(target.lat-lat)*a;if(Math.abs(delta)+Math.abs(target.lat-lat)<.03){lon=target.lon;lat=target.lat;target=null;}dirty=true;scheduler?.request();}else if(spin&&!gentle&&!pointer){lon+=dt*4;dirty=true;scheduler?.request();}
      if(dirty&&(!software||now-lastPaint>40)){render();lastPaint=now;}}
    return dirty||!!target||(spin&&!gentle&&!pointer);
  }
  render();scheduler=createFrameScheduler(host,draw);
  return {
    select(code){const c=visits.find(c=>c.code===code);if(!c)return;selected=code;spin=false;if(gentle){lon=c.longitude;lat=c.latitude;target=null;}else target={lon:c.longitude,lat:c.latitude};paintTexture();scheduler?.request();},
    setSpin(value){spin=value;scheduler?.request();},
    reset(){this.select(visits[0].code);},
    dispose(){disposed=true;scheduler?.dispose();observer.disconnect();media.removeEventListener('change',onMedia);surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerup',up);surface.removeEventListener('pointercancel',cancel);surface.removeEventListener('keydown',key);scene?.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});texture?.dispose();renderer?.dispose();renderer?.forceContextLoss();surface.remove();overview.remove();},
  };
}
