// GameOverScene

import { game } from './Game';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { clamp } from './Util';
import { PALETTE } from './Constants';

export class GameOverScene {
    constructor(victory, stats) {
        this.victory = victory;
        this.stats = stats;

        if (victory) {
            this.title = 'VICTORY';
            this.text = [
                'FREEDOM RINGS OUT, NOT JUST FOR ULTHAR,',
                'BUT THE ENTIRE PLANET.',
                ''
            ]
            this.scorelines = [
                ['FREEDOM REIGNS', 'YES', 7000],
                ['SEALS LIT', String(stats.freedom), stats.freedom * 1000],
                ['WOOD GATHERED', String(stats.woodGathered), clamp(1000 - stats.woodGathered, 0, 1000)],
                ['MEAT BUTCHERED', String(stats.meatGathered), clamp(1000 - stats.meatGathered, 0, 1000)],
                ['TORCHES CRAFTED', String(stats.torchesCrafted), clamp(1000 - stats.torchesCrafted, 0, 1000)],
                ['STONE MINED', String(stats.stoneGathered), clamp(1000 - stats.stoneGathered, 0, 1000)],
                ['TIME', String(stats.seconds), clamp(1000 - stats.seconds, 0, 1000)]
            ]
        } else {
            this.title = 'GAME OVER';
            this.text = [
                'THE LAST SPARK OF SANITY FADES IN ULTHAR, AND WITH IT',
                'ANY HOPE OF FREEDOM FOR YOU AND YOUR KIN.',
                '',
            ];
            this.scorelines = [
                ['FREEDOM REIGNS', 'NO', 0],
                ['SEALS LIT', String(stats.freedom), stats.freedom * 1000],
                ['WOOD GATHERED', String(stats.woodGathered), clamp(stats.woodGathered, 0, 1000)],
                ['MEAT BUTCHERED', String(stats.meatGathered), clamp(stats.meatGathered, 0, 1000)],
                ['TORCHES CRAFTED', String(stats.torchesCrafted), clamp(stats.torchesCrafted, 0, 1000)],
                ['STONE MINED', String(stats.stoneGathered), clamp(stats.stoneGathered, 0, 1000)],
                ['TIME', String(stats.seconds), clamp(stats.seconds, 0, 1000)]
            ]
        }
        this.t = 0;
        this.finalScore = 0;
        this.displayedScore = 0;
        this.linesDisplayed = 0;

        this.scorelines[3][2] = 123;
        this.scorelines[4][2] = 500;
    }

    update() {
        this.t++;

        if (this.t > 150 && Input.pressed['Space']) {
            game.scenes.pop();
        }

        if (this.t > 0 && (this.t % 30) === 0 && this.linesDisplayed < 7) {
            this.linesDisplayed++;
            this.finalScore += this.scorelines[this.linesDisplayed - 1][2];
        }

        if (this.displayedScore < this.finalScore) {
            this.displayedScore += Math.ceil((this.finalScore - this.displayedScore) * 0.1);
        }
    }

    draw() {
        Viewport.ctx.fillStyle = PALETTE[1];
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        const gameOverWidth = Text.measure(this.title, 2).w;
        Text.drawText(Viewport.ctx, this.title, (Viewport.width - gameOverWidth) / 2, 10, 2, Text.palette[4]);

        //Viewport.ctx.drawImage(Sprite.blackcat[1].img, 160, 73 - 30);
        //Viewport.ctx.drawImage(Sprite.blackcat[1].img, 160, 61 - 30);

        let y = 0;

        for (y = 0; y < this.text.length; y++) {
            let width = Text.measure(this.text[y], 1).w;
            Text.drawText(Viewport.ctx, this.text[y], (Viewport.width - width) / 2, 32 + y * 10, 1, Text.palette[4]);
        }

        y += 0.5;

        let displayed = clamp(this.t / 15, 0, 14);
        for (let i = 0; i < displayed; i++) {
            let idx = Math.floor(i / 2);
            let column = i % 2;
            if (column === 0) {
                Text.drawText(Viewport.ctx, this.scorelines[idx][0], 70, 32 + y * 10, 1, Text.palette[3]);
            }
            if (column === 1) {
                let width = Text.measure(this.scorelines[idx][1], 1).w;
                Text.drawText(Viewport.ctx, this.scorelines[idx][1], 250 - width, 32 + y * 10, 1, Text.palette[4]);
                y++;
            }
        }

        y = 11;
        Text.drawText(Viewport.ctx, 'FINAL SCORE', 70, 32 + y * 10, 1, Text.palette[3]);
        let width = Text.measure(String(this.displayedScore), 1).w;
        Text.drawText(Viewport.ctx, String(this.displayedScore), 250 - width, 32 + y * 10, 1, Text.palette[4]);

        if (this.t > 150) {
            let text = 'PRESS SPACE TO PLAY AGAIN';
            let width = Text.measure(text, 1).w;
            Text.drawText(Viewport.ctx, text, 160 - width / 2, 165, 1, Text.palette[4], Text.palette[1]);
        }
    }
}
