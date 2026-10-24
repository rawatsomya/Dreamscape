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
