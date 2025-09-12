// Util

export function angle2vector(r, m) {
    return { x: Math.cos(r), y: Math.sin(r), m: m || 1 };
}

export function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}

export function rgba(r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`;
}

export function createCanvas(width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    return { canvas, ctx };
}
