// Results component
let el, contentEl, durationEl, tokensEl, costEl;

export function init() {
  el = document.getElementById('results');
  contentEl = document.getElementById('content');
  durationEl = document.getElementById('duration');
  tokensEl = document.getElementById('tokens');
  costEl = document.getElementById('cost');
}

export function clear() {
  if (contentEl) contentEl.textContent = '';
  if (tokensEl) tokensEl.textContent = '0';
  if (costEl) costEl.textContent = '0.00';
}

export function append(text) {
  if (contentEl) contentEl.textContent = text; // Replace with latest
}

export function setDuration(duration) {
  if (durationEl) durationEl.textContent = duration;
}

export function setUsage(tokens, cost) {
  if (tokensEl) tokensEl.textContent = tokens.toLocaleString();
  if (costEl) costEl.textContent = cost.toFixed(4);
}

export function show() {
  if (el) el.classList.add('visible');
}

export function hide() {
  if (el) el.classList.remove('visible');
}
