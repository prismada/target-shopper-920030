// Status component
let el = null;
let textEl = null;
let timeEl = null;
let config = null;

export function setConfig(cfg) {
  config = cfg;
}

export function init() {
  el = document.getElementById('status');
  textEl = document.getElementById('statusText');
  timeEl = document.getElementById('statusTime');
}

export function show(message) {
  if (!el) return;
  el.classList.add('visible', 'searching');
  textEl.textContent = message || config?.statusText || 'Working...';
  timeEl.textContent = '0:00';
}

export function hide() {
  if (!el) return;
  el.classList.remove('visible', 'searching');
}

export function updateTime(formatted) {
  if (timeEl) timeEl.textContent = formatted;
}

export function updateText(text) {
  if (textEl) textEl.textContent = text;
}
