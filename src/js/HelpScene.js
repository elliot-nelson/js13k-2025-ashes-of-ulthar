// HelpScene

import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { game } from './Game';
import { Audio } from './Audio';
import { GameScene } from './GameScene';
import { Input } from './input/Input';
import { Sprite } from './Sprite';

export class HelpScene {
    static HELP_SANITY = 0;

    static Scenes = {
        [HelpScene.HELP_SANITY]:{
        text: 'The villagers are frail, and their sanity is fragile. Free the village before it runs out.'.toUpperCase(),
        uScroll: 120,
        vScroll: 30,
        uArrow: 278,
        vArrow: 38
    }
    };

    constructor(helpStep) {
        this.helpStep = helpStep;
        this.scene = HelpScene.Scenes[helpStep];
    }

    update() {
        if (Input.pressed[Input.Action.JUMP] || Input.pressed[Input.Action.CONTINUE]) {
            game.scenes.pop();
        }
    }

    draw() {
        Viewport.ctx.fillStyle = rgba(0, 0, 0, 0.66);
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        Viewport.ctx.drawImage(Sprite.helpscroll[0].img, this.scene.uScroll, this.scene.vScroll);
        Text.drawParagraph(Viewport.ctx, 'The villagers are frail, and their sanity is fragile. Free the village before it runs out.'.toUpperCase(), this.scene.uScroll + 4, this.scene.vScroll + 3, 140, 1, Text.palette[4]);

        Viewport.ctx.drawImage(Sprite.bigarrows[0].img, this.scene.uArrow, this.scene.vArrow);

        if (this.helpStep === HelpScene.HELP_SANITY) {
            game.gameScene.drawSanityBar();
        }

        return;
    }
}
