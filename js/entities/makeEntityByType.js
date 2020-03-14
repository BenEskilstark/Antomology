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
const {makeStone, makeStuckStone} = require('../entities/stone');
const {makeGrass} = require('../entities/grass');
const {makeTarget} = require('../entities/target');
const {
  makeBeetle, makeAphid, makeDragonFly, makeWorm, makeCentipede,
} = require('../entities/bugs');
const {add} = require('../utils/vectors');

const {config} = require('../config');

import type {State, EntityType, Vector} from '../types';

/**
 * Create a default entity of the given type at the given position.
 * Meant to be used in level editor and so works only for "organic"
 * entity types (e.g. not locations or pheromones)
 */
const makeEntityByType = (
  game: GameState,
  editorState: {antSubType: string, backgroundType: string},
  entityType: EntityType, gridPos: Vector,
): Entity => {
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
    case 'WORM': {
      const segments = [];
      let s = {...gridPos};
      for (let i = 0; i < 12; i++) {
        let x = 0;
        let y = 0;
        const rand = Math.random();
        if (rand < 0.5) {
          x = 1;
        } else {
          y = -1;
        }
        const nextSeg = add(s, {x, y});
        segments.push(nextSeg);
        s = nextSeg;
      }
      return makeWorm(gridPos, segments);
    }
    case 'CENTIPEDE': {
      const segments = [];
      let s = {...gridPos};
      for (let i = 0; i < 8; i++) {
        let x = 0;
        let y = 0;
        const rand = Math.random();
        if (rand < 0.5) {
          x = 1;
        } else {
          y = -1;
        }
        const nextSeg = add(s, {x, y});
        segments.push(nextSeg);
        s = nextSeg;
      }
      return makeCentipede(gridPos, segments);
    }
    default:
      console.error('no entity of type', entityType);
  }
};

module.exports = {makeEntityByType};
