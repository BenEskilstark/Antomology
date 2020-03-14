'use strict';

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
    makeDragonFly = _require14.makeDragonFly;

var _require15 = require('../config'),
    config = _require15.config;

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
    default:
      console.error('no entity of type', entityType);
  }
};

module.exports = { makeEntityByType: makeEntityByType };