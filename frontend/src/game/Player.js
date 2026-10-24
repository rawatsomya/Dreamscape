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
