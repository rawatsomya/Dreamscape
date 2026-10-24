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
