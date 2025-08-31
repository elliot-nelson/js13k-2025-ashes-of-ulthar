// VillagerDeathParticle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';
import { createCanvas } from './Util';
import { angle2vector } from './Util';

export class VillagerDeathParticle {
    constructor() {
        this.t = -1;
        this.d = 30;

        this.angle = Math.random() * Math.PI / 2;
        this.vector = angle2vector(this.angle);
        this.m = Math.random() * 25 + 5;

        this.pos = { u: 203 + this.vector.x * 5, v: 103 };
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        this.pos.u += (this.t/this.d) * this.vector.x * this.vector.m;
        this.pos.v += (this.t/this.d) * this.vector.y * this.vector.m;
        this.vector.y += 0.1;
    }

    draw() {

        Viewport.ctx.drawImage(Sprite.particle[0].img, this.pos.u, this.pos.v);

        return;

        Viewport.ctx.drawImage(Sprite.altar[this.frame].img, 103, 93 - 32);

        Viewport.ctx.drawImage(Sprite.tree[this.treeframe].img, 110, 64 - 32);

        if (this.villager && this.t <= 95) {
            Viewport.ctx.drawImage(Sprite.altar[5].img, this.pos.u, this.pos.v - 32);
        }
    }
}
