// Error component
let el = null;

export function init() {
  el = document.getElementById('error');
}

export function show(message) {
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

export function hide() {
  if (!el) return;
  el.classList.remove('visible');
}
