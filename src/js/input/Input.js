// Input

import { KeyboardAdapter } from './KeyboardAdapter';

export const Input = {
    // Game Inputs

    // Extreme hack
    //
    Action: [
        'ArrowUp',
        'ArrowLeft',
        'ArrowDown',
        'ArrowRight',
        'Escape',
        'Space',
        'KeyV',
        'KeyH',
        'KeyA',
        'KeyS',
        'KeyB',
        'KeyT',
        'KeyM'
    ],

    init() {
        // A vector representing the direction the user is pressing/facing,
        // separate from pressing and releasing inputs. Treating "direction"
        // separately makes it easier to handle gamepad sticks.
        //this.direction = { x: 0, y: 0, m: 0 };

        // "Pressed" means an input was pressed THIS FRAME.
        this.pressed = {};

        // "Released" means an input was released THIS FRAME.
        this.released = {};

        // "Held" means an input is held down. The input was "Pressed" either
        // this frame or in a past frame, and has not been "Released" yet.
        this.held = {};

        KeyboardAdapter.init();
    },

    update() {
        // We could have some kind of "input adapter toggle", but it's easier to just treat all inputs
        // as valid -- if you're pressing the "attack" button on either gamepad or keyboard, then you're
        // attacking. For directional input, we instead check whether there's movement on the thumbstick,
        // and we use it if there is -- otherwise we try to extract movement from the keyboard instead.

        //KeyboardAdapter.update();

        for (let action of Input.Action) {
            let held = KeyboardAdapter.held[action];
            this.pressed[action] = !this.held[action] && held;
            this.released[action] = this.held[action] && !held;

            this.held[action] = held;
        }

        //this.pointer = pointerAdapter.pointer;
        //this.direction = KeyboardAdapter.direction;
        //this.direction = this.gamepad.direction.m > 0 ? this.gamepad.direction : this.keyboard.direction;
    }
};
