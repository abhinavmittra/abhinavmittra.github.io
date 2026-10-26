/** Exponential damping has the same settling time at 30, 60, or 120 Hz. */
export function dampValue(current, target, rate, delta) {
  const next=target + (current - target) * Math.exp(-rate * delta);
  return Math.abs(next-target)<.001 ? target : next;
}

/** One simulation clock for all decorative movement, including replay and pause. */
export function createWorkspaceMotion() {
  const state = { time: 0, arrival: 2, separation: 0, moving: true };
  return {
    state,
    replay() { state.arrival = 0; },
    update(delta, { paused, gentle, speed, separation }) {
      state.moving = !paused && !gentle;
      if (state.moving) {
        const step = delta * speed / 100;
        state.time += step;
        state.arrival += step;
      }
      // Explicit inspection controls remain usable while decorative motion is paused.
      state.separation = gentle ? separation / 100 : dampValue(state.separation, separation / 100, 7, delta);
      return state;
    },
    arrivalOffset(index) {
      const progress = Math.min(1, Math.max(0, (state.arrival - index * .06) / .8));
      return Math.pow(1 - progress, 3) * .75;
    }
  };
}
