'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../utils/vectors'),
    add = _require.add,
    equals = _require.equals,
    subtract = _require.subtract,
    distance = _require.distance;

var _require2 = require('../config'),
    config = _require2.config;

var sin = Math.sin,
    cos = Math.cos,
    abs = Math.abs,
    sqrt = Math.sqrt;

var _require3 = require('./gameReducer'),
    gameReducer = _require3.gameReducer;

var _require4 = require('../utils/errors'),
    invariant = _require4.invariant;

var _require5 = require('../utils/helpers'),
    randomIn = _require5.randomIn,
    normalIn = _require5.normalIn,
    oneOf = _require5.oneOf,
    deleteFromArray = _require5.deleteFromArray;

var _require6 = require('../selectors/selectors'),
    collides = _require6.collides,
    collidesWith = _require6.collidesWith,
    getNeighborhoodLocation = _require6.getNeighborhoodLocation,
    getNeighborhoodEntities = _require6.getNeighborhoodEntities,
    getEmptyNeighborPositions = _require6.getEmptyNeighborPositions,
    getEntitiesByType = _require6.getEntitiesByType;

var tickReducer = function tickReducer(game, action) {
  switch (action.type) {
    case 'START_TICK':
      if (game.game != null && game.game.tickInterval != null) {
        return game;
      }
      return _extends({}, game, {
        tickInterval: setInterval(
        // HACK: store is only available via window
        function () {
          return store.dispatch({ type: 'TICK' });
        }, config.msPerTick)
      });
    case 'STOP_TICK':
      clearInterval(game.tickInterval);
      game.tickInterval = null;
      return game;
    case 'TICK':
      return handleTick(game);
  }
  return game;
};

var handleTick = function handleTick(game) {
  // update ants
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = game.ants[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var id = _step.value;

      var ant = game.entities[id];
      if (!ant.alive) {
        continue;
      }
      ant.age += 1;
      performTask(game, ant);

      ant.calories -= 1;
      // ant starvation
      if (ant.calories <= 0) {
        ant.alive = false;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  game.time += 1;
  return game;
};

// Update the world based on the ant (attempting) performing its task.
// In place.
var performTask = function performTask(game, ant) {
  if (ant.task == null) {
    return;
  }
  var task = ant.task,
      taskIndex = ant.taskIndex;

  if (taskIndex >= task.behaviorQueue.length) {
    return; // ran off the end of the behavior queue
  }
  var behavior = task.behaviorQueue[taskIndex];
  var done = performBehavior(game, ant, behavior);

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
var performBehavior = function performBehavior(game, ant, behavior) {
  var done = false;
  switch (behavior.type) {
    case 'DO_ACTION':
      {
        performAction(game, ant, behavior.action);
        done = true;
        break;
      }
    case 'CONDITIONAL':
      {
        var childBehavior = behavior.behavior;
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
    case 'DO_WHILE':
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

var evaluateCondition = function evaluateCondition(game, ant, condition) {
  var isTrue = false;
  var not = condition.not,
      comparator = condition.comparator,
      payload = condition.payload;
  var object = payload.object;

  switch (condition.type) {
    case 'LOCATION':
      {
        // comparator must be EQUALS
        // ant is considered to be at a location if it is within its boundingRect
        isTrue = collides(ant, object);
        break;
      }
    case 'HOLDING':
      {
        if (object === 'ANYTHING' && ant.holding != null && ant.holding.type != null) {
          isTrue = true;
        } else if (object === 'NOTHING' && (ant.holding == null || ant.holding.type == null)) {
          isTrue = true;
        } else {
          isTrue = ant.holding == null && object == null || ant.holding.type == object; // object is the held type
        }
        break;
      }
    case 'NEIGHBORING':
      {
        // comparator must be EQUALS
        var neighbors = getNeighborhoodEntities(ant, game.entities, 1 /* radius */
        );
        if (object === 'ANYTHING') {
          isTrue = neighbors.length > 0;
        } else if (object === 'NOTHING') {
          isTrue = neighbors.length === 0;
        } else if (object === 'MARKED') {
          isTrue = neighbors.filter(function (n) {
            return n.marked > 0;
          }).length > 0;
        }
        break;
      }
    case 'RANDOM':
      {
        var value = object;
        var rand = Math.random();
        if (comparator === 'EQUALS') {
          isTrue = rand == value;
        } else if (comparator === 'LESS_THAN') {
          isTrue = rand < value;
        } else if (comparator === 'GREATER_THAN') {
          isTrue = rand > value;
        }
        break;
      }
    case 'BLOCKED':
      {
        // comparator must be EQUALS
        isTrue = ant.blocked;
        break;
      }
    case 'CALORIES':
      {
        var _value = object;
        var antCalories = ant.calories;
        if (comparator === 'EQUALS') {
          isTrue = antCalories == _value;
        } else if (comparator === 'LESS_THAN') {
          isTrue = antCalories < _value;
        } else if (comparator === 'GREATER_THAN') {
          isTrue = antCalories > _value;
        }
        break;
      }
    case 'AGE':
      {
        var _value2 = object;
        var antAge = ant.age;
        if (comparator === 'EQUALS') {
          isTrue = antAge == _value2;
        } else if (comparator === 'LESS_THAN') {
          isTrue = antAge < _value2;
        } else if (comparator === 'GREATER_THAN') {
          isTrue = antAge > _value2;
        }
        break;
      }
  }

  return not ? !isTrue : isTrue;
};

var performAction = function performAction(game, ant, action) {
  var payload = action.payload;
  var object = payload.object;

  switch (action.type) {
    case 'MOVE':
      {
        var loc = object;
        if (object === 'RANDOM') {
          // randomly select loc based on free neighbors
          var freePositions = getEmptyNeighborPositions(ant, getEntitiesByType(game, 'DIRT'));
          if (freePositions.length == 0) {
            break; // can't move
          }
          // don't select previous position
          freePositions = freePositions.filter(function (pos) {
            return pos.x != ant.prevPosition.x || pos.y != ant.prevPosition.y;
          });
          if (freePositions.length == 0) {
            // then previous position was removed, so fall back to it
            loc = { position: ant.prevPosition };
          } else {
            // don't cross colonyEntrance boundary
            var colEnt = game.entities[config.colonyEntrance].position;
            freePositions = freePositions.filter(function (pos) {
              return !equals(pos, colEnt);
            });
            if (freePositions.length == 0) {
              // fall back to previous position
              loc = { position: ant.prevPosition };
            }
            loc = { position: oneOf(freePositions) };
          }
        }
        var distVec = subtract(loc.position, ant.position);
        var moveVec = { x: 0, y: 0 };
        var moveAxis = 'y';
        // different policies for choosing move direction
        // if (Math.abs(distVec.x) > Math.abs(distVec.y)) {
        if (distVec.y == 0 || distVec.x !== 0 && Math.random() < 0.5) {
          moveAxis = 'x';
        }
        moveVec[moveAxis] += distVec[moveAxis] > 0 ? 1 : -1;
        var nextPos = add(moveVec, ant.position);
        var occupied = collidesWith({ position: nextPos, width: 1, height: 1 }, getEntitiesByType(game, 'DIRT'));
        if (occupied.length == 0) {
          ant.prevPosition = ant.position;
          ant.position = nextPos;
        } else {
          // else try moving along the other axis
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
          occupied = collidesWith({ position: nextPos, width: 1, height: 1 }, getEntitiesByType(game, 'DIRT'));
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
    case 'PICKUP':
      {
        var entityToPickup = object;
        if (entityToPickup === 'BLOCKER') {
          entityToPickup = ant.blockedBy;
          ant.blocked = false;
          ant.blockedBy = null;
        } else if (entityToPickup === 'MARKED') {
          var markedNeighbors = getNeighborhoodEntities(ant, game.entities, 1 /* radius */
          ).filter(function (e) {
            return e.marked > 0;
          });
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
        var neighborhood = getNeighborhoodLocation(entityToPickup);
        if (collides(ant, neighborhood) && ant.holding == null) {
          ant.holding = entityToPickup;
          entityToPickup.position = null;
          // reduce mark quantity
          entityToPickup.marked = Math.max(0, entityToPickup.marked - 1);
        }
        break;
      }
    case 'PUTDOWN':
      {
        var locationToPutdown = object;
        if (locationToPutdown == null) {
          locationToPutdown = { position: ant.position };
        }
        var _neighborhood = getNeighborhoodLocation(locationToPutdown);
        var putDown = collidesWith(locationToPutdown, getEntitiesByType(game, 'DIRT'));
        if (collides(ant, _neighborhood) && ant.holding != null && putDown.length == 0) {
          ant.holding.position = locationToPutdown.position;
          ant.holding = null;
          // move the ant out of the way
          var _freePositions = getEmptyNeighborPositions(ant, getEntitiesByType(game, 'DIRT'));
          if (_freePositions.length > 0) {
            ant.position = _freePositions[0];
          }
        }
        break;
      }
    case 'EAT':
      {
        // TODO: very similar to PICKUP
        var entityToEat = object;
        if (entityToEat == null) {
          break;
        }
        var _neighborhood2 = getNeighborhoodLocation(entityToEat);
        if (collides(ant, _neighborhood2)) {
          var caloriesEaten = Math.max(config.antCaloriesPerEat, entityToEat.calories);
          ant.calories += caloriesEaten;
          entityToEat.calories -= caloriesEaten;
          // remove the food item if it has no more calories
          if (entityToEat.calories <= 0) {
            delete game.entities[entityToEat.id];
            game.food = deleteFromArray(game.food, entityToEat.id);
          }
        }
        break;
      }
    case 'FEED':
      {
        // TODO
        break;
      }
    case 'MARK':
      {
        // TODO
        break;
      }
    case 'LAY':
      {
        // TODO
        break;
      }
    case 'COMMUNICATE':
      {
        // TODO
        break;
      }
  }
};

module.exports = { tickReducer: tickReducer };