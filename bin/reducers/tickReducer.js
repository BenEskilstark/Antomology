'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _require7 = require('../utils/stateHelpers'),
    insertInGrid = _require7.insertInGrid,
    deleteFromGrid = _require7.deleteFromGrid,
    lookupInGrid = _require7.lookupInGrid,
    addEntity = _require7.addEntity,
    removeEntity = _require7.removeEntity,
    moveEntity = _require7.moveEntity,
    changeEntityType = _require7.changeEntityType;

var _require8 = require('../selectors/selectors'),
    fastCollidesWith = _require8.fastCollidesWith,
    fastGetEmptyNeighborPositions = _require8.fastGetEmptyNeighborPositions,
    fastGetNeighbors = _require8.fastGetNeighbors,
    collides = _require8.collides,
    getEntitiesByType = _require8.getEntitiesByType,
    filterEntitiesByType = _require8.filterEntitiesByType,
    insideWorld = _require8.insideWorld;

var _require9 = require('../entities/egg'),
    makeEgg = _require9.makeEgg;

var _require10 = require('../entities/larva'),
    makeLarva = _require10.makeLarva;

var _require11 = require('../entities/pupa'),
    makePupa = _require11.makePupa;

var _require12 = require('../entities/ant'),
    makeAnt = _require12.makeAnt;

var tickReducer = function tickReducer(game, action) {
  switch (action.type) {
    case 'START_TICK':
      if (game != null && game.tickInterval != null) {
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

var totalTime = 0;

var handleTick = function handleTick(game) {
  // const startTime = performance.now();
  // update ants
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = game.ANT[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
    for (var _iterator2 = game.EGG[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _id = _step2.value;

      var egg = game.entities[_id];
      egg.age += 1;
      if (egg.age > config.eggHatchAge) {
        game.entities[_id] = _extends({}, makeLarva(egg.position, egg.subType), { id: _id });
        changeEntityType(game, game.entities[_id], 'EGG', 'LARVA');
      }
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
    for (var _iterator3 = game.LARVA[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _id2 = _step3.value;

      var larva = game.entities[_id2];
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
        game.entities[_id2] = _extends({}, makePupa(larva.position, larva.subType), { id: _id2 });
        changeEntityType(game, game.entities[_id2], 'LARVA', 'PUPA');
      }
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
    for (var _iterator4 = game.PUPA[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _id3 = _step4.value;

      var pupa = game.entities[_id3];
      pupa.age += 1;
      if (pupa.age > config.pupaHatchAge) {
        game.entities[_id3] = _extends({}, makeAnt(pupa.position, pupa.subType), { id: _id3 });
        changeEntityType(game, game.entities[_id3], 'PUPA', 'ANT');
      }
    }

    // update pheromones
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

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = game.PHEROMONE[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _id4 = _step5.value;

      var pheromone = game.entities[_id4];
      pheromone.quantity -= 1;
      var antsHere = lookupInGrid(game.grid, pheromone.position).map(function (i) {
        return game.entities[i];
      }).filter(function (e) {
        return e.type === 'ANT';
      }).length > 0;
      if (antsHere) {
        pheromone.quantity += 1;
      } else {
        pheromone.quantity -= 1;
      }
      if (pheromone.quantity <= 0) {
        removeEntity(game, pheromone);
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

  game.time += 1;

  // const time = performance.now() - startTime;
  // totalTime += time;
  // if (game.time % 10 === 0) {
  //   console.log(time.toFixed(3), 'avg', (totalTime / game.time).toFixed(3));
  // }

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
        ant.taskIndex = parentTask.index + 1;
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
        var loc = object;
        if (typeof loc === 'string') {
          loc = getEntitiesByType(game, ['LOCATION']).filter(function (l) {
            return l.name === loc;
          })[0];
        }
        isTrue = collides(ant, loc);
        break;
      }
    case 'HOLDING':
      {
        if (object === 'ANYTHING' && ant.holding != null && ant.holding.type != null) {
          isTrue = true;
        } else if (object === 'NOTHING' && (ant.holding == null || ant.holding.type == null)) {
          isTrue = true;
        } else if (object === 'DIRT' || object === 'FOOD' || object === 'EGG' || object === 'LARVA' || object === 'PUPA' || object === 'DEAD_ANT') {
          isTrue = ant.holding != null && ant.holding.type == object;
        } else {
          isTrue = ant.holding == null && object == null || ant.holding.type == object; // object is the held type
        }
        break;
      }
    case 'NEIGHBORING':
      {
        // comparator must be EQUALS
        var neighbors = fastGetNeighbors(game, ant);
        if (object === 'ANYTHING') {
          isTrue = neighbors.length > 0;
        } else if (object === 'NOTHING') {
          isTrue = neighbors.length === 0;
        } else if (object === 'MARKED_DIRT') {
          var pheromoneNeighbors = neighbors.filter(function (e) {
            return e.type === 'PHEROMONE';
          });
          var dirtNeighbors = neighbors.filter(function (e) {
            return e.type === 'DIRT';
          });
          isTrue = false;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = dirtNeighbors[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var dirt = _step6.value;
              var _iteratorNormalCompletion7 = true;
              var _didIteratorError7 = false;
              var _iteratorError7 = undefined;

              try {
                for (var _iterator7 = pheromoneNeighbors[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                  var pheromone = _step7.value;

                  if (equals(dirt.position, pheromone.position)) {
                    isTrue = true;
                  }
                }
              } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion7 && _iterator7.return) {
                    _iterator7.return();
                  }
                } finally {
                  if (_didIteratorError7) {
                    throw _iteratorError7;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        } else if (object === 'DIRT' || object === 'FOOD' || object === 'EGG' || object === 'LARVA' || object === 'PUPA' || object === 'DEAD_ANT' || object === 'TRAIL') {
          var typeName = object;
          if (object === 'TRAIL') {
            typeName = 'PHEROMONE';
          }
          isTrue = neighbors.filter(function (n) {
            return n.type === typeName;
          }).length > 0;
        } else if (object != null && object.id != null) {
          isTrue = neighbors.filter(function (n) {
            return n.id === object.id;
          }).length > 0;
        } else if (typeof object === 'string') {
          isTrue = neighbors.filter(function (l) {
            return l.name === object;
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
        var stackedAnts = fastCollidesWith(game, ant).filter(function (e) {
          return config.antBlockingEntities.includes(e.type) || e.type == 'ANT';
        });
        if (stackedAnts.length > 0) {
          var freePositions = fastGetEmptyNeighborPositions(game, ant, config.antBlockingEntities);
          if (freePositions.length > 0) {
            moveEntity(game, ant, oneOf(freePositions));
          }
        } else {
          if (Math.random() < 0.05) {
            var factor = Math.random() < 0.5 ? 1 : -1;
            ant.theta += factor * Math.PI / 2;
          }
        }
        break;
      }
    case 'MOVE':
      {
        var loc = object;
        var obj = object;
        if (obj === 'TRAIL') {
          var pheromone = lookupInGrid(game.grid, ant.position).map(function (id) {
            return game.entities[id];
          }).filter(function (e) {
            return e.type === 'PHEROMONE';
          })[0];
          if (pheromone != null) {
            loc = { position: add(ant.position, makeVector(pheromone.theta, 1)) };
          } else {
            obj = 'RANDOM';
          }
        }
        if (obj === 'RANDOM') {
          // randomly select loc based on free neighbors
          var _freePositions = fastGetEmptyNeighborPositions(game, ant, config.antBlockingEntities).filter(insideWorld);
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
        } else if (obj != 'TRAIL' && typeof obj === 'string') {
          loc = getEntitiesByType(game, ['LOCATION']).filter(function (l) {
            return l.name === obj;
          })[0];
        }
        var distVec = subtract(loc.position, ant.position);
        if (distVec.x == 0 && distVec.y == 0) {
          break; // you're there
        }
        var moveVec = { x: 0, y: 0 };
        var moveAxis = 'y';
        // different policies for choosing move direction
        // if (Math.abs(distVec.x) > Math.abs(distVec.y)) {
        if (distVec.y == 0 || distVec.x !== 0 && Math.random() < 0.5) {
          moveAxis = 'x';
        }
        moveVec[moveAxis] += distVec[moveAxis] > 0 ? 1 : -1;
        var nextPos = add(moveVec, ant.position);
        var occupied = fastCollidesWith(game, { position: nextPos }).filter(function (e) {
          return config.antBlockingEntities.includes(e.type);
        });
        if (occupied.length == 0 && insideWorld(nextPos)) {
          moveEntity(game, ant, nextPos);
          ant.blocked = false;
          ant.blockedBy = null;
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
          occupied = fastCollidesWith(game, { position: nextPos }).filter(function (e) {
            return config.antBlockingEntities.includes(e.type);
          });
          if (occupied.length == 0 && insideWorld(nextPos)) {
            moveEntity(game, ant, nextPos);
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
        } else if (entityToPickup === 'MARKED_DIRT') {
          var neighbors = fastGetNeighbors(game, ant);
          var pheromoneNeighbors = neighbors.filter(function (e) {
            return e.type === 'PHEROMONE';
          });
          var dirtNeighbors = neighbors.filter(function (e) {
            return e.type === 'DIRT';
          });
          var markedDirt = [];
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = dirtNeighbors[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var dirt = _step8.value;
              var _iteratorNormalCompletion9 = true;
              var _didIteratorError9 = false;
              var _iteratorError9 = undefined;

              try {
                for (var _iterator9 = pheromoneNeighbors[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                  var _pheromone = _step9.value;

                  if (equals(dirt.position, _pheromone.position)) {
                    markedDirt.push(dirt);
                  }
                }
              } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion9 && _iterator9.return) {
                    _iterator9.return();
                  }
                } finally {
                  if (_didIteratorError9) {
                    throw _iteratorError9;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          entityToPickup = oneOf(markedDirt);
        } else if (entityToPickup === 'DIRT' || entityToPickup === 'FOOD' || entityToPickup === 'EGG' || entityToPickup === 'LARVA' || entityToPickup === 'PUPA' || entityToPickup === 'DEAD_ANT') {
          entityToPickup = oneOf(fastGetNeighbors(game, ant).filter(function (e) {
            return e.type == entityToPickup;
          }));
        } else if (entityToPickup != null && entityToPickup.position != null) {
          entityToPickup = fastGetNeighbors(game, ant).filter(function (e) {
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
          deleteFromGrid(game.grid, entityToPickup.position, entityToPickup.id);
          entityToPickup.position = null;
        }
        break;
      }
    case 'PUTDOWN':
      {
        var locationToPutdown = object;
        if (locationToPutdown == null) {
          locationToPutdown = { position: ant.position };
        }
        var putDownFree = fastCollidesWith(game, locationToPutdown).filter(function (e) {
          return config.antBlockingEntities.includes(e.type);
        }).length === 0;
        if (collides(ant, locationToPutdown) && ant.holding != null && putDownFree) {
          ant.holding.position = locationToPutdown.position;
          insertInGrid(game.grid, ant.holding.position, ant.holding.id);
          ant.holding = null;
          // move the ant out of the way
          var _freePositions2 = fastGetEmptyNeighborPositions(game, ant, config.antBlockingEntities);
          if (_freePositions2.length > 0) {
            moveEntity(game, ant, _freePositions2[0]);
          }
        }
        break;
      }
    case 'EAT':
      {
        var entityToEat = object;
        var neighborFood = fastGetNeighbors(game, ant).filter(function (e) {
          return e.type === 'FOOD';
        });
        if (entityToEat == null) {
          entityToEat = oneOf(neighborFood);
        } else if (entityToEat.id != null) {
          entityToEat = neighborFood.filter(function (f) {
            return f.id == entityToEat.id;
          })[0];
        }
        if (entityToEat == null) break;

        var caloriesEaten = Math.min(config.antCaloriesPerEat, entityToEat.calories, config.antMaxCalories - ant.calories);
        ant.calories += caloriesEaten;
        entityToEat.calories -= caloriesEaten;
        // remove the food item if it has no more calories
        if (entityToEat.calories <= 0) {
          removeEntity(game, entityToEat);
        }
        break;
      }
    case 'FEED':
      {
        var feedableEntities = fastGetNeighbors(game, ant).filter(function (e) {
          return ['ANT', 'LARVA'].includes(e.type);
        });
        if (ant.holding != null && ant.holding.type === 'FOOD' && feedableEntities.length > 0) {
          // prefer to feed larva if possible
          var fedEntity = oneOf(feedableEntities);
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = feedableEntities[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var e = _step10.value;

              if (e.type === 'LARVA') {
                fedEntity = e;
                break;
              }
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }

          fedEntity.calories += ant.holding.calories;
          removeEntity(game, ant.holding);
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
        var nothingInTheWay = fastCollidesWith(game, ant).filter(function (e) {
          return config.antBlockingEntities.includes(e.type);
        }).length === 0;
        var dirtBelow = lookupInGrid(game.grid, add(ant.position, { x: 0, y: -1 })).filter(function (id) {
          return game.entities[id].type === 'DIRT';
        }).length > 0;
        if (nothingInTheWay && dirtBelow) {
          var egg = makeEgg(ant.position, 'WORKER'); // TODO
          addEntity(game, egg);
          // move the ant out of the way
          var _freePositions3 = fastGetEmptyNeighborPositions(game, ant, config.antBlockingEntities);
          if (_freePositions3.length > 0) {
            moveEntity(game, ant, _freePositions3[0]);
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