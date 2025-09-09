// TechScene

import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba } from './Util';
import { game } from './Game';
import { Audio } from './Audio';
import { Input } from './input/Input';
import { Sprite } from './Sprite';

export class TechScene {
    constructor(tech, lastUnlock) {
        this.tech = tech;
        this.t = 0;

        lastUnlock = lastUnlock || Object.values(this.tech)[0];
        this.pos = { x: lastUnlock.x, y: lastUnlock.y };
    }

    update() {
        game.gameScene.update(false);

        this.t++;
        this.bounceX = Math.floor(Math.cos(this.t / 8) * 3);

        if (Input.pressed['ArrowRight']) {
            this.pos.x++;
        }

        if (Input.pressed['ArrowLeft']) {
            this.pos.x--;
        }

        if (Input.pressed['ArrowUp']) {
            this.pos.y--;
        }
        if (Input.pressed['ArrowDown']) {
            this.pos.y++;
        }

        if (Input.pressed['Space']) {
            if (game.gameScene.buyTech(game.gameScene.getTechNode(this.pos.x, this.pos.y))) {
                Audio.play(Audio.wink);
            } else {
                Audio.play(Audio.fail);
            }
        }

        if (Input.pressed['Escape']) {
            game.scenes.pop();
        }
    }

    draw() {
        Viewport.ctx.fillStyle = rgba(0, 0, 0, 0.72);
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        let centerx = 80 - 11;
        let centery = 90 - 9;
        let offsetx = (-this.pos.x) * 23;
        let offsety = (-this.pos.y) * 19;

        let cardx = 180;
        let cardy = 40;

        for (let node of Object.values(this.tech)) {
            if (node && node.visible) {
                let bgColor = node.unlocked ? 1 : 0;

                Viewport.ctx.drawImage(Sprite.techtree[bgColor].img, offsetx + centerx + node.x * 23, offsety + centery + node.y * 19);

                if (node.sprite) {
                    Viewport.ctx.drawImage(Sprite.techtree[node.sprite].img, offsetx + centerx + node.x * 23, offsety + centery + node.y * 19);
                }

                if (node.x == this.pos.x && node.y == this.pos.y) {
                    Viewport.ctx.drawImage(Sprite.techtree[2].img, offsetx + centerx + node.x * 23, offsety + centery + node.y * 19);

                    let color = node.unlocked ? 4 : 3;

                    Text.drawText(Viewport.ctx, node.title.toUpperCase(), cardx, cardy, 1, Text.palette[4]);
                    Text.drawParagraph(Viewport.ctx, node.description.toUpperCase(), cardx, cardy + 10, 132, 1, Text.palette[3]);

                    if (!node.unlocked) {
                        let costColor = game.gameScene.canAffordCosts(node) ? 4 : 2;
                        Text.drawText(Viewport.ctx, 'UNLOCK:', cardx, cardy+40, 1, Text.palette[3]);
                        Text.drawParagraph(Viewport.ctx, node.unlockCost.toUpperCase(), cardx + 56, cardy+30, 132 - 56, 1, Text.palette[costColor]);
                    }

                    Text.drawText(Viewport.ctx, 'PER TURN:', cardx, cardy+50, 1, Text.palette[3]);
                    Text.drawParagraph(Viewport.ctx, node.perTurn.toUpperCase(), cardx + 56, cardy+40, 132 - 56, 1, Text.palette[4]);
                }
            }
        }
    }
}
