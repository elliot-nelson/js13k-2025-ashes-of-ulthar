// Villager

import { Audio } from './Audio';
import { BloodPoolParticle } from './BloodPoolParticle';
import { GRAVITY, TILE_SIZE } from './Constants';
import { game } from './Game';
import { Sprite } from './Sprite';
import { clamp, xy2qr } from './Util';
import { Viewport } from './Viewport';
import { TweenChain } from './TweenChain';
import { HeightMapData } from './generated/HeightMapData-gen';

export const IDLE = 0;
export const WOODCUTTER = 1;
export const BUTCHER = 2;
export const TALLOWER = 3;
export const STONECUTTER = 4;
export const FIREKEEPER = 5;
export const TOTEMCARVER = 6;

export class IdleTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 30, v1: 0, v2: 0 }
        ]);
    }

    completeTask() { }
}

export class ButcherTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: -90 },
            { t1: 120, t2: 180, v1: -90, v2: -90 },
            { t1: 180, t2: 300, v1: -90, v2: 0 }
        ]);
    }

    completeTask() {
        game.gameScene.gatherMeat();
    }
}

export class WoodcutterTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: 130 },
            { t1: 120, t2: 180, v1: 130, v2: 130 },
            { t1: 180, t2: 300, v1: 130, v2: 0 }
        ]);
    }

    completeTask() {
        game.gameScene.gatherWood();
    }
}

export class TallowerTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: 47 },
            { t1: 120, t2: 180, v1: 47, v2: 47 },
            { t1: 180, t2: 300, v1: 47, v2: 0 }
        ]);
    }

    completeTask() {
        game.gameScene.craftTorch();
    }
}

export class StonecutterTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: -141 },
            { t1: 120, t2: 180, v1: -141, v2: -141 },
            { t1: 180, t2: 300, v1: -141, v2: 0 }
        ]);
    }

    completeTask() {
        game.gameScene.gatherStone();
    }
}

export class Villager {
    static JOB_NAMES = ['', 'WOODCUTTER', 'BUTCHER', 'TALLOWER', 'STONEMASON', 'FIREKEEPER', 'TOTEMCARVER'];

    constructor(job) {
        this.job = job;
        this.t = 0;
    }

    update() {
        if (!this.task) {
            this.task = this.newTask();
        }

        this.task.update();

        this.pos = { u: 160 + this.task.value, v: 100 };

        if (this.task.finished) {
            this.task.completeTask();
            this.task = undefined;
        }
    }

    draw() {
        let v = HeightMapData[3][Math.floor(this.pos.u)] - 32 - 16;
        Viewport.ctx.drawImage(Sprite.villager[0].img, this.pos.u, v);
    }

    newTask() {
        switch (this.job) {
            case BUTCHER:
                return new ButcherTask();
            case WOODCUTTER:
                return new WoodcutterTask();
            case TALLOWER:
                return new TallowerTask();
            case STONECUTTER:
                return new StonecutterTask();
            default:
                return new IdleTask();
        }
    }
}
