// Main app entry point
import { State, setState } from './state.js';
import { streamRequest } from './api.js';
import { setConfig, updateTitle, updateFavicon, formatTime, notify, requestNotifications } from './ui.js';
import * as Timer from './timer.js';
import * as Form from './components/form.js';
import * as Status from './components/status.js';
import * as Results from './components/results.js';
import * as ErrorDisplay from './components/error.js';

function updateUI(state, message) {
  updateTitle(state);
  updateFavicon(state);

  if (state === State.SEARCHING) {
    Status.show(message);
    Results.hide();
    ErrorDisplay.hide();
  } else if (state === State.DONE) {
    Status.hide();
  } else if (state === State.ERROR) {
    Status.hide();
    Results.hide();
    ErrorDisplay.show(message);
  }
}

async function handleSearch(query) {
  const { btn } = window.formElements;

  Form.disable(btn);
  setState(State.SEARCHING);
  updateUI(State.SEARCHING);
  Results.clear();
  Results.show();

  Timer.start((elapsed) => {
    const time = formatTime(elapsed);
    Status.updateTime(time);
    updateTitle('searching', time);
  });

  let totalIn = 0, totalOut = 0;

  try {
    for await (const chunk of streamRequest(query)) {
      if (chunk.type === 'text' || chunk.type === 'result') {
        Results.append(chunk.text);
      } else if (chunk.type === 'tool') {
        Status.updateText(`Using ${chunk.name}...`);
      } else if (chunk.type === 'usage') {
        totalIn += chunk.input;
        totalOut += chunk.output;
        Results.setUsage(totalIn + totalOut, totalIn * 0.25/1e6 + totalOut * 1.25/1e6);
      } else if (chunk.type === 'done') {
        const elapsed = Timer.stop();
        Results.setDuration(formatTime(elapsed));
        setState(State.DONE);
        updateUI(State.DONE);
        notify('Done!');
      } else if (chunk.error) {
        throw new Error(chunk.error);
      }
    }
  } catch (err) {
    Timer.stop();
    setState(State.ERROR);
    updateUI(State.ERROR, err.message);
  } finally {
    Form.enable(btn);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Load config
  const config = await fetch('/config.json').then(r => r.json());

  // Set config on modules that need it
  setConfig(config);
  Form.setConfig(config);
  Status.setConfig(config);

  // Update header
  document.getElementById('agentName').textContent = config.name;
  document.getElementById('agentTagline').textContent = config.tagline;
  document.title = config.name;

  // Initialize components
  Status.init();
  Results.init();
  ErrorDisplay.init();

  window.formElements = Form.init(handleSearch);

  // Request notification permission on first input focus
  window.formElements.input.addEventListener('focus', requestNotifications, { once: true });
});
