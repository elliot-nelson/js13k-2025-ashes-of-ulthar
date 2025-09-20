// HelpScene

import { PALETTE } from './Constants';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba } from './Util';
import { game } from './Game';
import { Audio } from './Audio';
import { GameScene } from './GameScene';
import { Input } from './input/Input';
import { Sprite } from './Sprite';

export class HelpScene {
    static pagesUnlocked = 5;
    static help = [
        {
            title: 'SANITY',
            text: 'Bring freedom to the village before sanity erodes completely.',
            arrow: [180, 38, 306, 30]
        },
        {
            title: 'INFLUENCE',
            text: 'Exert influence to recruit villagers. Each villager requires additional influence.'
            //arrow: [132, 38, 126, 8]
        },
        {
            title: 'JOBS',
            text: 'Use arrow keys to switch jobs and assign recruited villagers. You can move villagers you have already recruited between jobs.',
            arrow: [160, 80, 70, 127]
        },
        {
            title: 'RESOURCES',
            text: 'Resources are produced and consumed each turn by each job.',
            arrow: [160, 70, 210, 126]
        },
        {
            title: 'CODEX',
            text: 'Unlock jobs, upgrades and abilities in the Codex.'
        }
    ];

    constructor(page) {
        this.page = page || 0;
        this.t = 0;
    }

    update() {
        this.t++;
        this.bounceX = Math.floor(Math.cos(this.t / 8) * 3);

        if (Input.pressed['ArrowRight']) {
            this.page = (this.page + 1) % HelpScene.pagesUnlocked;
        }

        if (Input.pressed['ArrowLeft']) {
            this.page = (this.page + HelpScene.pagesUnlocked - 1) % HelpScene.pagesUnlocked;
        }

        if (Input.pressed['Escape'] || Input.pressed['KeyH']) {
            game.scenes.pop();
        }
    }

    draw() {
        Viewport.ctx.fillStyle = rgba(0, 0, 0, 0.66);
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        const page = HelpScene.help[this.page];

        const titleText = page.title.toUpperCase();
        const titleWidth = Text.measure(titleText, 1).w;
        Text.drawText(Viewport.ctx, titleText, (Viewport.width - titleWidth) / 2, 35, 1, Text.palette[4]);
        Text.drawParagraph(Viewport.ctx, page.text.toUpperCase(), 80, 50, 180, 1, Text.palette[4]);

        Viewport.ctx.strokeStyle = PALETTE[4];
        Viewport.ctx.beginPath();
        if (page.arrow) {
            Viewport.ctx.moveTo(page.arrow[0], page.arrow[1]);
            Viewport.ctx.lineTo(page.arrow[2], page.arrow[3]);
        }
        Viewport.ctx.stroke();

        const helpText = `HELP PAGE ${this.page + 1}/${HelpScene.pagesUnlocked}    \\h1l \\h1r MORE HELP    \\h1H / \\h3ESC BACK`;
        const helpWidth = Text.measure(helpText, 1).w;
        Text.drawText(Viewport.ctx, helpText, (Viewport.width - helpWidth) / 2, 170, 1, Text.palette[4]);
    }
}
