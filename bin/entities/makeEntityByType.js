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
    makeStone = _require11.makeStone;

var _require12 = require('../config'),
    config = _require12.config;

/**
 * Create a default entity of the given type at the given position.
 * Meant to be used in level editor and so works only for "organic"
 * entity types (e.g. not locations or pheromones)
 */
var makeEntityByType = function makeEntityByType(state, entityType, gridPos) {
  if (state.editor == null) {
    console.error('no editor state', state, entityType);
  }
  switch (entityType) {
    case 'ANT':
      return makeAnt(gridPos, state.editor.antSubType);
    case 'BACKGROUND':
      return makeBackground(gridPos, state.editor.backgroundType);
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
    default:
      console.error('no entity of type', entityType);
  }
};

module.exports = { makeEntityByType: makeEntityByType };