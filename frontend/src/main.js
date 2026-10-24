import { MenuScreen } from './MenuScreen.js';

const canvas = document.getElementById('game');
const input = document.getElementById('story-prompt');
const btn = document.getElementById('start-btn');
const out = document.getElementById('json-out');
const status = document.getElementById('status');
const promptOverlay = document.getElementById('prompt-overlay');

// Virtual Resolution
const WIDTH = 1280;
const HEIGHT = 720;
canvas.width = WIDTH;
canvas.height = HEIGHT;

const menu = new MenuScreen(canvas);

// Positioning overlay over the canvas
function repositionOverlay() {
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width / WIDTH;

  const overlayY = rect.top + (HEIGHT / 2 + 40) * scale;
  const overlayX = rect.left + rect.width / 2;

  promptOverlay.style.left = `${overlayX}px`;
  promptOverlay.style.top = `${overlayY}px`;
  promptOverlay.style.transform = `translate(-50%, -50%) scale(${Math.min(1, Math.max(0.65, scale))})`;
  promptOverlay.style.transformOrigin = 'center center';
}

window.addEventListener('resize', repositionOverlay);
new ResizeObserver(repositionOverlay).observe(canvas);
requestAnimationFrame(repositionOverlay);

// Menu render loop
function loop() {
  menu.update();
  menu.draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function onGo() {
  const prompt = input.value.trim();
  if (!prompt) {
    if (status) status.textContent = 'Type a story idea first.';
    return;
  }

  btn.disabled = true;
  if (status) status.textContent = 'Generating world (Mock Mode)…';
  if (out) {
    out.style.display = 'block';
    out.textContent = 'Generating…';
  }

  try {
    // mock
    await sleep(800);
    const data = await fetch('/mock/sugar-rush.json').then((r) => r.json());

    // show data in #json-out
    if (out) {
      out.style.display = 'block';
      out.textContent = JSON.stringify(data, null, 2);
    }
    const previewContainer = document.getElementById('mock-assets-preview');
    if (previewContainer) {
      previewContainer.style.display = 'flex';
    }
    if (status) status.textContent = `OK — ${data.theme?.title || 'world'} ready (Mock)`;
    console.log('Dreamscape JSON (Mock):', data);
  } catch (err) {
    console.error(err);
    if (status) status.textContent = 'Failed to load mock JSON';
    if (out) out.textContent = String(err.message || err);
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener('click', onGo);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') onGo();
});
