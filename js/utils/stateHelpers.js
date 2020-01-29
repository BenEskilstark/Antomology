// @flow

const {add, subtract, makeVector, vectorTheta, equals} = require('../utils/vectors');
const {
  fastCollidesWith, collides, insideWorld, lookupInGrid, getNeighborPositions,
} = require('../selectors/selectors');
const {config} = require('../config');

import type {EntityID, GameState, Vector, EntityType} from '../types';

export type Grid = Array<Array<Array<EntityID>>>;

/**
 * These functions all mutate state in some way. Meant to be used by reducers
 * so they can do similar operations consistently
 */

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

////////////////////////////////////////////////////////////////////////
// Entity Functions
// These don't do any validation, they just perform the operation
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
  if (entity.type === 'ANT') {
    // TODO this rotation is weird for the falling obelisk
    entity.theta = vectorTheta(subtract(entity.prevPosition, entity.position));
  }
}

function changeEntityType(
  game: GameState, entity: Entity,
  oldType: EntityType, nextType: EntityType,
): void {
  game[oldType] = game[oldType].filter(id => id != entity.id);
  game[nextType].push(entity.id);
  entity.type = nextType;
}

function pickUpEntity(
  game: GameState, ant: Ant, entityToPickup: Entity,
): void {
  ant.holding = entityToPickup;
  ant.blocked = false;
  ant.blockedBy = null;
  if (entityToPickup.toLift == 1) {
    deleteFromGrid(game.grid, entityToPickup.position, entityToPickup.id);
    entityToPickup.position = null;
  }
  entityToPickup.heldBy.push(ant.id);
}

function putDownEntity(
  game: GameState, ant: Ant,
): void {
  const heldEntity = ant.holding;
  const positionToPutdown = heldEntity.toLift > 1 ? heldEntity.position : ant.position;
  moveEntity(game, heldEntity, positionToPutdown);
  heldEntity.heldBy = heldEntity.heldBy.filter(i => i != ant.id);
  if (heldEntity.toLift > heldEntity.heldBy.length) {
    heldEntity.lifted = false;
  }
  ant.holding = null;
  ant.leadHolder = false;
}

////////////////////////////////////////////////////////////////////////
// Validated Entity Functions
////////////////////////////////////////////////////////////////////////

/**
 * Checks that
 *   - nextPos is a neighbor of entity's current position
 *   - entity can move to nextPos without a collision
 *   - not already at the position
 *   - nextPos is inside the world
 *
 * returns whether or not the entity got moved
 */
function maybeMoveEntity(
  game: GameState, entity: Entity, nextPos: Vector, debug: boolean,
): boolean {
  const distVec = subtract(nextPos, entity.position);
  if ((distVec.x > 1 || distVec.y > 1) || (distVec.x == 1 && distVec.y == 1)){
    if (debug) console.log("too far", distVec);
    return false; // too far
  }
  if (equals(entity.position, nextPos)) {
    if (debug) console.log("already there", entity.position, nextPos);
    return false; // already there
  }
  let occupied = fastCollidesWith(game, {...entity, position: nextPos})
    .filter(e => config.antBlockingEntities.includes(e.type))
    .length > 0;
  if (!occupied && insideWorld(game, nextPos)) {
    moveEntity(game, entity, nextPos);
    if (debug) console.log("did the move");
    return true;
  }
  if (debug) {
    if (!insideWorld(game, nextPos)) {
      console.log("not inside world", nextPos);
    }
    if (occupied) {
      console.log("occupied", occupied);
    }
  }
  return false;
}

module.exports = {
  insertInGrid,
  deleteFromGrid,
  lookupInGrid,

  addEntity,
  removeEntity,
  moveEntity,
  changeEntityType,
  pickUpEntity,
  putDownEntity,

  maybeMoveEntity,
}
