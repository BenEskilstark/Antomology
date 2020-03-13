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
    getInnerLocation = _require5.getInnerLocation,
    isInRadius = _require5.isInRadius,
    clamp = _require5.clamp;

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
    antSwitchTask = _require6.antSwitchTask,
    maybeDoRandomMove = _require6.maybeDoRandomMove;

var _require7 = require('../selectors/selectors'),
    fastCollidesWith = _require7.fastCollidesWith,
    fastGetEmptyNeighborPositions = _require7.fastGetEmptyNeighborPositions,
    fastGetNeighbors = _require7.fastGetNeighbors,
    collides = _require7.collides,
    getEntitiesByType = _require7.getEntitiesByType,
    filterEntitiesByType = _require7.filterEntitiesByType,
    insideWorld = _require7.insideWorld,
    getEntitiesInRadius = _require7.getEntitiesInRadius,
    shouldFall = _require7.shouldFall,
    getQueen = _require7.getQueen;

var _require8 = require('../entities/egg'),
    makeEgg = _require8.makeEgg;

var _require9 = require('../entities/larva'),
    makeLarva = _require9.makeLarva;

var _require10 = require('../entities/pupa'),
    makePupa = _require10.makePupa;

var _require11 = require('../entities/ant'),
    makeAnt = _require11.makeAnt;

var _require12 = require('../entities/food'),
    makeFood = _require12.makeFood;

var _require13 = require('../simulation/performTask'),
    performTask = _require13.performTask;

var _require14 = require('../state/graphTasks'),
    createFindPheromoneTask = _require14.createFindPheromoneTask,
    createFollowTrailTask = _require14.createFollowTrailTask,
    createFollowTrailInReverseTask = _require14.createFollowTrailInReverseTask,
    createPickupEntityTask = _require14.createPickupEntityTask;

var tickReducer = function tickReducer(game, action) {
  switch (action.type) {
    case 'START_TICK':
      {
        if (game != null && game.tickInterval != null) {
          return game;
        }
        var updateSim = action.updateSim;

        return _extends({}, game, {
          tickInterval: setInterval(
          // HACK: store is only available via window
          function () {
            return store.dispatch({ type: 'TICK', updateSim: updateSim });
          }, config.msPerTick)
        });
      }
    case 'STOP_TICK':
      {
        clearInterval(game.tickInterval);
        game.tickInterval = null;
        return game;
      }
    case 'TICK':
      {
        var _updateSim = action.updateSim;

        game.time += 1;
        handlePan(game, _updateSim);
        if (_updateSim) {
          return handleTick(game);
        } else {
          updateFoWVision(game);
          return game; // just ticking for rendering
        }
      }
  }
  return game;
};

///////////////////////////////////////////////////////////////////////////////
// Handle Pan
///////////////////////////////////////////////////////////////////////////////
var handlePan = function handlePan(game, updateSim) {
  var nextViewPos = _extends({}, game.viewPos);
  if (game.hotKeys.keysDown.up) {
    nextViewPos.y += 1;
  }
  if (game.hotKeys.keysDown.down) {
    nextViewPos.y -= 1;
  }
  if (game.hotKeys.keysDown.left) {
    nextViewPos.x -= 1;
  }
  if (game.hotKeys.keysDown.right) {
    nextViewPos.x += 1;
  }
  // updateSim is a proxy for whether you're in the editor
  if (!updateSim) {
    game.viewPos = nextViewPos;
  } else {
    game.viewPos = {
      x: clamp(nextViewPos.x, 0, game.worldWidth - config.width),
      y: clamp(nextViewPos.y, 0, game.worldHeight - config.height)
    };
  }
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
    var _loop = function _loop() {
      var id = _step.value;

      var ant = game.entities[id];
      if (!ant.alive) {
        return 'continue';
      }
      ant.age += 1;
      performTask(game, ant);

      // if ant just arrived at a location, switch task to that
      var locs = fastCollidesWith(game, ant).filter(function (e) {
        return e.type === 'LOCATION';
      }).filter(function (e) {
        return e.id != config.clickedPosition;
      });
      if (locs.length > 0 && (ant.location == null || locs[0].id != ant.location.id)) {
        if (collides(game, getInnerLocation(locs[0]), ant)) {
          ant.location = locs[0];
          // don't assign the task yet if the ant is selected
          if (!game.selectedEntities.includes(ant.id)) {
            antSwitchTask(game, ant, locs[0].task, [{ name: 'Follow Trail', index: 0 }, { name: 'Find Pheromone Trail', index: 0 }]);
          }
        }
      } else if (locs.length == 0 && ant.location != null) {
        ant.location = null;
      }

      // if idle on pheromone, follow it
      var pheromoneAtPosition = lookupInGrid(game.grid, ant.position).filter(function (id) {
        return game.PHEROMONE.includes(id);
      }).length > 0;
      if (ant.task != null && ant.task.name === 'Idle' && pheromoneAtPosition) {
        antSwitchTask(game, ant, createFollowTrailTask());
      }

      ant.calories -= 1;
      if (ant.eggLayingCooldown > 0) {
        ant.eggLayingCooldown -= 1;
      }

      // ways ants can die
      if (ant.calories <= 0 || ant.hp <= 0 || ant.subType != 'QUEEN' && ant.age > config.antMaxAge) {
        ant.alive = false;
        if (ant.holding) {
          putDownEntity(game, ant);
        }
        game.selectedEntities = game.selectedEntities.filter(function (id) {
          return id != ant.id;
        });
      }

      if (ant.holding != null && !heldEntityIDs.includes(ant.holding.id)) {
        heldEntityIDs.push(ant.holding.id);
      }
    };

    for (var _iterator = game.ANT[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ret = _loop();

      if (_ret === 'continue') continue;
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
  updateBugs(game);
  updateAntLifeCycles(game);
  updatePheromones(game);
  computeGravity(game);
  updateFoWVision(game);
  updateTicker(game);
  computeLevelOver(game);

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
            var _ant = game.entities[bigEntity.heldBy[i]];
            var diff = subtract(_ant.position, _ant.prevPosition);
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
// Bugs
///////////////////////////////////////////////////////////////////////////////
var updateBugs = function updateBugs(game) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = game.APHID[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var aphidID = _step3.value;

      var aphid = game.entities[aphidID];
      var rand = Math.random();
      if (rand < 0.4) {
        maybeDoRandomMove(game, aphid, []);
      }
      computeCombat(game, aphid, config.aphidDamage);
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

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = game.BEETLE[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var beetleID = _step4.value;

      var beetle = game.entities[beetleID];
      var _rand = Math.random();
      if (_rand < 0.4) {
        maybeDoRandomMove(game, beetle, []);
      }
      computeCombat(game, beetle, config.beetleDamage);
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

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = game.WORM[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var wormID = _step5.value;

      var worm = game.entities[wormID];
      var _rand2 = Math.random();
      if (_rand2 < 0.025) {
        maybeDoRandomMove(game, worm, ['NO_REVERSE', 'FORWARD_BIAS'], null, // constraint
        config.wormBlockingEntities);
      }
      // eat colliding dirt
      var collidedDirt = fastCollidesWith(game, worm).filter(function (e) {
        return e.type == 'DIRT';
      });
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = collidedDirt[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var dirt = _step8.value;

          removeEntity(game, dirt);
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

      computeCombat(game, worm, config.wormDamage);
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

  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = game.CENTIPEDE[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var centID = _step6.value;

      var centipede = game.entities[centID];
      var _rand3 = Math.random();
      if (_rand3 < 0.3) {
        maybeDoRandomMove(game, centipede, ['NO_REVERSE', 'FORWARD_BIAS'], null, // constraint
        config.centipedeBlockingEntities);
      }
      // eat stuff
      var collidedFood = fastCollidesWith(game, centipede).filter(function (e) {
        return e.type == 'EGG' || e.type == 'LARVA' || e.type == 'PUPA';
      });
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = collidedFood[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var food = _step9.value;

          removeEntity(game, food);
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

      computeCombat(game, centipede, config.centipedeDamage);
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

  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = game.DRAGONFLY[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var dragonFlyID = _step7.value;

      var dragonFly = game.entities[dragonFlyID];
      maybeDoRandomMove(game, dragonFly, ['NO_REVERSE', 'FORWARD_BIAS', 'FORWARD_BIAS'], null, // constraint
      config.dragonFlyBlockingEntities);
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

function computeCombat(game, entity, entityDamage) {
  var collidingAnts = fastCollidesWith(game, entity).filter(function (e) {
    return e.type === 'ANT' && e.alive;
  });
  entity.hp -= collidingAnts.length * config.antDamage;
  var hurtAnt = oneOf(collidingAnts);
  if (hurtAnt != null) {
    hurtAnt.hp -= entityDamage;
  }
  if (entity.hp <= 0) {
    removeEntity(game, entity);
    if (entity.segmented) {
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = entity.segments[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var segment = _step10.value;

          addEntity(game, makeFood(segment.position, 1000, entity.type));
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

      addEntity(game, makeFood(entity.position, 1000, entity.type));
    } else {
      for (var x = 0; x < entity.width; x++) {
        for (var y = 0; y < entity.height; y++) {
          addEntity(game, makeFood(add(entity.position, { x: x, y: y }), 1000, entity.type));
        }
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Game over
///////////////////////////////////////////////////////////////////////////////
var computeLevelOver = function computeLevelOver(game) {
  var queen = getQueen(game);
  if (!queen.alive) {
    game.gameOver = 'lose';
  }

  var obelisk = game.entities[game.OBELISK[0]];
  // TODO only supports one target
  var target = game.entities[game.TARGET[0]];
  if (!obelisk || !target) return;

  if (collides(game, obelisk, target)) {
    game.gameOver = 'win';
  }
};

///////////////////////////////////////////////////////////////////////////////
// Ticker
///////////////////////////////////////////////////////////////////////////////
var updateTicker = function updateTicker(game) {
  var ticker = game.ticker;

  if (ticker.curAge >= ticker.maxAge) {
    ticker.text = '';
  } else {
    ticker.curAge += 1;
  }
};

///////////////////////////////////////////////////////////////////////////////
// Ant Life Cycles
///////////////////////////////////////////////////////////////////////////////
var updateAntLifeCycles = function updateAntLifeCycles(game) {
  // update eggs
  var _iteratorNormalCompletion11 = true;
  var _didIteratorError11 = false;
  var _iteratorError11 = undefined;

  try {
    for (var _iterator11 = game.EGG[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
      var id = _step11.value;

      var egg = game.entities[id];
      egg.age += 1;
      if (egg.age > config.eggHatchAge) {
        game.entities[id] = _extends({}, makeLarva(egg.position, egg.subType), { id: id });
        changeEntityType(game, game.entities[id], 'EGG', 'LARVA');
      }
    }

    // update larva
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

  var _iteratorNormalCompletion12 = true;
  var _didIteratorError12 = false;
  var _iteratorError12 = undefined;

  try {
    for (var _iterator12 = game.LARVA[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
      var _id = _step12.value;

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
        game.entities[_id] = _extends({}, makePupa(larva.position, larva.subType), {
          id: _id, calories: larva.calories
        });
        changeEntityType(game, game.entities[_id], 'LARVA', 'PUPA');
      }
    }

    // update pupa
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

  var _iteratorNormalCompletion13 = true;
  var _didIteratorError13 = false;
  var _iteratorError13 = undefined;

  try {
    for (var _iterator13 = game.PUPA[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
      var _id2 = _step13.value;

      var pupa = game.entities[_id2];
      pupa.age += 1;
      if (pupa.age > config.pupaHatchAge && pupa.position != null) {
        game.entities[_id2] = _extends({}, makeAnt(pupa.position, pupa.subType), {
          id: _id2, calories: pupa.calories
        });
        changeEntityType(game, game.entities[_id2], 'PUPA', 'ANT');
      }
    }
  } catch (err) {
    _didIteratorError13 = true;
    _iteratorError13 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion13 && _iterator13.return) {
        _iterator13.return();
      }
    } finally {
      if (_didIteratorError13) {
        throw _iteratorError13;
      }
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
// Phermones
///////////////////////////////////////////////////////////////////////////////
var updatePheromones = function updatePheromones(game) {
  var toRemove = [];
  var _iteratorNormalCompletion14 = true;
  var _didIteratorError14 = false;
  var _iteratorError14 = undefined;

  try {
    for (var _iterator14 = game.PHEROMONE[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
      var id = _step14.value;

      var pheromone = game.entities[id];
      pheromone.quantity -= 1;
      if (pheromone.quantity <= 0) {
        toRemove.push(pheromone);
      }
    }
  } catch (err) {
    _didIteratorError14 = true;
    _iteratorError14 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion14 && _iterator14.return) {
        _iterator14.return();
      }
    } finally {
      if (_didIteratorError14) {
        throw _iteratorError14;
      }
    }
  }

  var _iteratorNormalCompletion15 = true;
  var _didIteratorError15 = false;
  var _iteratorError15 = undefined;

  try {
    for (var _iterator15 = toRemove[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
      var _pheromone = _step15.value;

      removeEntity(game, _pheromone);
    }
  } catch (err) {
    _didIteratorError15 = true;
    _iteratorError15 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion15 && _iterator15.return) {
        _iterator15.return();
      }
    } finally {
      if (_didIteratorError15) {
        throw _iteratorError15;
      }
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
// Compute Gravity
///////////////////////////////////////////////////////////////////////////////
var computeGravity = function computeGravity(game) {
  var _iteratorNormalCompletion16 = true;
  var _didIteratorError16 = false;
  var _iteratorError16 = undefined;

  try {
    for (var _iterator16 = config.fallingEntities[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
      var entityType = _step16.value;
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = game[entityType][Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var id = _step17.value;

          var entity = game.entities[id];
          if (shouldFall(game, entity)) {
            var positionBeneath = subtract(entity.position, { x: 0, y: 1 });
            moveEntity(game, entity, positionBeneath);
          }
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17.return) {
            _iterator17.return();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError16 = true;
    _iteratorError16 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion16 && _iterator16.return) {
        _iterator16.return();
      }
    } finally {
      if (_didIteratorError16) {
        throw _iteratorError16;
      }
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
// Update FoW Vision
///////////////////////////////////////////////////////////////////////////////
var updateFoWVision = function updateFoWVision(game) {
  var previouslyVisible = [];
  var _iteratorNormalCompletion18 = true;
  var _didIteratorError18 = false;
  var _iteratorError18 = undefined;

  try {
    for (var _iterator18 = config.entitiesInFog[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
      var entityType = _step18.value;
      var _iteratorNormalCompletion21 = true;
      var _didIteratorError21 = false;
      var _iteratorError21 = undefined;

      try {
        for (var _iterator21 = game[entityType][Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
          var id = _step21.value;

          var entity = game.entities[id];
          if (entity.position == null) {
            entity.visible = true; // held entities are visible
            continue;
          }
          if (entity.visible) {
            previouslyVisible.push(entity);
            entity.visible = false;
          }
          if (entity.lastSeenPos != null && !config.immobileEntities.includes(entity.type)) {
            var _iteratorNormalCompletion22 = true;
            var _didIteratorError22 = false;
            var _iteratorError22 = undefined;

            try {
              for (var _iterator22 = game.ANT[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                var _id3 = _step22.value;

                var _ant2 = game.entities[_id3];
                if (!_ant2.alive) continue;
                if (isInRadius(_ant2.position, config.antVisionRadius, entity.lastSeenPos)) {
                  entity.lastSeenPos = null;
                  break;
                }
              }
            } catch (err) {
              _didIteratorError22 = true;
              _iteratorError22 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion22 && _iterator22.return) {
                  _iterator22.return();
                }
              } finally {
                if (_didIteratorError22) {
                  throw _iteratorError22;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError21 = true;
        _iteratorError21 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion21 && _iterator21.return) {
            _iterator21.return();
          }
        } finally {
          if (_didIteratorError21) {
            throw _iteratorError21;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError18 = true;
    _iteratorError18 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion18 && _iterator18.return) {
        _iterator18.return();
      }
    } finally {
      if (_didIteratorError18) {
        throw _iteratorError18;
      }
    }
  }

  var _iteratorNormalCompletion19 = true;
  var _didIteratorError19 = false;
  var _iteratorError19 = undefined;

  try {
    for (var _iterator19 = game.ANT[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
      var _id4 = _step19.value;

      var _ant3 = game.entities[_id4];
      getEntitiesInRadius(game, _ant3.position, config.antVisionRadius).forEach(function (e) {
        return e.visible = true;
      });
    }
  } catch (err) {
    _didIteratorError19 = true;
    _iteratorError19 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion19 && _iterator19.return) {
        _iterator19.return();
      }
    } finally {
      if (_didIteratorError19) {
        throw _iteratorError19;
      }
    }
  }

  var _iteratorNormalCompletion20 = true;
  var _didIteratorError20 = false;
  var _iteratorError20 = undefined;

  try {
    for (var _iterator20 = previouslyVisible[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
      var _entity = _step20.value;

      if (!_entity.visible) {
        _entity.lastSeenPos = _entity.position;
      }
    }
  } catch (err) {
    _didIteratorError20 = true;
    _iteratorError20 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion20 && _iterator20.return) {
        _iterator20.return();
      }
    } finally {
      if (_didIteratorError20) {
        throw _iteratorError20;
      }
    }
  }
};

module.exports = { tickReducer: tickReducer };