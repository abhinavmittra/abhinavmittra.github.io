import * as THREE from "three";
import { createWorkspaceModels } from "./workspaceModels";
import { createWorkspaceSurroundings } from "./workspaceSurroundings";
import { optimizeGeometry } from "./optimizeGeometry";
import { deskPalette, deskStationColors } from "../../content/appearance";
import { interfaceCopy } from "../../content/portfolio";

export const deskPositions = {
  discovery: [-2.6, 0, -1.35],
  incident: [1.25, 0, 1.7],
  integrations: [3.2, 0, -1.65],
  fieldnotes: [-3.45, 0, 2.35],
  coffee: [0.15, 0, 3.3],
  clock: [5.05, -0.1, 1.15],
};

/** Reuses the approved desk geometry; R3F owns the camera and React owns the interface. */
export function createRestoredDesk(onUpdate) {
  const world = new THREE.Group();
  world.name = "The Systems Desk";
  const stations = {},
    layers = [],
    animated = [],
    flows = [],
    surfaces = {};
  const material = (color, opts = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.66,
      metalness: 0.22,
      ...opts,
    });
  const mesh = (geometry, mat, parent, x = 0, y = 0, z = 0) => {
    const item = new THREE.Mesh(geometry, mat);
    item.position.set(x, y, z);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  };
  const box = (w, h, d, mat, parent, x = 0, y = 0, z = 0) =>
    mesh(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  function rounded(w, d, h, mat, parent, x = 0, y = 0, z = 0, r = 0.15) {
    const s = new THREE.Shape(),
      a = -w / 2,
      b = -d / 2;
    s.moveTo(a + r, b);
    s.lineTo(a + w - r, b);
    s.quadraticCurveTo(a + w, b, a + w, b + r);
    s.lineTo(a + w, b + d - r);
    s.quadraticCurveTo(a + w, b + d, a + w - r, b + d);
    s.lineTo(a + r, b + d);
    s.quadraticCurveTo(a, b + d, a, b + d - r);
    s.lineTo(a, b + r);
    s.quadraticCurveTo(a, b, a + r, b);
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: h,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 2,
      curveSegments: 6,
      steps: 1,
    });
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, -h / 2, 0);
    return mesh(geometry, mat, parent, x, y, z);
  }
  const cylinder = (radius, height, mat, parent, x = 0, y = 0, z = 0) =>
    mesh(
      new THREE.CylinderGeometry(radius, radius, height, 24),
      mat,
      parent,
      x,
      y,
      z,
    );
  const line = (points, mat, parent = world, radius = 0.014) =>
    mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        40,
        radius,
        5,
        false,
      ),
      mat,
      parent,
    );
  const ring = (radius, tube, mat, parent, x = 0, y = 0, z = 0) => {
    const item = mesh(
      new THREE.TorusGeometry(radius, tube, 6, 40),
      mat,
      parent,
      x,
      y,
      z,
    );
    item.rotation.x = -Math.PI / 2;
    return item;
  };
  const texture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 440;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = deskPalette.graphite;
    ctx.fillRect(0, 0, 768, 440);
    ctx.fillStyle = deskPalette.paper;
    ctx.font = "500 42px system-ui";
    ctx.fillText("Engineering at Cisco", 42, 78);
    ctx.font = "25px system-ui";
    ctx.fillStyle = deskPalette.sand;
    ctx.fillText("Applications · APIs · agent workflows", 42, 125);
    ctx.strokeStyle = deskPalette.periwinkle;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(170, 260);
    ctx.lineTo(620, 260);
    ctx.stroke();
    for (const [label, left] of [
      ["Brief", 55],
      ["Discover", 290],
      ["Review", 525],
    ]) {
      ctx.fillStyle = deskPalette.olive;
      ctx.fillRect(left, 220, 175, 78);
      ctx.fillStyle = deskPalette.paper;
      ctx.font = "28px system-ui";
      ctx.fillText(label, left + 22, 269);
    }
    ctx.font = "24px system-ui";
    ctx.fillText("A person reviews the next step.", 55, 376);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  };
  const tools = { material, mesh, box, rounded, ring, cylinder, line, texture };
  const accentMat = material(deskPalette.periwinkle, {
      roughness: 0.4,
      metalness: 0.15,
    }),
    accentSoft = accentMat;
  const glowMat = new THREE.MeshBasicMaterial({ color: deskPalette.sand });
  const deskSurface = material(deskPalette.graphite, { roughness: 0.85 });
  rounded(12.9, 8.2, 0.4, deskSurface, world, 0, -0.35, 0, 0.35);
  rounded(
    13.04,
    8.34,
    0.045,
    material(deskPalette.edge),
    world,
    0,
    -0.52,
    0,
    0.37,
  );
  function makeStation(key, w, d) {
    const group = new THREE.Group();
    group.position.set(...deskPositions[key]);
    group.userData.station = key;
    world.add(group);
    stations[key] = group;
    const surface = material(deskPalette.mat, { roughness: 0.8, metalness: 0 });
    surfaces[key] = surface;
    rounded(w, d, 0.17, surface, group, 0, 0.12, 0);
    rounded(
      w + 0.09,
      d + 0.09,
      0.055,
      material(deskStationColors[key], { roughness: 0.7, metalness: 0 }),
      group,
      0,
      0.02,
      0,
    );
    return group;
  }
  const models = createWorkspaceModels({
    world,
    software: false,
    makeStation,
    tools,
    accentMat,
    accentSoft,
    glowMat,
    layers,
    animated,
    flows,
    onUpdate,
  });
  // A•WAKE gets its own visible, clickable flask at the front edge. The mountain cup stays in its story.
  world.add(models.deskBottle.group);
  models.deskBottle.group.position.set(...deskPositions.coffee);
  models.deskBottle.group.scale.setScalar(0.67);
  models.deskBottle.group.rotation.y = 0.35;
  // Give the flask its own tabletop pad so the A•WAKE callout resolves to this station.
  const coffeePad = rounded(
    1.9,
    1.55,
    0.075,
    material(deskPalette.mat, { roughness: 0.76, metalness: 0 }),
    world,
    deskPositions.coffee[0],
    -0.14,
    deskPositions.coffee[2],
    0.16,
  );
  surfaces.coldbrew = coffeePad.material;
  rounded(
    1.99,
    1.64,
    0.035,
    material(deskStationColors.coldbrew || deskStationColors.discovery, {
      roughness: 0.7,
      metalness: 0,
    }),
    world,
    deskPositions.coffee[0],
    -0.195,
    deskPositions.coffee[2],
    0.17,
  );
  const bottleLayer = layers.find(
    (item) => item.mesh === models.deskBottle.group,
  );
  bottleLayer.y = models.deskBottle.group.position.y;
  // The desk-scale flask keeps its original pixels and silhouette without a transmission render pass.
  models.deskBottle.group.traverse((object) => {
    if (object.material?.transmission) {
      object.material.transmission = 0;
      object.material.transparent = true;
      object.material.opacity = 0.3;
      object.material.depthWrite = false;
    }
  });
  stations.coldbrew = models.deskBottle.group;
  const surroundings = createWorkspaceSurroundings({
    world,
    tools,
    animated,
    software: false,
    lampCopy: {
      brand: "A•WAKE",
      offQuote: interfaceCopy.lampOffQuote,
      onQuote: interfaceCopy.lampOnQuote,
    },
  });
  stations.lamp = surroundings.lamp;
  stations.clock = models.deskClock.group;
  const paths = [
    [
      [-2.3, -0.08, -2.7],
      [-2.3, -0.08, -3.25],
      [3.2, -0.08, -3.25],
      [3.2, -0.08, -2.8],
    ],
    [
      [-0.8, -0.08, -1.1],
      [-0.25, -0.08, -1.1],
      [-0.25, -0.08, 0.4],
      [1.25, -0.08, 0.4],
    ],
    [
      [3.8, -0.08, -0.4],
      [4.75, -0.08, -0.4],
      [4.75, -0.08, 1.7],
      [2.8, -0.08, 1.7],
    ],
    [
      [-2.5, -0.08, 2.3],
      [-1.7, -0.08, 2.3],
      [-1.7, -0.08, 3.15],
      [0.6, -0.08, 3.15],
      [0.6, -0.08, 2.8],
    ],
  ];
  const cableMaterial = material(deskPalette.periwinkle, {
    emissive: deskPalette.periwinkle,
    emissiveIntensity: 0.15,
    roughness: 0.8,
    metalness: 0,
  });
  const movingPackets = [];
  for (const points of paths) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      false,
      "centripetal",
    );
    const cable = mesh(
      new THREE.TubeGeometry(curve, 40, 0.025, 5, false),
      cableMaterial,
      world,
    );
    cable.name = "Animated connection between project stations";
    for (let i = 0; i < 3; i++) movingPackets.push({ curve, phase: i / 3 });
    for (const p of [points[0], points.at(-1)])
      cylinder(0.065, 0.02, accentMat, world, ...p);
  }
  const packets = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.055, 8, 6),
    glowMat,
    movingPackets.length,
  );
  packets.name = "Data flow packets";
  world.add(packets);
  const protectedObjects = new Set([
    ...layers.map((x) => x.mesh),
    ...animated.map((x) => x.mesh),
    ...flows.map((x) => x.mesh),
  ]);
  // Preserve the deforming liquid geometry while batching the flask's cap ribs.
  world.traverse((object) => {
    if (object.name === "Cold brew inside the glass")
      protectedObjects.add(object);
  });
  const batched = optimizeGeometry(world, protectedObjects);
  const cursor = new THREE.Object3D(),
    point = new THREE.Vector3(),
    date = new Date();
  let elapsed = 0,
    separation = 0,
    arrivalTime = 2;
  const arrivalGroups = [
    stations.discovery,
    stations.incident,
    stations.integrations,
    stations.fieldnotes,
  ];
  const arrivalBase = arrivalGroups.map((group) => group.position.y);
  function update(delta, { motion, flow, look }, onReadout) {
    const dt = Math.min(delta, 0.05);
    if (motion) {
      elapsed += (dt * look.speed) / 100;
      arrivalTime += (dt * look.speed) / 100;
    }
    for (let i = 0; i < arrivalGroups.length; i++) {
      const progress = motion
        ? Math.min(1, Math.max(0, (arrivalTime - i * 0.06) / 0.8))
        : 1;
      arrivalGroups[i].position.y =
        arrivalBase[i] + Math.pow(1 - progress, 3) * 0.75;
    }
    separation = THREE.MathUtils.damp(separation, look.separation / 100, 7, dt);
    if (!motion) separation = look.separation / 100;
    for (const layer of layers)
      layer.mesh.position.y = layer.y + separation * layer.index * 0.26;
    for (const item of animated) {
      if (item.type === "rotateZ") item.mesh.rotation.z = elapsed * item.speed;
      else if (item.type === "sway")
        item.mesh.rotation.z = motion
          ? Math.sin(elapsed * 0.6 + item.phase) * 0.03
          : 0;
      else if (item.type === "steam")
        item.mesh.material.opacity = motion
          ? 0.15 + Math.sin(elapsed + item.phase) * 0.08
          : 0.15;
    }
    const lampAnimating = surroundings.update(dt);
    packets.visible = flow;
    for (let i = 0; i < movingPackets.length; i++) {
      const packet = movingPackets[i];
      packet.curve.getPointAt((elapsed * 0.065 + packet.phase) % 1, point);
      cursor.position.copy(point);
      cursor.updateMatrix();
      packets.setMatrixAt(i, cursor.matrix);
    }
    packets.instanceMatrix.needsUpdate = true;
    for (const item of flows) {
      item.mesh.visible = flow;
      item.curve.getPointAt(
        (elapsed * item.speed + item.phase) % 1,
        item.mesh.position,
      );
    }
    date.setTime(Date.now());
    models.deskClock.update(date, motion, onReadout, elapsed, !motion);
    return lampAnimating;
  }
  function highlight(id) {
    for (const [key, mat] of Object.entries(surfaces)) {
      mat.color.set(
        key === id ? deskStationColors[key] || "#efd594" : deskPalette.mat,
      );
      mat.emissive.set(
        key === id ? deskStationColors[key] || "#efd594" : "#000000",
      );
      mat.emissiveIntensity = key === id ? 0.42 : 0;
    }
  }
  function setAccent(value) {
    accentMat.color.set(value);
    accentMat.emissive.set(value);
    accentMat.emissiveIntensity = 0.07;
    glowMat.color.set(value);
    cableMaterial.color.set(value);
    cableMaterial.emissive.set(value);
  }
  function theme(value) {
    deskSurface.color.set(
      value === "daylight" ? "#aca993" : deskPalette.graphite,
    );
    surroundings.floor.material.color.set(
      value === "daylight"
        ? "#c7c6b8"
        : value === "dusk"
          ? "#292b35"
          : "#313a35",
    );
  }
  function dispose() {
    models.deskBottle.dispose();
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    world.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      for (const mat of object.material
        ? Array.isArray(object.material)
          ? object.material
          : [object.material]
        : []) {
        materials.add(mat);
        for (const value of Object.values(mat))
          if (value?.isTexture) textures.add(value);
      }
    });
    textures.forEach((x) => x.dispose());
    geometries.forEach((x) => x.dispose());
    materials.forEach((x) => x.dispose());
    world.clear();
  }
  return {
    world,
    stations,
    clock: models.deskClock.group,
    update,
    highlight,
    theme,
    setAccent,
    replay() {
      arrivalTime = 0;
    },
    setLamp: surroundings.setLampLit,
    dispose,
    batched,
    occupiedChair: surroundings.occupiedChair,
  };
}
