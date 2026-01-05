// Timer utilities
let timerId = null;
let startTime = null;

export function start(onTick) {
  startTime = Date.now();
  timerId = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    onTick(elapsed);
  }, 1000);
}

export function stop() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  return startTime ? (Date.now() - startTime) / 1000 : 0;
}

export function reset() {
  stop();
  startTime = null;
}
