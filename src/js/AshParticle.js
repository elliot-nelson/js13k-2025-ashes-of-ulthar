// AshParticle

import { Viewport } from './Viewport';
import { Sprite } from './Sprite';

export class AshParticle {
    constructor() {
        this.t = -1;
        this.d = 60;

        this.pos = { u: Math.random() * 320, v: Math.random() * 200 };
        this.layer = Math.floor(Math.random() * 3) + 1;
        this.alpha = 1;
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        if (this.t > 36) {
            this.alpha -= 0.02;
        }

        this.pos.v += 0.1;

        if (Math.random() < 0.05) {
            this.pos.u += 0.5;
        }
    }

    draw() {
        Viewport.ctx.globalAlpha = this.alpha;
        Viewport.ctx.drawImage(Sprite.particle[this.layer - 1].img, Math.floor(this.pos.u), Math.floor(this.pos.v));
        Viewport.ctx.globalAlpha = 1;
    }
}
