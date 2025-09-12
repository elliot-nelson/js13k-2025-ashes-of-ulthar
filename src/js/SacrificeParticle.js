// SacrificeParticle

import { Viewport } from './Viewport';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { game } from './Game';
import { createCanvas } from './Util';
import { Audio } from './Audio';

export class SacrificeParticle {
    constructor(villager) {
        this.t = -1;
        this.d = 30;
        this.villager = villager;
    }

    update() {
        if (++this.t === this.d) {
            game.gameScene.grant([10]);
            this.cull = true;
        }

        if (this.t >= 24 && this.t <= 27) {
            this.villager.spawnChunks();
        }
        if (this.t === 24) {
            Audio.play(Audio.explosion);
        }

        this.villager.pos.v -= 0.2;
    }

    draw() {
        let u = this.villager.pos.u;
        let v = Math.floor(this.villager.pos.v);

        if (this.t >= 0 && this.t < 15) {
            let shake = (this.t % 3) - 1;
            Sprite.drawViewportSprite(Sprite.villager[0], { u: u + shake, v });
        } else if (this.t >= 15 && this.t <= 25) {
            // fake a "fat villager" to save sprite size
            // ideally we wouldn't expand the head, only the body,
            // but it's not worth the extra hassle
            Sprite.drawViewportSprite(Sprite.villager[0], { u, v });
            Sprite.drawViewportSprite(Sprite.villager[0], { u: u - 1, v });
            Sprite.drawViewportSprite(Sprite.villager[0], { u: u + 1, v });
        }
    }
}
