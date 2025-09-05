'use strict';

import { game } from './Game';
import { rgba, createCanvas } from './Util';
import { SpriteSheet } from './generated/SpriteSheet-gen';
import { Viewport } from './Viewport';
import { TARGET_GAME_HEIGHT, PALETTE } from './Constants';

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
        // Standard (no special ops) sprites
        const defaultOpts = { anchor: { x: 0, y: 0 } };
        Sprite.font = initBasicSprite(SpriteSheet.font4[0]);
        Sprite.particle = SpriteSheet.particle.map(initBasicSprite);
        Sprite.blackcat = initBasicSpriteArray(SpriteSheet.blackcat, defaultOpts);
        Sprite.button = initBasicSpriteArray(SpriteSheet.button, defaultOpts);
        Sprite.influencebar = initBasicSpriteArray(SpriteSheet.influencebar, defaultOpts);
        Sprite.smallarrows = initBasicSpriteArray(SpriteSheet.smallarrows, defaultOpts);
        Sprite.jobselect = initBasicSpriteArray(SpriteSheet.jobselect, defaultOpts);
        Sprite.bridge = initBasicSpriteArray(SpriteSheet.bridge, defaultOpts);
        Sprite.bigarrows = initBasicSpriteArray(SpriteSheet.bigarrows, defaultOpts);
        Sprite.icons = initBasicSpriteArray(SpriteSheet.icons, defaultOpts);
        Sprite.factory = initBasicSpriteArray(SpriteSheet.factory, defaultOpts);
        Sprite.wink = initBasicSpriteArray(SpriteSheet.wink, defaultOpts);
        Sprite.keys = initBasicSpriteArray(SpriteSheet.keys, defaultOpts);

        // Custom anchors
        Sprite.altar = initBasicSpriteArray(SpriteSheet.altar, { anchor: { x: 9, y: 28 } });
        Sprite.villagerdeath = initBasicSpriteArray(SpriteSheet.villagerdeath, { anchor: { x: 6, y: 21 } });
        Sprite.villagerchunk = initBasicSpriteArray(SpriteSheet.villagerchunk, { anchor: { x: 4, y: 4 } });

        // Sanity bar handling
        Sprite.sanitybar = initBasicSpriteArray(SpriteSheet.sanitybar, defaultOpts);
        Sprite.sanitybar[2] = initDynamicSprite(recolor(Sprite.sanitybar[1].img, '#0a1a2f'), defaultOpts);

        // Terrain handling
        Sprite.terrain = [
            initBasicSprite(SpriteSheet.terrain_FG1[0]),
            initBasicSprite(SpriteSheet.terrain_FG2[0]),
            initBasicSprite(SpriteSheet.terrain_FG3[0])
        ];
        for (let i = 0; i < 3; i++) {
            Sprite.terrain[i].img = augmentTerrain(Sprite.terrain[i].img, 30, PALETTE[i]);
        }

        // Villager
        Sprite.villager = initBasicSpriteArray(SpriteSheet.villager, { anchor: { x: 16, y: 29 } });
        const villagerFrames = Sprite.villager.length;
        for (let i = 0; i < villagerFrames; i++) {
            Sprite.villager[i + villagerFrames] = initDynamicSprite(flipHorizontal(Sprite.villager[i].img), { anchor: { x: 5, y: 29 } });
        }
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
            u: pos.x - sprite.anchor.x - (0) /*Camera.pos.x*/ + Viewport.center.u,
            v: pos.y - sprite.anchor.y - (0) /*Camera.pos.y*/ + Viewport.center.v
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

export function flipHorizontal(source) {
    let canvas = createCanvas(source.width, source.height);
    canvas.ctx.translate(source.width, 0);
    canvas.ctx.scale(-1, 1);
    canvas.ctx.drawImage(source, 0, 0);
    return canvas.canvas;
}

function shiftTerrain(source, lines) {
    // To save space, the source image cuts out 30 lines of "space" we don't
    // fill in. This is just transparent.
    let canvas = createCanvas(source.width, TARGET_GAME_HEIGHT);
    canvas.ctx.drawImage(source, 0, 0, source.width, source.height, 0, lines, source.width);
    return canvas.canvas;
}

function augmentTerrain(source, lines, color) {
    let canvas = createCanvas(320, 180);
    canvas.ctx.drawImage(source, 0, 0);
    canvas.ctx.fillStyle = color;
    canvas.ctx.fillRect(0, 180 - lines, 320, lines);
    return canvas.canvas;
}

export function recolor(source, color) {
    let canvas = createCanvas(source.width, source.height);
    canvas.ctx.fillStyle = color;
    canvas.ctx.fillRect(0, 0, source.width, source.height);
    canvas.ctx.globalCompositeOperation = 'destination-in';
    canvas.ctx.drawImage(source, 0, 0);
    return canvas.canvas;
}
