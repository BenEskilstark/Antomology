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

var _require8 = require('../entities/egg'),
    makeEgg = _require8.makeEgg;

var _require9 = require('../entities/larva'),
    makeLarva = _require9.makeLarva;

var _require10 = require('../entities/pupa'),
    makePupa = _require10.makePupa;

var _require11 = require('../entities/ant'),
    makeAnt = _require11.makeAnt;

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

///////////////////////////////////////////////////////////////////////////////
// EVALUATE CONDITION
///////////////////////////////////////////////////////////////////////////////
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
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = dirtNeighbors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var dirt = _step.value;
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = pheromoneNeighbors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var pheromone = _step2.value;

                  if (equals(dirt.position, pheromone.position)) {
                    isTrue = true;
                  }
                }
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

///////////////////////////////////////////////////////////////////////////////
// PERFORM ACTION
///////////////////////////////////////////////////////////////////////////////
var performAction = function performAction(game, ant, action) {
  var payload = action.payload;
  var object = payload.object;

  var actionType = action.type;

  // first handle ants that are holding a big entity
  if (ant.holding != null && ant.holding.toLift > 1) {
    var bigEntity = ant.holding;

    // if (bigEntity.toLift > bigEntity.heldBy.length) {
    //   // if the ant is assigned something else to do, drop it
    //   if (action.type !== 'PUTDOWN' && action.type !== 'IDLE') {
    //     putDownEntity(game, ant);
    //   }
    // }
  }

  // then handle the actually-assigned action
  switch (actionType) {
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
          } else {
            ant.calories += 1; // calories don't go down if you fully idle
          }
        }
        ant.prevPosition = _extends({}, ant.position);
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
          var _freePositions = fastGetEmptyNeighborPositions(game, ant, config.antBlockingEntities).filter(function (pos) {
            return insideWorld(game, pos);
          });
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
        var didMove = maybeMoveEntity(game, ant, nextPos);
        if (didMove) {
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
            // TODO block is broken now
            ant.blocked = true;
            // ant.blockedBy = occupied[0];
            break;
          }
          nextPos = add(moveVec, ant.position);
          didMove = maybeMoveEntity(game, ant, nextPos);
          if (didMove) {
            ant.blocked = false;
            ant.blockedBy = null;
          } else {
            // TODO block is broken now
            // } else if (occpied.length > 0) {
            ant.blocked = true;
            // ant.blockedBy = occupied[0];
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
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = dirtNeighbors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var dirt = _step3.value;
              var _iteratorNormalCompletion4 = true;
              var _didIteratorError4 = false;
              var _iteratorError4 = undefined;

              try {
                for (var _iterator4 = pheromoneNeighbors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                  var _pheromone = _step4.value;

                  if (equals(dirt.position, _pheromone.position)) {
                    markedDirt.push(dirt);
                  }
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
            }
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
          pickUpEntity(game, ant, entityToPickup);
          if (entityToPickup.toLift > 1) {
            var _bigEntity = entityToPickup;
            var targetLoc = {
              position: {
                x: Math.round(_bigEntity.position.x + _bigEntity.width / 2),
                y: _bigEntity.lifted ? _bigEntity.position.y - 1 : _bigEntity.position.y
              },
              width: 1,
              height: 1
            };
            ant.taskStack = [];
            ant.taskIndex = -1; // HACK to switch tasks inside a task
            var goToLocationBehavior = createGoToLocationBehavior(targetLoc);
            ant.task = {
              name: 'Picking up ' + _bigEntity.type,
              repeating: false,
              behaviorQueue: [goToLocationBehavior, {
                type: 'SWITCH_TASK',
                task: 'Holding and Idle'
              }]
            };
          }
        }
        break;
      }
    case 'PUTDOWN':
      {
        var locationToPutdown = object;
        if (locationToPutdown == null) {
          locationToPutdown = { position: ant.position, width: 1, height: 1 };
        }
        var putDownFree = fastCollidesWith(game, locationToPutdown).filter(function (e) {
          return config.antBlockingEntities.includes(e.type);
        }).length === 0;
        if (collides(ant, locationToPutdown) && ant.holding != null && putDownFree) {
          putDownEntity(game, ant);
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

module.exports = { performTask: performTask };