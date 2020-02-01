'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeLocation = function makeLocation(name, width, height, position) {
  return _extends({}, makeEntity('LOCATION', width, height, position), {
    name: name,
    incomingEdges: [],
    outgoingEdges: [],
    visible: true
  });
};

module.exports = { makeLocation: makeLocation };