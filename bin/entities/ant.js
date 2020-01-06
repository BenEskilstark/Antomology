'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../config'),
    config = _require2.config;

var makeAnt = function makeAnt(position, subType) {
  return _extends({}, makeEntity('ANT', 1, 1, position), {
    subType: subType,
    holding: null,
    calories: config.antStartingCalories,
    caste: null,
    task: null,
    taskIndex: 0,
    blocked: false,
    blockedBy: null,
    alive: true
  });
};

module.exports = { makeAnt: makeAnt };