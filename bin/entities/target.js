'use strict';

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeTarget = function makeTarget(position) {
  return makeEntity('TARGET', 3, 3, position);
};

module.exports = { makeTarget: makeTarget };