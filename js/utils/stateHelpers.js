// @flow

const {
  add, subtract, makeVector, vectorTheta, equals,
} = require('../utils/vectors');
const {
  fastCollidesWith, collides, insideWorld, lookupInGrid, getNeighborPositions,
  shouldFall, fastGetEmptyNeighborPositions,
} = require('../selectors/selectors');
const {config} = require('../config');
const {getInnerLocation, oneOf} = require('../utils/helpers');
const {makePheromone} = require('../entities/pheromone');

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

  if (entity.segmented) {
    const {position, segments} = entity;
    insertInGrid(game.grid, position, entity.id);
    for (const segment of segments) {
      insertInGrid(game.grid, segment.position, entity.id);
    }
    return;
  }

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

  // handle segmented entities
  if (entity.segmented) {
    for (const segment of entity.segments) {
      deleteFromGrid(game.grid, segment.position, entity.id);
    }
    deleteFromGrid(game.grid, entity.position, entity.id);
    return;
  }

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
  // clean up locations
  if (entity.type === 'LOCATION') {
    for (const antID of game.ANT) {
      const ant = game.entities[antID];
      if (ant.location === entity.id) {
        ant.location = null;
      }
    }
  }
}

function moveEntity(game: GameState, entity: Entity, nextPos: Vector): void {
  if (entity.segmented) {
    let next = {...entity.position};
    // must do this delete first since a segment will end up there
    deleteFromGrid(game.grid, entity.position, entity.id);
    for (const segment of entity.segments) {
      const tmp = {...segment.position};
      deleteFromGrid(game.grid, segment.position, entity.id);
      segment.position = {...next};
      insertInGrid(game.grid, segment.position, entity.id);
      next = tmp;
    }
    entity.prevPosition = entity.position;
    entity.position = nextPos;
    insertInGrid(game.grid, entity.position, entity.id);
    return;
  }

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
  if (
    entity.type === 'ANT' ||
    config.bugs.includes(entity.type)
  ) {
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

////////////////////////////////////////////////////////////////////////
// Ant Functions
////////////////////////////////////////////////////////////////////////

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

// returns whether toEat was eaten entirely
function antEatEntity(
  game: GameState, ant: Ant, toEat: Entity,
): boolean {
  const caloriesEaten = Math.min(
    config.antCaloriesPerEat,
    toEat.calories,
    config.antMaxCalories - ant.calories,
  );
  ant.calories += caloriesEaten;
  toEat.calories -= caloriesEaten;
  if (toEat.calories <= 0) {
    removeEntity(game, toEat);
    return true;
  }
  return false;
}

function antMakePheromone(
  game: GameState, ant: Ant,
): void {
  const prevPheromone = game.entities[ant.prevPheromone];
  const nextPherPos = ant.prevPosition;

  // don't make pheromones inside locations
  // NOTE: doesn't use getInnerLocation since pherome is created in prevPosition
  const inInnerLocation = ant.location != null
    ? collides(game, ant.location, ant)
    : false;
  if (inInnerLocation) {
    ant.prevPheromone = null;
    return;
  }

  let strength = 0;
  let category = 1;
  if (game.selectedEntities.includes(ant.id)) {
    if (game.hotKeys.keysDown['P']) {
      strength = game.pheromones[1].strength;
      category = 1;
    }
    if (game.hotKeys.keysDown['O']) {
      strength = game.pheromones[2].strength;
      category = 2;
    }
    if (game.hotKeys.keysDown['I']) {
      strength = game.pheromones[3].strength;
      category = 3;
    }
  }

  const theta = vectorTheta(subtract(ant.position, ant.prevPosition));
  const pheromonesAtPos = lookupInGrid(game.grid, nextPherPos)
    .map(id => game.entities[id])
    .filter(e => e.type === 'PHEROMONE');
  // pheromone deletion
  if (pheromonesAtPos.length > 0 && strength < 0) {
    for (let ph of pheromonesAtPos) {
      ph.quantity = Math.max(0, strength + ph.quantity);
    }
    return;
  }
  const pheromoneInDirection = pheromonesAtPos
    .filter(p => {
      return p.theta === theta // || prevPheromone == null
    })[0];


  if (pheromoneInDirection != null) {
    pheromoneInDirection.quantity = Math.min(
      config.pheromoneMaxQuantity,
      strength + pheromoneInDirection.quantity,
    );
    ant.prevPheromone = pheromoneInDirection.id;
  } else if (strength > 0) {
    const pheromone = makePheromone(
      nextPherPos,
      theta,
      category,
      0, // edgeID (placeholder) DEPRECATED
      ant.prevPheromone,
      strength,
    );
    addEntity(game, pheromone);
    ant.prevPheromone = pheromone.id;
  }
}

function antSwitchTask(
  game: GameState, ant: Ant, task: Task, taskStack: ?Array<Object>,
): void {
  ant.task = task;
  ant.taskIndex = 0;
  ant.taskStack = taskStack != null ? taskStack : [];
}

////////////////////////////////////////////////////////////////////////
// Validated Entity Move Functions
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
  game: GameState, entity: Entity, nextPos: Vector,
  blockers: ?Array<EntityType>,
  debug: boolean,
): boolean {
  const blockingTypes = blockers != null ? blockers : config.antBlockingEntities;
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
    .filter(e => blockingTypes.includes(e.type))
    .length > 0;
  const defyingGravity = (
    nextPos.y > entity.position.y &&
    shouldFall(game, {...entity, position: nextPos})
  );
  if (!occupied && insideWorld(game, nextPos) && !defyingGravity) {
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

/**
 *  Moves towards a location that is distance > 1 away
 *  Returns true if it was able to move towards it,
 *  otherwise returns the entity that is blocking it
 */
function maybeMoveTowardsLocation(
  game: GameState, entity: Entity, loc: Vector,
): boolean | Entity {
  const distVec = subtract(loc, entity.position);
  if (distVec.x == 0 && distVec.y == 0) {
    return true; // you're there
  }
  let moveVec = {x: 0, y: 0};

  // select axis order to try moving along
  let moveAxes = ['y', 'x'];
  if (distVec.y == 0 || (distVec.x !== 0 && Math.random() < 0.5)) {
    moveAxes = ['x', 'y'];
  }

  // try moving along each axis
  let nextPos = null;
  for (let moveAxis of moveAxes) {
    if (distVec[moveAxis] == 0) {
      continue; // already aligned with destination on this axis
    }
    moveVec[moveAxis] += distVec[moveAxis] > 0 ? 1 : -1;
    nextPos = add(moveVec, entity.position);
    const didMove = maybeMoveEntity(game, entity, nextPos);
    if (didMove) {
      return true;
    } else {
      moveVec[moveAxis] = 0;
    }
  }

  // else we couldn't move, so return the blocker
  return lookupInGrid(game.grid, nextPos)
    .map(i => game.entities[i])
    .filter(e => config.antBlockingEntities.includes(e.type))
    [0];
}

/**
 *  Selects a random free neighbor to try to move to
 *  Provide policies to constrain the random movement
 *  Policies:
 *    - NO_REVERSE: don't go back to your previous position
 *    - FORWARD_BIAS: prefer to continue in current direction
 *  Additionally can provide:
 *    - constraint: a location random moves must stay inside
 *    - blocking entities: override antBlockingEntities with these
 */
function maybeDoRandomMove(
  game: GameState, entity: Entity, policies: Array<string>,
  constraint: ?Location, blockers: ?Array<EntityType>,
): boolean {
  const blockingTypes = blockers != null ? blockers : config.antBlockingEntities;
  let freePositions =
    fastGetEmptyNeighborPositions(game, entity, blockingTypes)
      .filter((pos) => insideWorld(game, pos));

  for (let policy of policies) {
    switch (policy) {
      case 'NO_REVERSE': {
        freePositions = freePositions.filter((pos) => {
          return pos.x != entity.prevPosition.x || pos.y != entity.prevPosition.y;
        });
        if (freePositions.length == 0) {
          freePositions = [{...entity.prevPosition}];
        }
        break;
      }
      case 'FORWARD_BIAS': {
        const dir = subtract(entity.position, entity.prevPosition);
        freePositions.push(add(dir, entity.position));
        freePositions.push(add(dir, entity.position));
      }
    }
  }

  if (constraint != null) {
    freePositions = freePositions.filter((pos) => {
      return collides(game, {...entity, position: pos}, constraint);
    });
  }

  if (freePositions.length == 0) {
    return false;
  }

  const nextPos = oneOf(freePositions);

  return maybeMoveEntity(game, entity, nextPos, blockingTypes);
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
  antEatEntity,
  antMakePheromone,

  antSwitchTask,

  maybeMoveEntity,
  maybeMoveTowardsLocation,
  maybeDoRandomMove,
}
