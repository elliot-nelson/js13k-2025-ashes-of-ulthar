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
        this.villager = villager;
    }

    update() {
        if (++this.t === this.d) {
            game.gameScene.grantSanity(10);
            this.cull = true;
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
    }
}
