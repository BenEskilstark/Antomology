'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('./entity'),
    makeEntity = _require.makeEntity;

var makeBackground = function makeBackground(position, subType, size) {
  return _extends({}, makeEntity('BACKGROUND', size || 1, size || 1, position), {
    subType: subType
  });
};

module.exports = { makeBackground: makeBackground };