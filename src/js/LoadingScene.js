// LoadingScene

import { Audio } from './Audio';
import { game } from './Game';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { clamp } from './Util';
import { Viewport } from './Viewport';
import { AshParticle } from './AshParticle';

export class LoadingScene {
    constructor() {
        this.t = -12;
        this.entities = [];

        for (let i = 0; i < 10; i++) {
            this.entities.push(new AshParticle());
        }
    }

    update() {
        this.t++;

        let ratio = Math.min(1, this.t / 40);
        this.y = Math.floor((1-ratio) * 100);

        if (this.t === 36) {
            Audio.initTracks();
        }

        if (this.t > 42) {
            game.scenes.pop();
        }

        //this.entities.push(new AshParticle());

        /*for (const entity of this.entities) {
            entity.update();
        }*/
    }

    draw() {
        Viewport.ctx.fillStyle = '#0a1a2f';
        if (this.t === 9) {
            Viewport.ctx.fillStyle = '#d1cb95';
        } else if (this.t > 5) {
            Viewport.ctx.fillStyle = '#40985e';
        }
        Viewport.ctx.fillRect(0, 0, 320, 180);

        if (this.t < 5) return;

        // Layer 3 (farthest)

        //Viewport.ctx.drawImage(Sprite.terrain[2].img, 0, this.y * 0.8 * 0.8);

        // Layer 2 (middle)

        //Viewport.ctx.drawImage(Sprite.terrain[1].img, 0, this.y * 0.8);

        // Layer 1 (closest)

        //Viewport.ctx.drawImage(Sprite.terrain[0].img, 0, this.y);

        // Black cat perch

        if (this.t >= 9) {
            Viewport.ctx.drawImage(Sprite.blackcat[0].img, 160, 73 - 30);
        }

        if (this.t <= 9) {
            for (let i = 0; i < 10; i++) {
                let x = Math.random() * 40 - 20 + 160 + 9;
                let y = Math.random() * 20 - 10 + 73 - 30 + 16;
                Viewport.ctx.drawImage(Sprite.particle[0].img, x, y);
            }
        }

        for (const entity of this.entities) {
            entity.draw();
        }

        Viewport.ctx.globalAlpha = Math.floor((1-(this.t/42)) * 100) / 100;
        const k = Math.floor((1-(this.t/42)) * 100) / 100;
        Viewport.ctx.fillStyle = '#0a1a2f';
        Viewport.ctx.fillRect(0, 0, 320, 180);
        Viewport.ctx.globalAlpha = 1;
    }
}
