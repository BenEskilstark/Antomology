'use strict';

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeGrass = function makeGrass(position) {
  return makeEntity('GRASS', 1, 1, position);
};

module.exports = { makeGrass: makeGrass };