// Audio

//import { ZZFX } from './lib/zzfx';
import { CPlayer } from './lib/player-small';
import { VillageHusk } from './songs/VillageHusk';
import { SoundEffects } from './sfx/SoundEffects';

export const Audio = {
    init() {
        Audio.contextCreated = false;
        Audio.readyToPlay = false;
        Audio.musicEnabled = true;
        Audio.sfxEnabled = true;
        Audio.musicVolume = 0;
        Audio.sfxVolume = 0;

        Audio.sounds = {};
    },

    initContext() {
        //console.log('initContext()');
        if (Audio.contextCreated) return;

        // In Safari, ensure our target AudioContext is created inside a
        // click or tap event (this ensures we don't interact with it until
        // after user input).
        //
        // Chrome and Firefox are more relaxed, but this approach works for all 3.
        //ZZFX.x = Audio.ctx = new AudioContext();
        Audio.ctx = new AudioContext();
        Audio.gain_ = Audio.ctx.createGain();
        Audio.gain_.connect(Audio.ctx.destination);
        //ZZFX.destination = Audio.gain_;
        //console.log(Audio.ctx);

        Audio.contextCreated = true;
    },

    initTracks() {
        // In this game, we ensure the screen that calls this function happens after the
        // user has interacted at least once (and that interaction called initContext above),
        // so we know it's safe to interact with the audio context.
        if (!Audio.musicPlaying) {
            // Sfx

            // Code golfing for bytes
            let soundEffects = SoundEffects.map(sfx => ({
                songData: [sfx],
                rowLen: 3120,   // In sample lengths
                patternLen: 32,  // Rows per pattern
                endPattern: 0,  // End pattern
                numChannels: 1  // Number of channels
            }));

            Audio.click = this.loadSoundBox(soundEffects[0]);
            Audio.bell = this.loadSoundBox(soundEffects[1]);
            Audio.wink = this.loadSoundBox(soundEffects[2]);
            Audio.explosion = this.loadSoundBox(soundEffects[3]);
            Audio.wind = this.loadSoundBox(soundEffects[4]);
            Audio.fail = this.loadSoundBox(soundEffects[5]);
            Audio.music = this.loadSoundBox(VillageHusk);

            Audio.readyToPlay = true;

            // Start music

            Audio.play(Audio.music, Audio.ctx.currentTime + 0.1, true);

            Audio.musicPlaying = true;
        }
    },

    update() {
        if (!Audio.readyToPlay) return;

        this.sfxVolume = this.sfxEnabled ? 0.3 : 0;
        this.musicVolume = this.musicEnabled ? 1 : 0;

        //ZZFX.volume = this.sfxVolume;

        if (this.sfxEnabled) {
            //ZZFX.volume = 0.3;
        } else {
            //ZZFX.volume = 0;
        }
    },

    play(sound, startTime, loop) {
        if (!Audio.readyToPlay) return;
        if (!sound) return;

        //ZZFX.play(...sound);
        //this.sources.explosion.start(Audio.ctx.currentTime);

        let source = Audio.ctx.createBufferSource();
        source.buffer = sound.buffer;
        source.loop = loop || false;
        source.connect(sound.gainNode);
        source.start(startTime || Audio.ctx.currentTime);
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
    },

    loadSoundBox(exportedSound) {
        let player = new CPlayer();
        player.init(exportedSound);

        for (;;) {
            if (player.generate() === 1) break;
        }

        let gainNode = Audio.ctx.createGain();
        gainNode.connect(Audio.gain_);

        let buffer = player.createAudioBuffer(Audio.ctx);

        // Return an object containing the original player, the audio node,
        // and the source buffer for playback later.
        return { player, gainNode, buffer };
    }
};
