// @flow

const {invariant} = require('../utils/errors');
const {subtract, distance, add} = require('../utils/vectors');
const {config} = require('../config');

import type {GameID, State, Game, Entity} from '../types';

// TODO: collides should handle entities with arbitrary sizes
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
      entityB.position.y + entityB.width > entityA.position.y &&
      entityB.position.y + entityB.width <= entityA.position.y + entityA.width
    ) {
      yOverlap = true;
    }
  } else {
    if (
      entityA.position.y + entityA.width > entityB.position.y &&
      entityA.position.y + entityA.width <= entityB.position.y + entityB.width
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

  return collisions;
};

const getSelectedAntIDs = (game: GameState): Array<EntityID> => {
  return game.selectedEntities.filter(id => game.ants.includes(id));
};

const getNeighborhoodLocation = (
  entity: Entity,
  radius: ?number,
): {position: Vector, width: number, height: number} => {
  const rad = radius != null ? radius : 1;
  return {
    position: add(entity.position, {x: -rad, y: -rad}),
    width: rad * 2 + 1, // +1 to include inner space itself
    height: rad * 2 + 1,
  };
};

// get all entities in the radius of the given entity excluding itself
const getNeighborhoodEntities = (
  entity: Entity, entities: Array<Entity>, radius: ?number,
): Array<Entity> => {
  const rad = radius != null ? radius : 1;
  const neighborhoodLocation = getNeighborhoodLocation(entity, rad);
  return collidesWith(neighborhoodLocation, entities).filter(e => e.id != entity.id);
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

const getEntitiesByType = (
  game: GameState,
  entityType: string,
): Array<Entity> => {
  switch (entityType) {
    case 'ANT': {
      return game.ants.map(id => game.entities[id]);
    }
    case 'DIRT': {
      return game.dirt.map(id => game.entities[id]);
    }
    case 'LOCATION': {
      return game.locations.map(id => game.entities[id]);
    }
    case 'FOOD': {
      return game.food.map(id => game.entities[id]);
    }
  }
}

const selectors = {
  collides,
  collidesWith,
  getSelectedAntIDs,
  getNeighborhoodLocation,
  getNeighborhoodEntities,
  getEmptyNeighborPositions,
  getEntitiesByType,
};
window.selectors = selectors; // for testing

module.exports = selectors;
