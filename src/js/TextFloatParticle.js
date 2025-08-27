// TextFloatParticle

import { Viewport } from './Viewport';
import { Text } from './Text';

export class TextFloatParticle {
    constructor(pos, text, paletteRange) {
        this.pos = { ...pos };
        this.text = text;
        this.paletteRange = paletteRange;
        this.t = -1;
        this.d = 30;
    }

    update() {
        if (++this.t === this.d) this.cull = true;
        this.pos.v -= 0.2;
        this.paletteColor = Math.round((this.paletteRange[1] - this.paletteRange[0]) * (this.t/this.d) + this.paletteRange[0]);
    }

    draw() {
        Text.drawText(Viewport.ctx, this.text, this.pos.u, this.pos.v, 1, Text.palette[this.paletteColor]);
    }
}
