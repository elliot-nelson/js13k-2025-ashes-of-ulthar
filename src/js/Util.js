'use strict';

import { game } from './Game';
import { Viewport } from './Viewport';
import { Camera } from './Camera';

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

export function dot(a, b) {
    [a, b] = [vector2point(a), vector2point(b)];
    return a.x * b.x + a.y * b.y;
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

export function xy2uv(pos) {
    return {
        u: pos.x + Viewport.center.u - Camera.pos.x,
        v: pos.y + Viewport.center.v - Camera.pos.y
    };
}

export function uv2xy(pos) {
    return {
        x: pos.u - Viewport.center.u + Camera.pos.x,
        y: pos.v - Viewport.center.v + Camera.pos.y
    };
}

export function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}

export function manhattan(qr1, qr2) {
    return Math.abs(qr1.q - qr2.q) + Math.abs(qr1.r - qr2.r);
}

export function manhattanXY(xy1, xy2) {
    return Math.abs(xy1.x - xy2.x) + Math.abs(xy1.y - xy2.y);
}

// The parameters to this function are (Q, Q) or (R, R) - i.e. horizontal or
// vertical coordinates in tile space.
export function calculateRayIntersectionAndStep(startPos, endPos) {
    let _next,
        _step,
        diff = endPos - startPos;

    if (diff === 0) {
        _step = NaN;
        _next = +Infinity;
    } else if (diff > 0) {
        _step = 1 / diff;
        _next = (1 - (startPos - (startPos | 0))) * _step;
    } else {
        _step = -1 / diff;
        _next = (startPos - (startPos | 0)) * _step;
    }

    return { _next, _step };
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

export function entityBB(entity) {
    return entity.bb.map(p => ({ x: p.x + entity.pos.x, y: p.y + entity.pos.y }));
}

export function entityHBB(entity) {
    if (!entity.hbb) {
        return entityBB(entity);
    }
    return entity.hbb.map(p => ({ x: p.x + entity.pos.x, y: p.y + entity.pos.y }));
}

export function entityABB(entity) {
    return entity.abb.map(p => ({ x: p.x + entity.pos.x, y: p.y + entity.pos.y }));
}

export function isBoundingBoxOverlap(left, right) {
    return left[1].x >= right[0].x && right[1].x >= left[0].x &&
           left[1].y >= right[0].y && right[1].y >= left[0].y;
}
