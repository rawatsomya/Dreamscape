# Dreamscape — final mock sync for Antigravity (other machine)

Paste this whole file into Antigravity and say:

> apply every file below into our Dreamscape repo exactly at the given paths. create folders as needed. after that place the PNG assets listed under Binary assets (send those in a zip separately). then `cd frontend && npm install && npm run dev`.

## What this is

Playable **desert mock**: menu → GO → `desert-dunes.json` → fullscreen game, rembg sprites, tiled ground, code coin/key/health, **C/J shoot** + Web Audio.

## Controls

| Key | Action |
|-----|--------|
| WASD / arrows | Move |
| Space / W / Up | Jump |
| E | Talk |
| C or J | Shoot |

## Target tree

```text
frontend/
  index.html
  package.json
  vite.config.js
  src/main.js
  src/MenuScreen.js
  src/api.js
  src/game/{Game,Input,Physics,Player,Sound}.js
  public/mock/desert-dunes.json
  public/mock/sugar-rush.json
  public/mock/sprites_clean/{hero,enemy_1,enemy_2,enemy_3,npc,platform}.png
  public/mock/tiles/ground.png
  public/mock/backgrounds/ch00_bg.png
```

## Binary assets (not embedded here)

Zip and send `frontend/public/mock/` from the working machine (sprites_clean + tiles + backgrounds).  
Or copy from shared Drive. Code alone will run but show broken images without PNGs.

---

# SOURCE FILES — create or overwrite exactly


## `frontend/package.json`

```json
{
  "name": "dreamscape",
  "version": "1.0.0",
  "type": "module",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "devDependencies": {
    "vite": "^8.3.5"
  }
}

```

## `frontend/vite.config.js`

```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    host: true,
  },
});

```

## `frontend/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Playable Storybook</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #0a0a1a;
    }
    canvas#game {
      position: fixed;
      inset: 0;
      display: block;
      width: 100vw;
      height: 100vh;
      image-rendering: pixelated;
      background: #0a0a1a;
    }
    #prompt-overlay {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: auto;
      z-index: 10;
    }
    #prompt-overlay.hidden { display: none; }
    #story-prompt {
      width: 340px;
      height: 40px;
      padding: 0 14px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: #fff;
      font: 15px monospace;
      outline: none;
      transition: border-color 0.2s;
    }
    #story-prompt:focus {
      border-color: rgba(241, 196, 15, 0.7);
      background: rgba(255, 255, 255, 0.14);
    }
    #story-prompt::placeholder {
      color: rgba(255, 255, 255, 0.35);
    }
    #start-btn {
      height: 40px;
      padding: 0 18px;
      background: #6366f1;
      border: 3px solid #a78bfa;
      border-radius: 2px;
      color: #fff;
      font: bold 14px monospace;
      cursor: pointer;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 2px;
      box-shadow: 3px 3px 0 #312e81, inset 0 -3px 0 rgba(0,0,0,0.25);
      image-rendering: pixelated;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    #start-btn:hover {
      background: #818cf8;
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0 #312e81, inset 0 -3px 0 rgba(0,0,0,0.25);
    }
    #start-btn:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0 #312e81, inset 0 -1px 0 rgba(0,0,0,0.25);
    }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <div id="stars"></div>
  <div id="prompt-overlay">
    <input id="story-prompt" type="text" placeholder="Type your story idea..." maxlength="120" />
    <button id="start-btn">GO</button>
    <div id="status" style="color: #bbb; font: 13px monospace; margin-left: 8px;"></div>
  </div>
  <pre id="json-out" style="position: absolute; bottom: 130px; left: 20px; right: 20px; max-height: 180px; overflow: auto; background: rgba(0,0,0,0.85); color: #00ffcc; font: 12px monospace; padding: 12px; border-radius: 6px; border: 1px solid #333; z-index: 10; pointer-events: auto; display: none;"></pre>
  <div id="mock-assets-preview" style="position: absolute; bottom: 12px; left: 20px; right: 20px; display: none; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; background: rgba(16, 18, 27, 0.9); border: 1px solid #272d3d; padding: 10px; border-radius: 8px; z-index: 10;">
    <div style="font: 12px monospace; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">Desert mock (rembg):</div>
    <div style="text-align: center;"><img src="/mock/sprites_clean/hero.png" style="height: 48px; image-rendering: pixelated; border: 1px solid #444; border-radius: 4px; background: repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 10px 10px;" /><div style="font: 10px monospace; color: #aaa;">Hero</div></div>
    <div style="text-align: center;"><img src="/mock/sprites_clean/enemy_1.png" style="height: 48px; image-rendering: pixelated; border: 1px solid #444; border-radius: 4px; background: repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 10px 10px;" /><div style="font: 10px monospace; color: #aaa;">Scorpion</div></div>
    <div style="text-align: center;"><img src="/mock/sprites_clean/enemy_2.png" style="height: 48px; image-rendering: pixelated; border: 1px solid #444; border-radius: 4px; background: repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 10px 10px;" /><div style="font: 10px monospace; color: #aaa;">Cactus</div></div>
    <div style="text-align: center;"><img src="/mock/sprites_clean/enemy_3.png" style="height: 48px; image-rendering: pixelated; border: 1px solid #444; border-radius: 4px; background: repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 10px 10px;" /><div style="font: 10px monospace; color: #aaa;">Mummy</div></div>
    <div style="text-align: center;"><img src="/mock/sprites_clean/npc.png" style="height: 48px; image-rendering: pixelated; border: 1px solid #444; border-radius: 4px; background: repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 10px 10px;" /><div style="font: 10px monospace; color: #aaa;">Fox</div></div>
    <div style="text-align: center;"><img src="/mock/sprites_clean/platform.png" style="height: 48px; image-rendering: pixelated; border: 1px solid #444; border-radius: 4px; background: repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 10px 10px;" /><div style="font: 10px monospace; color: #aaa;">Platform</div></div>
    <div style="text-align: center;"><img src="/mock/tiles/ground.png" style="height: 48px; image-rendering: pixelated; border: 1px solid #444; border-radius: 4px;" /><div style="font: 10px monospace; color: #aaa;">Ground</div></div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>

```

## `frontend/src/main.js`

```js
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

```

## `frontend/src/MenuScreen.js`

```js
export class MenuScreen {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Design tokens
    this.bg = '#0a0a1a';
    this.titleColor = '#f1c40f';
    this.subtitleColor = '#e67e22';
    this.taglineColor = '#bbb';
    this.footerColor = '#555';
    this.footerSub = '#444';

    // Starfield particles
    this.stars = [];
    this.initStars(90);

    // UFO animation state
    this.ufo = {
      x: 180,
      y: 160,
      targetY: 160,
      hoverOffset: 0,
      hoverSpeed: 0.035,
      beamPulse: 0,
    };

    // Sparkles / Gemini mark sparkles
    this.time = 0;
  }

  initStars(count) {
    this.stars = [];
    const w = this.canvas.width || 1280;
    const h = this.canvas.height || 720;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() < 0.25 ? 1.8 : Math.random() < 0.6 ? 1.2 : 0.7,
        alpha: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        twinkleOffset: Math.random() * Math.PI * 2,
        speedX: -0.15 - Math.random() * 0.35,
      });
    }
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.initStars(Math.floor((w * h) / 10000));
  }

  update() {
    this.time += 1;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Update stars
    for (const star of this.stars) {
      star.x += star.speedX;
      if (star.x < 0) {
        star.x = w;
        star.y = Math.random() * h;
      }
    }

    // Update UFO floating motion
    this.ufo.hoverOffset = Math.sin(this.time * this.ufo.hoverSpeed) * 14;
    this.ufo.beamPulse = 0.5 + 0.5 * Math.sin(this.time * 0.05);
    
    // Slow UFO patrol
    this.ufo.x += 0.45;
    if (this.ufo.x > w + 80) {
      this.ufo.x = -80;
    }
  }

  draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, w, h);

    // Starfield
    for (const star of this.stars) {
      const alpha = star.alpha * (0.6 + 0.4 * Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset));
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw UFO in sky
    this.drawUFO(ctx, this.ufo.x, this.ufo.y + this.ufo.hoverOffset);

    // Title & Headers
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = w / 2;
    const centerY = h / 2;

    // Draw Gemini four-point sparkle mark above or next to title
    this.drawGeminiMark(ctx, centerX, centerY - 165, 18);

    // Main Title
    ctx.fillStyle = this.titleColor;
    ctx.font = 'bold 42px monospace';
    ctx.fillText('Dreamscape', centerX, centerY - 105);

    // Subtitle
    ctx.fillStyle = this.subtitleColor;
    ctx.font = '18px monospace';
    ctx.fillText('PLAYABLE STORYBOOK', centerX, centerY - 55);

    // Tagline
    ctx.fillStyle = this.taglineColor;
    ctx.font = 'italic 15px monospace';
    ctx.fillText('Generate dynamic 2D worlds from natural imagination', centerX, centerY - 20);

    // Footer information
    ctx.fillStyle = this.footerColor;
    ctx.font = '13px monospace';
    ctx.fillText('Powered by Gemini 2.0 • 2D Pixel Platformer Engine', centerX, h - 55);

    ctx.fillStyle = this.footerSub;
    ctx.font = '11px monospace';
    ctx.fillText('World Canvas 3200×1080 • Camera Viewport 1280×720', centerX, h - 35);
  }

  // Canvas-rendered Gemini 4-point star sparkle mark
  drawGeminiMark(ctx, cx, cy, size) {
    const pulse = 1 + 0.12 * Math.sin(this.time * 0.08);
    const s = size * pulse;

    ctx.save();
    ctx.translate(cx, cy);

    // Soft outer aura
    const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, s * 2.2);
    gradient.addColorStop(0, 'rgba(241, 196, 15, 0.55)');
    gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.25)');
    gradient.addColorStop(1, 'rgba(10, 10, 26, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, s * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 4-pointed curved star shape (Gemini icon)
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0);
    ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.closePath();
    ctx.fill();

    // Secondary diagonal accent sparkles
    const ds = s * 0.42;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -ds);
    ctx.quadraticCurveTo(0, 0, ds, 0);
    ctx.quadraticCurveTo(0, 0, 0, ds);
    ctx.quadraticCurveTo(0, 0, -ds, 0);
    ctx.quadraticCurveTo(0, 0, 0, -ds);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Canvas-rendered retro UFO
  drawUFO(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Tractor beam
    const beamAlpha = 0.08 + 0.08 * this.ufo.beamPulse;
    ctx.fillStyle = `rgba(167, 139, 250, ${beamAlpha})`;
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.lineTo(16, 8);
    ctx.lineTo(44, 90);
    ctx.lineTo(-44, 90);
    ctx.closePath();
    ctx.fill();

    // Cockpit glass dome
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(0, -2, 14, Math.PI, 0, false);
    ctx.fill();

    // Dome gloss
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-4, -7, 4, 0, Math.PI * 2);
    ctx.fill();

    // Saucer metallic body
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, 4, 34, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Saucer rim
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(0, 8, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flashing lights
    const colors = ['#f43f5e', '#eab308', '#22c55e', '#3b82f6'];
    const lightOffset = Math.floor(this.time / 10) % colors.length;
    for (let i = -2; i <= 2; i++) {
      const col = colors[(i + 2 + lightOffset) % colors.length];
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(i * 12, 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

```

## `frontend/src/api.js`

```js
// API helper to communicate with the backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export async function createStory(prompt) {
  const response = await fetch(`${BACKEND_URL}/api/create-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate story: ${response.statusText}`);
  }

  return response.json();
}

```

## `frontend/src/game/Physics.js`

```js
export class Physics {
  constructor(config = {}) {
    this.gravity = config.gravity ?? 1200;
    this.jumpForce = config.jump_force ?? -500;
    this.moveSpeed = config.move_speed ?? 300;
    this.maxFall = config.max_fall_speed ?? 600;
  }

  applyGravity(entity, dt) {
    entity.vy += this.gravity * dt;
    if (entity.vy > this.maxFall) entity.vy = this.maxFall;
  }
}

export function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

```

## `frontend/src/game/Player.js`

```js
import { aabb } from './Physics.js';

export class Player {
  constructor(spawn, physics, mechanics = {}) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.w = 40;
    this.h = 52;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.physics = physics;
    this.facing = 1;
    this.doubleJump = !!mechanics.double_jump;
    this.jumpsLeft = 0;
    this._jumpHeld = false;
  }

  respawn(spawn) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpsLeft = this.doubleJump ? 1 : 0;
  }

  update(dt, input, platforms) {
    const p = this.physics;
    this.vx = 0;
    if (input.left()) {
      this.vx = -p.moveSpeed;
      this.facing = -1;
    }
    if (input.right()) {
      this.vx = p.moveSpeed;
      this.facing = 1;
    }

    const jumpDown = input.jumpPressed();
    if (jumpDown && !this._jumpHeld) {
      if (this.onGround) {
        this.vy = p.jumpForce;
        this.onGround = false;
        this.jumpsLeft = this.doubleJump ? 1 : 0;
      } else if (this.jumpsLeft > 0) {
        this.vy = p.jumpForce;
        this.jumpsLeft -= 1;
      }
    }
    this._jumpHeld = jumpDown;

    p.applyGravity(this, dt);

    this.x += this.vx * dt;
    this._collide(platforms, 'x');
    this.y += this.vy * dt;
    this.onGround = false;
    this._collide(platforms, 'y');
  }

  _collide(platforms, axis) {
    for (const plat of platforms) {
      if (!aabb(this, plat)) continue;
      if (axis === 'x') {
        if (this.vx > 0) this.x = plat.x - this.w;
        else if (this.vx < 0) this.x = plat.x + plat.w;
        this.vx = 0;
      } else if (this.vy > 0) {
        this.y = plat.y - this.h;
        this.vy = 0;
        this.onGround = true;
        this.jumpsLeft = this.doubleJump ? 1 : 0;
      } else if (this.vy < 0) {
        this.y = plat.y + plat.h;
        this.vy = 0;
      }
    }
  }

  bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}

```

## `frontend/src/game/Input.js`

```js
export class Input {
  constructor() {
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  left() {
    return !!(this.keys.ArrowLeft || this.keys.KeyA);
  }

  right() {
    return !!(this.keys.ArrowRight || this.keys.KeyD);
  }

  jumpPressed() {
    return !!(this.keys.ArrowUp || this.keys.KeyW || this.keys.Space);
  }

  talkPressed() {
    return !!this.keys.KeyE;
  }

  /** Shoot — C or J */
  shootPressed() {
    return !!(this.keys.KeyC || this.keys.KeyJ);
  }
}

```

## `frontend/src/game/Sound.js`

```js
/** Tiny Web Audio SFX — no asset files needed. */
export class Sound {
  constructor() {
    this.ctx = null;
  }

  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  shoot() {
    const ctx = this._ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  hit() {
    const ctx = this._ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }
}

```

## `frontend/src/game/Game.js`

```js
import { Physics, aabb } from './Physics.js';
import { Player } from './Player.js';
import { Input } from './Input.js';
import { Sound } from './Sound.js';

const MOCK_BASE = '/mock';
const SHOT_COOLDOWN = 0.28;
const SHOT_SPEED = 620;
const SHOT_LIFE = 1.2;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input();
    this.sound = new Sound();
    this.running = false;
    this._raf = 0;
    this._last = 0;
    this.camX = 0;
    this.camY = 0;
    this.hasKey = false;
    this.dialogue = null;
    this._talkLatch = false;
    this._shootLatch = false;
    this.shotCd = 0;
    this.shots = [];
    this.won = false;
    this.toast = '';
    this.toastTimer = 0;
  }

  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  /** Top of platform under worldX, minus entity height (feet on surface). */
  _standY(worldX, entityH, platforms) {
    let best = null;
    for (const p of platforms || []) {
      if (worldX < p.x || worldX > p.x + p.w) continue;
      const top = p.y - entityH;
      if (best == null || p.y < best.platY) best = { platY: p.y, top };
    }
    return best ? best.top : null;
  }

  _drawPlatform(ctx, p) {
    if (p.role === 'ground') {
      const tile = this.images.ground;
      if (tile) {
        const tw = tile.width;
        const th = Math.min(tile.height, p.h);
        for (let x = p.x; x < p.x + p.w; x += tw) {
          const w = Math.min(tw, p.x + p.w - x);
          ctx.drawImage(tile, 0, 0, w, th, x, p.y, w, th);
          // fill remainder under tile if ground is taller
          if (p.h > th) {
            ctx.fillStyle = '#a87a4e';
            ctx.fillRect(x, p.y + th, w, p.h - th);
          }
        }
      } else {
        ctx.fillStyle = '#c4a070';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#ddc09a';
        ctx.fillRect(p.x, p.y, p.w, 12);
      }
      return;
    }

    const img = this.images.platform;
    if (img) {
      // sandstone ledge — stretch width, keep readable height
      const dh = Math.max(p.h + 8, 40);
      const aspect = img.width / img.height;
      let dw = p.w;
      let drawH = dw / aspect;
      if (drawH > dh * 1.8) drawH = dh * 1.4;
      if (drawH < dh) drawH = dh;
      const dx = p.x + (p.w - dw) / 2;
      const dy = p.y + p.h - drawH;
      ctx.drawImage(img, dx, dy, dw, drawH);
      return;
    }

    ctx.fillStyle = '#c4a070';
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  _drawPickup(ctx, p) {
    const s = p.w;
    if (p.role === 'key') {
      ctx.save();
      ctx.fillStyle = '#cd7f32';
      ctx.beginPath();
      ctx.arc(p.x + s * 0.3, p.y + s * 0.4, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0a1a';
      ctx.beginPath();
      ctx.arc(p.x + s * 0.3, p.y + s * 0.4, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cd7f32';
      ctx.fillRect(p.x + s * 0.42, p.y + s * 0.32, s * 0.5, s * 0.14);
      ctx.fillRect(p.x + s * 0.78, p.y + s * 0.46, s * 0.12, s * 0.2);
      ctx.fillRect(p.x + s * 0.62, p.y + s * 0.46, s * 0.12, s * 0.14);
      ctx.restore();
      return;
    }
    if (p.role === 'health') {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      const cx = p.x + s / 2;
      const cy = p.y + s / 2;
      const r = s * 0.28;
      ctx.moveTo(cx, cy + r * 0.6);
      ctx.bezierCurveTo(cx - r * 2, cy - r * 0.6, cx - r * 0.8, cy - r * 2, cx, cy - r * 0.9);
      ctx.bezierCurveTo(cx + r * 0.8, cy - r * 2, cx + r * 2, cy - r * 0.6, cx, cy + r * 0.6);
      ctx.fill();
      return;
    }
    // coin
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(p.x + s / 2, p.y + s / 2, s / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  async start(story) {
    this.stop();
    this.theme = story.theme;
    this.level = story.level;
    const L = this.level;

    this.physics = new Physics(L.physics);
    this.platforms = (L.platforms || []).map((p) => ({ ...p }));
    const spawn = { ...L.player_spawn };
    const spawnY = this._standY(spawn.x + 20, 52, this.platforms);
    if (spawnY != null) spawn.y = spawnY;
    this.player = new Player(spawn, this.physics, L.mechanics || {});
    this._spawn = spawn;
    this.enemies = (L.enemies || []).map((e) => {
      const w = e.w || 48;
      const h = e.h || 48;
      return {
        ...e,
        w,
        h,
        dir: 1,
        dead: false,
        x: e.x,
        // stand on nearest ground/platform under spawn x
        y: this._standY(e.x + w / 2, h, L.platforms) ?? e.y,
      };
    });
    this.pickups = (L.pickups || []).map((p) => ({
      ...p,
      w: 28,
      h: 28,
      taken: false,
    }));
    this.hazards = (L.hazards || []).map((h) => ({ ...h }));
    this.npcs = (L.npcs || []).map((n) => {
      const w = n.w || 48;
      const h = n.h || 64;
      return {
        ...n,
        w,
        h,
        y: this._standY(n.x + w / 2, h, L.platforms) ?? n.y,
      };
    });
    this.exit = L.exit;
    if (this.exit) {
      const eh = this.exit.h || 192;
      const ey = this._standY(this.exit.x + (this.exit.w || 96) / 2, eh, L.platforms);
      if (ey != null) this.exit = { ...this.exit, y: ey };
    }

    const a = this.theme.assets;
    const loadOpt = async (rel) => {
      if (!rel) return null;
      try {
        return await loadImage(`${MOCK_BASE}/${rel}`);
      } catch {
        return null;
      }
    };
    this.images = {
      hero: await loadImage(`${MOCK_BASE}/${a.character}`),
      enemy_1: await loadOpt(a.enemy_1),
      enemy_2: await loadOpt(a.enemy_2),
      enemy_3: await loadOpt(a.enemy_3),
      platform: await loadImage(`${MOCK_BASE}/${a.platform}`),
      npc: await loadImage(`${MOCK_BASE}/${a.npc}`),
      ground: await loadOpt(a.ground || 'tiles/ground.png'),
      bg: await loadImage(`${MOCK_BASE}/${L.background || a.background}`),
    };

    this.hasKey = false;
    this.dialogue = null;
    this.won = false;
    this.toast = '';
    this.toastTimer = 0;
    this.shots = [];
    this.shotCd = 0;
    this._shootLatch = false;
    this.running = true;
    this._last = performance.now();
    this._raf = requestAnimationFrame((t) => this.loop(t));
  }

  loop(t) {
    if (!this.running) return;
    const dt = Math.min(0.033, (t - this._last) / 1000);
    this._last = t;
    this.update(dt);
    this.draw();
    this._raf = requestAnimationFrame((tt) => this.loop(tt));
  }

  update(dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toast = '';
    }

    if (this.won) return;

    const talk = this.input.talkPressed();
    if (this.dialogue) {
      if (talk && !this._talkLatch) {
        this.dialogue.i += 1;
        if (this.dialogue.i >= this.dialogue.lines.length) this.dialogue = null;
      }
      this._talkLatch = talk;
      return;
    }

    this.player.update(dt, this.input, this.platforms);
    this._updateShots(dt);
    this._updateEnemies(dt);
    this._updateCamera();

    for (const p of this.pickups) {
      if (p.taken) continue;
      if (aabb(this.player.bounds(), p)) {
        p.taken = true;
        if (p.role === 'key') {
          this.hasKey = true;
          this.toast = 'Got the bronze key!';
          this.toastTimer = 2;
        }
      }
    }

    for (const h of this.hazards) {
      if (aabb(this.player.bounds(), h)) {
        this.player.respawn(this._spawn || this.level.player_spawn);
        this.toast = 'Fell in the sand pit!';
        this.toastTimer = 1.5;
        break;
      }
    }

    for (const e of this.enemies) {
      if (e.dead) continue;
      if (aabb(this.player.bounds(), { x: e.x, y: e.y, w: e.w, h: e.h })) {
        this.player.respawn(this._spawn || this.level.player_spawn);
        this.toast = 'Ouch — desert foe!';
        this.toastTimer = 1.5;
        break;
      }
    }

    if (talk && !this._talkLatch) {
      for (const n of this.npcs) {
        if (Math.abs(this.player.x - n.x) < 70 && Math.abs(this.player.y - n.y) < 80) {
          this.dialogue = { lines: n.dialogue || [], i: 0 };
          break;
        }
      }
    }
    this._talkLatch = talk;

    const ex = this.exit;
    if (ex && aabb(this.player.bounds(), { x: ex.x, y: ex.y, w: ex.w, h: ex.h })) {
      if (ex.unlock_condition === 'has_key' && !this.hasKey) {
        if (!this.toast) {
          this.toast = ex.locked_dialogue || 'Need the key.';
          this.toastTimer = 2;
        }
      } else {
        this.won = true;
      }
    }

    // fell out of world
    if (this.player.y > this.level.world.height + 100) {
      this.player.respawn(this._spawn || this.level.player_spawn);
    }
  }

  _updateShots(dt) {
    if (this.shotCd > 0) this.shotCd -= dt;

    const shoot = this.input.shootPressed();
    if (shoot && !this._shootLatch && this.shotCd <= 0) {
      const pl = this.player;
      const dir = pl.facing >= 0 ? 1 : -1;
      this.shots.push({
        x: pl.x + (dir > 0 ? pl.w : -10),
        y: pl.y + pl.h * 0.35,
        w: 14,
        h: 6,
        vx: dir * SHOT_SPEED,
        life: SHOT_LIFE,
      });
      this.shotCd = SHOT_COOLDOWN;
      this.sound.shoot();
    }
    this._shootLatch = shoot;

    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      s.x += s.vx * dt;
      s.life -= dt;
      if (s.life <= 0) {
        this.shots.splice(i, 1);
        continue;
      }
      let hit = false;
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (aabb(s, { x: e.x, y: e.y, w: e.w, h: e.h })) {
          e.dead = true;
          hit = true;
          this.sound.hit();
          this.toast = 'Enemy down!';
          this.toastTimer = 0.8;
          break;
        }
      }
      if (hit) this.shots.splice(i, 1);
    }
  }

  _updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      const [minX, maxX] = e.patrol || [e.x - 80, e.x + 80];
      const speed = 90;
      e.x += e.dir * speed * dt;
      if (e.x <= minX) {
        e.x = minX;
        e.dir = 1;
      } else if (e.x + e.w >= maxX) {
        e.x = maxX - e.w;
        e.dir = -1;
      }
      // keep feet glued to ground while patrolling
      const sy = this._standY(e.x + e.w / 2, e.h, this.platforms);
      if (sy != null) e.y = sy;
    }
  }

  _updateCamera() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const worldW = this.level.world.width;
    const worldH = this.level.world.height;
    this.camX = this.player.x + this.player.w / 2 - W / 2;
    this.camY = this.player.y + this.player.h / 2 - H / 2;
    this.camX = Math.max(0, Math.min(this.camX, Math.max(0, worldW - W)));
    this.camY = Math.max(0, Math.min(this.camY, Math.max(0, worldH - H)));
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const camX = this.camX;
    const camY = this.camY;

    ctx.fillStyle = '#1a1028';
    ctx.fillRect(0, 0, W, H);

    if (this.images.bg) {
      // Cover the full view with the backdrop (no black side bars inside canvas)
      const img = this.images.bg;
      const scale = Math.max(W / img.width, H / img.height) * 1.05;
      const bw = img.width * scale;
      const bh = img.height * scale;
      const parallax = camX * 0.25;
      ctx.drawImage(img, W / 2 - bw / 2 - parallax * 0.1, H / 2 - bh / 2, bw, bh);
    }

    ctx.save();
    ctx.translate(-camX, -camY);

    for (const p of this.platforms) this._drawPlatform(ctx, p);

    for (const h of this.hazards) {
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.fillStyle = 'rgba(210, 180, 120, 0.45)';
      ctx.fillRect(h.x, h.y, h.w, 8);
    }

    for (const p of this.pickups) {
      if (p.taken) continue;
      this._drawPickup(ctx, p);
    }

    for (const e of this.enemies) {
      if (e.dead) continue;
      const sprite =
        this.images[e.role] || this.images.enemy_1 || this.images.enemy_2;
      if (sprite) {
        ctx.save();
        if (e.dir < 0) {
          ctx.translate(e.x + e.w, e.y);
          ctx.scale(-1, 1);
          ctx.drawImage(sprite, 0, 0, e.w, e.h);
        } else {
          ctx.drawImage(sprite, e.x, e.y, e.w, e.h);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(e.x, e.y, e.w, e.h);
      }
    }

    for (const s of this.shots) {
      ctx.fillStyle = '#ffe566';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 8;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.shadowBlur = 0;
    }

    for (const n of this.npcs) {
      const nw = 48;
      const nh = 64;
      if (this.images.npc) ctx.drawImage(this.images.npc, n.x, n.y, nw, nh);
      else {
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(n.x, n.y, nw, nh);
      }
    }

    const ex = this.exit;
    if (ex) {
      ctx.fillStyle = this.hasKey ? '#f1c40f' : '#666';
      ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);
    }

    const pl = this.player;
    if (this.images.hero) {
      ctx.save();
      if (pl.facing < 0) {
        ctx.translate(pl.x + pl.w, pl.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.images.hero, 0, 0, pl.w, pl.h);
      } else {
        ctx.drawImage(this.images.hero, pl.x, pl.y, pl.w, pl.h);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
    }

    if (this.dialogue && this.dialogue.lines[this.dialogue.i]) {
      const line = this.dialogue.lines[this.dialogue.i];
      const n = this.npcs[0] || { x: pl.x, y: pl.y };
      const bx = n.x - 10;
      const by = n.y - 78;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(bx, by, 280, 60);
      ctx.strokeStyle = '#a78bfa';
      ctx.strokeRect(bx, by, 280, 60);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(line.speaker || 'NPC', bx + 10, by + 20);
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      wrapText(ctx, line.text || '', bx + 10, by + 40, 260, 14);
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.fillText('E — next', bx + 210, by + 54);
    }

    ctx.restore();

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(10, 10, 240, 68);
    ctx.fillStyle = '#fff';
    ctx.font = '13px monospace';
    ctx.fillText(this.theme.title || 'Dreamscape', 20, 30);
    ctx.fillText(this.hasKey ? 'Key: yes' : 'Key: no', 20, 48);
    ctx.fillStyle = '#ccc';
    ctx.font = '12px monospace';
    ctx.fillText('E talk  ·  C / J shoot', 20, 66);

    if (this.toast) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(W / 2 - 200, 70, 400, 36);
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.toast, W / 2, 93);
      ctx.textAlign = 'left';
    }

    if (this.won) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Level complete!', W / 2, H / 2);
      ctx.fillStyle = '#bbb';
      ctx.font = '16px monospace';
      ctx.fillText('Mock run OK — refresh for menu', W / 2, H / 2 + 36);
      ctx.textAlign = 'left';
    }
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

```

## `frontend/public/mock/desert-dunes.json`

```json
{
  "theme": {
    "title": "Desert Dunes",
    "premise": "A yellow electric mouse races across quiet dunes, dodging scorpions, cactus pests, and dusty mummies to find the bronze key.",
    "art_style": "Soft desert dusk, muted pastels, clean 2d game sprites",
    "assets": {
      "character": "sprites_clean/hero.png",
      "enemy_1": "sprites_clean/enemy_1.png",
      "enemy_2": "sprites_clean/enemy_2.png",
      "enemy_3": "sprites_clean/enemy_3.png",
      "platform": "sprites_clean/platform.png",
      "npc": "sprites_clean/npc.png",
      "ground": "tiles/ground.png",
      "background": "backgrounds/ch00_bg.png"
    }
  },
  "level": {
    "level_id": "level_000",
    "chapter": "Sunbaked Trail",
    "chapter_number": 1,
    "narration": "Cross the dunes, talk to the fox guide, grab the key, reach the exit.",
    "background": "backgrounds/ch00_bg.png",
    "world": { "width": 2800, "height": 900 },
    "platforms": [
      { "x": 0, "y": 780, "w": 1100, "h": 120, "role": "ground" },
      { "x": 1550, "y": 780, "w": 1250, "h": 120, "role": "ground" },
      { "x": 280, "y": 680, "w": 180, "h": 48, "role": "platform" },
      { "x": 500, "y": 600, "w": 180, "h": 48, "role": "platform" },
      { "x": 720, "y": 680, "w": 180, "h": 48, "role": "platform" },
      { "x": 1120, "y": 700, "w": 160, "h": 48, "role": "platform" },
      { "x": 1300, "y": 640, "w": 160, "h": 48, "role": "platform" },
      { "x": 1480, "y": 700, "w": 160, "h": 48, "role": "platform" },
      { "x": 1900, "y": 680, "w": 200, "h": 48, "role": "platform" },
      { "x": 2200, "y": 600, "w": 200, "h": 48, "role": "platform" }
    ],
    "pickups": [
      { "role": "coin", "x": 320, "y": 640 },
      { "role": "coin", "x": 540, "y": 560 },
      { "role": "coin", "x": 760, "y": 640 },
      { "role": "health", "x": 1520, "y": 660 },
      { "role": "key", "x": 1345, "y": 600 },
      { "role": "coin", "x": 1960, "y": 640 },
      { "role": "coin", "x": 2260, "y": 560 }
    ],
    "enemies": [
      {
        "role": "enemy_1",
        "x": 650,
        "y": 732,
        "w": 52,
        "h": 44,
        "patrol": [560, 900],
        "behavior": "patrol"
      },
      {
        "role": "enemy_2",
        "x": 1800,
        "y": 732,
        "w": 48,
        "h": 48,
        "patrol": [1650, 2000],
        "behavior": "patrol"
      },
      {
        "role": "enemy_3",
        "x": 2100,
        "y": 732,
        "w": 48,
        "h": 52,
        "patrol": [2050, 2450],
        "behavior": "patrol"
      }
    ],
    "blocks": [],
    "hazards": [
      { "type": "lava", "x": 1100, "y": 820, "w": 450, "h": 80 }
    ],
    "bounce_pads": [],
    "teleporters": [],
    "npcs": [
      {
        "role": "npc",
        "name": "Oasis Fox",
        "x": 160,
        "y": 716,
        "w": 48,
        "h": 64,
        "dialogue": [
          { "speaker": "Oasis Fox", "text": "Hot dunes ahead — jump the stone islands over the sand pit!" },
          { "speaker": "Oasis Fox", "text": "Grab the bronze key, then the exit opens on the far side." }
        ]
      }
    ],
    "exit": {
      "role": "exit_door",
      "x": 2550,
      "y": 588,
      "w": 96,
      "h": 192,
      "unlock_condition": "has_key",
      "locked_dialogue": "Find the bronze key first.",
      "target_level": "level_001"
    },
    "player_spawn": { "x": 60, "y": 728 },
    "physics": {
      "gravity": 1600,
      "jump_force": -720,
      "move_speed": 320,
      "max_fall_speed": 900,
      "friction": 800,
      "coyote_time_ms": 80,
      "jump_buffer_ms": 100
    },
    "mechanics": {
      "double_jump": true,
      "gravity_scale": 1.0,
      "player_action": "none",
      "weather": "none"
    }
  }
}

```

## `frontend/public/mock/sugar-rush.json`

Copy the same content as `desert-dunes.json` to this path (compat alias).

---

## Antigravity one-shot

> create/overwrite every path in this markdown with the fenced code. also copy sugar-rush.json = desert-dunes.json. wait for PNGs zip into public/mock. run npm install && npm run dev in frontend.
