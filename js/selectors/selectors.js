// @flow

const {invariant} = require('../utils/errors');
const {subtract, distance, add} = require('../utils/vectors');
const {config} = require('../config');
const {lookupInGrid} = require('../utils/helpers');

import type {GameID, State, Game, Entity} from '../types';

/////////////////////////////////////////////////////////////////
// Collisions
/////////////////////////////////////////////////////////////////

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

const collidesWith = (
  entityA: Entity,
  entities: Array<Entity> | {[EntityID]: Entity},
): Array<Entity> => {
  const collisions = [];
  if (Array.isArray(entities)) {
    for (const entityB of entities) {
      if (entityA.id === entityB.id) {
        continue;
      }
      if (collides(entityA, entityB)) {
        collisions.push(entityB);
      }
    }
  } else {
    for (const entityID in entities) {
      const entityB = entities[entityID];
      if (entityA.id === entityB.id) {
        continue;
      }
      if (collides(entityA, entityB)) {
        collisions.push(entityB);
      }
    }
  }

  // don't collide with yourself ever
  return collisions.filter(e => e.id != entityA.id);
};

/////////////////////////////////////////////////////////////////
// Fast functions
/////////////////////////////////////////////////////////////////

const fastCollidesWith = (game: GameState, entity: Entity): Array<Entity> => {
  if (entity.position == null) return [];
  const {x, y} = entity.position;
  return lookupInGrid(game.grid, entity.position).filter(id => id != entity.id);
};

const fastGetEmptyNeighborPositions = (game: GameState, entity: Entity): Array<Vector> => {
  if (entity.position == null) return [];
  const emptyPositions = [];
  const neighborPositions =
    [{x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}];
  for (const neighborVec of neighborPositions) {
    if (lookupInGrid(game.grid, add(entity.position, neighborVec)).length === 0) {
      emptyPositions.push(add(entity.position, neighborVec));
    }
  }
  return emptyPositions;
}

/////////////////////////////////////////////////////////////////
// Neighbors
/////////////////////////////////////////////////////////////////

// get all entities in the radius of the given entity excluding itself
// TODO only supports entities of size = 1
const getNeighborhoodEntities = (
  entity: Entity, entities: Array<Entity>, radius: ?number,
): Array<Entity> => {
  const neighborEntities = [];
  const neighborPositions =
    [{x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}];
  for (const neighborVec of neighborPositions) {
    neighborEntities.push(...collidesWith(
      {...entity, position: add(entity.position, neighborVec)},
      entities,
    ));
  }
  return neighborEntities;
}

const getEmptyNeighborPositions = (
  entity: Entity, entities: Array<Entity>,
): Array<Vector> => {
  const emptyPositions = [];
  const neighborPositions =
    [{x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}];
  for (const neighborVec of neighborPositions) {
    const free = collidesWith(
      {...entity, position: add(entity.position, neighborVec)},
      entities,
    );
    if (free.length === 0) {
      emptyPositions.push(add(entity.position, neighborVec));
    }
  }
  return emptyPositions;
};

const insideWorld = (pos: Vector): boolean => {
  return pos.x >= 0 && pos.x < config.width && pos.y >= 0 && pos.y < config.height;
};

/////////////////////////////////////////////////////////////////
// Entities by type
/////////////////////////////////////////////////////////////////

const getSelectedAntIDs = (game: GameState): Array<EntityID> => {
  return game.selectedEntities.filter(id => game.ants.includes(id));
};

const getEntitiesByType = (
  game: GameState,
  entityTypes: Array<string>,
): Array<Entity> => {
  let entities = [];
  for (const entityType of entityTypes) {
    switch (entityType) {
      case 'ANT':
        entities = entities.concat(game.ants.map(id => game.entities[id]));
        break;
      case 'DIRT':
        entities = entities.concat(game.dirt.map(id => game.entities[id]));
        break;
      case 'LOCATION':
        entities = entities.concat(game.locations.map(id => game.entities[id]));
        break;
      case 'FOOD':
        entities = entities.concat(game.food.map(id => game.entities[id]));
        break;
      case 'EGG':
        entities = entities.concat(game.eggs.map(id => game.entities[id]));
        break;
      case 'LARVA':
        entities = entities.concat(game.larva.map(id => game.entities[id]));
        break;
      case 'PUPA':
        entities = entities.concat(game.pupa.map(id => game.entities[id]));
        break;
      case 'DEAD_ANT':
        entities = entities.concat(game.deadAnts.map(id => game.entities[id]));
        break;
    }
  }
  return entities;
}

const selectors = {
  collides,
  collidesWith,
  fastCollidesWith,
  fastGetEmptyNeighborPositions,
  getSelectedAntIDs,
  getNeighborhoodEntities,
  getEmptyNeighborPositions,
  getEntitiesByType,
  insideWorld,
};
window.selectors = selectors; // for testing

module.exports = selectors;
