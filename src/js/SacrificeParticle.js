// SacrificeParticle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';

export class SacrificeParticle {
    constructor() {
        this.t = -1;
        this.pos = { u: 103, v: 123 };
        this.d = 150;
        this.frame = 1;
        this.treeframe = 0;
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        if (this.t < 5) {
            this.frame = 2;
        } else if (this.t < 10) {
            this.frame = 3;
        } else if (this.t < 15) {
            this.treeframe = 1;
            this.frame = 4;
        } else if (!this.villager) {
            // Set back clock until villager is ready for sacrifice
            this.t--;
        } else if (this.t >= 95) {
            this.frame = 1;
        }

        if (this.t > 132) {
            this.treeframe = 1;
        } else if (this.t > 124) {
            this.treeframe = 6;
        } else if (this.t > 116) {
            this.treeframe = 1;
        } else if (this.t > 108) {
            this.treeframe = 6;
        } else if (this.t > 100) {
            this.treeframe = 5;
        } else if (this.t > 95) {
            this.treeframe = 4;
        } else if (this.t > 90) {
            this.treeframe = 3;
        } else if (this.t > 80) {
            this.treeframe = 2;
        }

        if ([108, 110, 112, 114, 116, 118, 120, 122, 124, 126].includes(this.t)) {
            game.gameScene.grantSanity();
        }

        if (this.t <= 82) {
            this.pos.v = (93 - 123) * (this.t / 82) + 123;
        }
    }

    draw() {
        Viewport.ctx.drawImage(Sprite.altar[this.frame].img, 103, 93 - 32);

        Viewport.ctx.drawImage(Sprite.tree[this.treeframe].img, 110, 64 - 32);

        if (this.villager && this.t <= 95) {
            Viewport.ctx.drawImage(Sprite.altar[5].img, this.pos.u, this.pos.v - 32);
        }
    }
}
