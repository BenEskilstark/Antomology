'use strict';

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeStone = function makeStone(position, size) {
  return makeEntity('STONE', size || 1, size || 1, position);
};

module.exports = { makeStone: makeStone };