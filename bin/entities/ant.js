'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../config'),
    config = _require2.config;

var _require3 = require('../state/tasks'),
    createIdleTask = _require3.createIdleTask,
    createRandomMoveTask = _require3.createRandomMoveTask;

var makeAnt = function makeAnt(position, subType) {
  return _extends({}, makeEntity('ANT', 1, 1, position), {
    subType: subType,
    holding: null,
    calories: config.antStartingCalories,
    caste: null,
    //task: createRandomMoveTask(),
    task: createIdleTask(),
    taskIndex: 0,
    taskStack: [{
      name: 'Idle',
      index: 0
    }],
    blocked: false,
    blockedBy: null,
    location: null,
    alive: true,
    visible: true
  });
};

module.exports = { makeAnt: makeAnt };