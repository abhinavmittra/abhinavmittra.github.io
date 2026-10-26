import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Merge static siblings only. Moving hands, fans, layers and picking roots stay independent. */
export function optimizeGeometry(root, protectedObjects = new Set()) {
  let removed = 0;
  root.traverse((parent) => {
    const buckets = new Map();
    for (const child of parent.children) {
      if (
        !child.isMesh ||
        child.isInstancedMesh ||
        child.children.length ||
        !child.visible ||
        protectedObjects.has(child) ||
        Object.keys(child.userData).length ||
        Array.isArray(child.material) ||
        child.material.transparent ||
        child.material.map
      )
        continue;
      const key = [
        child.material.uuid,
        child.renderOrder,
        child.castShadow,
        child.receiveShadow,
        Object.keys(child.geometry.attributes).sort().join(","),
      ].join(":");
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(child);
    }
    for (const siblings of buckets.values()) {
      if (siblings.length < 3) continue;
      const parts = siblings.map((child) => {
        child.updateMatrix();
        return (
          child.geometry.index
            ? child.geometry.toNonIndexed()
            : child.geometry.clone()
        ).applyMatrix4(child.matrix);
      });
      const geometry = mergeGeometries(parts);
      parts.forEach((part) => part.dispose());
      if (!geometry) continue;
      const first = siblings[0];
      const batch = new THREE.Mesh(geometry, first.material);
      batch.name = "Batched static desk details";
      batch.castShadow = first.castShadow;
      batch.receiveShadow = first.receiveShadow;
      batch.renderOrder = first.renderOrder;
      for (const child of siblings) {
        parent.remove(child);
        child.geometry.dispose();
      }
      parent.add(batch);
      removed += siblings.length - 1;
    }
  });
  return removed;
}
