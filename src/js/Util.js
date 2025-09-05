'use strict';

export function normalizeVector(p) {
    let m = Math.sqrt(p.x * p.x + p.y * p.y);
    return m === 0 ? { x: 0, y: 0, m: 0 } : { x: p.x / m, y: p.y / m, m };
}

export function vectorBetween(p1, p2) {
    return normalizeVector({ x: p2.x - p1.x, y: p2.y - p1.y });
}

export function angle2vector(r, m) {
    return { x: Math.cos(r), y: Math.sin(r), m: m || 1 };
}

export function vector2point(v) {
    return { x: v.x * (v.m || 1), y: v.y * (v.m || 1) };
}

// Takes a series of vectors and denormalizes them and adds them together, usually resulting
// in a point in space. Wrap in normalizeVector to get a normalized vector again, if desired.
export function vectorAdd(...vectors) {
    let v = { x: 0, y: 0, m: 1 };
    for (let vector of vectors) {
        v.x += vector.x * (vector.m || 1);
        v.y += vector.y * (vector.m || 1);
    }
    return v;
}

export function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}

export function array2d(width, height, fn) {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, fn)
    );
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

export function partialText(text, t, d) {
    let length = clamp(Math.ceil(t / d * text.length), 0, text.length),
        substr = text.slice(0, length),
        idx = text.indexOf(' ', length - 1);
    if (idx < 0) idx = text.length;
    if (idx - length > 0) substr += '#'.repeat(idx - length);

    return substr;
}
