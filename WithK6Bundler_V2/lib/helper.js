"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomMinMax = void 0;
function randomMinMax(min, max) {
    return Math.random() * (max - min) + min;
}
exports.randomMinMax = randomMinMax;
