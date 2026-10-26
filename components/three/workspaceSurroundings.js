import * as THREE from "three";
import { createSeatedVisitor, chooseVisitorSeat } from "./seatedVisitor";
import { deskPalette } from "../../content/appearance";

/** A small room fragment: floor, desk legs and a quiet planted corner. */
export function createWorkspaceSurroundings({
  world,
  tools,
  animated,
  software,
  lampCopy,
}) {
  const { material, mesh, box, rounded, cylinder } = tools,
    p = deskPalette;
  const frame = material(p.graphite, { roughness: 0.85, metalness: 0.1 });
  const floor = rounded(
    16.8,
    11.8,
    0.12,
    material("#272d2b", { roughness: 1, metalness: 0 }),
    world,
    -.6,
    -1.65,
    0,
    0.6,
  );
  floor.name = "Room floor";
  if (software) floor.renderOrder = -8;
  for (const x of [-5.7, 5.7])
    for (const z of [-3.35, 3.35])
      box(0.2, 1.05, 0.2, frame, world, x, -1.05, z);
  const planter = rounded(
    2.2,
    0.65,
    0.4,
    material(p.sand, { roughness: 1, metalness: 0 }),
    world,
    -6.85,
    -1.38,
    0.6,
    0.1,
  );
  planter.name = "Window garden";
  planter.rotation.y = Math.PI / 2;
  for (let i = 0; i < 5; i++) {
    const stem = new THREE.Group();
    stem.position.set(-6.85, -1.18, -0.2 + i * 0.4);
    world.add(stem);
    cylinder(0.025, 1.4, frame, stem, 0, 0.7, 0);
    for (let j = 0; j < 3; j++) {
      const leaf = mesh(
        new THREE.SphereGeometry(1, 12, 8),
        material(i % 2 ? p.olive : "#697853", { roughness: 1, metalness: 0 }),
        stem,
        j % 2 ? -0.13 : 0.13,
        0.85 + j * 0.23,
        0,
      );
      leaf.scale.set(0.28, 0.1, 0.13);
      leaf.rotation.z = j % 2 ? -0.5 : 0.5;
    }
    animated.push({ mesh: stem, type: "sway", phase: i * 0.8 });
  }
  // The travel notebook and reading lamp make the room feel lived in without enclosing the camera.
  const book = rounded(
    0.85,
    0.6,
    0.11,
    material(p.periwinkle),
    world,
    -5.55,
    -0.06,
    -2.8,
    0.03,
  );
  box(0.72, 0.035, 0.5, material(p.paper), book, 0, 0.065, 0);
  const lamp = new THREE.Group();
  lamp.name = "A•WAKE reading lamp and card";
  lamp.position.set(-5.6, 0, -3.4);
  lamp.userData.action = "lamp";
  world.add(lamp);
  cylinder(0.32, 0.07, frame, lamp, 0, -0.08, 0);
  cylinder(0.035, 1.55, frame, lamp, 0, 0.7, 0);
  const shade = mesh(
    new THREE.ConeGeometry(0.38, 0.4, 24, 1, true),
    material(p.sand, { side: THREE.DoubleSide, roughness: 0.9 }),
    lamp,
    0,
    1.53,
    0,
  );
  shade.name = "Reading lamp shade";
  const bulbMaterial = new THREE.MeshStandardMaterial({
    color: p.metal,
    emissive: "#000000",
    roughness: 0.35,
    metalness: 0.1,
  });
  const bulb = mesh(
    new THREE.SphereGeometry(0.12, 16, 12),
    bulbMaterial,
    lamp,
    0,
    1.3,
    0,
  );
  bulb.name = "Reading lamp bulb";
  // Small physical toggle on the base; the whole lamp also remains clickable.
  const switchBase = rounded(
    0.16,
    0.23,
    0.045,
    material(p.graphite, { roughness: 0.48, metalness: 0.18 }),
    lamp,
    0.18,
    -0.018,
    0.12,
    0.035,
  );
  switchBase.name = "Reading lamp toggle base";
  const switchLever = new THREE.Group();
  switchLever.name = "Reading lamp toggle";
  switchLever.position.set(0.18, 0.012, 0.12);
  lamp.add(switchLever);
  const lever = mesh(
    new THREE.CylinderGeometry(0.035, 0.045, 0.14, 12),
    material(p.metal, { roughness: 0.38, metalness: 0.35 }),
    switchLever,
    0,
    0.065,
    0,
  );
  lever.name = "Lamp switch lever";
  const indicatorMaterial = new THREE.MeshBasicMaterial({ color: p.metal });
  const indicator = mesh(
    new THREE.SphereGeometry(0.027, 10, 8),
    indicatorMaterial,
    lamp,
    0.18,
    0.035,
    0.245,
  );
  const card = new THREE.Group();
  card.name = "A•WAKE table card";
  card.position.set(-0.2, -0.02, 1.8);
  card.rotation.y = 0.18;
  lamp.add(card);
  box(
    1.16,
    0.72,
    0.055,
    material(p.paper, { roughness: 0.9, metalness: 0 }),
    card,
    0,
    0.36,
    0,
  );
  const cardCanvas = document.createElement("canvas");
  cardCanvas.width = 640;
  cardCanvas.height = 400;
  const cardContext = cardCanvas.getContext("2d");
  if (!cardContext)
    throw new Error("Could not create the A•WAKE card artwork.");
  const drawCard = (quote) => {
    cardContext.fillStyle = p.paper;
    cardContext.fillRect(0, 0, 640, 400);
    cardContext.fillStyle = p.graphite;
    cardContext.font = "700 76px system-ui";
    cardContext.fillText(lampCopy.brand, 36, 128);
    cardContext.fillStyle = p.olive;
    cardContext.fillRect(36, 165, 568, 5);
    cardContext.fillStyle = p.graphite;
    cardContext.font = "500 32px system-ui";
    cardContext.fillText(quote, 36, 235, 568);
    cardContext.fillStyle = p.olive;
    cardContext.fillRect(36, 286, 94, 10);
  };
  drawCard(lampCopy.offQuote);
  const cardTexture = new THREE.CanvasTexture(cardCanvas);
  cardTexture.colorSpace = THREE.SRGBColorSpace;
  const faceMaterial = new THREE.MeshBasicMaterial({
    color: software ? p.paper : "#ffffff",
    map: software ? null : cardTexture,
  });
  const face = mesh(
    new THREE.PlaneGeometry(1.1, 0.66),
    faceMaterial,
    card,
    0,
    0.36,
    0.03,
  );
  face.name = "A•WAKE card print";
  const lampLight = new THREE.PointLight(0xffd998, 0, 3.8, 2);
  lampLight.position.set(0, 1.25, 0);
  lamp.add(lampLight);
  let lampLit = false,
    lampIntensity = 0;
  const bulbOnColor = new THREE.Color("#fff0c2");
  const setLampLit = (value) => {
    lampLit = Boolean(value);
    indicatorMaterial.color.set(lampLit ? "#c6d98d" : p.metal);
    drawCard(lampLit ? lampCopy.onQuote : lampCopy.offQuote);
    if (!software) cardTexture.needsUpdate = true;
    return lampLit;
  };
  const update = (delta) => {
    const dt = Math.min(delta, 0.05),
      target = lampLit ? 1 : 0;
    lampIntensity += (target - lampIntensity) * (1 - Math.exp(-8 * dt));
    bulbMaterial.color.set(p.metal).lerp(bulbOnColor, lampIntensity);
    bulbMaterial.emissive.set("#ffd27f");
    bulbMaterial.emissiveIntensity = lampIntensity * 1.2;
    lampLight.intensity = lampIntensity && !software ? lampIntensity * 10 : 0;
    switchLever.rotation.x = THREE.MathUtils.lerp(0.4, -0.4, lampIntensity);
    return Math.abs(target - lampIntensity) > 0.01;
  };
  // Two quiet bentwood chairs frame the workbench without enclosing the orbit camera.
  const upholstery = material(p.olive, { roughness: 0.95, metalness: 0 });
  const wood = material(p.sand, { roughness: 0.9, metalness: 0 });
  function chair(x, z, angle) {
    const group = new THREE.Group();
    group.name = "Bentwood desk chair";
    group.position.set(x, -0.66, z);
    group.rotation.y = angle;
    world.add(group);
    rounded(1.22, 1.1, 0.14, upholstery, group, 0, 0, 0, 0.15);
    const back = rounded(1.24, 0.13, 0.76, wood, group, 0, 0.49, 0.48, 0.12);
    back.rotation.x = -0.12;
    for (const side of [-1, 1]) {
      const rail = box(
        0.065,
        0.65,
        0.065,
        frame,
        group,
        side * 0.48,
        0.3,
        0.44,
      );
      rail.rotation.x = -0.12;
      for (const front of [-1, 1]) {
        const leg = cylinder(
          0.045,
          0.87,
          frame,
          group,
          side * 0.48,
          -0.45,
          front * 0.4,
        );
        leg.rotation.z = -side * 0.08;
      }
    }
    return group;
  }
  const chairs = [chair(-3.6, 4.75, -0.12), chair(4.5, -4.85, Math.PI + 0.22)];
  const occupiedChair = chooseVisitorSeat();
  chairs[occupiedChair].add(createSeatedVisitor());
  return { floor, occupiedChair, lamp, setLampLit, update };
}
