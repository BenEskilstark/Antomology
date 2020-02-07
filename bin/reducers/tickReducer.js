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

var _require12 = require('../simulation/performTask'),
    performTask = _require12.performTask;

var _require13 = require('../state/graphTasks'),
    createFindPheromoneTask = _require13.createFindPheromoneTask,
    createFollowTrailTask = _require13.createFollowTrailTask,
    createFollowTrailInReverseTask = _require13.createFollowTrailInReverseTask,
    createPickupEntityTask = _require13.createPickupEntityTask;

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

///////////////////////////////////////////////////////////////////////////////
// Handle Tick
///////////////////////////////////////////////////////////////////////////////
var totalTime = 0;
var handleTick = function handleTick(game) {
  // const startTime = performance.now();

  // update ants
  var heldEntityIDs = [];
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

      // if ant just arrived at a location, switch task to that
      var locs = fastCollidesWith(game, ant).filter(function (e) {
        return e.type === 'LOCATION';
      });
      if (locs.length > 0 && locs[0].id != ant.location) {
        if (locs[0].id !== config.clickedPosition) {
          ant.location = locs[0].id;
          ant.task = locs[0].task;
          ant.taskIndex = 0;
          ant.taskStack = [{ name: 'Follow Trail', index: 0 }, { name: 'Find Pheromone Trail', index: 0 }];
        }
      } else if (locs.length == 0 && ant.location != null) {
        ant.location = null;
      }
      // if blocked on a trail, pick up blocker and reverse
      if (ant.task != null && ant.task.name === 'Follow Trail' && ant.blocked) {
        var blockingEntity = ant.blockedBy;
        if (!blockingEntity) {
          console.error("no blocking entity on pheromone trail", ant);
          break;
        }
        ant.task = createPickupEntityTask(blockingEntity);
        ant.taskIndex = 0;
        ant.taskStack = [{ name: 'Follow Trail In Reverse', index: 0 }];
      }

      ant.calories -= 1;
      if (ant.eggLayingCooldown > 0) {
        ant.eggLayingCooldown -= 1;
      }
      // ant starvation
      if (ant.calories <= 0) {
        ant.alive = false;
        if (ant.holding) {
          putDownEntity(game, ant);
        }
      }
      if (ant.holding != null && !heldEntityIDs.includes(ant.holding.id)) {
        heldEntityIDs.push(ant.holding.id);
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

  updateHeldBigEntities(game, heldEntityIDs);
  updateAntLifeCycles(game);
  // updatePheromones(game);
  computeGravity(game);
  updateFoWVision(game);

  game.time += 1;

  // const time = performance.now() - startTime;
  // totalTime += time;
  // if (game.time % 10 === 0) {
  //   console.log(time.toFixed(3), 'avg', (totalTime / game.time).toFixed(3));
  // }

  return game;
};

///////////////////////////////////////////////////////////////////////////////
// Held Big Entities
///////////////////////////////////////////////////////////////////////////////
var updateHeldBigEntities = function updateHeldBigEntities(game, heldEntityIDs) {
  var heldBigEntities = heldEntityIDs.map(function (i) {
    return game.entities[i];
  }).filter(function (e) {
    return e.toLift > 1;
  });
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = heldBigEntities[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var bigEntity = _step2.value;

      if (bigEntity.toLift <= bigEntity.heldBy.length) {
        if (!bigEntity.lifted) {
          var didMove = maybeMoveEntity(game, bigEntity, add(bigEntity.position, { x: 0, y: 1 }), false // don't debug
          );
          bigEntity.lifted = didMove;
        } else {
          // move the bigEntity according to the average movement of the ants holding it
          var sum = { x: 0, y: 0 };
          for (var i = 0; i < bigEntity.heldBy.length; i++) {
            var ant = game.entities[bigEntity.heldBy[i]];
            var diff = subtract(ant.position, ant.prevPosition);
            sum = add(sum, diff);
          }
          var avg = {
            x: Math.round(sum.x / bigEntity.heldBy.length),
            y: Math.round(sum.y / bigEntity.heldBy.length)
          };
          maybeMoveEntity(game, bigEntity, add(bigEntity.position, avg), false);
        }
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
};

///////////////////////////////////////////////////////////////////////////////
// Ant Life Cycles
///////////////////////////////////////////////////////////////////////////////
var updateAntLifeCycles = function updateAntLifeCycles(game) {
  // update eggs
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = game.EGG[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var id = _step3.value;

      var egg = game.entities[id];
      egg.age += 1;
      if (egg.age > config.eggHatchAge) {
        game.entities[id] = _extends({}, makeLarva(egg.position, egg.subType), { id: id });
        changeEntityType(game, game.entities[id], 'EGG', 'LARVA');
      }
    }

    // update larva
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
    for (var _iterator4 = game.LARVA[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _id = _step4.value;

      var larva = game.entities[_id];
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
        game.entities[_id] = _extends({}, makePupa(larva.position, larva.subType), { id: _id });
        changeEntityType(game, game.entities[_id], 'LARVA', 'PUPA');
      }
    }

    // update pupa
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
    for (var _iterator5 = game.PUPA[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _id2 = _step5.value;

      var pupa = game.entities[_id2];
      pupa.age += 1;
      if (pupa.age > config.pupaHatchAge) {
        game.entities[_id2] = _extends({}, makeAnt(pupa.position, pupa.subType), { id: _id2 });
        changeEntityType(game, game.entities[_id2], 'PUPA', 'ANT');
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
};

///////////////////////////////////////////////////////////////////////////////
// Phermones
///////////////////////////////////////////////////////////////////////////////
var updatePheromones = function updatePheromones(game) {
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = game.PHEROMONE[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var id = _step6.value;

      var pheromone = game.entities[id];
      var antsHere = lookupInGrid(game.grid, pheromone.position).map(function (i) {
        return game.entities[i];
      }).filter(function (e) {
        return e.type === 'ANT';
      }).length > 0;
      if (antsHere) {
        pheromone.quantity = Math.min(pheromone.quantity + 1, config.pheromoneMaxQuantity);
      } else {
        pheromone.quantity -= 1;
      }
      if (pheromone.quantity <= 0) {
        removeEntity(game, pheromone);
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
};

///////////////////////////////////////////////////////////////////////////////
// Compute Gravity
///////////////////////////////////////////////////////////////////////////////
var computeGravity = function computeGravity(game) {
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = config.fallingEntities[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var entityType = _step7.value;
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = game[entityType][Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var id = _step8.value;

          var entity = game.entities[id];
          if (!entity.position) continue;
          // TODO lifted (big)entities not affected by gravity for now
          var isBig = entity.toLift > 1;
          var isReadyToLift = entity.toLift <= entity.heldBy.length;
          if (entity.lifted) continue;
          // if (isBig && isReadyToLift && !entity.isLifted) continue;
          var positionBeneath = subtract(entity.position, { x: 0, y: 1 });
          var entitiesBeneath = fastCollidesWith(game, _extends({}, entity, { position: positionBeneath })).filter(function (e) {
            return config.stopFallingEntities.includes(e.type);
          }).length > 0;
          var entitiesSupporting = [];
          if (config.supportedEntities.includes(entityType)) {
            entitiesSupporting = fastCollidesWith(game, entity).filter(function (e) {
              return config.supportingBackgroundTypes.includes(e.subType);
            });
            if (config.climbingEntities.includes(entity.type)) {
              entitiesSupporting = entitiesSupporting.concat(fastGetNeighbors(game, entity, true /* diagonal */).filter(function (e) {
                return config.stopFallingEntities.includes(e.type);
              }));
            }
          }
          if (!entitiesSupporting.length > 0 && !entitiesBeneath && insideWorld(game, positionBeneath)) {
            moveEntity(game, entity, positionBeneath);
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
};

///////////////////////////////////////////////////////////////////////////////
// Update FoW Vision
///////////////////////////////////////////////////////////////////////////////
var updateFoWVision = function updateFoWVision(game) {
  var previouslyVisible = [];
  var _iteratorNormalCompletion9 = true;
  var _didIteratorError9 = false;
  var _iteratorError9 = undefined;

  try {
    for (var _iterator9 = config.entitiesInFog[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
      var entityType = _step9.value;
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = game[entityType][Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var id = _step12.value;

          var entity = game.entities[id];
          if (entity.position == null) {
            entity.visible = true; // held entities are visible
            continue;
          }
          if (entity.visible) {
            previouslyVisible.push(entity);
            entity.visible = false;
          }
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12.return) {
            _iterator12.return();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
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

  var _iteratorNormalCompletion10 = true;
  var _didIteratorError10 = false;
  var _iteratorError10 = undefined;

  try {
    for (var _iterator10 = game.ANT[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
      var _id3 = _step10.value;

      var ant = game.entities[_id3];
      getEntitiesInRadius(game, ant.position, config.antVisionRadius).forEach(function (e) {
        return e.visible = true;
      });
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

  var _iteratorNormalCompletion11 = true;
  var _didIteratorError11 = false;
  var _iteratorError11 = undefined;

  try {
    for (var _iterator11 = previouslyVisible[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
      var _entity = _step11.value;

      if (!_entity.visible) {
        _entity.lastSeenPos = _entity.position;
      }
    }
  } catch (err) {
    _didIteratorError11 = true;
    _iteratorError11 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion11 && _iterator11.return) {
        _iterator11.return();
      }
    } finally {
      if (_didIteratorError11) {
        throw _iteratorError11;
      }
    }
  }
};

module.exports = { tickReducer: tickReducer };