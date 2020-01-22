'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../config'),
    config = _require2.config;

var makePheromone = function makePheromone(position, theta, category, quantity) {
  var amount = quantity != null ? quantity : config.pheromoneStartingQuantity;
  return _extends({}, makeEntity('PHEROMONE', 1, 1, position), {
    theta: theta,
    category: category,
    quantity: amount,
    visible: true
  });
};

module.exports = { makePheromone: makePheromone };