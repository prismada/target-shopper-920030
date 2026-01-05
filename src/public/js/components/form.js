// Form component
let config = null;

export function setConfig(cfg) {
  config = cfg;
}

export function init(onSubmit) {
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const btn = document.getElementById('btn');

  // Set example from config
  if (config?.example) {
    input.value = config.example;
  }

  // Set button text from config
  if (config?.buttonText) {
    btn.textContent = config.buttonText;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      onSubmit(query);
    }
  });

  return { form, input, btn };
}

export function disable(btn) {
  btn.disabled = true;
  btn.textContent = config?.workingText || 'Working...';
}

export function enable(btn) {
  btn.disabled = false;
  btn.textContent = config?.buttonText || 'Send';
}
