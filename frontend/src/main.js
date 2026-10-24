import { MenuScreen } from './MenuScreen.js';
import { createStory } from './api.js';

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

// Menu loop
function loop() {
  menu.update();
  menu.draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Hardcoded fallback data in case frontend runs standalone without backend
const FALLBACK_SUGAR_RUSH = {
  theme: {
    title: "Sugar Rush Nebula",
    premise: "A whimsical candy planet where ferocious gummy bears roam sugary hills, boiling chocolate rivers carve through the valleys, and steaming espresso geysers provide lightning-fast boosts.",
    art_style: "Vibrant pastel 16-bit pixel art with candy-cane striping, neon gummy translucency, and rich chocolate gloss",
    assets: {
      character: "sprites/hero.png",
      enemy_1: "sprites/enemy.png",
      platform: "sprites/platform.png",
      npc: "sprites/npc.png"
    }
  },
  level: {
    level_id: "level_000",
    chapter: "The Gumdrop Foothills",
    chapter_number: 1,
    narration: "Tread lightly on the frosted crust; the gummy prowlers are hungry, and the chocolate rapids below are scalding hot.",
    background: "backgrounds/ch00_bg.png",
    world: { width: 3200, height: 1080 },
    platforms: [
      { x: 0, y: 850, w: 3200, h: 230, role: "ground" },
      { x: 420, y: 700, w: 192, h: 48, role: "platform" },
      { x: 780, y: 580, w: 220, h: 48, role: "platform" },
      { x: 1250, y: 660, w: 180, h: 48, role: "platform" },
      { x: 1700, y: 540, w: 240, h: 48, role: "platform" },
      { x: 2200, y: 680, w: 200, h: 48, role: "platform" },
      { x: 2600, y: 560, w: 220, h: 48, role: "platform" }
    ],
    pickups: [
      { role: "coin", x: 460, y: 650 },
      { role: "coin", x: 820, y: 530 },
      { role: "health", x: 1300, y: 610 },
      { role: "key", x: 1780, y: 490 },
      { role: "coin", x: 2250, y: 630 }
    ],
    enemies: [
      {
        role: "enemy_1",
        x: 1000,
        y: 806,
        patrol: [850, 1150],
        behavior: "chase",
        detect_range: 350,
        chase_speed: 220
      },
      {
        role: "enemy_1",
        x: 2050,
        y: 806,
        patrol: [1900, 2200],
        behavior: "chase",
        detect_range: 400,
        chase_speed: 240
      }
    ],
    blocks: [],
    hazards: [
      {
        type: "lava",
        x: 1400,
        y: 830,
        w: 300,
        h: 50
      }
    ],
    bounce_pads: [],
    teleporters: [],
    npcs: [
      {
        role: "npc",
        name: "Barista Bonbon",
        x: 220,
        y: 786,
        dialogue: [
          { speaker: "Barista Bonbon", text: "Drink up that espresso essence to outrun the gummy beasts!" },
          { speaker: "Barista Bonbon", text: "Mind the molten chocolate flow ahead, and retrieve the sugar key to escape." }
        ]
      }
    ],
    exit: {
      role: "exit_door",
      x: 3000,
      y: 658,
      w: 128,
      h: 192,
      unlock_condition: "has_key",
      locked_dialogue: "Find the sugar key to unseal the candy vault.",
      target_level: "level_001"
    },
    player_spawn: { x: 60, y: 780 },
    physics: {
      gravity: 1200,
      jump_force: -520,
      move_speed: 420,
      max_fall_speed: 600,
      friction: 800,
      coyote_time_ms: 80,
      jump_buffer_ms: 100
    },
    mechanics: {
      double_jump: true,
      gravity_scale: 1.0,
      player_action: "none",
      weather: "none"
    }
  }
};

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
    let data;
    try {
      data = await createStory(prompt);
    } catch {
      // If backend is not running, simulate ~1s delay locally with same mock
      await new Promise(r => setTimeout(r, 1000));
      data = FALLBACK_SUGAR_RUSH;
    }

    if (out) {
      out.style.display = 'block';
      out.textContent = JSON.stringify(data, null, 2);
    }
    if (status) status.textContent = `OK — ${data.theme?.title || 'world'} ready (Mock)`;
    console.log('Dreamscape JSON (Mock):', data);
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
