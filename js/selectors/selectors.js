// @flow

const {invariant} = require('../utils/errors');
const {subtract, distance, add} = require('../utils/vectors');
const {config} = require('../config');

import type {GameID, State, Game, Entity} from '../types';

/////////////////////////////////////////////////////////////////
// Collisions
/////////////////////////////////////////////////////////////////

// TODO may not need all the size stuff if we just use the grid
const collides = (entityA: Entity, entityB: Entity): boolean => {
  if (entityA == null || entityB == null) {
    return false;
  }
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
      const entitiesInSquare = lookupInGrid(game.grid, {x, y});
      for (const id of entitiesInSquare) {
        if (!entities.includes(id)){
          entities.push(id);
        }
      }
    }
  }

  return entities.map(id => game.entities[id]);
}

function lookupInGrid(grid: Grid, position: Vector): Array<EntityID> {
  if (position == null) return [];
  const {x, y} = position;
  if (grid[x] == null) {
    return [];
  }
  if (grid[x][y] == null) {
    return [];
  }
  return grid[x][y];
}

/////////////////////////////////////////////////////////////////
// Fast functions
/////////////////////////////////////////////////////////////////

const fastCollidesWith = (game: GameState, entity: Entity): Array<Entity> => {
  if (entity.position == null) return [];
  let {position, width, height} = entity;
  if (width == null) {
    console.error("checking collision on non-entity", entity);
    width = 1;
  }
  if (height == null) {
    console.error("checking collision on non-entity", entity);
    height = 1;
  }
  const collisions = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const thisSquare = lookupInGrid(game.grid, add(entity.position, {x, y}));
      for (const id of thisSquare) {
        if (!collisions.includes(id) && id != entity.id) {
          collisions.push(id);
        }
      }
    }
  }
  return collisions.map(i => game.entities[i]);
};

/////////////////////////////////////////////////////////////////
// Neighbors
/////////////////////////////////////////////////////////////////

const getNeighborPositions = (entity: Entity, includeDiagonal: boolean): Array<Vector> => {
  const {position, width, height} = entity;
  const neighbors = [];
  for (let x = position.x; x < position.x + width; x++) {
    neighbors.push({x, y: position.y + height});
    neighbors.push({x, y: position.y - 1});
  }
  for (let y = position.y; y < position.y + width; y++) {
    neighbors.push({x: position.x - 1, y});
    neighbors.push({x: position.x + width, y});
  }
  if (includeDiagonal) {
    neighbors.push({x: position.x - 1, y: position.y - 1});
    neighbors.push({x: position.x - 1, y: position.y + height});
    neighbors.push({x: position.x + width, y: position.y - 1});
    neighbors.push({x: position.x + width, y: position.y + height});
  }
  return neighbors;
}

const fastGetEmptyNeighborPositions = (
  game: GameState, entity: Entity, blockingEntityTypes: Array<EntityType>,
): Array<Vector> => {
  if (entity.position == null) return [];
  const emptyPositions = [];
  const neighborPositions = getNeighborPositions(entity);
  for (const neighborPos of neighborPositions) {
    const neighbors = lookupInGrid(game.grid, neighborPos)
      .filter(id => blockingEntityTypes.includes(game.entities[id].type));
    if (neighbors.length == 0) {
      emptyPositions.push(neighborPos);
    }
  }
  return emptyPositions;
}

const fastGetNeighbors = (
  game: GameState, entity: Entity, includeDiagonal: boolean,
): Array<Entity> => {
  if (entity.position == null) return [];
  const neighborEntities = [];
  const neighborPositions = getNeighborPositions(entity, includeDiagonal);
  for (const neighborPos of neighborPositions) {
    neighborEntities.push(
      ...lookupInGrid(game.grid, neighborPos)
    );
  }
  return neighborEntities.map(id => game.entities[id]);
}

const insideWorld = (game: GameState, pos: Vector): boolean => {
  return pos.x >= 0 && pos.x < game.worldWidth && pos.y >= 0 && pos.y < game.worldHeight;
};

const onScreen = (game: GameState, pos: Vector): boolean => {
  const {viewPos} = game;
  const e = 2; // to handle drag lag
  return pos.x >= viewPos.x - e && pos.y >= viewPos.y - e &&
    pos.x <= viewPos.x + config.width + e && pos.y <= viewPos.y + config.height + e;
};

const getEntitiesInRadius = (
  game: GameState, pos: Vector, radius: number,
): Array<Entity> => {
  const entities = [];
  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      if (x*x + y*y < radius*radius) {
        entities.push(...lookupInGrid(game.grid, {x: x + pos.x, y: y + pos.y}));
      }
    }
  }
  return entities.map(id => game.entities[id]);
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
  lookupInGrid,
  insideWorld,
  onScreen,
  collides,
  getSelectedAntIDs,
  entitiesInMarquee,
  getEntitiesInRadius,
};
window.selectors = selectors; // for testing

module.exports = selectors;
