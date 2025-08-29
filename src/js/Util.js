'use strict';

import { R90, R270, R360, TILE_SIZE } from './Constants';
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

export function vector2angle(v) {
    let angle = Math.atan2(v.y, v.x);
    if (angle < 0) angle += R360;
    return angle;
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

export function closestAngleDifference(a, b) {
    if (a > b) [a, b] = [b, a];
    return Math.min(b - a, R360 + a - b);
}

export function intermediateAngle(a, b, m) {
    if (b > R270 && a <= R90) a += R360;
    if (a > R270 && b <= R90) b += R360;
    let angle = (b - a) * m + a;
    return (angle + R360) % R360;
}

export function angleBetween(angle, min, max) {
    if (min > max) [min, max] = [max, min];
    while (angle >= max + R360) angle -= R360;
    while (angle <= min - R360) angle += R360;
    return angle >= min && angle < max;
}

export function arcOverlap(angleA1, angleA2, angleB1, angleB2) {
    if (angleA1 > angleA2) [angleA1, angleA2] = [angleA2, angleA1];
    if (angleB1 > angleB2) [angleB1, angleB2] = [angleB2, angleB1];

    while (angleB2 >= angleA2 + R360) {
        angleB2 -= R360;
        angleB1 -= R360;
    }
    while (angleB1 <= angleA1 - R360) {
        angleB1 += R360;
        angleB2 += R360;
    }

    const result = [Math.max(angleA1, angleB1), Math.min(angleA2, angleB2)];
    return result[0] > result[1] ? undefined : result;
}

export function xy2qr(pos) {
    return { q: (pos.x / TILE_SIZE) | 0, r: (pos.y / TILE_SIZE) | 0 };
}

export function qr2xy(pos) {
    return { x: pos.q * TILE_SIZE, y: pos.r * TILE_SIZE };
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

export function centerxy(pos) {
    return {
        x: pos.x + TILE_SIZE / 2,
        y: pos.y + TILE_SIZE / 2
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

export function roomCenter(room) {
    return {
        x: (room.q + room.w / 2) * TILE_SIZE,
        y: (room.r + room.h / 2) * TILE_SIZE
    };
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
