// @flow

const {add, subtract, makeVector, vectorTheta} = require('../utils/vectors');

import type {EntityID, GameState, Vector, EntityType} from '../types';

export type Grid = Array<Array<Array<EntityID>>>;

////////////////////////////////////////////////////////////////////////
// Grid Functions
////////////////////////////////////////////////////////////////////////

function insertInGrid(grid: Grid, position: Vector, item: EntityID): void {
  if (position == null) return;
  const {x, y} = position;
  if (grid[x] == null) {
    grid[x] = [];
  }
  if (grid[x][y] == null) {
    grid[x][y] = [];
  }
  grid[x][y].push(item);
}

function deleteFromGrid(grid: Grid, position: Vector, item: EntityID): void {
  if (position == null) return;
  const {x, y} = position;
  if (grid[x] == null) return;
  if (grid[x][y] == null) return;
  grid[x][y] = grid[x][y].filter(i => i != item);
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

////////////////////////////////////////////////////////////////////////
// Entity Functions
////////////////////////////////////////////////////////////////////////

function addEntity(game: GameState, entity: Entity): void {
  game.entities[entity.id] = entity;
  game[entity.type].push(entity.id);

  const {position, width, height} = entity;
  if (position == null) {
    return;
  }
  // handle entities with larger size
  for (let x = position.x; x < position.x + width; x++) {
    for (let y = position.y; y < position.y + height; y++) {
      insertInGrid(game.grid, {x, y}, entity.id);
    }
  }
}

function removeEntity(game: GameState, entity: Entity): void {
  delete game.entities[entity.id];
  game[entity.type] = game[entity.type].filter(id => id != entity.id);
  const {position, width, height} = entity;
  if (position == null) {
    return;
  }
  // handle entities with larger size
  for (let x = position.x; x < position.x + width; x++) {
    for (let y = position.y; y < position.y + height; y++) {
      deleteFromGrid(game.grid, {x, y}, entity.id);
    }
  }
}

function moveEntity(game: GameState, entity: Entity, nextPos: Vector): void {
  const {position, width, height} = entity;
  // handle entities with larger size
  if (position != null) {
    for (let x = position.x; x < position.x + width; x++) {
      for (let y = position.y; y < position.y + height; y++) {
        deleteFromGrid(game.grid, {x, y}, entity.id);
      }
    }
  }
  for (let x = nextPos.x; x < nextPos.x + width; x++) {
    for (let y = nextPos.y; y < nextPos.y + height; y++) {
      insertInGrid(game.grid, {x, y}, entity.id);
    }
  }
  entity.prevPosition = entity.position;
  entity.position = nextPos;
  entity.theta = vectorTheta(subtract(entity.prevPosition, entity.position));
}

function changeEntityType(
  game: GameState, entity: Entity,
  oldType: EntityType, nextType: EntityType,
): void {
  game[oldType] = game[oldType].filter(id => id != entity.id);
  game[nextType].push(entity.id);
  entity.type = nextType;
}

module.exports = {
  insertInGrid,
  deleteFromGrid,
  lookupInGrid,

  addEntity,
  removeEntity,
  moveEntity,
  changeEntityType,
}
