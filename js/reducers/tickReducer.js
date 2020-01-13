// @flow

const {add, equals, subtract, distance} = require('../utils/vectors');
const {config} = require('../config');
const {sin, cos, abs, sqrt} = Math;
const {gameReducer} = require('./gameReducer');
const {createIdleTask} = require('../state/tasks');
const {invariant} = require('../utils/errors');
const {
  randomIn,
  normalIn,
  oneOf,
  deleteFromArray,
  insertInGrid,
  deleteFromGrid,
} = require('../utils/helpers');
const {
  collides,
  collidesWith,
  fastCollidesWith,
  fastGetEmptyNeighborPositions,
  getNeighborhoodEntities,
  getEmptyNeighborPositions,
  getEntitiesByType,
  insideWorld,
} = require('../selectors/selectors');
const {makeEgg} = require('../entities/egg');
const {makeLarva} = require('../entities/larva');
const {makePupa} = require('../entities/pupa');
const {makeAnt} = require('../entities/ant');

import type {
  GameState, Entity, Action, Ant, Behavior, Condition, Task, AntAction, AntActionType
} from '../types';

const tickReducer = (game: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_TICK':
      if (game.game != null && game.game.tickInterval != null) {
        return game;
      }
      return {
        ...game,
        tickInterval: setInterval(
          // HACK: store is only available via window
          () => store.dispatch({type: 'TICK'}),
          config.msPerTick,
        ),
      };
    case 'STOP_TICK':
      clearInterval(game.tickInterval);
      game.tickInterval = null;
      return game;
    case 'TICK':
      return handleTick(game);
  }
  return game;
};

let totalTime = 0;

const handleTick = (game: GameState): GameState => {
  const startTime = performance.now();
  // update ants
  for (const id of game.ants) {
    const ant = game.entities[id];
    if (!ant.alive) {
      continue;
    }
    ant.age += 1;
    performTask(game, ant);

    ant.calories -=1;
    // ant starvation
    if (ant.calories <= 0) {
      ant.alive = false;
    }
  }

  // update eggs
  for (const id of game.eggs) {
    const egg = game.entities[id];
    egg.age += 1;
    if (egg.age > config.eggHatchAge) {
      game.entities[id] = {...makeLarva(egg.position, egg.subType), id};
      game.larva.push(id);
      game.eggs = game.eggs.filter(e => e != id);
    }
  }

  // update larva
  for (const id of game.larva) {
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
      game.pupa.push(id);
      game.larva = game.larva.filter(e => e != id);
    }

  }

  // update pupa
  for (const id of game.pupa) {
    const pupa = game.entities[id];
    pupa.age += 1;
    if (pupa.age > config.pupaHatchAge) {
      game.entities[id] = {...makeAnt(pupa.position, pupa.subType), id};
      game.ants.push(id);
      game.pupa = game.pupa.filter(e => e != id);
    }
  }

  game.time += 1;

  const time = performance.now() - startTime;
  totalTime += time;
  if (game.time % 10 === 0) {
    console.log(time.toFixed(3), 'avg', (totalTime / game.time).toFixed(3));
  }

  return game;
}

// Update the world based on the ant (attempting) performing its task.
// In place.
const performTask = (game: GameState, ant: Ant): void => {
  if (ant.task == null) {
    return;
  }
  const {task, taskIndex} = ant;
  // if ran off the end of the behavior queue, switch to idle task
  if (taskIndex >= task.behaviorQueue.length) {
    ant.taskIndex = 0;
    ant.task = createIdleTask();
    return;
  }
  const behavior = task.behaviorQueue[taskIndex];
  const done = performBehavior(game, ant, behavior);

  // if the behavior is done, advance the task index
  if (done) {
    ant.taskIndex += 1;
    if (task.repeating) {
      ant.taskIndex = ant.taskIndex % task.behaviorQueue.length;
    }
  // HACK to deal with switching tasks in a nested behavior
  } else if (ant.taskIndex == -1) {
    ant.taskIndex = 0;
  }
};

// behaviors can be recursive, so use this
const performBehavior = (game: GameState, ant: Ant, behavior: Behavior): boolean => {
  let done = false
  switch (behavior.type) {
    case 'DO_ACTION': {
      performAction(game, ant, behavior.action);
      done = true;
      break;
    }
    case 'IF': {
      const childBehavior = behavior.behavior;
      if (evaluateCondition(game, ant, behavior.condition)) {
        performBehavior(game, ant, childBehavior);
      } else if (behavior.elseBehavior != null) {
        performBehavior(game, ant, behavior.elseBehavior);
      }
      // TODO support nested execution
      // if (childBehavior.done) {
      done = true;
      // }
      break;
    }
    case 'WHILE': {
      const childBehavior = behavior.behavior;
      if (evaluateCondition(game, ant, behavior.condition)) {
        performBehavior(game, ant, childBehavior);
      } else {
        done = true;
      }
      break;
    }
    case 'SWITCH_TASK': {
      ant.task = game.tasks.filter(t => t.name === behavior.task)[0];
      // HACK: this sucks. done doesn't always propagate up particularly if
      // you switch tasks from inside a do-while
      ant.taskIndex = -1; // it's about to +1 in performTask
      done = true;
      break;
    }
  }
  return done;
};

const evaluateCondition = (
  game: GameState, ant: Ant, condition: Condition,
): boolean => {
  let isTrue = false;
  const {not, comparator, payload} = condition;
  const {object} = payload;
  switch (condition.type) {
    case 'LOCATION': {
      // comparator must be EQUALS
      // ant is considered to be at a location if it is within its boundingRect
      let loc = object;
      if (typeof loc === 'string') {
        loc = getEntitiesByType(game, ['LOCATION']).filter(l => l.name === loc)[0];
      }
      isTrue = collides(ant, loc);
      break;
    }
    case 'HOLDING': {
      if (object === 'ANYTHING' && (ant.holding != null && ant.holding.type != null)) {
        isTrue = true;
      } else if (object === 'NOTHING' && (ant.holding == null || ant.holding.type == null)) {
        isTrue = true;
      } else {
        isTrue = (ant.holding == null && object == null) ||
          ant.holding.type == object; // object is the held type
      }
      break;
    }
    case 'NEIGHBORING': {
      // comparator must be EQUALS
      const neighbors = getNeighborhoodEntities(
        ant, game.entities, 1 /* radius */
      );
      if (object === 'ANYTHING') {
        isTrue = neighbors.length > 0;
      } else if (object === 'NOTHING') {
        isTrue = neighbors.length === 0;
      } else if (object === 'MARKED') {
        isTrue = neighbors.filter(n => n.marked > 0).length > 0;
      } else if (object === 'FOOD') {
        isTrue = neighbors.filter(n => n.type === 'FOOD').length > 0;
      } else if (object != null && object.id !== null) {
        isTrue = neighbors.filter(n => n.id === object.id).length > 0;
      }
      break;
    }
    case 'BLOCKED': {
      // comparator must be EQUALS
      isTrue = ant.blocked;
      break;
    }
    case 'RANDOM': {
      const value = object;
      const rand = Math.random();
      if (comparator === 'EQUALS') {
        isTrue = rand == value;
      } else if (comparator === 'LESS_THAN') {
        isTrue = rand < value;
      } else if (comparator === 'GREATER_THAN') {
        isTrue = rand > value;
      }
      break;
    }
    case 'CALORIES': {
      const value = object;
      const antCalories = ant.calories;
      if (comparator === 'EQUALS') {
        isTrue = antCalories == value;
      } else if (comparator === 'LESS_THAN') {
        isTrue = antCalories < value;
      } else if (comparator === 'GREATER_THAN') {
        isTrue = antCalories > value;
      }
      break;
    }
    case 'AGE': {
      // TODO: age, calories, random are very similar
      const value = object;
      const antAge = ant.age;
      if (comparator === 'EQUALS') {
        isTrue = antAge == value;
      } else if (comparator === 'LESS_THAN') {
        isTrue = antAge < value;
      } else if (comparator === 'GREATER_THAN') {
        isTrue = antAge > value;
      }
      break;
    }
  }

  return not ? !isTrue : isTrue;
};

const performAction = (
  game: GameState, ant: Ant, action: AntAction,
): void => {
  const {payload} = action;
  const {object} = payload;
  switch (action.type) {
    case 'IDLE': {
      // unstack, similar to moving out of the way of placed dirt
      const stackedAnts = collidesWith(ant, getEntitiesByType(game, ['ANT']))
        .filter(a => a.id != ant.id);
      if (stackedAnts.length > 0) {
        const freePositions = getEmptyNeighborPositions(
          ant, getEntitiesByType(game, config.antBlockingEntities),
        );
        if (freePositions.length > 0) {
          ant.position = oneOf(freePositions);
        }
      }
      break;
    }
    case 'MOVE': {
      let loc = object;
      if (object === 'RANDOM') {
        // randomly select loc based on free neighbors
        // let freePositions = getEmptyNeighborPositions(
        //   ant, getEntitiesByType(game, config.antBlockingEntities),
        // ).filter(insideWorld);
        let freePositions = fastGetEmptyNeighborPositions(game, ant)
          .filter(insideWorld);
        if (freePositions.length == 0) {
          break; // can't move
        }
        // don't select previous position
        freePositions = freePositions.filter(pos => {
          return pos.x != ant.prevPosition.x || pos.y != ant.prevPosition.y;
        });
        if (freePositions.length == 0) {
          // then previous position was removed, so fall back to it
          loc = {position: ant.prevPosition};
        } else {
          // don't cross colonyEntrance boundary
          const colEnt = game.entities[config.colonyEntrance].position;
          freePositions = freePositions.filter(pos => !equals(pos, colEnt));
          if (freePositions.length == 0) {
            // fall back to previous position
            loc = {position: ant.prevPosition};
          }
          loc = {position: oneOf(freePositions)};
        }
      }
      const distVec = subtract(loc.position, ant.position);
      let moveVec = {x: 0, y: 0};
      let moveAxis = 'y';
      // different policies for choosing move direction
      // if (Math.abs(distVec.x) > Math.abs(distVec.y)) {
      if (distVec.y == 0 ||(distVec.x !== 0 && Math.random() < 0.5)) {
        moveAxis = 'x';
      }
      moveVec[moveAxis] += distVec[moveAxis] > 0 ? 1 : -1;
      let nextPos = add(moveVec, ant.position);
      // let occupied = collidesWith(
      //   {position: nextPos, width: 1, height: 1},
      //     getEntitiesByType(game, config.antBlockingEntities),
      // );
      let occupied = fastCollidesWith(game, {position: nextPos});
      if (occupied.length == 0 && insideWorld(nextPos)) {
        ant.prevPosition = ant.position;
        ant.position = nextPos;
      } else { // else try moving along the other axis
        moveVec[moveAxis] = 0;
        moveAxis = moveAxis === 'y' ? 'x' : 'y';
        if (distVec[moveAxis] > 0) {
          moveVec[moveAxis] += 1;
        } else if (distVec[moveAxis] < 0) {
          moveVec[moveAxis] -= 1;
        } else {
          // already axis-aligned with destination, but blocked
          ant.blocked = true;
          ant.blockedBy = occupied[0];
          break;
        }
        nextPos = add(moveVec, ant.position);
        // occupied = collidesWith(
        //   {position: nextPos, width: 1, height: 1},
        //   getEntitiesByType(game, config.antBlockingEntities),
        // );
        occupied = fastCollidesWith(game, {position: nextPos});
        if (occupied.length == 0 && insideWorld(nextPos)) {
          deleteFromGrid(game.grid, ant.position, ant.id);
          insertInGrid(game.grid, nextPos, ant.id);
          ant.position = nextPos;
          ant.blocked = false;
          ant.blockedBy = null;
        } else {
          if (occupied.length > 0) {
            ant.blocked = true;
            ant.blockedBy = occupied[0];
          }
        }
      }
      break;
    }
    case 'PICKUP': {
      let entityToPickup = object;
      if (entityToPickup === 'BLOCKER') {
        entityToPickup = ant.blockedBy;
      } else if (entityToPickup === 'MARKED') {
        entityToPickup = oneOf(getNeighborhoodEntities(
          ant, game.entities,
        ).filter(e => e.marked > 0));
      } else if (
        entityToPickup === 'DIRT' || entityToPickup === 'FOOD' ||
        entityToPickup === 'EGG' || entityToPickup === 'LARVA' ||
        entityToPickup === 'PUPA' || entityToPickup === 'DEAD_ANT'
      ) {
        entityToPickup = oneOf(getNeighborhoodEntities(
          ant, getEntitiesByType(game, [entityToPickup])
        ));
      } else if (entityToPickup != null && entityToPickup.position != null ) {
        entityToPickup = getNeighborhoodEntities(
          ant, getEntitiesByType(game, config.antPickupEntities)
        ).filter(e => e.id === entityToPickup.id)[0];
      }
      if (entityToPickup == null || entityToPickup.position == null) {
        break;
      }
      if (ant.holding == null) {
        ant.holding = entityToPickup;
        ant.blocked = false;
        ant.blockedBy = null;
        entityToPickup.position = null;
        // reduce mark quantity
        entityToPickup.marked = Math.max(0, entityToPickup.marked - 1);
      }
      break;
    }
    case 'PUTDOWN': {
      let locationToPutdown = object;
      if (locationToPutdown == null) {
        locationToPutdown = {position: ant.position};
      }
      const putDownFree = collidesWith(
        locationToPutdown,
        getEntitiesByType(game, config.antBlockingEntities),
      ).length === 0;
      if (collides(ant, locationToPutdown) && ant.holding != null && putDownFree) {
        ant.holding.position = locationToPutdown.position;
        ant.holding = null;
        // move the ant out of the way
        const freePositions = getEmptyNeighborPositions(
          ant, getEntitiesByType(game, config.antBlockingEntities),
        );
        if (freePositions.length > 0) {
          ant.position = freePositions[0];
        }
      }
      break;
    }
    case 'EAT': {
      let entityToEat = object;
      const neighborFood = getNeighborhoodEntities(
        ant, getEntitiesByType(game, ['FOOD'])
      );
      if (entityToEat == null) {
        entityToEat = oneOf(neighborFood);
      } else if (entityToEat.id != null) {
        entityToEat = neighborFood.filter(f => f.id == entityToEat.id)[0];
      }
      if (entityToEat == null) break;

      const caloriesEaten = Math.min(
        config.antCaloriesPerEat,
        entityToEat.calories,
        config.antMaxCalories - ant.calories,
      );
      ant.calories += caloriesEaten;
      entityToEat.calories -= caloriesEaten;
      // remove the food item if it has no more calories
      if (entityToEat.calories <= 0) {
        delete game.entities[entityToEat.id];
        game.food = deleteFromArray(game.food, entityToEat.id);
      }
      break;
    }
    case 'FEED': {
      const feedableEntities = getNeighborhoodEntities(
        ant, getEntitiesByType(game, ['ANT', 'LARVA']),
      );
      if (
        ant.holding != null && ant.holding.type === 'FOOD' &&
        feedableEntities.length > 0
      ) {
        // prefer to feed larva if possible
        let fedEntity = oneOf(feedableEntities);
        for (const e of feedableEntities) {
          if (e.type === 'LARVA') {
            fedEntity = e;
            break;
          }
        }
        fedEntity.calories += ant.holding.calories;
        delete game.entities[ant.holding.id];
        game.food = deleteFromArray(game.food, ant.holding.id);
        ant.holding = null;
      }
      break;
    }
    case 'MARK': {
      // TODO
      break;
    }
    case 'LAY': {
      if (ant.subType != 'QUEEN') {
        break; // only queen lays eggs
      }
      const nothingInTheWay = collidesWith(
        ant,
        getEntitiesByType(game, config.antBlockingEntities),
      ).length === 0;
      const dirtBelow = collidesWith(
        {position: {x: ant.position.x, y: ant.position.y - 1}},
        getEntitiesByType(game, ['DIRT']),
      ).length > 0;
      if (nothingInTheWay && dirtBelow) {
        const egg = makeEgg(ant.position, 'WORKER'); // TODO
        game.entities[egg.id] = egg;
        game.eggs.push(egg.id);
        // move the ant out of the way
        const freePositions = getEmptyNeighborPositions(
          ant, getEntitiesByType(game, config.antBlockingEntities),
        );
        if (freePositions.length > 0) {
          ant.position = freePositions[0];
        }
      }
      break;
    }
    case 'COMMUNICATE': {
      // TODO
      break;
    }
  }

};

module.exports = {tickReducer};
