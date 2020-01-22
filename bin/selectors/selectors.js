'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('../utils/errors'),
    invariant = _require.invariant;

var _require2 = require('../utils/vectors'),
    subtract = _require2.subtract,
    distance = _require2.distance,
    add = _require2.add;

var _require3 = require('../config'),
    config = _require3.config;

var _require4 = require('../utils/stateHelpers'),
    lookupInGrid = _require4.lookupInGrid;

/////////////////////////////////////////////////////////////////
// Collisions
/////////////////////////////////////////////////////////////////

// TODO may not need all the size stuff if we just use the grid
var collides = function collides(entityA, entityB) {
  if (entityA.position == null || entityB.position == null) {
    return false;
  }
  var dist = subtract(entityA.position, entityB.position);
  var xOverlap = false;
  var yOverlap = false;
  if (dist.x === 0) {
    xOverlap = true;
  } else if (dist.x < 0) {
    if (entityB.position.x + entityB.width > entityA.position.x && entityB.position.x + entityB.width <= entityA.position.x + entityA.width) {
      xOverlap = true;
    }
  } else {
    if (entityA.position.x + entityA.width > entityB.position.x && entityA.position.x + entityA.width <= entityB.position.x + entityB.width) {
      xOverlap = true;
    }
  }

  if (dist.y === 0) {
    yOverlap = true;
  } else if (dist.y < 0) {
    if (entityB.position.y + entityB.height > entityA.position.y && entityB.position.y + entityB.height <= entityA.position.y + entityA.height) {
      yOverlap = true;
    }
  } else {
    if (entityA.position.y + entityA.height > entityB.position.y && entityA.position.y + entityA.height <= entityB.position.y + entityB.height) {
      yOverlap = true;
    }
  }

  return xOverlap && yOverlap;
};

/**
 * marquee position should be bottom left corner
 * exclusive of final width and height
 */
var entitiesInMarquee = function entitiesInMarquee(game, marquee) {
  var position = marquee.position,
      width = marquee.width,
      height = marquee.height;

  var entities = [];
  for (var _x = position.x; _x < position.x + width; _x++) {
    for (var _y = position.y; _y < position.y + height; _y++) {
      entities.push.apply(entities, _toConsumableArray(lookupInGrid(game.grid, { x: _x, y: _y }).map(function (id) {
        return game.entities[id];
      })));
    }
  }

  return entities;
};

/////////////////////////////////////////////////////////////////
// Fast functions
/////////////////////////////////////////////////////////////////

var fastCollidesWith = function fastCollidesWith(game, entity) {
  if (entity.position == null) return [];
  var _entity$position = entity.position,
      x = _entity$position.x,
      y = _entity$position.y;

  return lookupInGrid(game.grid, entity.position).filter(function (id) {
    return id != entity.id;
  }).map(function (id) {
    return game.entities[id];
  });
};

/////////////////////////////////////////////////////////////////
// Neighbors
/////////////////////////////////////////////////////////////////

var fastGetEmptyNeighborPositions = function fastGetEmptyNeighborPositions(game, entity, blockingEntityTypes) {
  if (entity.position == null) return [];
  var emptyPositions = [];
  var neighborPositions = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = neighborPositions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var neighborVec = _step.value;

      var neighbors = lookupInGrid(game.grid, add(entity.position, neighborVec)).filter(function (id) {
        return blockingEntityTypes.includes(game.entities[id].type);
      });
      if (neighbors.length == 0) {
        emptyPositions.push(add(entity.position, neighborVec));
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

  return emptyPositions;
};

var fastGetNeighbors = function fastGetNeighbors(game, entity) {
  if (entity.position == null) return [];
  var neighborEntities = [];
  var neighborPositions = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = neighborPositions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var neighborVec = _step2.value;

      neighborEntities.push.apply(neighborEntities, _toConsumableArray(lookupInGrid(game.grid, add(entity.position, neighborVec))));
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

  return neighborEntities.map(function (id) {
    return game.entities[id];
  });
};

var insideWorld = function insideWorld(game, pos) {
  return pos.x >= 0 && pos.x < game.worldWidth && pos.y >= 0 && pos.y < game.worldHeight;
};

/////////////////////////////////////////////////////////////////
// Entities by type
/////////////////////////////////////////////////////////////////

var getSelectedAntIDs = function getSelectedAntIDs(game) {
  return game.selectedEntities.filter(function (id) {
    return game.ANT.includes(id);
  });
};

var getEntitiesByType = function getEntitiesByType(game, entityTypes) {
  var entities = [];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = entityTypes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var entityType = _step3.value;

      entities = entities.concat(game[entityType].map(function (id) {
        return game.entities[id];
      }));
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

  return entities;
};

var filterEntitiesByType = function filterEntitiesByType(entities, entityTypes) {
  return entities.filter(function (e) {
    return entityTypes.includes(e.type);
  });
};

var selectors = {
  getEntitiesByType: getEntitiesByType,
  filterEntitiesByType: filterEntitiesByType,
  fastCollidesWith: fastCollidesWith,
  fastGetEmptyNeighborPositions: fastGetEmptyNeighborPositions,
  fastGetNeighbors: fastGetNeighbors,
  insideWorld: insideWorld,
  collides: collides,
  getSelectedAntIDs: getSelectedAntIDs,
  entitiesInMarquee: entitiesInMarquee
};
window.selectors = selectors; // for testing

module.exports = selectors;