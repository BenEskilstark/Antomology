'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../entities/ant'),
    makeAnt = _require.makeAnt;

var _require2 = require('../entities/background'),
    makeBackground = _require2.makeBackground;

var _require3 = require('../entities/dirt'),
    makeDirt = _require3.makeDirt;

var _require4 = require('../entities/egg'),
    makeEgg = _require4.makeEgg;

var _require5 = require('../entities/entity'),
    makeEntity = _require5.makeEntity;

var _require6 = require('../entities/food'),
    makeFood = _require6.makeFood;

var _require7 = require('../entities/larva'),
    makeLarva = _require7.makeLarva;

var _require8 = require('../entities/location'),
    makeLocation = _require8.makeLocation;

var _require9 = require('../entities/obelisk'),
    makeObelisk = _require9.makeObelisk;

var _require10 = require('../entities/pupa'),
    makePupa = _require10.makePupa;

var _require11 = require('../entities/stone'),
    makeStone = _require11.makeStone,
    makeStuckStone = _require11.makeStuckStone;

var _require12 = require('../entities/grass'),
    makeGrass = _require12.makeGrass;

var _require13 = require('../entities/target'),
    makeTarget = _require13.makeTarget;

var _require14 = require('../entities/bugs'),
    makeBeetle = _require14.makeBeetle,
    makeAphid = _require14.makeAphid,
    makeDragonFly = _require14.makeDragonFly,
    makeWorm = _require14.makeWorm,
    makeCentipede = _require14.makeCentipede;

var _require15 = require('../utils/vectors'),
    add = _require15.add;

var _require16 = require('../config'),
    config = _require16.config;

/**
 * Create a default entity of the given type at the given position.
 * Meant to be used in level editor and so works only for "organic"
 * entity types (e.g. not locations or pheromones)
 */
var makeEntityByType = function makeEntityByType(game, editorState, entityType, gridPos) {
  if (gridPos == null) {
    console.error("CALLSITE!");
  }
  switch (entityType) {
    case 'ANT':
      return makeAnt(gridPos, editorState.antSubType);
    case 'BACKGROUND':
      return makeBackground(gridPos, editorState.backgroundType);
    case 'DIRT':
      return makeDirt(gridPos);
    case 'EGG':
      return makeEgg(gridPos, 'WORKER');
    case 'FOOD':
      return makeFood(gridPos, config.foodSpawnCalories, 'CRUMB');
    case 'LARVA':
      return makeLarva(gridPos, 'WORKER');
    case 'OBELISK':
      return makeObelisk(gridPos, 4, 8); // TODO
    case 'PUPA':
      return makePupa(gridPos, 'WORKER');
    case 'STONE':
      return makeStone(gridPos);
    case 'STUCK_STONE':
      return makeStuckStone(gridPos);
    case 'GRASS':
      return makeGrass(gridPos);
    case 'TARGET':
      return makeTarget(gridPos);
    case 'BEETLE':
      return makeBeetle(gridPos, 3, 2);
    case 'DRAGONFLY':
      return makeDragonFly(gridPos, 6);
    case 'APHID':
      return makeAphid(gridPos);
    // TODO
    case 'WORM':
      {
        var segments = [];
        var s = _extends({}, gridPos);
        for (var i = 0; i < 12; i++) {
          var x = 0;
          var y = 0;
          var rand = Math.random();
          if (rand < 0.5) {
            x = 1;
          } else {
            y = -1;
          }
          var nextSeg = add(s, { x: x, y: y });
          segments.push(nextSeg);
          s = nextSeg;
        }
        return makeWorm(gridPos, segments);
      }
    case 'CENTIPEDE':
      {
        var _segments = [];
        var _s = _extends({}, gridPos);
        for (var _i = 0; _i < 8; _i++) {
          var _x = 0;
          var _y = 0;
          var _rand = Math.random();
          if (_rand < 0.5) {
            _x = 1;
          } else {
            _y = -1;
          }
          var _nextSeg = add(_s, { x: _x, y: _y });
          _segments.push(_nextSeg);
          _s = _nextSeg;
        }
        return makeCentipede(gridPos, _segments);
      }
    default:
      console.error('no entity of type', entityType);
  }
};

module.exports = { makeEntityByType: makeEntityByType };