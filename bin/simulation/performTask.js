'use strict';

var _require = require('../utils/vectors'),
    add = _require.add,
    equals = _require.equals,
    subtract = _require.subtract,
    distance = _require.distance,
    makeVector = _require.makeVector,
    vectorTheta = _require.vectorTheta;

var _require2 = require('../config'),
    config = _require2.config;

var sin = Math.sin,
    cos = Math.cos,
    abs = Math.abs,
    sqrt = Math.sqrt;

var _require3 = require('../state/tasks'),
    createIdleTask = _require3.createIdleTask,
    createGoToLocationBehavior = _require3.createGoToLocationBehavior;

var _require4 = require('../utils/errors'),
    invariant = _require4.invariant;

var _require5 = require('../utils/helpers'),
    randomIn = _require5.randomIn,
    normalIn = _require5.normalIn,
    oneOf = _require5.oneOf,
    deleteFromArray = _require5.deleteFromArray;

var _require6 = require('../utils/stateHelpers'),
    insertInGrid = _require6.insertInGrid,
    deleteFromGrid = _require6.deleteFromGrid,
    lookupInGrid = _require6.lookupInGrid,
    addEntity = _require6.addEntity,
    removeEntity = _require6.removeEntity,
    moveEntity = _require6.moveEntity,
    changeEntityType = _require6.changeEntityType,
    pickUpEntity = _require6.pickUpEntity,
    putDownEntity = _require6.putDownEntity,
    maybeMoveEntity = _require6.maybeMoveEntity;

var _require7 = require('../selectors/selectors'),
    fastCollidesWith = _require7.fastCollidesWith,
    fastGetEmptyNeighborPositions = _require7.fastGetEmptyNeighborPositions,
    fastGetNeighbors = _require7.fastGetNeighbors,
    collides = _require7.collides,
    getEntitiesByType = _require7.getEntitiesByType,
    filterEntitiesByType = _require7.filterEntitiesByType,
    insideWorld = _require7.insideWorld,
    getEntitiesInRadius = _require7.getEntitiesInRadius;

var _require8 = require('../simulation/doAction'),
    doAction = _require8.doAction,
    doHighLevelAction = _require8.doHighLevelAction;

var _require9 = require('../simulation/evaluateCondition'),
    evaluateCondition = _require9.evaluateCondition;

///////////////////////////////////////////////////////////////////////////////
// PERFORM TASK
///////////////////////////////////////////////////////////////////////////////
// Update the world based on the ant (attempting) performing its task.
// In place.
var performTask = function performTask(game, ant) {
  if (ant.task == null) {
    return;
  }
  var task = ant.task,
      taskIndex = ant.taskIndex;
  // if run off the end of the behavior queue, then repeat or pop back to parent

  if (taskIndex >= task.behaviorQueue.length) {
    if (task.repeating) {
      ant.taskIndex = 0;
    } else {
      var parentTask = ant.taskStack.pop();
      if (parentTask == null) {
        ant.taskIndex = 0;
        ant.task = createIdleTask();
      } else {
        ant.taskIndex = parentTask.index;
        ant.task = game.tasks.filter(function (t) {
          return t.name === parentTask.name;
        })[0];
      }
    }
    return;
  }
  var behavior = task.behaviorQueue[taskIndex];
  var done = performBehavior(game, ant, behavior);

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
var performBehavior = function performBehavior(game, ant, behavior) {
  var done = false;
  switch (behavior.type) {
    case 'DO_ACTION':
      {
        doAction(game, ant, behavior.action);
        done = true;
        break;
      }
    case 'IF':
      {
        var childBehavior = behavior.behavior;
        if (evaluateCondition(game, ant, behavior.condition)) {
          done = performBehavior(game, ant, childBehavior);
        } else if (behavior.elseBehavior != null) {
          done = performBehavior(game, ant, behavior.elseBehavior);
        }
        break;
      }
    case 'WHILE':
      {
        var _childBehavior = behavior.behavior;
        if (evaluateCondition(game, ant, behavior.condition)) {
          performBehavior(game, ant, _childBehavior);
        } else {
          done = true;
        }
        break;
      }
    case 'SWITCH_TASK':
      {
        var parentTask = ant.task;
        ant.task = game.tasks.filter(function (t) {
          return t.name === behavior.task;
        })[0];
        ant.taskStack.push({
          name: parentTask.name,
          index: ant.taskIndex
        });
        // HACK: this sucks. done doesn't always propagate up particularly if
        // you switch tasks from inside a do-while
        ant.taskIndex = -1; // it's about to +1 in performTask
        done = true;
        break;
      }
    case 'DO_HIGH_LEVEL_ACTION':
      {
        done = doHighLevelAction(game, ant, behavior.action);
        break;
      }
  }
  return done;
};

module.exports = { performTask: performTask };