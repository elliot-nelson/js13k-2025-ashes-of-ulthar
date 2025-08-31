// Particle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';
import { createCanvas } from './Util';
import { angle2vector } from './Util';

export class Particle {
    constructor() {
        this.t = -1;
        this.d = 30;

        this.angle = Math.random() * 2 * Math.PI;
        this.vector = angle2vector(this.angle);
        this.m = Math.random() * 25 + 5;

        this.pos = { u: 203, v: 103 };
        this.target = { u: 203, v: 103 };
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        this.pos.u = (this.vector.x * this.m * ((this.d - this.t)/this.d)) + this.target.u;
        this.pos.v = (this.vector.y * this.m * ((this.d - this.t)/this.d)) + this.target.v;
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
