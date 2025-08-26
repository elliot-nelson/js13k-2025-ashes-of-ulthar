// Game

import { Audio } from './Audio';
import { Camera } from './Camera';
import { FPS } from './Constants';
import { IntroScene } from './IntroScene';
import { GameScene } from './GameScene';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { VictoryScene } from './VictoryScene';
import { Viewport } from './Viewport';
import { LevelData } from './generated/LevelData-gen';
import { Input } from './input/Input';

/**
 * Game state.
 */
export class Game {
    init() {
        Sprite.loadSpritesheet(() => {
            Viewport.init();
            Sprite.init();
            Text.init();
            Input.init();
            Audio.init();

            Camera.init();

            window.addEventListener('blur', () => this.pause());
            window.addEventListener('focus', () => this.unpause());

            this.reset();
            this.start();
        });
    }

    reset() {
        this.scenes = [];
        this.lastFrame = 0;
        this.nextLevel = 0;

        this.scores = [
            { time: 300 * 60, enemiesAlive: 10 },
            { time: 300 * 60, enemiesAlive: 10 },
            { time: 300 * 60, enemiesAlive: 10 },
            { time: 300 * 60, enemiesAlive: 10 }
        ];

        this.scenes.push(new IntroScene());
    }

    start() {
        this.frame = 0;
        this.framestamps = [0];
        this.update();
        window.requestAnimationFrame((xyz) => this.onFrame(xyz));
    }

    onFrame(currentms) {
        let delta = (currentms - this.lastFrame) - (1000 / FPS);

        if (delta >= 0) {
            this.frame++;
            this.lastFrame = currentms - delta;
            Viewport.resize();
            this.update();
            this.draw(Viewport.ctx);

            // this.framestamps.push(currentms);
            // if (this.framestamps.length >= 120) {
            //     this.framestamps.shift();
            // }
            // this.fps = 1000 / ((this.framestamps[this.framestamps.length - 1] - this.framestamps[0]) / this.framestamps.length);
        }
        window.requestAnimationFrame((xyz) => this.onFrame(xyz));
    }

    update() {
        // Gather user input
        Input.update();

        // Handle special keys that are screen-independent
        if (Input.pressed[Input.Action.MUSIC_TOGGLE]) {
            Audio.musicEnabled = !Audio.musicEnabled;
        }
        if (Input.pressed[Input.Action.SFX_TOGGLE]) {
            Audio.sfxEnabled = !Audio.sfxEnabled;
        }

        // Hand off control to the current "screen" (for example, game screen or menu)
        if (this.scenes.length === 0) {
            this.scenes.push(new GameScene());
        }
        this.scene = this.scenes[this.scenes.length - 1];
        this.scene.update();

        // Do per-frame audio updates
        Audio.update();
    }

    draw() {
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(1, 0, 0, 1, 0, 0);
        Viewport.ctx.scale(Viewport.scale, Viewport.scale);

        for (let i = 0; i < this.scenes.length; i++) {
            this.scenes[i].draw();
        }

        Text.drawText(Viewport.ctx, String(this.fps), 15, 15, 1, Text.white);

        Viewport.ctx.fillStyle = 'black';
        Viewport.ctx.fillRect(50, 50, 10, 10);
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        Audio.pause();
    }

    unpause() {
        if (!this.paused) return;
        this.paused = false;
        Audio.unpause();
    }

    restartLevel() {
        this.scenes.pop();
    }

    speedrunScore() {
        let score = 100000;

        for (let i = 0; i < this.scores.length; i++) {
            score -= this.scores[i].time;
            score -= this.scores[i].enemiesAlive * 5 * 60;
        }

        let scoreText = String(score);
        if (scoreText.length > 3) {

            scoreText = scoreText.slice(0, scoreText.length - 3) + ',' + scoreText.slice(scoreText.length - 3);
        }

        return scoreText;
    }
}

export const game = new Game();
