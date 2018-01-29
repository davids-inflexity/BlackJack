// shuffle array function
export function shuffleArray(array) {
    let i = array.length - 1;
    for (i; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// return random number
export function randomNumber(min, max) {
    return Math.floor(max - Math.random()*(max - min));
}

// select sound based on voice name from array of sound objects
export function select_sound(array, name) {
    let i = 0;

    while (array[i].name !== name) {
        i++;
    }

    return array[i];
}

// keyCode CONST
export const NUMPAD = {
    KEY_ONE: 97,
    KEY_TWO: 98,
    KEY_THREE: 99,
};

export const KEYBOARD = {
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    KEY_ONE: 49,
    KEY_TWO: 50,
    KEY_THREE: 51
};

// allowed key codes
export const PLAYABLE_KEYS = [

    KEYBOARD.ALT,
    KEYBOARD.SHIFT,
    KEYBOARD.CTRL
];

export const KEYS_TO_START = [
    NUMPAD.KEY_ONE,
    NUMPAD.KEY_TWO,
    NUMPAD.KEY_THREE,
    KEYBOARD.KEY_ONE,
    KEYBOARD.KEY_TWO,
    KEYBOARD.KEY_THREE
];

export const TIME = {
    DEFAULT: 60,
    ONE_PACKAGE: 15,
    TWO_PACKAGES: 30,
    THREE_PACKAGES: 45
};
