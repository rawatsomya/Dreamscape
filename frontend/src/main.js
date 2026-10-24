import { MenuScreen } from './MenuScreen.js';
import { Game } from './game/Game.js';

const canvas = document.getElementById('game');
const input = document.getElementById('story-prompt');
const btn = document.getElementById('start-btn');
const out = document.getElementById('json-out');
const status = document.getElementById('status');
const promptOverlay = document.getElementById('prompt-overlay');
const preview = document.getElementById('mock-assets-preview');

const WIDTH = 1280;
const HEIGHT = 720;
canvas.width = WIDTH;
canvas.height = HEIGHT;

const menu = new MenuScreen(canvas);
const game = new Game(canvas);

let mode = 'menu'; // menu | playing

/** Keep internal 1280×720; CSS stretches canvas to full window. */
function fitCanvasToWindow() {
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
}

function repositionOverlay() {
  if (mode !== 'menu') return;
  // Center overlay on the full viewport (game fills the screen)
  promptOverlay.style.left = '50%';
  promptOverlay.style.top = '52%';
  promptOverlay.style.transform = 'translate(-50%, -50%)';
  promptOverlay.style.transformOrigin = 'center center';
}

function onResize() {
  fitCanvasToWindow();
  repositionOverlay();
  if (typeof menu.resize === 'function') menu.resize(WIDTH, HEIGHT);
}

window.addEventListener('resize', onResize);
onResize();

function menuLoop() {
  if (mode !== 'menu') return;
  menu.update();
  menu.draw();
  requestAnimationFrame(menuLoop);
}
requestAnimationFrame(menuLoop);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hideMenuChrome() {
  promptOverlay.classList.add('hidden');
  if (out) out.style.display = 'none';
  if (preview) preview.style.display = 'none';
  if (status) status.textContent = '';
}

async function onGo() {
  const prompt = input.value.trim();
  if (!prompt) {
    if (status) status.textContent = 'Type a story idea first.';
    return;
  }

  btn.disabled = true;
  if (status) status.textContent = 'Loading mock world…';

  try {
    await sleep(400);
    const data = await fetch('/mock/desert-dunes.json').then((r) => {
      if (!r.ok) throw new Error('Failed to load desert-dunes.json');
      return r.json();
    });

    if (out) {
      out.style.display = 'block';
      out.textContent = JSON.stringify(data, null, 2);
    }
    if (preview) preview.style.display = 'flex';
    if (status) status.textContent = `Starting ${data.theme?.title || 'mock'}…`;

    mode = 'playing';
    hideMenuChrome();
    await game.start(data);
  } catch (err) {
    console.error(err);
    mode = 'menu';
    promptOverlay.classList.remove('hidden');
    if (status) status.textContent = 'Failed to start mock';
    if (out) {
      out.style.display = 'block';
      out.textContent = String(err.message || err);
    }
    requestAnimationFrame(menuLoop);
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener('click', onGo);
input.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') onGo();
});
