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

var _require4 = require('../state/tasks'),
    createIdleTask = _require4.createIdleTask;

var _require5 = require('../utils/errors'),
    invariant = _require5.invariant;

var _require6 = require('../utils/helpers'),
    randomIn = _require6.randomIn,
    normalIn = _require6.normalIn,
    oneOf = _require6.oneOf,
    deleteFromArray = _require6.deleteFromArray;

var _require7 = require('../selectors/selectors'),
    collides = _require7.collides,
    collidesWith = _require7.collidesWith,
    getNeighborhoodEntities = _require7.getNeighborhoodEntities,
    getEmptyNeighborPositions = _require7.getEmptyNeighborPositions,
    getEntitiesByType = _require7.getEntitiesByType,
    insideWorld = _require7.insideWorld;

var _require8 = require('../entities/egg'),
    makeEgg = _require8.makeEgg;

var _require9 = require('../entities/larva'),
    makeLarva = _require9.makeLarva;

var _require10 = require('../entities/pupa'),
    makePupa = _require10.makePupa;

var _require11 = require('../entities/ant'),
    makeAnt = _require11.makeAnt;

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

    // update eggs
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    var _loop = function _loop() {
      var id = _step2.value;

      var egg = game.entities[id];
      egg.age += 1;
      if (egg.age > config.eggHatchAge) {
        game.entities[id] = _extends({}, makeLarva(egg.position, egg.subType), { id: id });
        game.larva.push(id);
        game.eggs = game.eggs.filter(function (e) {
          return e != id;
        });
      }
    };

    for (var _iterator2 = game.eggs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      _loop();
    }

    // update larva
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    var _loop2 = function _loop2() {
      var id = _step3.value;

      var larva = game.entities[id];
      larva.age += 1;
      if (!larva.alive) {
        return 'continue';
      }

      larva.calories -= 1;
      // larva starvation
      if (larva.calories <= 0) {
        larva.alive = false;
        return 'continue';
      }

      if (larva.calories >= config.larvaEndCalories) {
        game.entities[id] = _extends({}, makePupa(larva.position, larva.subType), { id: id });
        game.pupa.push(id);
        game.larva = game.larva.filter(function (e) {
          return e != id;
        });
      }
    };

    for (var _iterator3 = game.larva[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _ret2 = _loop2();

      if (_ret2 === 'continue') continue;
    }

    // update pupa
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    var _loop3 = function _loop3() {
      var id = _step4.value;

      var pupa = game.entities[id];
      pupa.age += 1;
      if (pupa.age > config.pupaHatchAge) {
        game.entities[id] = _extends({}, makeAnt(pupa.position, pupa.subType), { id: id });
        game.ants.push(id);
        game.pupa = game.pupa.filter(function (e) {
          return e != id;
        });
      }
    };

    for (var _iterator4 = game.pupa[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      _loop3();
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
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
  // if ran off the end of the behavior queue, switch to idle task

  if (taskIndex >= task.behaviorQueue.length) {
    ant.taskIndex = 0;
    ant.task = createIdleTask();
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
    case 'IF':
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
        ant.task = game.tasks.filter(function (t) {
          return t.name === behavior.task;
        })[0];
        // HACK: this sucks. done doesn't always propagate up particularly if
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
        } else if (object != null && object.id !== null) {
          isTrue = neighbors.filter(function (n) {
            return n.id === object.id;
          }).length > 0;
        }
        break;
      }
    case 'BLOCKED':
      {
        // comparator must be EQUALS
        isTrue = ant.blocked;
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
        // TODO: age, calories, random are very similar
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
    case 'IDLE':
      {
        // unstack, similar to moving out of the way of placed dirt
        var stackedAnts = collidesWith(ant, getEntitiesByType(game, ['ANT'])).filter(function (a) {
          return a.id != ant.id;
        });
        if (stackedAnts.length > 0) {
          var freePositions = getEmptyNeighborPositions(ant, getEntitiesByType(game, config.antBlockingEntities));
          if (freePositions.length > 0) {
            ant.position = oneOf(freePositions);
          }
        }
        break;
      }
    case 'MOVE':
      {
        var loc = object;
        if (object === 'RANDOM') {
          // randomly select loc based on free neighbors
          var _freePositions = getEmptyNeighborPositions(ant, getEntitiesByType(game, config.antBlockingEntities)).filter(insideWorld);
          if (_freePositions.length == 0) {
            break; // can't move
          }
          // don't select previous position
          _freePositions = _freePositions.filter(function (pos) {
            return pos.x != ant.prevPosition.x || pos.y != ant.prevPosition.y;
          });
          if (_freePositions.length == 0) {
            // then previous position was removed, so fall back to it
            loc = { position: ant.prevPosition };
          } else {
            // don't cross colonyEntrance boundary
            var colEnt = game.entities[config.colonyEntrance].position;
            _freePositions = _freePositions.filter(function (pos) {
              return !equals(pos, colEnt);
            });
            if (_freePositions.length == 0) {
              // fall back to previous position
              loc = { position: ant.prevPosition };
            }
            loc = { position: oneOf(_freePositions) };
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
        var occupied = collidesWith({ position: nextPos, width: 1, height: 1 }, getEntitiesByType(game, config.antBlockingEntities));
        if (occupied.length == 0 && insideWorld(nextPos)) {
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
          occupied = collidesWith({ position: nextPos, width: 1, height: 1 }, getEntitiesByType(game, config.antBlockingEntities));
          if (occupied.length == 0 && insideWorld(nextPos)) {
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
    case 'PICKUP':
      {
        var entityToPickup = object;
        if (entityToPickup === 'BLOCKER') {
          entityToPickup = ant.blockedBy;
        } else if (entityToPickup === 'MARKED') {
          entityToPickup = oneOf(getNeighborhoodEntities(ant, game.entities).filter(function (e) {
            return e.marked > 0;
          }));
        } else if (entityToPickup === 'DIRT' || entityToPickup === 'FOOD' || entityToPickup === 'EGG' || entityToPickup === 'LARVA' || entityToPickup === 'PUPA' || entityToPickup === 'DEAD_ANT') {
          entityToPickup = oneOf(getNeighborhoodEntities(ant, getEntitiesByType(game, [entityToPickup])));
        } else if (entityToPickup != null && entityToPickup.position != null) {
          entityToPickup = getNeighborhoodEntities(ant, getEntitiesByType(game, config.antPickupEntities)).filter(function (e) {
            return e.id === entityToPickup.id;
          })[0];
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
    case 'PUTDOWN':
      {
        var locationToPutdown = object;
        if (locationToPutdown == null) {
          locationToPutdown = { position: ant.position };
        }
        var putDownFree = collidesWith(locationToPutdown, getEntitiesByType(game, config.antBlockingEntities)).length === 0;
        if (collides(ant, locationToPutdown) && ant.holding != null && putDownFree) {
          ant.holding.position = locationToPutdown.position;
          ant.holding = null;
          // move the ant out of the way
          var _freePositions2 = getEmptyNeighborPositions(ant, getEntitiesByType(game, config.antBlockingEntities));
          if (_freePositions2.length > 0) {
            ant.position = _freePositions2[0];
          }
        }
        break;
      }
    case 'EAT':
      {
        var entityToEat = object;
        var neighborFood = getNeighborhoodEntities(ant, getEntitiesByType(game, ['FOOD']));
        if (entityToEat == null) {
          entityToEat = oneOf(neighborFood);
        } else if (entityToEat.id != null) {
          entityToEat = neighborFood.filter(function (f) {
            return f.id == entityToEat.id;
          })[0];
        }
        if (entityToEat == null) break;

        var caloriesEaten = Math.min(config.antCaloriesPerEat, entityToEat.calories);
        ant.calories += caloriesEaten;
        entityToEat.calories -= caloriesEaten;
        // remove the food item if it has no more calories
        if (entityToEat.calories <= 0) {
          delete game.entities[entityToEat.id];
          game.food = deleteFromArray(game.food, entityToEat.id);
        }
        break;
      }
    case 'FEED':
      {
        var feedableEntities = getNeighborhoodEntities(ant, getEntitiesByType(game, ['ANT', 'LARVA']));
        if (ant.holding != null && ant.holding.type === 'FOOD' && feedableEntities.length > 0) {
          // prefer to feed larva if possible
          var fedEntity = oneOf(feedableEntities);
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = feedableEntities[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var e = _step5.value;

              if (e.type === 'LARVA') {
                fedEntity = e;
                break;
              }
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          fedEntity.calories += ant.holding.calories;
          delete game.entities[ant.holding.id];
          game.food = deleteFromArray(game.food, ant.holding.id);
          ant.holding = null;
        }
        break;
      }
    case 'MARK':
      {
        // TODO
        break;
      }
    case 'LAY':
      {
        if (ant.subType != 'QUEEN') {
          break; // only queen lays eggs
        }
        var nothingInTheWay = collidesWith(ant, getEntitiesByType(game, config.antBlockingEntities)).length === 0;
        var dirtBelow = collidesWith({ position: { x: ant.position.x, y: ant.position.y - 1 } }, getEntitiesByType(game, ['DIRT'])).length > 0;
        if (nothingInTheWay && dirtBelow) {
          var _egg = makeEgg(ant.position, 'WORKER'); // TODO
          game.entities[_egg.id] = _egg;
          game.eggs.push(_egg.id);
          // move the ant out of the way
          var _freePositions3 = getEmptyNeighborPositions(ant, getEntitiesByType(game, config.antBlockingEntities));
          if (_freePositions3.length > 0) {
            ant.position = _freePositions3[0];
          }
        }
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