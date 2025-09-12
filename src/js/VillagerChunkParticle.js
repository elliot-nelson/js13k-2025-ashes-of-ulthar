// VillagerChunkParticle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';
import { createCanvas } from './Util';
import { angle2vector } from './Util';

export class VillagerChunkParticle {
    constructor(pos) {
        this.t = -1;
        this.d = 30;

        this.angle = Math.random() * Math.PI + Math.PI;
        this.vector = angle2vector(this.angle);
        this.m = 50 + Math.random() * 25;
        this.a = Math.random() * Math.PI * 2;
        this.ad = 0.1;

        this.pos = { u: pos.u, v: pos.v - 12 };
        this.pos.u += this.vector.x * 3;
        this.pos.v += this.vector.y * 3;

        this.frame = Math.floor(Math.random() * 6);
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        this.pos.u += (this.m / this.d) * this.vector.x;
        this.pos.v += (this.m / this.d) * this.vector.y;
        this.vector.x *= 0.95;
        this.vector.y *= 0.95;
        this.vector.y += 0.05;

        this.a += this.ad;
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.villagerchunk[this.frame], this.pos, this.a);
    }
}
