import { MenuScreen } from './MenuScreen.js';

const canvas = document.getElementById('game');
const promptOverlay = document.getElementById('prompt-overlay');
const storyPrompt = document.getElementById('story-prompt');
const startBtn = document.getElementById('start-btn');

// Fixed virtual resolution
const WIDTH = 1280;
const HEIGHT = 720;
canvas.width = WIDTH;
canvas.height = HEIGHT;

const menu = new MenuScreen(canvas);

// Positioning overlay right beneath the header text
function repositionOverlay() {
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width / WIDTH;

  // Center horizontally, position around centerY + 40
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

// Handle GO button
function submitStory() {
  const story = storyPrompt.value.trim();
  console.log('[Dreamscape] User submitted story prompt:', story);
}

startBtn.addEventListener('click', submitStory);
storyPrompt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    submitStory();
  }
});

// Render Loop
function loop() {
  menu.update();
  menu.draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
