// Villager

import { Audio } from './Audio';
import { BloodPoolParticle } from './BloodPoolParticle';
import { GRAVITY, TILE_SIZE } from './Constants';
import { game } from './Game';
import { Sprite } from './Sprite';
import { clamp, xy2qr } from './Util';
import { Viewport } from './Viewport';
import { TweenChain } from './TweenChain';

export const IDLE = 0;
export const BUTCHER = 1;
export const WOODCUTTER = 2;
export const STONECUTTER = 3;
export const FIREKEEPER = 4;
export const TOTEMCARVER = 5;

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
        game.gameScene.meat += 5;
        game.gameScene.consumeMeat();
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
        game.gameScene.wood += 5;
        game.gameScene.consumeMeat();
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
        game.gameScene.stone += 5;
        game.gameScene.consumeMeat();
    }
}

export class Villager {
    constructor() {
        this.job = STONECUTTER;
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
        Viewport.ctx.drawImage(Sprite.villager[0].img, this.pos.u, this.pos.v);
    }

    newTask() {
        switch (this.job) {
            case BUTCHER:
                return new ButcherTask();
            case WOODCUTTER:
                return new WoodcutterTask();
            case STONECUTTER:
                return new StonecutterTask();
            default:
                return new IdleTask();
        }
    }
}
