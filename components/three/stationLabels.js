import * as THREE from "three";
import { dampValue } from "./workspaceMotion";

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const overlap = (a, b) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/** Translucent HTML annotations beside their objects; all sizes are observer-cached. */
export function createStationLabels(host, stations, buttons) {
  let width = host.clientWidth,
    height = host.clientHeight;
  const compact = matchMedia('(max-width: 800px)');
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
      };
    });
  const modelEntries = [...entries, ...blockers];
  const observer = new ResizeObserver((records) => {
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
      return;
    }
    const models = [];
    for (const entry of modelEntries) {
      const { station, bounds } = entry;
      station.updateWorldMatrix(true, false);
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
      entry.model = { x: left, y: top, w: right - left, h: bottom - top };
      models.push(entry.model);
    }
    const placed = [];
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
      const candidates = [
        { x: m.x + (m.w - w) / 2, y: m.y - h + 4 },
        { x: m.x + (m.w - w) / 2, y: m.y + m.h - 4 },
        { x: m.x - w + 8, y: m.y + m.h * 0.4 - h / 2 },
        { x: m.x + m.w - 8, y: m.y + m.h * 0.4 - h / 2 },
        { x: m.x - w * 0.4, y: m.y - h + 4 },
        { x: m.x + m.w - w * 0.6, y: m.y - h + 4 },
        { x: m.x - w * 0.4, y: m.y + m.h - 4 },
        { x: m.x + m.w - w * 0.6, y: m.y + m.h - 4 },
      ].map((p) => ({
        x: clamp(p.x, 4, Math.max(4, width - w - 4)),
        y: clamp(p.y, 4, Math.max(4, height - h - 4)),
        w,
        h,
      }));
      const score = (p, index) =>
        obstacles.reduce((sum, b) => sum + overlap(p, b), 0) * 40 +
        models.reduce((sum, b) => sum + overlap(p, b), 0) * 3 +
        placed.reduce((sum, b) => sum + overlap(p, b), 0) * 30 +
        Math.hypot(p.x + w / 2 - m.x - m.w / 2, p.y + h / 2 - m.y - m.h / 2) *
          2 +
        index * 3 -
        (index === entry.choice ? 40 : 0);
      const engaged =
        hovered === button.dataset.station ||
        button.matches(":hover, :focus-visible");
      let best = entry.choice;
      if (!engaged || !entry.ready)
        for (let i = 0; i < candidates.length; i++)
          if (score(candidates[i], i) < score(candidates[best], best)) best = i;
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
      entry.rect = { x: entry.x, y: entry.y, w, h };
      placed.push(entry.rect);
      entry.ready = true;
      button.style.transform = `translate3d(${entry.x}px,${entry.y}px,0)`;
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
      entry.wire.setAttribute("d", `M${sx},${sy} L${tx},${ty}`);
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
