// A bounded spring approximation of inertia, not a fluid simulation.
// F = -kx - bv; small integration steps stay stable even in the SVG renderer.
export function createBrewMotion() {
  const axes = [['x', 'vx'], ['z', 'vz']];
  const state = { x: 0, z: 0, vx: 0, vz: 0 };
  const clamp = (n, limit) => Math.max(-limit, Math.min(limit, n));
  return {
    state,
    impulse(x, z) {
      if (!Number.isFinite(x) || !Number.isFinite(z)) return;
      state.vx = clamp(state.vx + x, 1.8);
      state.vz = clamp(state.vz + z, 1.8);
    },
    update(delta, reduced = false) {
      if (reduced) { this.reset(); return state; }
      let remaining = Number.isFinite(delta) ? clamp(delta, .1) : 0;
      while (remaining > 0) {
        const dt = Math.min(remaining, 1 / 120);
        for (const [position, velocity] of axes) {
          state[velocity] += (-90 * state[position] - 9 * state[velocity]) * dt;
          state[position] += state[velocity] * dt;
          if (Math.abs(state[position]) > .14) {
            state[position] = clamp(state[position], .14);
            state[velocity] *= .25;
          }
          if (Math.abs(state[position]) < .00001 && Math.abs(state[velocity]) < .0001) state[position] = state[velocity] = 0;
        }
        remaining -= dt;
      }
      return state;
    },
    reset() { state.x = state.z = state.vx = state.vz = 0; },
  };
}

