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

export class WoodcutterTask extends TweenChain {
    constructor() {
        super([
            [0, 120, 0, 130],
            [120, 180, 130, 130],
            [180, 300, 130, 0]
        ]);
    }

    completeTask() {
        game.gameScene.wood += 5;
    }
}

export class StonecutterTask extends TweenChain {
    constructor() {
        super([
            [0, 120, 0, 130],
            [120, 180, 130, 130],
            [180, 300, 130, 0]
        ]);
    }

    completeTask() {
        game.gameScene.stone += 5;
    }
}

export class Villager {
    constructor() {
        this.job = WOODCUTTER;
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
            case WOODCUTTER:
                return new WoodcutterTask();
            case STONECUTTER:
                return new StonecutterTask();
        }
    }
}
