// WinkParticle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';
import { createCanvas } from './Util';
import { VillagerChunkParticle } from './VillagerChunkParticle';

export class WinkParticle {
    constructor() {
        this.t = -1;
        this.d = 15;
        this.winkframe = 3;
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        if (this.t === 2) {
            this.winkframe = 0;
        } else if (this.t === 6) {
            this.winkframe++;
        } else if (this.t === 8) {
            this.winkframe++;
        } else if (this.t === 10) {
            this.winkframe++;
        }
    }

    draw() {
        Viewport.ctx.drawImage(Sprite.wink[this.winkframe].img, 160 + 11 - 1, 73 - 30 + 9 - 2);
    }
}
