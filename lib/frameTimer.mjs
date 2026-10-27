/** THREE.Timer behind the Clock-shaped interface still required by R3F 9.
 * No document listeners are attached: the app already suspends hidden canvases,
 * and R3F 9 does not dispose its internal clock on root teardown.
 */
export function createFrameTimer(Timer, now = () => performance.now()) {
  const timer = new Timer();
  return {
    autoStart: true,
    running: false,
    startTime: 0,
    oldTime: 0,
    elapsedTime: 0,
    start() {
      this.startTime = this.oldTime = now();
      timer.update(this.startTime);
      this.elapsedTime = 0;
      this.running = true;
    },
    stop() {
      this.getDelta();
      this.running = false;
      this.autoStart = false;
    },
    getDelta() {
      if (this.autoStart && !this.running) {
        this.start();
        return 0;
      }
      if (!this.running) return 0;
      this.oldTime = now();
      // R3F calls this once before its subscribers; every useFrame receives this delta.
      timer.update(this.oldTime);
      const delta = timer.getDelta();
      this.elapsedTime += delta;
      return delta;
    },
    getElapsedTime() {
      this.getDelta();
      return this.elapsedTime;
    },
  };
}
