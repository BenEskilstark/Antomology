'use strict';

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/vectors'),
    subtract = _require2.subtract,
    multiply = _require2.multiply,
    add = _require2.add,
    floor = _require2.floor;

// TODO this won't support pan/zoom without additional knowledge of camera position
var canvasToGrid = function canvasToGrid(canvasPos) {
  var scaleVec = {
    x: config.width / config.canvasWidth,
    y: -1 * config.height / config.canvasHeight
  };
  return floor(add({ x: 0, y: config.height }, multiply(canvasPos, scaleVec)));
};

var gridToCanvas = function gridToCanvas(gridPos) {
  var scaleVec = {
    x: config.canvasWidth / config.width,
    y: -1 * config.canvasHeight / config.height
  };
  return multiply(gridPos, scaleVec);
};

module.exports = {
  canvasToGrid: canvasToGrid,
  gridToCanvas: gridToCanvas
};