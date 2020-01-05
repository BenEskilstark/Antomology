// @flow

const {config} = require('../config');
const {subtract, multiply, add, floor} = require('../utils/vectors');

import type {Vector} from '../types';

// TODO this won't support pan/zoom without additional knowledge of camera position
const canvasToGrid = (canvasPos: Vector): Vector => {
  const scaleVec = {
    x: config.width / config.canvasWidth,
    y: -1 * config.height / config.canvasHeight,
  };
  return floor(add({x: 0, y: config.height}, multiply(canvasPos, scaleVec)));
};

const gridToCanvas = (gridPos: Vector): Vector => {
  const scaleVec = {
    x: config.canvasWidth / config.width,
    y: -1 * config.canvasHeight / config.height,
  };
  return multiply(gridPos, scaleVec);
};

module.exports = {
  canvasToGrid,
  gridToCanvas,
};
