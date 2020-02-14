// @flow

const {makeAnt} = require('../entities/ant');
const {makeBackground} = require('../entities/background');
const {makeDirt} = require('../entities/dirt');
const {makeEgg} = require('../entities/egg');
const {makeEntity} = require('../entities/entity');
const {makeFood} = require('../entities/food');
const {makeLarva} = require('../entities/larva');
const {makeLocation} = require('../entities/location');
const {makeObelisk} = require('../entities/obelisk');
const {makePupa} = require('../entities/pupa');
const {makeStone} = require('../entities/stone');

const {config} = require('../config');

import type {EntityType, Vector} from '../types';

/**
 * Create a default entity of the given type at the given position.
 * Meant to be used in level editor and so works only for "organic"
 * entity types (e.g. not locations or pheromones)
 */
const makeEntityByType = (
  entityType: EntityType, gridPos: Vector,
): Entity => {
  switch (entityType) {
    case 'ANT':
      return makeAnt(gridPos, 'QUEEN'); // TODO
    case 'BACKGROUND':
      return makeBackground(gridPos, 'SKY'); // TODO
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

module.exports = {makeEntityByType};
