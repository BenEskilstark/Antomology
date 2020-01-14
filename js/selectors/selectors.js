// @flow

const {invariant} = require('../utils/errors');
const {subtract, distance, add} = require('../utils/vectors');
const {config} = require('../config');
const {lookupInGrid} = require('../utils/stateHelpers');

import type {GameID, State, Game, Entity} from '../types';

/////////////////////////////////////////////////////////////////
// Collisions
/////////////////////////////////////////////////////////////////

// TODO may not need all the size stuff if we just use the grid
const collides = (entityA: Entity, entityB: Entity): boolean => {
  if (entityA.position == null || entityB.position == null) {
    return false;
  }
  const dist = subtract(entityA.position, entityB.position);
  let xOverlap = false;
  let yOverlap = false;
  if (dist.x === 0) {
    xOverlap = true;
  } else if (dist.x < 0) {
    if (
      entityB.position.x + entityB.width > entityA.position.x &&
      entityB.position.x + entityB.width <= entityA.position.x + entityA.width
    ) {
      xOverlap = true;
    }
  } else {
    if (
      entityA.position.x + entityA.width > entityB.position.x &&
      entityA.position.x + entityA.width <= entityB.position.x + entityB.width
    ) {
      xOverlap = true;
    }
  }

  if (dist.y === 0) {
    yOverlap = true;
  } else if (dist.y < 0) {
    if (
      entityB.position.y + entityB.height > entityA.position.y &&
      entityB.position.y + entityB.height <= entityA.position.y + entityA.height
    ) {
      yOverlap = true;
    }
  } else {
    if (
      entityA.position.y + entityA.height > entityB.position.y &&
      entityA.position.y + entityA.height <= entityB.position.y + entityB.height
    ) {
      yOverlap = true;
    }
  }

  return xOverlap && yOverlap;
};

/**
 * marquee position should be bottom left corner
 * exclusive of final width and height
 */
const entitiesInMarquee = (
  game: GameState,
  marquee: {position: {x: number, y: number}, width: number, height: number},
): Array<Entity> => {
  const {position, width, height} = marquee;
  const entities = [];
  for (let x = position.x; x < position.x + width; x++) {
    for (let y = position.y; y < position.y + height; y++) {
      entities.push(...lookupInGrid(game.grid, {x, y}).map(id => game.entities[id]));
    }
  }

  return entities;
}

/////////////////////////////////////////////////////////////////
// Fast functions
/////////////////////////////////////////////////////////////////

const fastCollidesWith = (game: GameState, entity: Entity): Array<Entity> => {
  if (entity.position == null) return [];
  const {x, y} = entity.position;
  return lookupInGrid(game.grid, entity.position)
    .filter(id => id != entity.id)
    .map(id => game.entities[id]);
};

/////////////////////////////////////////////////////////////////
// Neighbors
/////////////////////////////////////////////////////////////////

const fastGetEmptyNeighborPositions = (
  game: GameState, entity: Entity, blockingEntityTypes: Array<EntityType>,
): Array<Vector> => {
  if (entity.position == null) return [];
  const emptyPositions = [];
  const neighborPositions =
    [{x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}];
  for (const neighborVec of neighborPositions) {
    const neighbors = lookupInGrid(game.grid, add(entity.position, neighborVec))
      .filter(id => blockingEntityTypes.includes(game.entities[id].type));
    if (neighbors.length == 0) {
      emptyPositions.push(add(entity.position, neighborVec));
    }
  }
  return emptyPositions;
}

const fastGetNeighbors = (game: GameState, entity: Entity): Array<Entity> => {
  if (entity.position == null) return [];
  const neighborEntities = [];
  const neighborPositions =
    [{x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}];
  for (const neighborVec of neighborPositions) {
    neighborEntities.push(
      ...lookupInGrid(game.grid, add(entity.position, neighborVec))
    );
  }
  return neighborEntities.map(id => game.entities[id]);
}

const insideWorld = (pos: Vector): boolean => {
  return pos.x >= 0 && pos.x < config.width && pos.y >= 0 && pos.y < config.height;
};

/////////////////////////////////////////////////////////////////
// Entities by type
/////////////////////////////////////////////////////////////////

const getSelectedAntIDs = (game: GameState): Array<EntityID> => {
  return game.selectedEntities.filter(id => game.ANT.includes(id));
};

const getEntitiesByType = (
  game: GameState,
  entityTypes: Array<string>,
): Array<Entity> => {
  let entities = [];
  for (const entityType of entityTypes) {
    entities = entities.concat(game[entityType].map(id => game.entities[id]));
  }
  return entities;
}

const filterEntitiesByType = (
  entities: Array<Entity>,
  entityTypes: Array<string>,
): Array<Entity> => {
  return entities.filter(e => entityTypes.includes(e.type));
}

const selectors = {
  getEntitiesByType,
  filterEntitiesByType,
  fastCollidesWith,
  fastGetEmptyNeighborPositions,
  fastGetNeighbors,
  insideWorld,
  collides,
  getSelectedAntIDs,
  entitiesInMarquee,
};
window.selectors = selectors; // for testing

module.exports = selectors;
