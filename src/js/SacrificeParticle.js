// SacrificeParticle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';
import { createCanvas } from './Util';
import { VillagerChunkParticle } from './VillagerChunkParticle';

export class SacrificeParticle {
    constructor(villager) {
        this.t = -1;
        this.d = 30;
        this.winkframe = 3;
        this.villager = villager;
    }

    update() {
        if (++this.t === this.d) {
            game.gameScene.grantSanity(10);
            this.cull = true;
        }

        if (this.t === 2) {
            this.winkframe = 0;
        } else if (this.t === 6) {
            this.winkframe = 1;
        } else if (this.t === 8) {
            this.winkframe = 2;
        } else if (this.t === 10) {
            this.winkframe = 3;
        } else if (this.t === 14) {
            this.winkframe = -1;
        }

        if (this.t >= 24 && this.t <= 27) {
            game.gameScene.entities.push(new VillagerChunkParticle(this.villager.pos));
            game.gameScene.entities.push(new VillagerChunkParticle(this.villager.pos));
            game.gameScene.entities.push(new VillagerChunkParticle(this.villager.pos));
            game.gameScene.entities.push(new VillagerChunkParticle(this.villager.pos));
            game.gameScene.entities.push(new VillagerChunkParticle(this.villager.pos));
        }

        this.villager.pos.v -= 0.2;
    }

    draw() {
        let v = Math.floor(this.villager.pos.v);

        if (this.t >= 0 && this.t < 15) {
            let shake = (this.t % 3) - 1;
            Sprite.drawViewportSprite(Sprite.villager[0], { u: this.villager.pos.u + shake, v: v });
        } else if (this.t >= 15 && this.t <= 25) {
            Sprite.drawViewportSprite(Sprite.villagerdeath[0], { u: this.villager.pos.u, v: v });
        }

        if (this.winkframe >= 0) {
            Viewport.ctx.drawImage(Sprite.wink[this.winkframe].img, 160 + 11 - 1, 73 - 30 + 9 - 2);
        }
    }
}
