// State management
export const State = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  DONE: 'done',
  ERROR: 'error'
};

let current = State.IDLE;
let listeners = [];

export function getState() {
  return current;
}

export function setState(newState) {
  current = newState;
  listeners.forEach(fn => fn(current));
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}
