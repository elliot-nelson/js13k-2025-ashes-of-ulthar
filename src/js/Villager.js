// Villager

import { Audio } from './Audio';
import { GRAVITY, TILE_SIZE, VILLAGER_FRAMES } from './Constants';
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
export const SACRIFICE = 7;

export class IdleTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 30, v1: 0, v2: 0 }
        ]);
        this.frame = 0;
    }

    completeTask() { }
}

export class ButcherTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: -76, stagger: 20 },
            { t1: 120, t2: 180, v1: undefined, v2: -76, stagger: 20 },
            { t1: 180, t2: 300, v1: undefined, v2: 0 }
        ]);
        this.layer = 3;
        this.frame = 0;
    }

    update() {
        super.update();

        const facing = (this.t > 140 && this.t < 160) ? (Math.floor(this.t / 10) % 2) : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + facing * VILLAGER_FRAMES;
        this.equipmentframe = (this.t > 60 && this.t < 210) ? 3 + facing * VILLAGER_FRAMES : undefined;
    }

    completeTask() {
        game.gameScene.gatherMeat();
    }
}

export class WoodcutterTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: 140, stagger: 15 },
            { t1: 120, t2: 180, v1: undefined, v2: 140, stagger: 15 },
            { t1: 180, t2: 300, v1: undefined, v2: 0 }
        ]);
        this.layer = 3;
        this.frame = 0;
    }

    update() {
        super.update();

        const facing = (this.t > 130 && this.t < 170) ? (Math.floor(this.t / 10) % 2) : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + facing * VILLAGER_FRAMES;
        this.equipmentframe = (this.t > 60 && this.t < 210) ? 2 + facing * VILLAGER_FRAMES : undefined;
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
        this.layer = 2;
        this.frame = 0;
    }

    update() {
        super.update();

        const facing = (this.t > 140 && this.t < 160) ? (Math.floor(this.t / 10) % 2) : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + 7 + facing * VILLAGER_FRAMES;
        //this.equipmentframe = (this.t > 60 && this.t < 210) ? 2 + facing * VILLAGER_FRAMES : undefined;
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
        this.layer = 3;
        this.frame = 0;
    }

    update() {
        super.update();

        const facing = (this.t > 140 && this.t < 160) ? (Math.floor(this.t / 10) % 2) : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + facing * VILLAGER_FRAMES;
        this.equipmentframe = (this.t > 60 && this.t < 210) ? 5 + facing * VILLAGER_FRAMES : undefined;
    }

    completeTask() {
        game.gameScene.gatherStone();
    }
}

export class SacrificeTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 1, v1: 0, v2: 0 }
        ]);
        this.layer = 3;
        this.frame = 0;
    }

    update() {
        super.update();
    }

    completeTask(villager) {
        game.gameScene.beginSacrifice(villager);
    }
}

export class Villager {
    static JOB_NAMES = ['', 'WOODCUTTER', 'BUTCHER', 'TALLOWER', 'STONEMASON', 'FIREKEEPER', 'TOTEMCARVER'];

    constructor(job) {
        this.job = job;
        this.t = 0;
        this.pos = { u: 0, v: 0 };
    }

    update() {
        if (!this.task) {
            this.task = this.newTask();
        }

        this.task.update();

        this.pos.u = 160 + this.task.value;
        this.pos.v = HeightMapData[this.task.layer][Math.floor(this.pos.u)] - 32 + 1;
        this.frame = this.task.frame || 0;
        this.equipmentframe = this.task.equipmentframe;

        if (this.task.finished) {
            this.task.completeTask(this);
            this.task = undefined;
        }
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.villager[this.frame], this.pos);

        if (this.equipmentframe > -1) {
            Sprite.drawViewportSprite(Sprite.villager[this.equipmentframe], this.pos);
        }
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
            case SACRIFICE:
                return new SacrificeTask();
            default:
                return new IdleTask();
        }
    }
}
