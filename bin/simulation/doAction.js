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
    deleteFromArray = _require5.deleteFromArray,
    getInnerLocation = _require5.getInnerLocation;

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
    maybeMoveEntity = _require6.maybeMoveEntity,
    antEatEntity = _require6.antEatEntity,
    antMakePheromone = _require6.antMakePheromone;

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

var doAction = function doAction(game, ant, action) {
  var payload = action.payload;
  var object = payload.object,
      constraint = payload.constraint;

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
        if (obj === 'TRAIL' || obj === 'REVERSE_TRAIL') {
          var pheromone = oneOf(lookupInGrid(game.grid, ant.position).map(function (id) {
            return game.entities[id];
          }).filter(function (e) {
            return e.type === 'PHEROMONE';
          }));
          if (pheromone != null) {
            if (obj === 'REVERSE_TRAIL') {
              var prevPheromone = game.entities[pheromone.prevPheromone];
              if (prevPheromone != null) {
                var diff = subtract(prevPheromone.position, pheromone.position);
                var dir = makeVector(vectorTheta(diff), 1);
                loc = { position: add(ant.position, dir) };
              } else {
                obj = 'RANDOM';
              }
            } else {
              var _dir = makeVector(pheromone.theta, 1);
              loc = { position: add(ant.position, _dir) };
            }
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
          // if required, stay inside location boundary
          if (constraint != null) {
            _freePositions = _freePositions.filter(function (pos) {
              return collides(_extends({}, ant, { position: pos }), constraint);
            });
          }
          loc = { position: oneOf(_freePositions) };
          if (_freePositions.length == 0) {
            // fall back to previous position
            loc = { position: ant.prevPosition };
          }
        } else if (obj != 'TRAIL' && obj != 'REVERSE_TRAIL' && typeof obj === 'string') {
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
          antMakePheromone(game, ant);
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
            // TODO blockedBy requires ants to be 1x1
            ant.blockedBy = lookupInGrid(game.grid, nextPos).map(function (i) {
              return game.entities[i];
            }).filter(function (e) {
              return config.antBlockingEntities.includes(e.type);
            })[0];
            break;
          }
          nextPos = add(moveVec, ant.position);
          didMove = maybeMoveEntity(game, ant, nextPos);
          if (didMove) {
            antMakePheromone(game, ant);
            ant.blocked = false;
            ant.blockedBy = null;
          } else {
            ant.blocked = true;
            // TODO blockedBy requires ants to be 1x1
            ant.blockedBy = lookupInGrid(game.grid, nextPos).map(function (i) {
              return game.entities[i];
            }).filter(function (e) {
              return config.antBlockingEntities.includes(e.type);
            })[0];
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
                  var _pheromone = _step2.value;

                  if (equals(dirt.position, _pheromone.position)) {
                    markedDirt.push(dirt);
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
          return config.antBlockingEntities.includes(e.type) || e.type === 'PHEROMONE';
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
        antEatEntity(game, ant, entityToEat);
        break;
      }
    case 'FEED':
      {
        var typeToFeed = object;
        var feedableEntities = fastGetNeighbors(game, ant).filter(function (e) {
          return ['ANT', 'LARVA'].includes(e.type);
        });
        if (ant.holding != null && ant.holding.type === 'FOOD' && feedableEntities.length > 0) {
          var fedEntity = null;
          if (typeToFeed === 'LARVA') {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = feedableEntities[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var e = _step3.value;

                if (e.type === 'LARVA') {
                  fedEntity = e;
                  break;
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
          } else if (typeToFeed === 'QUEEN') {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = feedableEntities[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var _e = _step4.value;

                if (_e.subType === 'QUEEN') {
                  fedEntity = _e;
                  break;
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
          } else if (typeToFeed === null || typeToFeed === 'RANDOM') {
            fedEntity = oneOf(feedableEntities);
          }
          if (fedEntity != null) {
            var ateAll = antEatEntity(game, fedEntity, ant.holding);
            if (ateAll) {
              ant.holding = null;
            }
          }
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
        if (nothingInTheWay && dirtBelow && ant.eggLayingCooldown <= 0) {
          var egg = makeEgg(ant.position, 'WORKER'); // TODO
          addEntity(game, egg);
          // move the ant out of the way
          var _freePositions3 = fastGetEmptyNeighborPositions(game, ant, config.antBlockingEntities);
          ant.eggLayingCooldown = config.eggLayingCooldown;
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

var doHighLevelAction = function doHighLevelAction(game, ant, action) {
  var payload = action.payload;
  var object = payload.object;

  var actionType = action.type;
  var done = false;

  switch (actionType) {
    // high level move is a random move inside a location
    case 'MOVE':
      {
        doAction(game, ant, {
          type: 'MOVE',
          payload: { object: 'RANDOM', constraint: action.payload.object }
        });
        break;
      }
    // high level pickup moves around randomly inside location until
    // item type you want to pickup is encountered
    case 'PICKUP':
      {
        doAction(game, ant, { type: 'PICKUP', payload: { object: object } });
        if (!ant.holding) {
          console.log(ant.location);
          console.log(getInnerLocation(ant.location));
          console.log("--------");
          doAction(game, ant, {
            type: 'MOVE',
            payload: { object: 'RANDOM', constraint: getInnerLocation(ant.location) }
          });
        } else {
          done = true;
        }
        break;
      }
    case 'PUTDOWN':
      {
        if (ant.accumulator == null) {
          ant.accumulator = Math.round(Math.random() * 10) + 10;
        }
        if (ant.accumulator <= 0) {
          doAction(game, ant, { type: 'PUTDOWN', payload: { object: null } });
        } else {
          doAction(game, ant, {
            type: 'MOVE',
            payload: { object: 'RANDOM', constraint: getInnerLocation(ant.location) }
          });
          ant.accumulator--;
        }
        if (!ant.holding) {
          ant.accumulator = null;
          done = true;
        }
        break;
      }
    case 'FIND_PHEROMONE':
      {
        var onPheromone = fastCollidesWith(game, ant).filter(function (e) {
          return e.type === 'PHEROMONE';
        })
        // .filter(p => game.edges[p.edge].end != ant.location)
        // filter to pheromones that point out of location
        .filter(function (p) {
          var locPointedAt = add(makeVector(p.theta, 1), p.position);

          return !collides(ant.location, { position: locPointedAt, width: 1, height: 1 });
        }).length > 0;
        if (onPheromone) {
          done = true;
        } else {
          doAction(game, ant, {
            type: 'MOVE',
            payload: { object: 'RANDOM', constraint: ant.location }
          });
        }
        break;
      }
    case 'FEED':
      {
        if (!ant.holding || ant.holding.type != 'FOOD') {
          done = true;
        } else {
          doAction(game, ant, { type: 'FEED', payload: { object: object } });
          doAction(game, ant, {
            type: 'MOVE',
            payload: { object: 'RANDOM', constraint: getInnerLocation(ant.location) }
          });
        }
        break;
      }
    case 'EAT':
      {
        var startCalories = ant.calories;
        doAction(game, ant, {
          type: 'MOVE',
          payload: { object: 'RANDOM', constraint: getInnerLocation(ant.location) }
        });
        doAction(game, ant, { type: 'EAT', payload: { object: null } });
        if (ant.calories > startCalories) {
          done = true;
        }
        break;
      }
    case 'LAY':
      {
        doAction(game, ant, {
          type: 'MOVE',
          payload: { object: 'RANDOM', constraint: getInnerLocation(ant.location) }
        });
        doAction(game, ant, { type: 'LAY', payload: { object: null } });
      }
      break;
  }
  return done;
};

module.exports = { doAction: doAction, doHighLevelAction: doHighLevelAction };