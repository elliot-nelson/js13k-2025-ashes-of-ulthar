// IntroScene

import { PALETTE } from './Constants';
import { game } from './Game';
import { Text } from './Text';
import { Sprite } from './Sprite';
import { Viewport } from './Viewport';
import { Input } from './input/Input';
import { AshParticle } from './AshParticle';
import { Audio } from './Audio';
import { GameScene } from './GameScene';
import { drawBlackCat } from './BlackCat';



export class IntroScene {
    constructor() {
        this.t = 0;
        this.fadet = -1;
        this.entities = [];

        // Fade in GitHub link for first time in intro scene.
        document.getElementsByClassName('github-corner')[0].className = 'github-corner';
    }

    update() {
        this.t++;

        if (this.fadet >= 0) this.fadet++;

        if (this.fadet === 1) {
            Audio.initTracks();
        }

        if (this.fadet > 20) {
            game.scenes.pop();

            const gameScene = new GameScene();
            game.scenes.push(gameScene);
            gameScene.entities = this.entities;
        }

        if (Input.pressed['Space']) {
            this.fadet = 0;
        }

        if (this.entities.length < 33) {
            this.entities.push(new AshParticle());
        }

        for (let entity of this.entities) {
            entity.update();
        }

        this.entities = this.entities.filter(entity => !entity.cull);
    }

    draw() {
        Viewport.ctx.fillStyle = PALETTE[0];
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        Viewport.ctx.globalAlpha = Math.min(this.t / 20, 1);
        Viewport.ctx.fillStyle = PALETTE[3];
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);
        Viewport.ctx.globalAlpha = 1;

        for (let entity of this.entities) {
            entity.draw();
        }

        if (this.t > 30) {
            let adjustment = Math.max(1 - this.t / 54, 0);
            drawBlackCat(this, this.t % 3 === 0, adjustment);
        }

        if (this.t > 40) {
            let title = 'ASHES OF ULTHAR';
            let titleWidth = Text.measure(title, 2).w;
            Text.drawText(Viewport.ctx, title, 168 - titleWidth / 2, 13 - this.fadet * 3, 2, Text.palette[4], Text.palette[1]);
        }

        if (this.t > 48 && this.fadet < 0) {
            let text = 'PRESS SPACE TO PLAY';
            let width = Text.measure(text, 1).w;
            Text.drawText(Viewport.ctx, text, 168 - width / 2, 150, 1, Text.palette[4], Text.palette[1]);
        }
    }
}
