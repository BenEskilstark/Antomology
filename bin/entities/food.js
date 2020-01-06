'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeFood = function makeFood(position, calories, name, size) {
  return _extends({}, makeEntity('FOOD', size || 1, size || 1, position), {
    name: name,
    calories: calories
  });
};

module.exports = { makeFood: makeFood };