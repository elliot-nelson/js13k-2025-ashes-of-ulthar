// PauseScene

import { RESOURCE_NAMES } from './Constants';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba } from './Util';
import { game } from './Game';
import { Audio } from './Audio';
import { Input } from './input/Input';
import { Sprite } from './Sprite';

export class PauseScene {
    constructor() {
        this.t = 0;
    }

    update() {
        this.t++;

        if (Input.pressed['Escape']) {
            game.scenes.pop();
        }
    }

    draw() {
        Viewport.ctx.fillStyle = rgba(0, 0, 0, 0.72);
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        let text = 'PAUSED - PRESS ESC TO CONTINUE';
        let width = Text.measure(text, 1).w;

        Text.drawText(Viewport.ctx, text, (Viewport.width - width) / 2, 80, 1, Text.palette[3]);
    }
}
