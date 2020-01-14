// @flow

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
  insertInGrid(game.grid, entity.position, entity.id);
  // TODO handle entities with larger size
}

function removeEntity(game: GameState, entity: Entity): void {
  delete game.entities[entity.id];
  game[entity.type] = game[entity.type].filter(id => id != entity.id);
  deleteFromGrid(game.grid, entity.position, entity.id);
  // TODO handle entities with larger size
}

function moveEntity(game: GameState, entity: Entity, nextPos: Vector): void {
  deleteFromGrid(game.grid, entity.position, entity.id);
  insertInGrid(game.grid, nextPos, entity.id);
  entity.prevPosition = entity.position;
  entity.position = nextPos;
  // TODO handle entities with larger size
}

function changeEntityType(
  game: GameState, entity: Entity,
  oldType: EntityType, nextType: EntityType,
): void {
  game[oldType] = game[entity.type].filter(id => id != entity.id);
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
