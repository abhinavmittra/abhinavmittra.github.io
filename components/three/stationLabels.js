import * as THREE from "three";
import { dampValue } from "./workspaceMotion.js";

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const overlap = (a, b) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const rect = () => ({x:0,y:0,w:0,h:0});
function score(p, index, entry, obstacles, models, placed) {
  let cost = 0;
  for (const b of obstacles) cost += overlap(p,b)*40;
  for (const b of models) cost += overlap(p,b)*3;
  for (const b of placed) cost += overlap(p,b)*30;
  const m=entry.model;
  return cost + Math.hypot(p.x+entry.w/2-m.x-m.w/2,p.y+entry.h/2-m.y-m.h/2)*2
    + index*3 - (index===entry.choice?40:0);
}

/** Translucent HTML annotations beside their objects; all sizes are observer-cached. */
export function createStationLabels(host, stations, buttons) {
  let width = host.clientWidth,
    height = host.clientHeight;
  const compact = matchMedia('(max-width: 800px)');
  let dirty=true,settling=true,lastSeparation=-1,lastSelected=null,lastHovered=null,lastSnap=false,layouts=0;
  const view=new THREE.Matrix4(),projection=new THREE.Matrix4();
  const models=[],placed=[],previousObstacles=[];
  const vector = new THREE.Vector3(),
    ns = "http://www.w3.org/2000/svg";
  const wires = document.createElementNS(ns, "svg");
  wires.classList.add("station-leaders");
  wires.setAttribute("aria-hidden", "true");
  buttons[0]?.parentElement.prepend(wires);
  const entries = buttons.map((button) => {
    const station = stations[button.dataset.station];
    station.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3()
      .setFromObject(station)
      .applyMatrix4(station.matrixWorld.clone().invert());
    const size = button.getBoundingClientRect(),
      wire = document.createElementNS(ns, "path");
    wire.style.stroke = button.style.getPropertyValue("--station-color");
    wires.append(wire);
    return {
      button,
      station,
      bounds,
      wire,
      w: size.width,
      h: size.height,
      x: 0,
      y: 0,
      ready: false,
      choice: 0,
      visible: true,
      model: rect(),
      rect: rect(),
      matrix: new THREE.Matrix4(),
      candidates: Array.from({length:8},rect),
      engaged: false,
      transform: '',
      path: '',
    };
  });
  const blockers = [stations.lamp, stations.clock]
    .filter(Boolean)
    .map((station) => {
      station.updateWorldMatrix(true, true);
      return {
        station,
        bounds: new THREE.Box3()
          .setFromObject(station)
          .applyMatrix4(station.matrixWorld.clone().invert()),
        matrix: new THREE.Matrix4(),
        model: rect(),
      };
    });
  const modelEntries = [...entries, ...blockers];
  for(const entry of modelEntries) models.push(entry.model);
  const observer = new ResizeObserver((records) => {
    dirty=true;
    width = host.clientWidth;
    height = host.clientHeight;
    for (const record of records) {
      const entry = entries.find((e) => e.button === record.target);
      if (entry) {
        entry.w =
          record.borderBoxSize?.[0]?.inlineSize || entry.button.offsetWidth;
        entry.h =
          record.borderBoxSize?.[0]?.blockSize || entry.button.offsetHeight;
      }
    }
  });
  observer.observe(host);
  entries.forEach((e) => observer.observe(e.button));
  /** @param {THREE.Camera} camera
   * @param {number} delta
   * @param {{separation?:number, selected?:string|null, hovered?:string|null, snap?:boolean, obstacles?:Array<{x:number,y:number,w:number,h:number}>}} options
   */
  function update(
    camera,
    delta,
    {
      separation = 0,
      selected = null,
      hovered = null,
      snap = false,
      obstacles = [],
    } = {},
  ) {
    if (!width || !height) return;
    // Phones use an ordinary DOM story dock. Skip projection, collision allocation and wires entirely.
    if (compact.matches) {
      for (const entry of entries) {
        entry.visible = false;
        entry.button.hidden = true;
        entry.wire.style.display = 'none';
      }
      dirty=true;
      return;
    }
    // Camera and station transforms are stable once arrival/orbit settles. Keep
    // projection, collision scoring and DOM writes out of those idle frames.
    let project=dirty || !view.equals(camera.matrixWorldInverse) || !projection.equals(camera.projectionMatrix) || lastSeparation!==separation;
    for(const entry of modelEntries){
      entry.station.updateWorldMatrix(true,false);
      if(!entry.matrix.equals(entry.station.matrixWorld)) project=true;
    }
    if(previousObstacles.length!==obstacles.length) dirty=true;
    for(let i=0;i<obstacles.length;i++){
      const next=obstacles[i],old=previousObstacles[i] ||= rect();
      if(old.x!==next.x||old.y!==next.y||old.w!==next.w||old.h!==next.h) dirty=true;
      Object.assign(old,next);
    }
    previousObstacles.length=obstacles.length;
    for(const entry of entries){
      const engaged=hovered===entry.button.dataset.station||entry.button.matches(':hover, :focus-visible');
      if(entry.engaged!==engaged) dirty=true;
      entry.engaged=engaged;
    }
    if(!project&&!dirty&&!settling&&selected===lastSelected&&hovered===lastHovered&&snap===lastSnap) return;
    if(project){
    view.copy(camera.matrixWorldInverse);projection.copy(camera.projectionMatrix);lastSeparation=separation;
    for (const entry of modelEntries) {
      const { station, bounds } = entry;
      entry.matrix.copy(station.matrixWorld);
      let left = Infinity,
        top = Infinity,
        right = -Infinity,
        bottom = -Infinity;
      for (let i = 0; i < 8; i++) {
        vector
          .set(
            i & 1 ? bounds.max.x : bounds.min.x,
            i & 2 ? bounds.max.y + separation * 1.4 : bounds.min.y,
            i & 4 ? bounds.max.z : bounds.min.z,
          )
          .applyMatrix4(station.matrixWorld)
          .project(camera);
        const x = ((vector.x + 1) * width) / 2,
          y = ((1 - vector.y) * height) / 2;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
      Object.assign(entry.model,{x:left,y:top,w:right-left,h:bottom-top});
    }
    }
    dirty=false;settling=false;lastSelected=selected;lastHovered=hovered;lastSnap=snap;
    host.dataset.labelLayouts=String(++layouts);
    placed.length=0;
    for (const entry of entries) {
      const { button, model: m, w, h } = entry;
      entry.visible =
        (!selected || selected === button.dataset.station) &&
        m.x + m.w > 0 &&
        m.x < width &&
        m.y + m.h > 0 &&
        m.y < height;
      button.hidden = !entry.visible;
      entry.wire.style.display = entry.visible ? "" : "none";
      if (!entry.visible) continue;
      const candidates=entry.candidates;
      for(let i=0;i<8;i++){
        const p=candidates[i];
        p.x=i<2?m.x+(m.w-w)/2:i===2?m.x-w+8:i===3?m.x+m.w-8:i%2===0?m.x-w*.4:m.x+m.w-w*.6;
        p.y=i===0||i===4||i===5?m.y-h+4:i===1||i>=6?m.y+m.h-4:m.y+m.h*.4-h/2;
        p.x=clamp(p.x,4,Math.max(4,width-w-4));p.y=clamp(p.y,4,Math.max(4,height-h-4));p.w=w;p.h=h;
      }
      let best = entry.choice;
      if (!entry.engaged || !entry.ready){
        let bestScore=score(candidates[best],best,entry,obstacles,models,placed);
        for(let i=0;i<candidates.length;i++){
          const cost=score(candidates[i],i,entry,obstacles,models,placed);
          if(cost<bestScore){best=i;bestScore=cost;}
        }
      }
      entry.choice = best;
      const target = candidates[best];
      entry.x =
        snap || !entry.ready
          ? target.x
          : dampValue(entry.x, target.x, 14, delta);
      entry.y =
        snap || !entry.ready
          ? target.y
          : dampValue(entry.y, target.y, 14, delta);
      if(entry.x!==target.x||entry.y!==target.y) settling=true;
      Object.assign(entry.rect,{x:entry.x,y:entry.y,w,h});
      placed.push(entry.rect);
      entry.ready = true;
      const transform=`translate3d(${entry.x}px,${entry.y}px,0)`;
      if(entry.transform!==transform){button.style.transform=transform;entry.transform=transform;}
      const active = hovered === button.dataset.station;
      button.classList.toggle("is-hovered", active);
      button.dataset.ready = "true";
      const cx = entry.x + w / 2,
        cy = entry.y + h / 2,
        mx = m.x + m.w / 2,
        my = m.y + m.h / 2;
      // Stop at the model boundary, not its centre: short, quiet connectors.
      const dx = cx - mx,
        dy = cy - my,
        k =
          1 /
          Math.max(Math.abs(dx) / (m.w * 0.5), Math.abs(dy) / (m.h * 0.5), 1);
      const tx = mx + dx * k,
        ty = my + dy * k;
      const sx = clamp(tx, entry.x + 4, entry.x + w - 4),
        sy = clamp(ty, entry.y + 4, entry.y + h - 4);
      const path=`M${sx},${sy} L${tx},${ty}`;
      if(entry.path!==path){entry.wire.setAttribute('d',path);entry.path=path;}
      entry.wire.classList.toggle("active", active);
    }
  }
  return {
    update,
    hit(x, y) {
      if (buttons[0]?.parentElement.hidden) return null;
      return (
        entries.find(
          (e) =>
            e.visible &&
            e.ready &&
            x >= e.x &&
            x <= e.x + e.w &&
            y >= e.y &&
            y <= e.y + e.h,
        )?.button.dataset.station || null
      );
    },
    dispose() {
      observer.disconnect();
      wires.remove();
    },
  };
}
