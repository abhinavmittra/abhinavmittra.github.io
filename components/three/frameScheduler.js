/** One owned RAF per scene. Idle, hidden and off-screen views do no frame work. */
export function createFrameScheduler(host, draw) {
  let frame = 0,
    disposed = false,
    inView = true;
  const visible = () => inView && !document.hidden;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    host.dataset.sceneRunning = "false";
  };
  function tick(now) {
    frame = 0;
    if (disposed || !visible()) {
      stop();
      return;
    }
    if (draw(now)) request();
    else host.dataset.sceneRunning = "false";
  }
  function request() {
    if (!disposed && !frame && visible()) {
      host.dataset.sceneRunning = "true";
      frame = requestAnimationFrame(tick);
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      if (visible()) request();
      else stop();
    },
    { threshold: 0.01 },
  );
  observer.observe(host);
  const visibility = () => {
    if (visible()) request();
    else stop();
  };
  document.addEventListener("visibilitychange", visibility);
  request();
  return {
    request,
    dispose() {
      disposed = true;
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}
