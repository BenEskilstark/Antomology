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
const {doAction, doHighLevelAction} = require('../simulation/doAction');
const {evaluateCondition} = require('../simulation/evaluateCondition');

import type {
  GameState, Entity, Action, Ant, Behavior, Condition, Task, AntAction, AntActionType
} from '../types';

///////////////////////////////////////////////////////////////////////////////
// PERFORM TASK
///////////////////////////////////////////////////////////////////////////////
// Update the world based on the ant (attempting) performing its task.
// In place.
const performTask = (game: GameState, ant: Ant): void => {
  if (ant.task == null) {
    return;
  }
  const {task, taskIndex} = ant;
  // if run off the end of the behavior queue, then repeat or pop back to parent
  if (taskIndex >= task.behaviorQueue.length) {
    if (task.repeating) {
      ant.taskIndex = 0;
    } else {
      const parentTask = ant.taskStack.pop();
      if (parentTask == null) {
        ant.taskIndex = 0;
        ant.task = createIdleTask();
      } else {
        ant.taskIndex = parentTask.index;
        ant.task = game.tasks.filter(t => t.name === parentTask.name)[0];
      }
    }
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

///////////////////////////////////////////////////////////////////////////////
// PERFORM BEHAVIOR
///////////////////////////////////////////////////////////////////////////////
// behaviors can be recursive, so use this
const performBehavior = (game: GameState, ant: Ant, behavior: Behavior): boolean => {
  let done = false
  switch (behavior.type) {
    case 'DO_ACTION': {
      doAction(game, ant, behavior.action);
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
      const parentTask = ant.task;
      ant.task = game.tasks.filter(t => t.name === behavior.task)[0];
      ant.taskStack.push({
        name: parentTask.name,
        index: ant.taskIndex,
      });
      // HACK: this sucks. done doesn't always propagate up particularly if
      // you switch tasks from inside a do-while
      ant.taskIndex = -1; // it's about to +1 in performTask
      done = true;
      break;
    }
    case 'HIGH_LEVEL_DO_ACTION': {
      doHighLevelAction(game, ant, behavior.action);
      done = true;
      break;
    }
  }
  return done;
};

module.exports = {performTask};
