// @flow

const {config} = require('../config');
const {subtract, multiply, add, floor, round} = require('../utils/vectors');

import type {Vector, GameState} from '../types';

const canvasToGrid = (game: GameState, canvasPos: Vector, noFloor: boolean): Vector => {
  const scaleVec = {
    x: config.width / config.canvasWidth,
    y: -1 * config.height / config.canvasHeight,
  };

  if (noFloor) {
    const gridCoord = add({x: 0, y: config.height}, multiply(canvasPos, scaleVec));
    return add(gridCoord, game.viewPos);
  } else {
    const gridCoord = floor(add({x: 0, y: config.height}, multiply(canvasPos, scaleVec)));
    return floor(add(gridCoord, game.viewPos));
  }
};

const gridToCanvas = (game: GameState, gridPos: Vector): Vector => {
  console.log("test gridToCanvas!!!");
  const scaleVec = {
    x: config.canvasWidth / config.width,
    y: -1 * config.canvasHeight / config.height,
  };
  // TODO this might not work...
  const screenCoord = subtract(gridPos, game.viewPos);
  console.log(screenCoord, multiply(screenCoord, scaleVec));
  return multiply(screenCoord, scaleVec);
};

module.exports = {
  canvasToGrid,
  gridToCanvas,
};
