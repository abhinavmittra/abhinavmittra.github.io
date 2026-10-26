/** Tilt only the upper vertices; the base and radius stay inside their container. */
export function createLiquidSurface(geometry, height) {
  const positions = geometry.attributes.position;
  const rest = positions.array.slice();
  geometry.computeBoundingBox();
  const baseY=geometry.boundingBox.min.y;
  let previousX = NaN, previousZ = NaN, previousRipple=NaN, previousPhase=NaN;
  return (x, z, ripple=0, phase=0) => {
    if (x === previousX && z === previousZ && ripple===previousRipple && (!ripple || phase===previousPhase)) return;
    previousX = x; previousZ = z; previousRipple=ripple; previousPhase=phase;
    for (let i = 0; i < positions.count; i++) {
      const offset = i * 3;
      const weight = Math.max(0, Math.min(1, (rest[offset + 1] - baseY) / height));
      const wave=ripple*Math.sin(rest[offset]*8+phase)*Math.cos(rest[offset+2]*7-phase*.7);
      positions.setY(i, rest[offset + 1] + weight * (x * rest[offset] + z * rest[offset + 2]) + weight**3*wave);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  };
}
