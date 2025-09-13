// WinkParticle

import { Viewport } from './Viewport';
import { Sprite } from './Sprite';

export class WinkParticle {
    constructor() {
        this.t = -1;
        this.d = 15;
        this.frame = 3;
        this.layer = 1;
    }

    update() {
        if (++this.t === this.d) {
            this.cull = true;
        }

        if (this.t === 2) {
            this.frame = 0;
        } else if (this.t === 6) {
            this.frame++;
        } else if (this.t === 8) {
            this.frame++;
        } else if (this.t === 10) {
            this.frame++;
        }
    }

    draw() {
        Viewport.ctx.drawImage(Sprite.wink[this.frame].img, 160 + 11 - 1, 73 - 30 + 9 - 2);
    }
}
