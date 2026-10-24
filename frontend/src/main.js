import { createStory } from './api.js';

const input = document.getElementById('story-prompt');
const btn = document.getElementById('start-btn');
const out = document.getElementById('json-out');
const status = document.getElementById('status');
const stars = document.getElementById('stars');

// tiny starfield decoration
if (stars) {
  for (let i = 0; i < 50; i++) {
    const s = document.createElement('span');
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.opacity = String(0.25 + Math.random() * 0.6);
    stars.appendChild(s);
  }
}

async function onGo() {
  const prompt = input.value.trim();
  if (!prompt) {
    if (status) status.textContent = 'Type a story idea first.';
    return;
  }

  btn.disabled = true;
  if (status) status.textContent = 'Calling Gemini…';
  if (out) out.textContent = 'Generating…';

  try {
    const data = await createStory(prompt);
    if (out) out.textContent = JSON.stringify(data, null, 2);
    if (status) status.textContent = `OK — ${data.theme?.title || 'world'} ready (JSON only for now)`;
    console.log('Dreamscape JSON', data);
  } catch (err) {
    console.error(err);
    if (status) status.textContent = 'Failed';
    if (out) out.textContent = String(err.message || err);
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener('click', onGo);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') onGo();
});
