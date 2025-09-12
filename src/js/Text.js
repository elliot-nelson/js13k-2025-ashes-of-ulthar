// Text

import { Sprite, recolor } from './Sprite';
import { rgba, createCanvas } from './Util';
import { PALETTE } from './Constants';

const C_WIDTH = 5;
const C_HEIGHT = 5;
const FONT_SHEET_C_WIDTH = 6;
const FONT_SHEET_WIDTH = 270;
const DEFAULT_C_SHIFT = 5;

// Very simple variable-width font implementation. The characters in the font strip
// are left-aligned in their 5x5 pixel boxes, so in order to have variable width,
// we just need to note the characters that AREN'T full width. Anything not in
// this list has full shift (5+1 = 6 pixels).
const C_SHIFT = {
    10: 0, // LF (\n)
    32: 3, // Space ( )
    33: 3, // Bang (!)
    39: 2, // Apostrophe (')
    40: 3, // Open Paren (
    41: 3, // Close Paren )
    44: 3, // Comma (,)
    46: 3, // Period (.)
    47: 6, // Slash (/)
    73: 2, // I
    77: 6, // M
    84: 6, // T
    86: 6, // V
    87: 6, // W
    88: 6, // X
    89: 6, // Y
    91: 4, // [ (s)
    109: 6, // m (up)
    111: 6, // o (down),
    1108: 10, // left arrow key
    1114: 10, // right arrow key
    1069: 6, // E
    1083: 6, // S
    1067: 10  // C
};

const C_ICONS = {
};

export const Text = {
    init() {
        Text.white = Sprite.font.img;
        //Text.black = recolor(Text.white, rgba(0, 0, 0, 1));
        //Text.shadow = recolor(Text.white, rgba(44, 27, 46, 1));

        //Text.tan = recolor(Text.white, rgba(209, 180, 140, 1));
        //Text.pig = recolor(Text.white, rgba(227, 66, 98, 1));
        //Text.duotone = recolorDuotone(Text.white, '#f2b63d', '#fff4e0');
        //Text.duotone_red = recolorDuotone(Text.white, '#ffaa5e', '#ffd4a3', rgba(255, 0, 0, 0.7));

        Text.palette = PALETTE.map(color => recolor(Text.white, color));

        C_ICONS[1108] = Sprite.button[0];
        C_ICONS[1114] = Sprite.button[0];
        C_ICONS[1069] = Sprite.button[0];
        C_ICONS[1083] = Sprite.button[0];
        C_ICONS[1067] = Sprite.button[0];
    },

    drawText(ctx, text, u, v, scale = 1, font = Text.white) {
        for (let c of this.charactersToDraw(text, scale)) {
            let nextfont = font;
            if (C_ICONS[c.c]) {
                ctx.drawImage(
                    C_ICONS[c.c].img,
                    u + c.u,
                    v + c.v - Math.floor((C_ICONS[c.c].img.height) / 2) + 2
                );
                nextfont = Text.palette[0];
                c.c -= 1000;
                c.u += 2;
            }
            let k = (c.c - 32) * FONT_SHEET_C_WIDTH;
            ctx.drawImage(
                nextfont,
                k % FONT_SHEET_WIDTH,
                (k / FONT_SHEET_WIDTH | 0) * FONT_SHEET_C_WIDTH,
                C_WIDTH,
                C_HEIGHT,
                u + c.u,
                v + c.v,
                C_WIDTH * scale,
                C_HEIGHT * scale
            );
        }
    },

    drawParagraph(ctx, text, u, v, width, scale = 1, font = Text.white, shadow) {
        const lines = this.breakParagraph(text, width, scale);

        for (let i = 0; i < lines.length; i++) {
            this.drawText(ctx, lines[i], u, v + i * (C_HEIGHT + 2) * scale, scale, font, shadow);
        }
    },

    breakParagraph(text, width, scale = 1) {
        const lines = [];
        let line = '';
        const words = text.split(' ');
        while (words.length > 0) {
            const lineWidth = this.measure(line + ' ' + words[0], scale).w;
            if (lineWidth > width) {
                lines.push(line);
                line = '';
            }
            line = (line.length > 0 ? line + ' ' : '') + words.shift();
        }
        if (line.length > 0) {
            lines.push(line);
        }
        return lines;
    },

    measure(text, scale = 1) {
        let w = 0, h = 0;

        for (let c of this.charactersToDraw(text, scale)) {
            w = Math.max(w, c.u + (C_SHIFT[c.c] || DEFAULT_C_SHIFT) * scale);
            h = c.v + (C_HEIGHT + 2) * scale;
        }

        return { w, h };
    },

    *charactersToDraw(text, scale = 1) {
        let u = 0, v = 0;

        for (let idx = 0; idx < text.length; idx++) {
            let c = text.charCodeAt(idx);

            if (c === 10) {
                // Newline
                u = 0;
                v += (C_HEIGHT + 2) * scale;
                continue;
            }

            if (c === 92) {
                // Backslash
                idx++;
                c = 1000 + text.charCodeAt(idx);
            }

            yield { c, u, v };

            u += (C_SHIFT[c] || DEFAULT_C_SHIFT) * scale;
        }
    }
};
