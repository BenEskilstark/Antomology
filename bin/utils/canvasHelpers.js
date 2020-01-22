'use strict';

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/vectors'),
    subtract = _require2.subtract,
    multiply = _require2.multiply,
    add = _require2.add,
    floor = _require2.floor,
    round = _require2.round;

var canvasToGrid = function canvasToGrid(game, canvasPos, noFloor) {
  var scaleVec = {
    x: config.width / config.canvasWidth,
    y: -1 * config.height / config.canvasHeight
  };

  if (noFloor) {
    var gridCoord = add({ x: 0, y: config.height }, multiply(canvasPos, scaleVec));
    return add(gridCoord, game.viewPos);
  } else {
    var _gridCoord = floor(add({ x: 0, y: config.height }, multiply(canvasPos, scaleVec)));
    return floor(add(_gridCoord, game.viewPos));
  }
};

var gridToCanvas = function gridToCanvas(game, gridPos) {
  console.log("test gridToCanvas!!!");
  var scaleVec = {
    x: config.canvasWidth / config.width,
    y: -1 * config.canvasHeight / config.height
  };
  // TODO this might not work...
  var screenCoord = subtract(gridPos, game.viewPos);
  console.log(screenCoord, multiply(screenCoord, scaleVec));
  return multiply(screenCoord, scaleVec);
};

module.exports = {
  canvasToGrid: canvasToGrid,
  gridToCanvas: gridToCanvas
};