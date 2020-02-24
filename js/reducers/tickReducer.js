// @flow

const {
  add,
  equals,
  subtract,
  distance,
  makeVector,
  vectorTheta,
} = require('../utils/vectors');
const {config} = require('../config');
const {sin, cos, abs, sqrt} = Math;
const {
  createIdleTask,
  createGoToLocationBehavior,
} = require('../state/tasks');
const {invariant} = require('../utils/errors');
const {
  randomIn,
  normalIn,
  oneOf,
  deleteFromArray,
  getInnerLocation,
} = require('../utils/helpers');
const {
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
} = require('../utils/stateHelpers');
const {
  fastCollidesWith,
  fastGetEmptyNeighborPositions,
  fastGetNeighbors,
  collides,
  getEntitiesByType,
  filterEntitiesByType,
  insideWorld,
  getEntitiesInRadius,
} = require('../selectors/selectors');
const {makeEgg} = require('../entities/egg');
const {makeLarva} = require('../entities/larva');
const {makePupa} = require('../entities/pupa');
const {makeAnt} = require('../entities/ant');
const {performTask} = require('../simulation/performTask');
const {
  createFindPheromoneTask, createFollowTrailTask,
  createFollowTrailInReverseTask, createPickupEntityTask,
} = require('../state/graphTasks');

import type {
  GameState, Entity, Action, Ant, Behavior, Condition, Task, AntAction, AntActionType
} from '../types';

const tickReducer = (game: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_TICK': {
      if (game != null && game.tickInterval != null) {
        return game;
      }
      const {updateSim} = action;
      return {
        ...game,
        tickInterval: setInterval(
          // HACK: store is only available via window
          () => store.dispatch({type: 'TICK', updateSim}),
          config.msPerTick,
        ),
      };
    }
    case 'STOP_TICK': {
      clearInterval(game.tickInterval);
      game.tickInterval = null;
      return game;
    }
    case 'TICK': {
      const {updateSim} = action;
      game.time += 1;
      handlePan(game);
      if (updateSim) {
        return handleTick(game);
      } else {
        updateFoWVision(game);
        return game; // just ticking for rendering
      }
    }
  }
  return game;
};

///////////////////////////////////////////////////////////////////////////////
// Handle Pan
///////////////////////////////////////////////////////////////////////////////
const handlePan = (game: GameState): void => {
  const nextViewPos = {...game.viewPos};
  if (game.arrowKeys.up) {
    nextViewPos.y += 1;
  }
  if (game.arrowKeys.down) {
    nextViewPos.y -= 1;
  }
  if (game.arrowKeys.left) {
    nextViewPos.x -= 1;
  }
  if (game.arrowKeys.right) {
    nextViewPos.x += 1;
  }
  game.viewPos = nextViewPos;
}


///////////////////////////////////////////////////////////////////////////////
// Handle Tick
///////////////////////////////////////////////////////////////////////////////
let totalTime = 0;
const handleTick = (game: GameState): GameState => {
  // const startTime = performance.now();

  // update ants
  const heldEntityIDs = [];
  for (const id of game.ANT) {
    const ant = game.entities[id];
    if (!ant.alive) {
      continue;
    }
    ant.age += 1;
    performTask(game, ant);

    // if ant just arrived at a location, switch task to that
    const locs = fastCollidesWith(game, ant)
      .filter(e => e.type === 'LOCATION')
      .filter(e => e.id != config.clickedPosition);
    if (locs.length > 0 && (ant.location == null || locs[0].id != ant.location.id)) {
      if (collides(getInnerLocation(locs[0]), ant)) {
        ant.location = locs[0];
        ant.task = locs[0].task;
        ant.taskIndex = 0;
        ant.taskStack = [
          {name: 'Follow Trail', index: 0},
          {name: 'Find Pheromone Trail', index: 0},
        ];
      }
    } else if (locs.length == 0 && ant.location != null) {
      ant.location = null;
    }

    // if idle on pheromone, follow it
    const pheromoneAtPosition = lookupInGrid(game.grid, ant.position)
      .filter(id => game.PHEROMONE.includes(id))
      .length > 0;
    if (ant.task != null && ant.task.name === 'Idle' && pheromoneAtPosition) {
      ant.taskIndex = 0;
      ant.taskStack = [];
      ant.task = createFollowTrailTask();
    }

    // if blocked on a trail, pick up blocker and reverse
    if (ant.task != null && ant.task.name === 'Follow Trail' && ant.blocked) {
      const blockingEntity = ant.blockedBy;
      if (!blockingEntity) {
        console.error("no blocking entity on pheromone trail", ant);
        break;
      }
      ant.task = createPickupEntityTask(blockingEntity);
      ant.taskIndex = 0;
      ant.taskStack = [{name: 'Follow Trail In Reverse', index: 0}];
    }

    ant.calories -= 1;
    if (ant.eggLayingCooldown > 0) {
      ant.eggLayingCooldown -= 1;
    }
    // ant starvation
    if (ant.calories <= 0) {
      ant.alive = false;
      if (ant.holding) {
        putDownEntity(game, ant);
      }
    }
    if (ant.holding != null && !heldEntityIDs.includes(ant.holding.id)) {
      heldEntityIDs.push(ant.holding.id);
    }
  }

  updateHeldBigEntities(game, heldEntityIDs);
  updateAntLifeCycles(game);
  updatePheromones(game);
  computeGravity(game);
  updateFoWVision(game);

  // const time = performance.now() - startTime;
  // totalTime += time;
  // if (game.time % 10 === 0) {
  //   console.log(time.toFixed(3), 'avg', (totalTime / game.time).toFixed(3));
  // }

  return game;
}

///////////////////////////////////////////////////////////////////////////////
// Held Big Entities
///////////////////////////////////////////////////////////////////////////////
const updateHeldBigEntities = (
  game: GameState, heldEntityIDs: Array<EntityID>,
): void => {
  const heldBigEntities = heldEntityIDs
    .map(i => game.entities[i])
    .filter(e => e.toLift > 1);
  for (const bigEntity of heldBigEntities) {
    if (bigEntity.toLift <= bigEntity.heldBy.length) {
      if (!bigEntity.lifted) {
        const didMove = maybeMoveEntity(
          game, bigEntity,
          add(bigEntity.position, {x: 0, y: 1}),
          false, // don't debug
        );
        bigEntity.lifted = didMove;
      } else {
        // move the bigEntity according to the average movement of the ants holding it
        let sum = {x: 0, y: 0};
        for (let i = 0; i < bigEntity.heldBy.length; i++) {
          const ant = game.entities[bigEntity.heldBy[i]];
          const diff = subtract(ant.position, ant.prevPosition);
          sum = add(sum, diff);
        }
        const avg = {
          x: Math.round(sum.x / bigEntity.heldBy.length),
          y: Math.round(sum.y / bigEntity.heldBy.length),
        };
        maybeMoveEntity(game, bigEntity, add(bigEntity.position, avg), false);
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Ant Life Cycles
///////////////////////////////////////////////////////////////////////////////
const updateAntLifeCycles = (game): void => {
  // update eggs
  for (const id of game.EGG) {
    const egg = game.entities[id];
    egg.age += 1;
    if (egg.age > config.eggHatchAge) {
      game.entities[id] = {...makeLarva(egg.position, egg.subType), id};
      changeEntityType(game, game.entities[id], 'EGG', 'LARVA');
    }
  }

  // update larva
  for (const id of game.LARVA) {
    const larva = game.entities[id];
    larva.age += 1;
    if (!larva.alive) {
      continue;
    }

    larva.calories -= 1;
    // larva starvation
    if (larva.calories <= 0) {
      larva.alive = false;
      continue;
    }

    if (larva.calories >= config.larvaEndCalories) {
      game.entities[id] = {...makePupa(larva.position, larva.subType), id};
      changeEntityType(game, game.entities[id], 'LARVA', 'PUPA');
    }
  }

  // update pupa
  for (const id of game.PUPA) {
    const pupa = game.entities[id];
    pupa.age += 1;
    if (pupa.age > config.pupaHatchAge) {
      game.entities[id] = {...makeAnt(pupa.position, pupa.subType), id};
      changeEntityType(game, game.entities[id], 'PUPA', 'ANT');
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Phermones
///////////////////////////////////////////////////////////////////////////////
const updatePheromones = (game: GameState): void => {
  const toRemove = [];
  for (const id of game.PHEROMONE) {
    const pheromone = game.entities[id];
    pheromone.quantity -= 1;
    if (pheromone.quantity <= 0) {
      toRemove.push(pheromone);
    }
  }
  for (const pheromone of toRemove) {
    removeEntity(game, pheromone);
  }
}

///////////////////////////////////////////////////////////////////////////////
// Compute Gravity
///////////////////////////////////////////////////////////////////////////////
const computeGravity = (game: GameState): void => {
  for (const entityType of config.fallingEntities) {
    for (const id of game[entityType]) {
      const entity = game.entities[id];
      if (!entity.position) continue;
      // TODO lifted (big)entities not affected by gravity for now
      const isBig = entity.toLift > 1;
      const isReadyToLift = entity.toLift <= entity.heldBy.length;
      if (entity.lifted) continue;
      // if (isBig && isReadyToLift && !entity.isLifted) continue;
      const positionBeneath = subtract(entity.position, {x: 0, y: 1});
      const entitiesBeneath = fastCollidesWith(game, {...entity, position: positionBeneath})
        .filter(e => config.stopFallingEntities.includes(e.type))
        .length > 0;
      let entitiesSupporting = [];
      if (config.supportedEntities.includes(entityType)) {
        entitiesSupporting = fastCollidesWith(game, entity)
          .filter(e => config.supportingBackgroundTypes.includes(e.subType))
        if (config.climbingEntities.includes(entity.type)) {
          entitiesSupporting = entitiesSupporting
            .concat(
              fastGetNeighbors(game, entity, true /* diagonal */)
              .filter(e => config.stopFallingEntities.includes(e.type))
            );
        }
      }
      if (
        (!entitiesSupporting.length > 0 && !entitiesBeneath)
        && insideWorld(game, positionBeneath)
      ) {
          moveEntity(game, entity, positionBeneath);
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Update FoW Vision
///////////////////////////////////////////////////////////////////////////////
const updateFoWVision = (game: GameState): void => {
  const previouslyVisible = [];
  for (const entityType of config.entitiesInFog) {
    for (const id of game[entityType]) {
      const entity = game.entities[id];
      if (entity.position == null) {
        entity.visible = true; // held entities are visible
        continue;
      }
      if (entity.visible) {
        previouslyVisible.push(entity);
        entity.visible = false;
      }
    }
  }
  for (const id of game.ANT) {
    const ant = game.entities[id];
    getEntitiesInRadius(game, ant.position, config.antVisionRadius)
      .forEach(e => e.visible = true);
  }
  for (const entity of previouslyVisible) {
    if (!entity.visible) {
      entity.lastSeenPos = entity.position;
    }
  }
}

module.exports = {tickReducer};
