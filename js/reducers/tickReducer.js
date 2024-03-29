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
  isInRadius,
  clamp,
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
  antSwitchTask,
  maybeDoRandomMove,
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
  shouldFall,
  getQueen,
} = require('../selectors/selectors');
const {makeEgg} = require('../entities/egg');
const {makeLarva} = require('../entities/larva');
const {makePupa} = require('../entities/pupa');
const {makeAnt} = require('../entities/ant');
const {makeFood} = require('../entities/food');
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
      handlePan(game, updateSim);
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
const handlePan = (game: GameState, updateSim: boolean): void => {
  const nextViewPos = {...game.viewPos};
  if (game.hotKeys.keysDown.up) {
    nextViewPos.y += 1;
  }
  if (game.hotKeys.keysDown.down) {
    nextViewPos.y -= 1;
  }
  if (game.hotKeys.keysDown.left) {
    nextViewPos.x -= 1;
  }
  if (game.hotKeys.keysDown.right) {
    nextViewPos.x += 1;
  }
  // updateSim is a proxy for whether you're in the editor
  if (!updateSim) {
    game.viewPos = nextViewPos;
  } else {
    game.viewPos = {
      x: clamp(nextViewPos.x, 0, game.worldWidth - config.width),
      y: clamp(nextViewPos.y, 0, game.worldHeight - config.height),
    };
  }
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
    if (
      locs.length > 0 && (ant.location == null || locs[0].id != ant.location.id)
    ) {
      if (collides(game, getInnerLocation(locs[0]), ant)) {
        ant.location = locs[0];
        // don't assign the task yet if the ant is selected
        if (!game.selectedEntities.includes(ant.id)) {
          antSwitchTask(game, ant, locs[0].task, [
            {name: 'Follow Trail', index: 0},
            {name: 'Find Pheromone Trail', index: 0},
          ]);
        }
      }
    } else if (locs.length == 0 && ant.location != null) {
      ant.location = null;
    }

    // if idle on pheromone, follow it
    const pheromoneAtPosition = lookupInGrid(game.grid, ant.position)
      .filter(id => game.PHEROMONE.includes(id))
      .length > 0;
    if (ant.task != null && ant.task.name === 'Idle' && pheromoneAtPosition) {
      antSwitchTask(game, ant, createFollowTrailTask());
    }

    ant.calories -= 1;
    if (ant.eggLayingCooldown > 0) {
      ant.eggLayingCooldown -= 1;
    }

    // ways ants can die
    if (
      ant.calories <= 0 || ant.hp <= 0
      // || (ant.subType != 'QUEEN' && ant.age > config.antMaxAge)
    ) {
      ant.alive = false;
      if (ant.holding) {
        putDownEntity(game, ant);
      }
      game.selectedEntities = game.selectedEntities.filter(id => id != ant.id);
    }

    if (ant.holding != null && !heldEntityIDs.includes(ant.holding.id)) {
      heldEntityIDs.push(ant.holding.id);
    }
  }

  updateHeldBigEntities(game, heldEntityIDs);
  updateBugs(game);
  updateAntLifeCycles(game);
  updatePheromones(game);
  computeGravity(game);
  updateFoWVision(game);
  updateTicker(game);
  computeLevelOver(game);

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
        );
        bigEntity.lifted = didMove == true;
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
        maybeMoveEntity(game, bigEntity, add(bigEntity.position, avg));
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Bugs
///////////////////////////////////////////////////////////////////////////////
const updateBugs = (game): void => {
  for (const aphidID of game.APHID) {
    const aphid = game.entities[aphidID];
    const rand = Math.random();
    if (rand < 0.4) {
      maybeDoRandomMove(game, aphid, []);
    }
    computeCombat(game, aphid, config.aphidDamage);
  }

  for (const beetleID of game.BEETLE) {
    const beetle = game.entities[beetleID];
    const rand = Math.random();
    if (rand < 0.4) {
      maybeDoRandomMove(game, beetle, []);
    }
    computeCombat(game, beetle, config.beetleDamage);
  }

  for (const wormID of game.WORM) {
    const worm = game.entities[wormID];
    const rand = Math.random();
    if (rand < 0.025) {
      maybeDoRandomMove(
        game, worm, ['NO_REVERSE', 'FORWARD_BIAS'],
        null, // constraint
        config.wormBlockingEntities,
      );
    }
    // eat colliding dirt
    const collidedDirt = fastCollidesWith(game, worm)
      .filter(e => e.type == 'DIRT');
    for (const dirt of collidedDirt) {
      removeEntity(game, dirt);
    }

    computeCombat(game, worm, config.wormDamage);
  }

  for (const centID of game.CENTIPEDE) {
    const centipede = game.entities[centID];
    const rand = Math.random();
    if (rand < 0.3) {
      maybeDoRandomMove(
        game, centipede, ['NO_REVERSE', 'FORWARD_BIAS'],
        null, // constraint
        config.centipedeBlockingEntities,
      );
    }
    // eat stuff
    const collidedFood = fastCollidesWith(game, centipede)
      .filter(e => e.type == 'EGG' || e.type == 'LARVA' || e.type == 'PUPA');
    for (const food of collidedFood) {
      removeEntity(game, food);
    }

    computeCombat(game, centipede, config.centipedeDamage);
  }

  for (const dragonFlyID of game.DRAGONFLY) {
    const dragonFly = game.entities[dragonFlyID];
    maybeDoRandomMove(
      game, dragonFly, ['NO_REVERSE', 'FORWARD_BIAS', 'FORWARD_BIAS'],
      null, // constraint
      config.dragonFlyBlockingEntities,
    );
  }
};

function computeCombat(game, entity, entityDamage) {
  const collidingAnts = fastCollidesWith(game, entity)
    .filter(e => e.type === 'ANT' && e.alive);
  entity.hp -= collidingAnts.length * config.antDamage;
  const hurtAnt = oneOf(collidingAnts);
  if (hurtAnt != null) {
    hurtAnt.hp -= entityDamage;
  }
  if (entity.hp <= 0) {
    removeEntity(game, entity);
    if (entity.segmented) {
      for (const segment of entity.segments) {
        addEntity(game, makeFood(segment.position, 1000, entity.type));
      }
      addEntity(game, makeFood(entity.position, 1000, entity.type));
    } else {
      for (let x = 0; x < entity.width; x++) {
        for (let y = 0; y < entity.height; y++) {
          addEntity(
            game,
            makeFood(add(entity.position, {x, y}), 1000, entity.type),
          );
        }
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Game over
///////////////////////////////////////////////////////////////////////////////
const computeLevelOver = (game): void => {
  const queen = getQueen(game);
  if (queen == null) return; // probably not loaded yet
  if (!queen.alive) {
    game.gameOver = 'lose';
  }

  const obelisk = game.entities[game.OBELISK[0]];
  // TODO only supports one target
  const target = game.entities[game.TARGET[0]];
  if (!obelisk || !target) return;

  if (collides(game, obelisk, target)) {
    game.gameOver = 'win';
  }

};

///////////////////////////////////////////////////////////////////////////////
// Ticker
///////////////////////////////////////////////////////////////////////////////
const updateTicker = (game): void => {
  const {ticker} = game;
  if (ticker.curAge >= ticker.maxAge) {
    ticker.text = '';
  } else {
    ticker.curAge += 1;
  }
};

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
      game.entities[id] = {
        ...makePupa(larva.position, larva.subType),
        id, calories: larva.calories,
      };
      changeEntityType(game, game.entities[id], 'LARVA', 'PUPA');
    }
  }

  // update pupa
  for (const id of game.PUPA) {
    const pupa = game.entities[id];
    pupa.age += 1;
    if (pupa.age > config.pupaHatchAge && pupa.position != null) {
      game.entities[id] = {
        ...makeAnt(pupa.position, pupa.subType),
        id, calories: pupa.calories,
      };
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
      if (shouldFall(game, entity)) {
        const positionBeneath = subtract(entity.position, {x: 0, y: 1});
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
      if (
        entity.lastSeenPos != null &&
        !config.immobileEntities.includes(entity.type)
      ) {
        for (const id of game.ANT) {
          const ant = game.entities[id];
          if (!ant.alive) continue;
          if (
            isInRadius(ant.position, config.antVisionRadius, entity.lastSeenPos)
          ) {
            entity.lastSeenPos = null;
            break;
          }
        }
      }
    }
  }

  for (const id of game.ANT) {
    const ant = game.entities[id];
    if (!ant.alive) continue;
    getEntitiesInRadius(
      game, ant.position, config.antVisionRadius,
    ).forEach(e => e.visible = true);
  }
  for (const entity of previouslyVisible) {
    if (!entity.visible) {
      entity.lastSeenPos = entity.position;
    }
  }

}

module.exports = {tickReducer};
