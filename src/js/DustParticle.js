// Particle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';
import { createCanvas } from './Util';
import { angle2vector } from './Util';

export class DustParticle {
    constructor(pos, layer) {
        this.t = -1;
        this.d = 30;

        this.pos = { ...pos };
        this.layer = layer;
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        this.pos.v += 0.1;
    }

    draw() {
        Viewport.ctx.drawImage(Sprite.particle[1].img, Math.floor(this.pos.u), Math.floor(this.pos.v));
    }
}
