// HelpScene

import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba } from './Util';
import { game } from './Game';
import { Audio } from './Audio';
import { GameScene } from './GameScene';
import { Input } from './input/Input';
import { Sprite } from './Sprite';

export class HelpScene {
    static pagesUnlocked = 4;
    static help = [
        {
            title: 'SANITY',
            text: 'The sanity of the village is already eroding. If it runs out before you accomplish your mission, you lose.',
            arrow: [278, 38]
        },
        {
            title: 'INFLUENCE',
            text: 'Use your influence to control villagers. The more villagers you have, the longer it takes to gain another.',
            arrow: [100, 3]
        },
        {
            title: 'JOBS',
            text: 'Use the arrow keys to switch jobs and change the number of villagers assigned to a job. As you unlock additional jobs, adjust the number of villagers assigned to accomplish your goals.',
            arrow: [65, 122]
        },
        {
            title: 'RESOURCES',
            text: 'Resources are produced constantly by villagers each turn. Some resources consume other resources to produce, so watch resource levels carefully.',
            arrow: [170, 128]
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

        if (Input.pressed['Escape']) {
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

        if (page.arrow) {
            Viewport.ctx.drawImage(Sprite.bigarrows[0].img, page.arrow[0] + this.bounceX, page.arrow[1]);
        }

        const helpText = `HELP PAGE ${this.page + 1}/${HelpScene.pagesUnlocked}    \\l\\r MORE HELP    \\e BACK`;
        const helpWidth = Text.measure(helpText, 1).w;
        Text.drawText(Viewport.ctx, helpText, (Viewport.width - helpWidth) / 2, 170, 1, Text.palette[4]);
    }
}
