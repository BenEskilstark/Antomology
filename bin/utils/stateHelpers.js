'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../utils/vectors'),
    add = _require.add,
    subtract = _require.subtract,
    makeVector = _require.makeVector,
    vectorTheta = _require.vectorTheta,
    equals = _require.equals;

var _require2 = require('../selectors/selectors'),
    fastCollidesWith = _require2.fastCollidesWith,
    collides = _require2.collides,
    insideWorld = _require2.insideWorld,
    lookupInGrid = _require2.lookupInGrid,
    getNeighborPositions = _require2.getNeighborPositions;

var _require3 = require('../config'),
    config = _require3.config;

var _require4 = require('../utils/helpers'),
    getInnerLocation = _require4.getInnerLocation;

var _require5 = require('../entities/pheromone'),
    makePheromone = _require5.makePheromone;

/**
 * These functions all mutate state in some way. Meant to be used by reducers
 * so they can do similar operations consistently
 */

////////////////////////////////////////////////////////////////////////
// Grid Functions
////////////////////////////////////////////////////////////////////////

function insertInGrid(grid, position, item) {
  if (position == null) return;
  var x = position.x,
      y = position.y;

  if (grid[x] == null) {
    grid[x] = [];
  }
  if (grid[x][y] == null) {
    grid[x][y] = [];
  }
  grid[x][y].push(item);
}

function deleteFromGrid(grid, position, item) {
  if (position == null) return;
  var x = position.x,
      y = position.y;

  if (grid[x] == null) return;
  if (grid[x][y] == null) return;
  grid[x][y] = grid[x][y].filter(function (i) {
    return i != item;
  });
}

////////////////////////////////////////////////////////////////////////
// Entity Functions
// These don't do any validation, they just perform the operation
////////////////////////////////////////////////////////////////////////

function addEntity(game, entity) {
  game.entities[entity.id] = entity;
  game[entity.type].push(entity.id);

  var position = entity.position,
      width = entity.width,
      height = entity.height;

  if (position == null) {
    return;
  }
  // handle entities with larger size
  for (var x = position.x; x < position.x + width; x++) {
    for (var y = position.y; y < position.y + height; y++) {
      insertInGrid(game.grid, { x: x, y: y }, entity.id);
    }
  }
}

function removeEntity(game, entity) {
  delete game.entities[entity.id];
  game[entity.type] = game[entity.type].filter(function (id) {
    return id != entity.id;
  });
  var position = entity.position,
      width = entity.width,
      height = entity.height;

  if (position == null) {
    return;
  }
  // handle entities with larger size
  for (var x = position.x; x < position.x + width; x++) {
    for (var y = position.y; y < position.y + height; y++) {
      deleteFromGrid(game.grid, { x: x, y: y }, entity.id);
    }
  }
  // clean up locations
  if (entity.type === 'LOCATION') {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = game.ANT[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var antID = _step.value;

        var ant = game.entities[antID];
        if (ant.location === entity.id) {
          ant.location = null;
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
  }
}

function moveEntity(game, entity, nextPos) {
  var position = entity.position,
      width = entity.width,
      height = entity.height;
  // handle entities with larger size

  if (position != null) {
    for (var x = position.x; x < position.x + width; x++) {
      for (var y = position.y; y < position.y + height; y++) {
        deleteFromGrid(game.grid, { x: x, y: y }, entity.id);
      }
    }
  }
  for (var _x = nextPos.x; _x < nextPos.x + width; _x++) {
    for (var _y = nextPos.y; _y < nextPos.y + height; _y++) {
      insertInGrid(game.grid, { x: _x, y: _y }, entity.id);
    }
  }
  entity.prevPosition = entity.position;
  entity.position = nextPos;
  if (entity.type === 'ANT') {
    // TODO this rotation is weird for the falling obelisk
    entity.theta = vectorTheta(subtract(entity.prevPosition, entity.position));
  }
}

function changeEntityType(game, entity, oldType, nextType) {
  game[oldType] = game[oldType].filter(function (id) {
    return id != entity.id;
  });
  game[nextType].push(entity.id);
  entity.type = nextType;
}

////////////////////////////////////////////////////////////////////////
// Ant Functions
////////////////////////////////////////////////////////////////////////

function pickUpEntity(game, ant, entityToPickup) {
  ant.holding = entityToPickup;
  ant.blocked = false;
  ant.blockedBy = null;
  if (entityToPickup.toLift == 1) {
    deleteFromGrid(game.grid, entityToPickup.position, entityToPickup.id);
    entityToPickup.position = null;
  }
  entityToPickup.heldBy.push(ant.id);
}

function putDownEntity(game, ant) {
  var heldEntity = ant.holding;
  var positionToPutdown = heldEntity.toLift > 1 ? heldEntity.position : ant.position;
  moveEntity(game, heldEntity, positionToPutdown);
  heldEntity.heldBy = heldEntity.heldBy.filter(function (i) {
    return i != ant.id;
  });
  if (heldEntity.toLift > heldEntity.heldBy.length) {
    heldEntity.lifted = false;
  }
  ant.holding = null;
  ant.leadHolder = false;
}

// returns whether toEat was eaten entirely
function antEatEntity(game, ant, toEat) {
  var caloriesEaten = Math.min(config.antCaloriesPerEat, toEat.calories, config.antMaxCalories - ant.calories);
  ant.calories += caloriesEaten;
  toEat.calories -= caloriesEaten;
  if (toEat.calories <= 0) {
    removeEntity(game, toEat);
    return true;
  }
  return false;
}

function antMakePheromone(game, ant) {
  var prevPheromone = game.entities[ant.prevPheromone];
  var nextPherPos = ant.prevPosition;

  // don't make pheromones inside locations
  // NOTE: doesn't use getInnerLocation since pherome is created in prevPosition
  var inInnerLocation = ant.location != null ? collides(ant.location, ant) : false;
  if (inInnerLocation) {
    ant.prevPheromone = null;
    return;
  }

  var strength = game.selectedEntities.includes(ant.id) ? game.selectedAntPheromoneStrength : game.allAntPheromoneStrength;

  if (!game.hotKeys.keysDown['p'] && !game.hotKeys.keysDown['P']) {
    strength = 0; // must be holding P to make pheromones
  }

  var theta = vectorTheta(subtract(ant.position, ant.prevPosition));
  var pheromonesAtPos = lookupInGrid(game.grid, nextPherPos).map(function (id) {
    return game.entities[id];
  }).filter(function (e) {
    return e.type === 'PHEROMONE';
  });
  // pheromone deletion
  if (pheromonesAtPos.length > 0 && strength < 0) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = pheromonesAtPos[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var ph = _step2.value;

        ph.quantity = Math.max(0, strength + ph.quantity);
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

    return;
  }
  var pheromoneInDirection = pheromonesAtPos.filter(function (p) {
    return p.theta === theta; // || prevPheromone == null
  })[0];

  if (pheromoneInDirection != null) {
    pheromoneInDirection.quantity = Math.min(config.pheromoneMaxQuantity, strength + pheromoneInDirection.quantity);
    ant.prevPheromone = pheromoneInDirection.id;
  } else if (strength > 0) {
    var pheromone = makePheromone(nextPherPos, theta, 1, // edge category
    0, // edgeID (placeholder)
    ant.prevPheromone, strength);
    addEntity(game, pheromone);
    ant.prevPheromone = pheromone.id;
  }
}

function antSwitchTask(game, ant, task, taskStack) {
  ant.task = task;
  ant.taskIndex = 0;
  ant.taskStack = taskStack != null ? taskStack : [];
}

////////////////////////////////////////////////////////////////////////
// Validated Entity Functions
////////////////////////////////////////////////////////////////////////

/**
 * Checks that
 *   - nextPos is a neighbor of entity's current position
 *   - entity can move to nextPos without a collision
 *   - not already at the position
 *   - nextPos is inside the world
 *
 * returns whether or not the entity got moved
 */
function maybeMoveEntity(game, entity, nextPos, debug) {
  var distVec = subtract(nextPos, entity.position);
  if (distVec.x > 1 || distVec.y > 1 || distVec.x == 1 && distVec.y == 1) {
    if (debug) console.log("too far", distVec);
    return false; // too far
  }
  if (equals(entity.position, nextPos)) {
    if (debug) console.log("already there", entity.position, nextPos);
    return false; // already there
  }
  var occupied = fastCollidesWith(game, _extends({}, entity, { position: nextPos })).filter(function (e) {
    return config.antBlockingEntities.includes(e.type);
  }).length > 0;
  if (!occupied && insideWorld(game, nextPos)) {
    moveEntity(game, entity, nextPos);
    if (debug) console.log("did the move");
    return true;
  }
  if (debug) {
    if (!insideWorld(game, nextPos)) {
      console.log("not inside world", nextPos);
    }
    if (occupied) {
      console.log("occupied", occupied);
    }
  }
  return false;
}

module.exports = {
  insertInGrid: insertInGrid,
  deleteFromGrid: deleteFromGrid,
  lookupInGrid: lookupInGrid,

  addEntity: addEntity,
  removeEntity: removeEntity,
  moveEntity: moveEntity,
  changeEntityType: changeEntityType,
  pickUpEntity: pickUpEntity,
  putDownEntity: putDownEntity,
  antEatEntity: antEatEntity,
  antMakePheromone: antMakePheromone,

  maybeMoveEntity: maybeMoveEntity,
  antSwitchTask: antSwitchTask
};