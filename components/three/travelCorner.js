import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { deskPalette as p } from '../../content/appearance';

/** A packed trekking bag on a low sofa, built from shared materials and batchable geometry. */
export function createTravelCorner({ world, tools }) {
  const { material, mesh, box, rounded, cylinder, line } = tools;
  const corner = new THREE.Group();
  corner.name = 'Backpacking corner';
  corner.position.set(-7.35, -1.59, -2.05);
  corner.rotation.y = Math.PI / 2;
  corner.userData.action = 'travel';
  world.add(corner);
  const upholstery = material(p.sand, { roughness: 1, metalness: 0 });
  const wood = material(p.edge, { roughness: .9, metalness: 0 });
  const fabric = material(p.olive, { roughness: 1, metalness: 0 });
  const pocket = material('#78845a', { roughness: 1, metalness: 0 });
  const webbing = material(p.graphite, { roughness: .95, metalness: 0 });
  const trim = material(p.paper, { roughness: .9, metalness: 0 });
  const metal = material(p.metal, { roughness: .4, metalness: .6 });
  const softBox = (w, h, d, mat, parent, x, y, z, radius = .1) =>
    mesh(new RoundedBoxGeometry(w, h, d, 2, radius), mat, parent, x, y, z);
  rounded(2.8, 1.25, .24, wood, corner, 0, .3, 0, .13);
  for (const x of [-1.05, 1.05]) for (const z of [-.42, .42])
    cylinder(.07, .28, wood, corner, x, .14, z);
  for (const x of [-.65, .65]) {
    softBox(1.25, .3, 1.04, upholstery, corner, x, .55, .03, .13);
    const cushion = softBox(1.25, .88, .24, upholstery, corner, x, 1.06, -.47, .12);
    cushion.rotation.x = -.12;
  }
  for (const x of [-1.4, 1.4])
    softBox(.22, .65, 1.2, upholstery, corner, x, .79, 0, .1);

  const bag = new THREE.Group();
  bag.name = 'Trekking backpack — open the travel atlas';
  bag.position.set(.45, .71, .12);
  bag.rotation.set(-.07, -.12, -.08);
  bag.userData.action = 'travel';
  corner.add(bag);
  softBox(.99, 1.42, .65, fabric, bag, 0, .77, 0, .16);
  softBox(1.08, .31, .74, fabric, bag, 0, 1.49, .02, .13);
  softBox(.72, .68, .19, pocket, bag, 0, .65, .37, .1);
  box(.6, .025, .03, trim, bag, 0, .89, .475);
  for (const x of [-.34, .34]) {
    box(.075, 1.15, .035, webbing, bag, x, .91, .37);
    softBox(.13, .14, .06, metal, bag, x, 1.08, .41, .02);
    box(.075, .35, .025, webbing, bag, x, .92, .44);
    line([[x, 1.39, -.28], [x * 1.45, 1.08, -.5], [x * 1.45, .48, -.48], [x, .25, -.26]], webbing, bag, .055);
  }
  line([[-.2, 1.6, -.15], [-.15, 1.78, -.18], [.15, 1.78, -.18], [.2, 1.6, -.15]], webbing, bag, .035);
  for (const side of [-1, 1]) {
    softBox(.22, .48, .42, pocket, bag, side * .56, .37, .02, .08);
    box(.25, .09, .72, webbing, bag, side * .5, .97, 0);
  }
  const bottle = cylinder(.105, .51, metal, bag, -.59, .6, .02);
  cylinder(.065, .07, webbing, bottle, 0, .29, 0);
  const bedroll = cylinder(.18, 1.2, trim, bag, 0, 1.78, .02);
  bedroll.rotation.z = Math.PI / 2;
  for (const y of [-.36, .36]) {
    const strap = mesh(new THREE.TorusGeometry(.187, .025, 5, 16), webbing, bedroll, 0, y, 0);
    strap.rotation.x = Math.PI / 2;
  }
  for (const x of [.6, .73]) {
    cylinder(.018, 1.85, metal, bag, x, .94, -.28);
    cylinder(.037, .23, webbing, bag, x, 1.83, -.28);
    cylinder(.075, .025, webbing, bag, x, .16, -.28);
  }
  // A small mountain patch gives the bag a readable front without another raster texture.
  const patch = new THREE.BufferGeometry();
  patch.setAttribute('position', new THREE.Float32BufferAttribute([-.13, .5, .48, .13, .5, .48, 0, .69, .48], 3));
  patch.computeVertexNormals();
  mesh(patch, trim, bag);
  return { bag, fabric };
}
