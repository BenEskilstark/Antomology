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
    getNeighborPositions = _require2.getNeighborPositions,
    shouldFall = _require2.shouldFall,
    fastGetEmptyNeighborPositions = _require2.fastGetEmptyNeighborPositions;

var _require3 = require('../config'),
    config = _require3.config;

var _require4 = require('../utils/helpers'),
    getInnerLocation = _require4.getInnerLocation,
    oneOf = _require4.oneOf;

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

  if (entity.segmented) {
    var _position = entity.position,
        segments = entity.segments;

    insertInGrid(game.grid, _position, entity.id);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = segments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var segment = _step.value;

        insertInGrid(game.grid, segment.position, entity.id);
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

    return;
  }

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

  // handle segmented entities
  if (entity.segmented) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = entity.segments[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var segment = _step2.value;

        deleteFromGrid(game.grid, segment.position, entity.id);
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

    deleteFromGrid(game.grid, entity.position, entity.id);
    return;
  }

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
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = game.ANT[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var antID = _step3.value;

        var ant = game.entities[antID];
        if (ant.location === entity.id) {
          ant.location = null;
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
  }
}

function moveEntity(game, entity, nextPos) {
  if (entity.segmented) {
    var next = _extends({}, entity.position);
    // must do this delete first since a segment will end up there
    deleteFromGrid(game.grid, entity.position, entity.id);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = entity.segments[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var segment = _step4.value;

        var tmp = _extends({}, segment.position);
        deleteFromGrid(game.grid, segment.position, entity.id);
        segment.position = _extends({}, next);
        insertInGrid(game.grid, segment.position, entity.id);
        next = tmp;
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

    entity.prevPosition = entity.position;
    entity.position = nextPos;
    insertInGrid(game.grid, entity.position, entity.id);
    return;
  }

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
  if (entity.type === 'ANT' || config.bugs.includes(entity.type)) {
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
  var inInnerLocation = ant.location != null ? collides(game, ant.location, ant) : false;
  if (inInnerLocation) {
    ant.prevPheromone = null;
    return;
  }

  var strength = 0;
  var category = 1;
  if (game.selectedEntities.includes(ant.id)) {
    if (game.hotKeys.keysDown['P']) {
      strength = game.pheromones[1].strength;
      category = 1;
    }
    if (game.hotKeys.keysDown['O']) {
      strength = game.pheromones[2].strength;
      category = 2;
    }
    if (game.hotKeys.keysDown['I']) {
      strength = game.pheromones[3].strength;
      category = 3;
    }
  }

  var theta = vectorTheta(subtract(ant.position, ant.prevPosition));
  var pheromonesAtPos = lookupInGrid(game.grid, nextPherPos).map(function (id) {
    return game.entities[id];
  }).filter(function (e) {
    return e.type === 'PHEROMONE';
  });
  // pheromone deletion
  if (pheromonesAtPos.length > 0 && strength < 0) {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = pheromonesAtPos[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var ph = _step5.value;

        ph.quantity = Math.max(0, strength + ph.quantity);
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

    return;
  }
  var pheromoneInDirection = pheromonesAtPos.filter(function (p) {
    return p.theta === theta; // || prevPheromone == null
  })[0];

  if (pheromoneInDirection != null) {
    pheromoneInDirection.quantity = Math.min(config.pheromoneMaxQuantity, strength + pheromoneInDirection.quantity);
    ant.prevPheromone = pheromoneInDirection.id;
  } else if (strength > 0) {
    var pheromone = makePheromone(nextPherPos, theta, category, 0, // edgeID (placeholder) DEPRECATED
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
// Validated Entity Move Functions
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
function maybeMoveEntity(game, entity, nextPos, blockers, debug) {
  var blockingTypes = blockers != null ? blockers : config.antBlockingEntities;
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
    return blockingTypes.includes(e.type);
  }).length > 0;
  var defyingGravity = nextPos.y > entity.position.y && shouldFall(game, _extends({}, entity, { position: nextPos }));
  if (!occupied && insideWorld(game, nextPos) && !defyingGravity) {
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

/**
 *  Moves towards a location that is distance > 1 away
 *  Returns true if it was able to move towards it,
 *  otherwise returns the entity that is blocking it
 */
function maybeMoveTowardsLocation(game, entity, loc) {
  var distVec = subtract(loc, entity.position);
  if (distVec.x == 0 && distVec.y == 0) {
    return true; // you're there
  }
  var moveVec = { x: 0, y: 0 };

  // select axis order to try moving along
  var moveAxes = ['y', 'x'];
  if (distVec.y == 0 || distVec.x !== 0 && Math.random() < 0.5) {
    moveAxes = ['x', 'y'];
  }

  // try moving along each axis
  var nextPos = null;
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = moveAxes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var moveAxis = _step6.value;

      if (distVec[moveAxis] == 0) {
        continue; // already aligned with destination on this axis
      }
      moveVec[moveAxis] += distVec[moveAxis] > 0 ? 1 : -1;
      nextPos = add(moveVec, entity.position);
      var didMove = maybeMoveEntity(game, entity, nextPos);
      if (didMove) {
        return true;
      } else {
        moveVec[moveAxis] = 0;
      }
    }

    // else we couldn't move, so return the blocker
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

  return lookupInGrid(game.grid, nextPos).map(function (i) {
    return game.entities[i];
  }).filter(function (e) {
    return config.antBlockingEntities.includes(e.type);
  })[0];
}

/**
 *  Selects a random free neighbor to try to move to
 *  Provide policies to constrain the random movement
 *  Policies:
 *    - NO_REVERSE: don't go back to your previous position
 *    - FORWARD_BIAS: prefer to continue in current direction
 *  Additionally can provide:
 *    - constraint: a location random moves must stay inside
 *    - blocking entities: override antBlockingEntities with these
 */
function maybeDoRandomMove(game, entity, policies, constraint, blockers) {
  var blockingTypes = blockers != null ? blockers : config.antBlockingEntities;
  var freePositions = fastGetEmptyNeighborPositions(game, entity, blockingTypes).filter(function (pos) {
    return insideWorld(game, pos);
  });

  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = policies[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var policy = _step7.value;

      switch (policy) {
        case 'NO_REVERSE':
          {
            freePositions = freePositions.filter(function (pos) {
              return pos.x != entity.prevPosition.x || pos.y != entity.prevPosition.y;
            });
            if (freePositions.length == 0) {
              freePositions = [_extends({}, entity.prevPosition)];
            }
            break;
          }
        case 'FORWARD_BIAS':
          {
            var dir = subtract(entity.position, entity.prevPosition);
            freePositions.push(add(dir, entity.position));
            freePositions.push(add(dir, entity.position));
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

  if (constraint != null) {
    freePositions = freePositions.filter(function (pos) {
      return collides(game, _extends({}, entity, { position: pos }), constraint);
    });
  }

  if (freePositions.length == 0) {
    return false;
  }

  var nextPos = oneOf(freePositions);

  return maybeMoveEntity(game, entity, nextPos, blockingTypes);
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

  antSwitchTask: antSwitchTask,

  maybeMoveEntity: maybeMoveEntity,
  maybeMoveTowardsLocation: maybeMoveTowardsLocation,
  maybeDoRandomMove: maybeDoRandomMove
};