'use strict';

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeDirt = function makeDirt(position, size) {
  return makeEntity('DIRT', size || 1, size || 1, position);
};

module.exports = { makeDirt: makeDirt };