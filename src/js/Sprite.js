'use strict';

import { game } from './Game';
import { rgba, createCanvas } from './Util';
import { SpriteSheet } from './generated/SpriteSheet-gen';
import { Viewport } from './Viewport';
import { Camera } from './Camera';

/**
 * Sprite
 *
 * Encapsulates loading sprite slices from the spritesheet, organizing them, and
 * modifying them or constructing using primitives. To save space, we use some techniques
 * like storing only a small slice of an image in the spritesheet, then using code
 * to duplicate it, add some randomness, etc.
 */
export const Sprite = {
    // This is an exception to the rule, loading the spritesheet is a special action that
    // happens BEFORE everything is initialized.
    loadSpritesheet(cb) {
        let image = new Image();
        image.onload = cb;
        image.src = SpriteSheet.base64;
        Sprite.sheet = image;
    },

    init() {
        const defaultOpts = { anchor: { x: 0, y: 0 } };

        Sprite.blackcat = initBasicSpriteArray(SpriteSheet.blackcat, defaultOpts);
        Sprite.button = initBasicSpriteArray(SpriteSheet.button, defaultOpts);
        Sprite.sanitybar = initBasicSpriteArray(SpriteSheet.sanitybar, defaultOpts);
        Sprite.influencebar = initBasicSpriteArray(SpriteSheet.influencebar, defaultOpts);
        Sprite.smallarrows = initBasicSpriteArray(SpriteSheet.smallarrows, defaultOpts);
        Sprite.jobselect = initBasicSpriteArray(SpriteSheet.jobselect, defaultOpts);
        Sprite.bridge = initBasicSpriteArray(SpriteSheet.bridge, defaultOpts);
        Sprite.bigarrows = initBasicSpriteArray(SpriteSheet.bigarrows, defaultOpts);
        Sprite.icons = initBasicSpriteArray(SpriteSheet.icons, defaultOpts);
        Sprite.factory = initBasicSpriteArray(SpriteSheet.factory, defaultOpts);
        Sprite.altar = initBasicSpriteArray(SpriteSheet.altar, defaultOpts);
        Sprite.tree = initBasicSpriteArray(SpriteSheet.tree, defaultOpts);
        Sprite.terrain = [
            initBasicSprite(SpriteSheet['terrain-FG1'][0]),
            initBasicSprite(SpriteSheet['terrain-FG2'][0]),
            initBasicSprite(SpriteSheet['terrain-FG3'][0])
        ];
        Sprite.keys = initBasicSpriteArray(SpriteSheet.keys, defaultOpts);
        //Sprite.terrain[1].img = augmentTerrain(Sprite.terrain[1].img, 30, '#04373b');
        //Sprite.terrain[2].img = augmentTerrain(Sprite.terrain[2].img, 49, '#1a644e');

        // Villager
        Sprite.villager = initBasicSpriteArray(SpriteSheet.villager, { anchor: { x: 16, y: 29 } });
        const villagerFrames = Sprite.villager.length;
        for (let i = 0; i < villagerFrames; i++) {
            Sprite.villager[i + villagerFrames] = initDynamicSprite(flipHorizontal(Sprite.villager[i].img), { anchor: { x: 5, y: 29 } });
        }

        Sprite.particle = SpriteSheet.particle.map(initBasicSprite);

        // Base pixel font and icons (see `Text.init` for additional variations)
        Sprite.font = initBasicSprite(SpriteSheet.font4[0]);
    },

    /**
     * A small helper that draws a sprite onto a canvas, respecting the anchor point of
     * the sprite. Note that the canvas should be PRE-TRANSLATED and PRE-ROTATED, if
     * that's appropriate!
     */
    drawSprite(ctx, sprite, u, v) {
        ctx.drawImage(sprite.img, u - sprite.anchor.x, v - sprite.anchor.y);
    },

    drawViewportSprite(sprite, pos, rotation) {
        let { u, v } = this.viewportSprite2uv(
            sprite,
            pos
        );
        if (rotation) {
            Viewport.ctx.save();
            Viewport.ctx.translate(u + sprite.anchor.x, v + sprite.anchor.y);
            Viewport.ctx.rotate(rotation);
            Viewport.ctx.drawImage(
                sprite.img,
                -sprite.anchor.x,
                -sprite.anchor.y
            );
            Viewport.ctx.restore();
        } else {
            Viewport.ctx.drawImage(sprite.img, u, v);
        }
    },

    drawSmashedSprite(sprite, pos, height) {
        let { u, v } = this.viewportSprite2uv(
            sprite,
            pos
        );

        Viewport.ctx.drawImage(sprite.img, u - 1, v - height + sprite.img.height, sprite.img.width + 2, height);
    },

    viewportSprite2uv(sprite, pos) {
        // HACK TODO
        if (pos.u) {
            return {
                u: pos.u - sprite.anchor.x,
                v: pos.v - sprite.anchor.y
            };
        }

        return {
            u: pos.x - sprite.anchor.x - Camera.pos.x + Viewport.center.u,
            v: pos.y - sprite.anchor.y - Camera.pos.y + Viewport.center.v
        };
    }
};

// Sprite utility functions

function initBasicSpriteArray(data, opts) {
    return data.map(element => initBasicSprite(element, opts));
}

function initBasicSprite(data, opts) {
    return initDynamicSprite(loadCacheSlice(...data), opts);
}

function initDynamicSprite(source, opts) {
    let w = source.width,
        h = source.height;

    if (typeof opts !== 'object') {
        opts = {};
    }

    if (!opts.anchor) {
        opts.anchor = { x: (w / 2) | 0, y: (h / 2) | 0 };
    }

    if (!opts.bb) {
        opts.bb = [-opts.anchor.x, -opts.anchor.y, source.width, source.height];
    }

    return {
        img: source,
        ...opts
    };
}

function loadCacheSlice(x, y, w, h) {
    const source = Sprite.sheet;
    const sliceCanvas = createCanvas(w, h);
    sliceCanvas.ctx.drawImage(source, x, y, w, h, 0, 0, w, h);
    return sliceCanvas.canvas;
}

function flipHorizontal(source) {
    let canvas = createCanvas(source.width, source.height);
    canvas.ctx.translate(source.width, 0);
    canvas.ctx.scale(-1, 1);
    canvas.ctx.drawImage(source, 0, 0);
    return canvas.canvas;
}

/*function augmentTerrain(source, lines, color) {
    let w = source.width, h = source.height;
    let canvas = createCanvas(source.width, source.height);
    canvas.ctx.drawImage(source, 0, 0, w, h, 0, 0, w, h);
    canvas.ctx.fillStyle = color;
    canvas.ctx.fillRect(0, h - lines, w, lines);
    return canvas.canvas;
}
*/
