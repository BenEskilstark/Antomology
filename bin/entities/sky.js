'use strict';

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeSky = function makeSky(position, size) {
  return makeEntity('SKY', size || 1, size || 1, position);
};

module.exports = { makeSky: makeSky };