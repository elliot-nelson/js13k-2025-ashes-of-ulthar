// Audio

import { ZZFX } from './lib/zzfx';
import { CPlayer } from './lib/player-small';
import { song } from './songs/VillageHusk';

export const TRACK_COMBAT = 5;
export const TRACK_WAVE = 6;

export const Audio = {
    init() {
        Audio.contextCreated = false;
        Audio.readyToPlay = false;
        Audio.musicEnabled = true;
        Audio.sfxEnabled = true;
        Audio.musicVolume = 0;
        Audio.sfxVolume = 0;

        Audio.wink = [1.8,,453,.07,.01,.01,4,.3,,,-21,.14,.04,,,,.27,.58,.18,.47,-900]; // Random 276
        Audio.sacrifice = [.5,,10,,.19,0,2,.6,-86,8,,,,.4,31,,,.7,.29,,-739]; // Random 301
        Audio.tick = [1.2,,338,,.02,.004,2,.7,-59,,,,,.2,,.3,,.86,,,-702]; // Random 359
        Audio.start = [,,691,.02,.12,.34,,.8,-5,,251,.08,,,22,,,.59,.14]; // Powerup 472
    },

    initContext() {
        console.log('initContext()');
        if (Audio.contextCreated) return;

        // In Safari, ensure our target AudioContext is created inside a
        // click or tap event (this ensures we don't interact with it until
        // after user input).
        //
        // Chrome and Firefox are more relaxed, but this approach works for all 3.
        ZZFX.x = Audio.ctx = new AudioContext();
        Audio.gain_ = Audio.ctx.createGain();
        Audio.gain_.connect(Audio.ctx.destination);
        ZZFX.destination = Audio.gain_;
        console.log(Audio.ctx);

        Audio.contextCreated = true;
    },

    initTracks() {
        // In this game, we ensure the screen that calls this function happens after the
        // user has interacted at least once (and that interaction called initContext above),
        // so we know it's safe to interact with the audio context.
        if (!Audio.musicPlaying) {
            console.log('starting music');
            this.player = new CPlayer();
            this.player.init(song);
            console.log('music started');

            for (;;) {
                if (this.player.generate() === 1) break;
                console.log('generating');
            }

            this.musicGainNode = Audio.ctx.createGain();
            this.musicGainNode.connect(Audio.gain_);
            this.songSource = Audio.ctx.createBufferSource();
            this.songSource.buffer = this.player.createAudioBuffer(Audio.ctx);
            this.songSource.loop = true;
            this.songSource.connect(this.musicGainNode);

            this.musicStartTime = Audio.ctx.currentTime + 0.1;
            this.songSource.start(this.musicStartTime);

            Audio.musicPlaying = true;
        }

        Audio.readyToPlay = true;
    },

    update() {
        if (!Audio.readyToPlay) return;

        this.sfxVolume = this.sfxEnabled ? 0.3 : 0;
        this.musicVolume = this.musicEnabled ? 1 : 0;

        ZZFX.volume = this.sfxVolume;

        if (this.sfxEnabled) {
            ZZFX.volume = 0.3;
        } else {
            ZZFX.volume = 0;
        }
    },

    play(sound) {
        if (!Audio.readyToPlay) return;
        ZZFX.play(...sound);
    },

    // It's important we do pausing and unpausing as specific events and not in general update(),
    // because update() is triggered by the animation frame trigger which does not run if the
    // page is not visible. (So, if you want the music to fade in the background, for example,
    // that's not helpful if it won't work because you aren't looking at the page!)

    pause() {
        if (Audio.readyToPlay) {
            Audio.gain_.gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 1);
        }
    },

    unpause() {
        if (Audio.readyToPlay) {
            Audio.gain_.gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 1);
        }
    }
};
