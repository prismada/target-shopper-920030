// UI utilities
const FAVICONS = {
  idle: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23334155'/></svg>",
  searching: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%2322c55e'/></svg>",
  done: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%2322c55e'/><path d='M30 50 L45 65 L70 35' stroke='white' stroke-width='8' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  error: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23ef4444'/><path d='M35 35 L65 65 M65 35 L35 65' stroke='white' stroke-width='8' stroke-linecap='round'/></svg>"
};

let config = null;

export function setConfig(cfg) {
  config = cfg;
}

export function updateTitle(state, time = '') {
  const name = config?.name || 'Agent';
  const titles = {
    idle: name,
    searching: time ? `${time}...` : '...',
    done: `✓ Done`,
    error: '✗ Error'
  };
  document.title = titles[state] || name;
}

export function updateFavicon(state) {
  const favicon = document.getElementById('favicon');
  if (favicon) {
    favicon.href = FAVICONS[state] || FAVICONS.idle;
  }
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function notify(message) {
  if (document.hidden && Notification.permission === 'granted') {
    new Notification(config?.name || 'Agent', { body: message });
  }
}

export function requestNotifications() {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
