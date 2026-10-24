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
