'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeObelisk = function makeObelisk(position, width, height) {
  return _extends({}, makeEntity('OBELISK', width, height, position), {
    theta: 0,
    toLift: 6,
    visible: true
  });
};

module.exports = { makeObelisk: makeObelisk };