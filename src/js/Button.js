// Button

import { Sprite } from './Sprite';
import { Text } from './Text';
import { Viewport } from './Viewport';

export class Button {
    constructor(u, v, hotkey, text) {
        this.u = u;
        this.v = v;
        this.hotkey = hotkey;
        this.text = text;
        this.visible = false;
        this.active = false;
    }

    update() { }

    draw() {
        if (this.visible) {
            const frame = this.active ? 0 : 2;
            const colorIndex = this.active ? 4 : 2;
            const bgColorIndex = this.active ? 0 : 2;
            Viewport.ctx.drawImage(Sprite.button[frame].img, this.u, this.v);
            Text.drawText(Viewport.ctx, this.hotkey, this.u + 2, this.v + 2, 1, Text.palette[bgColorIndex]);
            Text.drawText(Viewport.ctx, this.text.toUpperCase(), this.u + 11, this.v + 2, 1, Text.palette[colorIndex]);
        }
    }
}
