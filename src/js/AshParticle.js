// AshParticle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';
import { createCanvas } from './Util';
import { angle2vector } from './Util';

export class AshParticle {
    constructor() {
        this.t = -1;
        this.d = 60;

        this.pos = { u: Math.random() * 320, v: Math.random() * 40 };
        this.layer = 2;
        this.alpha = 1;
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        if (this.t > 30) {
            this.alpha -= 0.02;
        }

        this.pos.v += 0.1;
    }

    draw() {
        Viewport.ctx.globalAlpha = this.alpha;
        Viewport.ctx.drawImage(Sprite.particle[1].img, this.pos.u, this.pos.v);
        Viewport.ctx.globalAlpha = 1;
    }
}
