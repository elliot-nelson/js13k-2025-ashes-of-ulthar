// TechScene

import { RESOURCE_NAMES } from './Constants';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba } from './Util';
import { game } from './Game';
import { Audio } from './Audio';
import { Input } from './input/Input';
import { Sprite } from './Sprite';

export class TechScene {
    constructor(tech) {
        this.tech = tech;
        this.t = 0;

        let lastNode = TechScene.lastPos || Object.values(this.tech)[0];
        this.pos = { x: lastNode.x, y: lastNode.y };
    }

    update() {
        game.gameScene.update(false);

        this.t++;
        this.bounceX = Math.floor(Math.cos(this.t / 8) * 3);

        TechScene.lastPos = this.pos;

        if (Input.pressed['ArrowRight']) {
            this.move(1, 0);
        }
        if (Input.pressed['ArrowLeft']) {
            this.move(-1, 0);
        }
        if (Input.pressed['ArrowUp']) {
            this.move(0, -1);
        }
        if (Input.pressed['ArrowDown']) {
            this.move(0, 1);
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
            if (node && node.visible && Math.abs(node.x - this.pos.x) <= 2 && Math.abs(node.y - this.pos.y) <= 2) {
                let bgColor = node.unlocked ? 1 : 0;

                Viewport.ctx.drawImage(Sprite.techtree[bgColor].img, offsetx + centerx + node.x * 23, offsety + centery + node.y * 19);

                if (node.sprite) {
                    Viewport.ctx.drawImage(Sprite.techtree[node.sprite].img, offsetx + centerx + node.x * 23, offsety + centery + node.y * 19);
                }

                if (node.x == this.pos.x && node.y == this.pos.y) {
                    Viewport.ctx.drawImage(Sprite.techtree[2].img, offsetx + centerx + node.x * 23, offsety + centery + node.y * 19);

                    Text.drawText(Viewport.ctx, node.title.toUpperCase(), cardx, cardy, 1, Text.palette[4]);
                    Text.drawParagraph(Viewport.ctx, node.description.toUpperCase(), cardx, cardy + 10, 132, 1, Text.palette[3]);

                    if (node.unlocked) {
                        Text.drawText(Viewport.ctx, 'UNLOCKED', cardx, cardy+40, 1, Text.palette[4]);
                    } else {
                        let costColor = game.gameScene.canAffordCosts(node.unlockCost) ? 4 : 2;

                        let unlockCostTextArray = [];
                        for (let i = 0; i < node.unlockCost.length; i++) {
                            if (node.unlockCost[i]) unlockCostTextArray.push('' + node.unlockCost[i] + ' ' + RESOURCE_NAMES[i]);
                        }

                        Text.drawText(Viewport.ctx, 'UNLOCK:', cardx, cardy+40, 1, Text.palette[3]);
                        Text.drawParagraph(Viewport.ctx, unlockCostTextArray.join('\n'), cardx + 56, cardy+40, 132 - 56, 1, Text.palette[costColor]);
                    }

                    let perText = node.perTurn ? 'PER TURN:' : 'PER USE:';
                    Text.drawText(Viewport.ctx, perText, cardx, cardy+70, 1, Text.palette[3]);
                    Text.drawParagraph(Viewport.ctx, (node.perTurn || node.perUse).toUpperCase(), cardx + 56, cardy+70, 132 - 56, 1, Text.palette[4]);
                }
            }
        }

        const helpText = `\\l\\r MOVE    \\SPACE UNLOCK     \\E\\S\\C BACK`;
        const helpWidth = Text.measure(helpText, 1).w;
        Text.drawText(Viewport.ctx, helpText, (Viewport.width - helpWidth) / 2, 170, 1, Text.palette[4]);
    }

    move(dx, dy) {
        Audio.play(Audio.click);
        if (game.gameScene.getTechNode(this.pos.x + dx, this.pos.y + dy)?.visible) {
            this.pos.x += dx;
            this.pos.y += dy;
        }
    }
}
