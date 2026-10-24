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
