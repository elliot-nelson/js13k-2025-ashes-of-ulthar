// Button

import { Audio } from './Audio';
import { BigArrowParticle } from './BigArrowParticle';
import { Camera } from './Camera';
import { CloudParticle } from './CloudParticle';
import { TARGET_GAME_HEIGHT, TARGET_GAME_WIDTH, TILE_SIZE } from './Constants';
import { FallingDirtParticle } from './FallingDirtParticle';
import { game } from './Game';
import { LandingParticle } from './LandingParticle';
import { Player } from './Player';
import { Replay } from './Replay';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { StarParticle } from './StarParticle';
import { clamp, qr2xy, uv2xy, xy2qr, xy2uv } from './Util';
import { Viewport } from './Viewport';
import { LevelData } from './generated/LevelData-gen';

export class Button {
    constructor(u, v, hotkey, text) {
        this.u = u;
        this.v = v;
        this.hotkey = hotkey;
        this.text = text;
        this.visible = false;
        this.active = false;
    }

    update() {
        if (!this.visible) return;
    }

    draw() {
        if (!this.visible) return;

        const frame = this.active ? 0 : 2;
        const colorIndex = this.active ? 4 : 2;
        const bgColorIndex = this.active ? 0 : 2;
        Viewport.ctx.drawImage(Sprite.button[frame].img, this.u, this.v);
        Text.drawText(Viewport.ctx, this.hotkey, this.u + 2, this.v + 2, 1, Text.palette[bgColorIndex]);
        Text.drawText(Viewport.ctx, this.text.toUpperCase(), this.u + 11, this.v + 2, 1, Text.palette[colorIndex]);
    }
}
