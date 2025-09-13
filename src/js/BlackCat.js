// BlackCat

import { Viewport } from './Viewport';
import { Sprite } from './Sprite';

export function drawBlackCat(obj, reset, adjustment) {
    if (!obj.blackCatX || reset) {
        obj.blackCatX = [0,1,2,3,4,5,6,7,8].map(x => adjustment * (Math.random() * 12 - 6));
        obj.blackCatAlpha = [0,1,2,3,4,5,6,7,8].map(x => 1 - adjustment * Math.random());
    }
    for (let i = 0; i < 9; i++) {
        let y = i * 4;
        Viewport.ctx.globalAlpha = obj.blackCatAlpha[i];
        Viewport.ctx.drawImage(Sprite.blackcat[0].img, 0, y, 24, 4, 160 + obj.blackCatX[i], 73 - 30 + y, 24, 4);
    }
    Viewport.ctx.globalAlpha = 1;
}
