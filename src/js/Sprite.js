// Sprite

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
        // Preloaded option
        // image.onload = cb;
        // image.src = SpriteSheet.base64;
        // Sprite.sheet = image;

        // Dynamic load option
        let image = new Image();
        image.onload = () => {
            Sprite.sheet = image;
            cb();
        };
        image.onerror = () => { cb(); }
        image.src = 'sprites.png';
    },

    init() {
        // Standard (no special ops) sprites
        const defaultOpts = { anchor: { x: 0, y: 0 } };
        Sprite.font = initBasicSprite(SpriteSheet.font4[0]);
        Sprite.particle = SpriteSheet.particle.map(initBasicSprite);
        Sprite.blackcat = initBasicSpriteArray(SpriteSheet.blackcat, defaultOpts);
        Sprite.button = initBasicSpriteArray(SpriteSheet.button, defaultOpts);
        //Sprite.influencebar = initBasicSpriteArray(SpriteSheet.influencebar, defaultOpts);
        Sprite.smallarrows = initBasicSpriteArray(SpriteSheet.smallarrows, defaultOpts);
        Sprite.jobselect = initBasicSpriteArray(SpriteSheet.jobselect, defaultOpts);
        //Sprite.bigarrows = initBasicSpriteArray(SpriteSheet.bigarrows, defaultOpts);
        Sprite.icons = initBasicSpriteArray(SpriteSheet.icons, defaultOpts);
        Sprite.wink = initBasicSpriteArray(SpriteSheet.wink, defaultOpts);
        Sprite.techtree = initBasicSpriteArray(SpriteSheet.techtree, defaultOpts);
        Sprite.techtree[1] = initDynamicSprite(recolor(Sprite.techtree[0].img, PALETTE[3]), defaultOpts);

        // Ritual
        Sprite.ritualflame = initBasicSpriteArray(SpriteSheet.ritualflame, { anchor: { x: 4, y: 10 } });

        // Sanity bar handling
        Sprite.sanitybar = initBasicSpriteArray(SpriteSheet.sanitybar, defaultOpts);
        Sprite.sanitybar[2] = initDynamicSprite(recolor(Sprite.sanitybar[1].img, PALETTE[0]), defaultOpts);

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
        Sprite.villagerchunk = initBasicSpriteArray(SpriteSheet.villagerchunk, { anchor: { x: 4, y: 4 } });
        Sprite.villager = initBasicSpriteArray(SpriteSheet.villager, { anchor: { x: 16, y: 29 } });
        const villagerFrames = Sprite.villager.length;
        Sprite.villager[1].img = copySpriteFrame(Sprite.villager[0].img, Sprite.villager[1].img, 22, 28);
        Sprite.villager[8].img = copySpriteFrame(Sprite.villager[7].img, Sprite.villager[8].img, 22, 29);
        Sprite.villager[9].img = copySpriteFrame(Sprite.villager[7].img, Sprite.villager[9].img, 22, 29);
        Sprite.villager[11].img = copySpriteFrame(Sprite.villager[10].img, Sprite.villager[11].img, 22, 29);
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

    viewportSprite2uv(sprite, pos) {
        return {
            u: pos.u - sprite.anchor.x,
            v: pos.v - sprite.anchor.y
        };
        /*
        // HACK TODO
        if (pos.u) {
            return {
                u: pos.u - sprite.anchor.x,
                v: pos.v - sprite.anchor.y
            };
        }

        return {
            u: pos.x - sprite.anchor.x - (0) Camera.pos.x + Viewport.center.u,
            v: pos.y - sprite.anchor.y - (0) Camera.pos.y + Viewport.center.v
        };
        */
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

function copySpriteFrame(source, dest, w, h) {
    let canvas = createCanvas(dest.width, dest.height);
    canvas.ctx.drawImage(dest, 0, 0);
    canvas.ctx.drawImage(source, 0, 0, w, h, 0, 0, w, h);
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
