// @flow

const {add, equals, subtract, distance} = require('../utils/vectors');
const {config} = require('../config');
const {sin, cos, abs, sqrt} = Math;
const {gameReducer} = require('./gameReducer');
const {invariant} = require('../utils/errors');
const {
  randomIn,
  normalIn,
  oneOf,
} = require('../utils/helpers');
const {
  collides,
  collidesWith,
  getNeighborhoodLocation,
  getNeighborhoodEntities,
  getEmptyNeighborPositions,
  getEntitiesByType,
} = require('../selectors/selectors');

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

const handleTick = (game: GameState): GameState => {
  // update ants
  for (const id of game.ants) {
    const ant = game.entities[id];
    ant.age += 1;
    performTask(game, ant);
  }

  game.time += 1;
  return game;
}

// Update the world based on the ant (attempting) performing its task.
// In place.
const performTask = (game: GameState, ant: Ant): void => {
  if (ant.task == null) {
    return;
  }
  const {task, taskIndex} = ant;
  if (taskIndex >= task.behaviorQueue.length) {
    return; // ran off the end of the behavior queue
  }
  const behavior = task.behaviorQueue[taskIndex];
  const done = performBehavior(game, ant, behavior);

  // if the behavior is done, advance the task index
  if (done) {
    ant.taskIndex += 1;
    if (task.repeating) {
      ant.taskIndex = ant.taskIndex % task.behaviorQueue.length;
    }
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
    case 'CONDITIONAL': {
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
    case 'DO_WHILE': {
      const childBehavior = behavior.behavior;
      if (evaluateCondition(game, ant, behavior.condition)) {
        performBehavior(game, ant, childBehavior);
      } else {
        done = true;
      }
      break;
    }
    case 'SWITCH_TASK': {
      ant.task = behavior.task(game);
      // TODO: this sucks. done doesn't always propagate up particularly if
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
      isTrue = collides(ant, object);
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
      }
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
    case 'BLOCKED': {
      // comparator must be EQUALS
      isTrue = ant.blocked;
    }
    case 'HUNGER': {
      // TODO
      break;
    }
    case 'AGE': {
      // TODO
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
    case 'MOVE': {
      let loc = object;
      if (object === 'RANDOM') {
        // randomly select loc based on free neighbors
        let freePositions = getEmptyNeighborPositions(
          ant, getEntitiesByType(game, 'DIRT'),
        );
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
      let occupied = collidesWith(
        {position: nextPos, width: 1, height: 1},
          getEntitiesByType(game, 'DIRT'),
      );
      if (occupied.length == 0) {
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
        occupied = collidesWith(
          {position: nextPos, width: 1, height: 1},
          getEntitiesByType(game, 'DIRT'),
        );
        if (occupied.length == 0) {
          ant.position = nextPos;
          ant.blocked = false;
          ant.blockedBy = null;
        } else {
          ant.blocked = true;
          ant.blockedBy = occupied[0];
        }
      }
      break;
    }
    case 'PICKUP': {
      let entityToPickup = object;
      if (entityToPickup === 'BLOCKER') {
        entityToPickup = ant.blockedBy;
        ant.blocked = false;
        ant.blockedBy = null;
      } else if (entityToPickup === 'MARKED') {
        const markedNeighbors = getNeighborhoodEntities(
          ant, game.entities, 1 /* radius */
        ).filter(e => e.marked > 0);
        if (markedNeighbors.length > 0) {
          entityToPickup = oneOf(markedNeighbors);
          ant.blocked = false;
          ant.blockedBy = null;
        } else {
          entityToPickup = null;
        }
      }
      if (entityToPickup == null) {
        break;
      }
      const neighborhood = getNeighborhoodLocation(entityToPickup);
      if (collides(ant, neighborhood) && ant.holding == null) {
        ant.holding = entityToPickup;
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
      const neighborhood = getNeighborhoodLocation(locationToPutdown);
      const putDown = collidesWith(
        locationToPutdown,
        getEntitiesByType(game, 'DIRT'),
      );
      if (collides(ant, neighborhood) && ant.holding != null && putDown.length == 0) {
        ant.holding.position = locationToPutdown.position;
        ant.holding = null;
        // move the ant out of the way
        const freePositions = getEmptyNeighborPositions(
          ant, getEntitiesByType(game, 'DIRT'),
        );
        if (freePositions.length > 0) {
          ant.position = freePositions[0];
        }
      }
      break;
    }
    // TODO: implement rest of actions
  }

};

module.exports = {tickReducer};
