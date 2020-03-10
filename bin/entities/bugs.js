'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../config'),
    config = _require.config;

var _require2 = require('./entity'),
    makeEntity = _require2.makeEntity;

var makeAphid = function makeAphid(position) {
  return _extends({}, makeEntity('APHID', 1, 1, position), {
    alive: true
  });
};

var makeBeetle = function makeBeetle(position, width, height) {
  return _extends({}, makeEntity('BEETLE', width, height != null ? height : width, position), {
    alive: true
  });
};

var makeLadyBug = function makeLadyBug(position, width, height) {
  return _extends({}, makeEntity('LADYBUG', width, height != null ? height : width, position), {
    alive: true
  });
};

var makeSpider = function makeSpider(position, width, height) {
  return _extends({}, makeEntity('SPIDER', width, height != null ? height : width, position), {
    alive: true
  });
};

var makeDragonFly = function makeDragonFly(position, width) {
  return _extends({}, makeEntity('DRAGONFLY', width, 1, position), {
    alive: true
  });
};

var makeWorm = function makeWorm(position, segments) {
  return _extends({}, makeEntity('WORM', 1, 1, position), {
    alive: true,
    segmented: true,
    segments: segments.map(function (position) {
      return { position: position };
    })
  });
};

var makeCentipede = function makeCentipede(position, segments) {
  return _extends({}, makeEntity('CENTIPEDE', 1, 1, position), {
    alive: true,
    segmented: true,
    segments: segments.map(function (position) {
      return { position: position };
    })
  });
};

module.exports = {
  makeAphid: makeAphid,
  makeBeetle: makeBeetle,
  makeLadyBug: makeLadyBug,
  makeSpider: makeSpider,
  makeDragonFly: makeDragonFly,
  makeCentipede: makeCentipede,
  makeWorm: makeWorm
};