// Villager

import { Audio } from './Audio';
import { BloodPoolParticle } from './BloodPoolParticle';
import { GRAVITY, TILE_SIZE } from './Constants';
import { game } from './Game';
import { Sprite } from './Sprite';
import { clamp, xy2qr } from './Util';
import { Viewport } from './Viewport';

export const GATHERER = 1;

const JOB_DETAIL = {
    xyz: [120, 60, 120]
};

const ROUNDTRIP = 60 * 5;

export class Sunder {
    constructor(tweenArray) {
        this.t = -1;
        this.tweenArray = tweenArray;
    }

    update() {
        this.t++;

        if (this.t < this.tweenArray[0][0]) {
            this.value = this.tweenArray[0][2];
            return;
        }

        if (this.t >= this.tweenArray[this.tweenArray.length - 1][1]) {
            this.value = this.tweenArray[this.tweenArray.length - 1][3];
            this.finished = true;
            return;
        }

        for (let i = 0; i < this.tweenArray.length; i++) {
            if (this.t >= this.tweenArray[i][0] && this.t < this.tweenArray[i][1]) {
                this.value = (this.tweenArray[i][3] - this.tweenArray[i][2])
                    * (this.t - this.tweenArray[i][0])
                    / (this.tweenArray[i][1] - this.tweenArray[i][0])
                    + this.tweenArray[i][2];
                break;
            }
        }
    }
}

export class GathererPath extends Sunder {
    constructor() {
        super([
            [0, 120, 0, 130],
            [120, 180, 130, 130],
            [180, 300, 130, 0]
        ]);
    }
}

export class Gatherer {
    constructor() {
        this.frame = 0;
        this.t++;
    }

    update() {
    }
}


export class Villager {
    constructor() {
        this.job = GATHERER;
        this.t = 0;
    }

    update() {
        if (!this.path) {
            this.path = new GathererPath();
        }

        this.path.update();
        console.log(this.path);

        this.pos = { u: 160 + this.path.value, v: 100 };

        if (this.path.finished) {
            this.path = undefined;
        }
    }

    draw() {
        Viewport.ctx.drawImage(Sprite.villager[0].img, this.pos.u, this.pos.v);
    }
}
