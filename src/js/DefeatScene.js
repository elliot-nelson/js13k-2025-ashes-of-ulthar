// DefeatScene

import { game } from './Game';
import { Text } from './Text';
import { Viewport } from './Viewport';
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
        Viewport.ctx.fillStyle = '#0a1a2f';
        Viewport.ctx.fillRect(-5, 0, Viewport.width + 5, Viewport.height);

        const gameOverWidth = Text.measure('GAME OVER', 2).w;
        Text.drawText(Viewport.ctx, 'GAME OVER', (Viewport.width - gameOverWidth) / 2, 10, 2, Text.palette[4]);

        //Viewport.ctx.drawImage(Sprite.blackcat[1].img, 160, 73 - 30);
        Viewport.ctx.drawImage(Sprite.blackcat[1].img, 160, 61 - 30);

        for (let i = 0; i < this.text.length; i++) {
            let width = Text.measure(this.text[i], 1).w;
            Text.drawText(Viewport.ctx, this.text[i], (Viewport.width - width) / 2, 80 + i * 10, 1, Text.palette[4]);
        }
    }
}
