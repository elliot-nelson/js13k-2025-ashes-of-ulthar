// DefeatScene

import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { game } from './Game';
import { Audio } from './Audio';
import { GameScene } from './GameScene';
import { Sprite } from './Sprite';
import { Input } from './input/Input';

export class DefeatScene {
    constructor(stats) {
        this.stats = stats;

        this.text = [
            'THE LAST SPARK OF SANITY FADES IN ULTHAR, AND WITH IT',
            'ANY HOPE OF DELIVERANCE FOR YOU AND YOUR KIN.',
            '',
            'WOOD GATHERED: ' + this.stats.woodGathered,
            'MEAT BUTCHERED: ' + this.stats.meatGathered,
            'TORCHES CRAFTED: ' + this.stats.torchesCrafted,
            'STONE MINED: ' + this.stats.stoneGathered,
            'SECONDS SURVIVED: ' + this.stats.seconds
        ];
        this.frames = 0;
    }

    update() {
        this.frames++;

        if (Input.pressed[Input.Action.JUMP]) {
            game.scenes.pop();
        }
    }

    draw() {
        Viewport.ctx.drawImage(Sprite.defeat[12].img, 0, 0);

        for (let i = 0; i < this.text.length; i++) {
            let width = Text.measure(this.text[i], 1).w;
            Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2, 30 + i * 10, 1, Text.white, Text.shadow);
        }
    }
}
