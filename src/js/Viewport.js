// Viewport

import { TARGET_GAME_WIDTH, TARGET_GAME_HEIGHT } from './Constants';

/**
 * Viewport
 *
 * Represents the game display (for us, a canvas).
 */
export const Viewport = {
    init() {
        Viewport.canvas = document.getElementById('canvas');
        Viewport.ctx = Viewport.canvas.getContext('2d');
        Viewport.resize(true);
    },

    // Unlike past years, this canvas does not build in "buffers" to the gameplay canvas,
    // it locks the output canvas at exactly the desired dimensions, and you'll get black bars
    // (horizontal or vertical) depending on browser size.
    //
    // This may or may not be appropriate for every game, but it works for this one, and is
    // a little less code :).
    resize(force) {
        let dpr = window.devicePixelRatio,
            clientWidth = Viewport.canvas.clientWidth,
            clientHeight = Viewport.canvas.clientHeight;

        // Note: this check is just checking existing dimensions against cached dimensions,
        // help cut out some work if no resize took place. We DON'T hook into the actual
        // browser resize event.
        if (clientWidth !== Viewport.clientWidth || clientHeight !== Viewport.clientHeight) {
            Viewport.width = TARGET_GAME_WIDTH;
            Viewport.height = TARGET_GAME_HEIGHT;

            Viewport.clientWidth = clientWidth;
            Viewport.clientHeight = clientHeight;

            let pixelScale = Math.ceil(clientWidth * dpr / TARGET_GAME_WIDTH);

            Viewport.canvas.width = TARGET_GAME_WIDTH * pixelScale;
            Viewport.canvas.height = TARGET_GAME_HEIGHT * pixelScale;
            Viewport.scale = pixelScale;

            console.log(Viewport.width, Viewport.height, Viewport.clientWidth, Viewport.clientHeight, pixelScale);

            // Make sure to set this every time the canvas changes size.
            Viewport.ctx.imageSmoothingEnabled = false;
        }

        // We do this every frame, not just on resize, due to browser sometimes "forgetting".
        Viewport.canvas.style.cursor = 'none';
    }
};
