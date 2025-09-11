// Villager

import { Audio } from './Audio';
import { VILLAGER_FRAMES } from './Constants';
import { game } from './Game';
import { Sprite } from './Sprite';
import { Viewport } from './Viewport';
import { TweenChain } from './TweenChain';
import { HeightMapData } from './generated/HeightMapData-gen';
import { VillagerChunkParticle } from './VillagerChunkParticle';

export const IDLE = 0;
export const WOODCUTTER = 1;
export const BUTCHER = 2;
export const TALLOWER = 3;
export const STONECUTTER = 4;
export const CANTOR = 5;

export class IdleTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 30, v1: 0, v2: 0 }
        ]);
        this.frame = 0;
        this.layer = 1;
        this.cost = [];
        this.grant = [];
    }
}

export class SillyTask extends TweenChain {
    constructor(uValue) {
        super([
            { t1: 0, t2: 120, v1: uValue, v2: 0 }
        ]);
        this.frame = 0;
        this.layer = 1;
        this.cost = [];
        this.grant = [];
    }
}

export class WoodcutterTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: 140, stagger: 15 },
            { t1: 120, t2: 180, v1: undefined, v2: 140, stagger: 15 },
            { t1: 180, t2: 300, v1: undefined, v2: 0 }
        ]);
        this.layer = 1;
        this.frame = 0;
        this.cost = [0, 0, 0, 1];
        this.grant = [0, 0, 5];
    }

    update() {
        super.update();

        const facing = (this.t > 130 && this.t < 170) ? (Math.floor(this.t / 10) % 2) : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + facing * VILLAGER_FRAMES;
        this.equipmentframe = (this.t > 60 && this.t < 210) ? 2 + facing * VILLAGER_FRAMES : undefined;
    }
}

export class ButcherTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: -76, stagger: 20 },
            { t1: 120, t2: 180, v1: undefined, v2: -76, stagger: 20 },
            { t1: 180, t2: 300, v1: undefined, v2: 0 }
        ]);
        this.layer = 1;
        this.frame = 0;
        this.cost = [];
        this.grant = [0, 0, 0, 4];
    }

    update() {
        super.update();

        const facing = (this.t > 140 && this.t < 160) ? (Math.floor(this.t / 10) % 2) : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + facing * VILLAGER_FRAMES;
        this.equipmentframe = (this.t > 60 && this.t < 210) ? 3 + facing * VILLAGER_FRAMES : undefined;
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
        this.cost = [0, 0, 2, 3];
        this.grant = [0, 0, 0, 0, 1];
    }

    update() {
        super.update();

        const facing = (this.t > 140 && this.t < 160) ? (Math.floor(this.t / 10) % 2) : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + 7 + facing * VILLAGER_FRAMES;
        //this.equipmentframe = (this.t > 60 && this.t < 210) ? 2 + facing * VILLAGER_FRAMES : undefined;
    }
}

export class StonecutterTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 0, v2: -141 },
            { t1: 120, t2: 180, v1: -141, v2: -141 },
            { t1: 180, t2: 300, v1: -141, v2: 0 }
        ]);
        this.layer = 1;
        this.frame = 0;
        this.cost = [0, 0, 0, 1, 1];
        this.grant = [0, 0, 0, 0, 0, 5];
    }

    update() {
        super.update();

        const facing = (this.t > 140 && this.t < 160) ? (Math.floor(this.t / 10) % 2) : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + facing * VILLAGER_FRAMES;
        this.equipmentframe = (this.t > 60 && this.t < 210) ? 5 + facing * VILLAGER_FRAMES : undefined;
    }
}

export class CantorTask extends TweenChain {
    constructor() {
        super([
            { t1: 0, t2: 120, v1: 135, v2: 70, stagger: 15 },
            { t1: 120, t2: 180, v1: undefined, v2: undefined },
            { t1: 180, t2: 300, v1: undefined, v2: 135 }
        ]);
        this.layer = 3;
        this.frame = 0;
        this.cost = [0, 0, 3, 3, 3, 3];
        this.grant = [1];
    }

    update() {
        super.update();

        //const facing = (this.t > 140 && this.t < 160) ? (Math.floor(this.t / 10) % 2) : this.facing;
        const facing = (this.t > 120 && this.t < 180) ? 0 : this.facing;

        this.frame = Math.floor((this.t + 1) / 8) % 2 + facing * VILLAGER_FRAMES + 10;
        //this.equipmentframe = (this.t > 60 && this.t < 210) ? 5 + facing * VILLAGER_FRAMES : undefined;
    }
}

export const TaskClass = {
    [WOODCUTTER]: WoodcutterTask,
    [BUTCHER]: ButcherTask,
    [TALLOWER]: TallowerTask,
    [STONECUTTER]: StonecutterTask,
    [CANTOR]: CantorTask,
    [IDLE]: IdleTask
};

export class Villager {
    static JOB_NAMES = ['', 'WOODCUTTER', 'BUTCHER', 'TALLOWER', 'STONEMASON', 'CANTOR'];

    constructor(job) {
        this.job = job;
        this.t = 0;
        this.pos = { u: 0, v: 0 };
    }

    update() {
        if (!this.task) {
            this.task = new TaskClass[this.job]();
        }

        this.task.update();
        //console.log('Villager',this.job,this.task);

        this.layer = this.task.layer;
        this.pos.u = 160 + this.task.value;
        this.pos.v = HeightMapData[this.layer][Math.floor(this.pos.u)] - 32 + 1;
        this.frame = this.task.frame || 0;
        this.equipmentframe = this.task.equipmentframe;

        if (this.task.finished) {
            this.task.completeTask();
            this.task = undefined;
        }
    }

    draw(terrainY) {
        Sprite.drawViewportSprite(Sprite.villager[this.frame], { u: this.pos.u, v: this.pos.v + terrainY });

        if (this.equipmentframe > -1) {
            Sprite.drawViewportSprite(Sprite.villager[this.equipmentframe], { u: this.pos.u, v: this.pos.v + terrainY });
        }
    }

    newTask() {
        return new TaskClass[this.job]();
    }

    spawnChunks() {
        game.gameScene.entities.push(new VillagerChunkParticle(this.pos));
        game.gameScene.entities.push(new VillagerChunkParticle(this.pos));
        game.gameScene.entities.push(new VillagerChunkParticle(this.pos));
        game.gameScene.entities.push(new VillagerChunkParticle(this.pos));
        game.gameScene.entities.push(new VillagerChunkParticle(this.pos));
    }
}
