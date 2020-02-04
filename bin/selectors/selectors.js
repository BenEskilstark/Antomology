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
      var entitiesInSquare = lookupInGrid(game.grid, { x: _x, y: _y });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = entitiesInSquare[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var id = _step.value;

          if (!entities.includes(id)) {
            entities.push(id);
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

  return entities.map(function (id) {
    return game.entities[id];
  });
};

function lookupInGrid(grid, position) {
  if (position == null) return [];
  var x = position.x,
      y = position.y;

  if (grid[x] == null) {
    return [];
  }
  if (grid[x][y] == null) {
    return [];
  }
  return grid[x][y];
}

/////////////////////////////////////////////////////////////////
// Fast functions
/////////////////////////////////////////////////////////////////

var fastCollidesWith = function fastCollidesWith(game, entity) {
  if (entity.position == null) return [];
  var position = entity.position,
      width = entity.width,
      height = entity.height;

  if (width == null) {
    console.error("checking collision on non-entity", entity);
    width = 1;
  }
  if (height == null) {
    console.error("checking collision on non-entity", entity);
    height = 1;
  }
  var collisions = [];
  for (var _x2 = 0; _x2 < width; _x2++) {
    for (var _y2 = 0; _y2 < height; _y2++) {
      var thisSquare = lookupInGrid(game.grid, add(entity.position, { x: _x2, y: _y2 }));
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = thisSquare[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var id = _step2.value;

          if (!collisions.includes(id) && id != entity.id) {
            collisions.push(id);
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
  }
  return collisions.map(function (i) {
    return game.entities[i];
  });
};

/////////////////////////////////////////////////////////////////
// Neighbors
/////////////////////////////////////////////////////////////////

var getNeighborPositions = function getNeighborPositions(entity, includeDiagonal) {
  var position = entity.position,
      width = entity.width,
      height = entity.height;

  var neighbors = [];
  for (var _x3 = position.x; _x3 < position.x + width; _x3++) {
    neighbors.push({ x: _x3, y: position.y + height });
    neighbors.push({ x: _x3, y: position.y - 1 });
  }
  for (var _y3 = position.y; _y3 < position.y + width; _y3++) {
    neighbors.push({ x: position.x - 1, y: _y3 });
    neighbors.push({ x: position.x + width, y: _y3 });
  }
  if (includeDiagonal) {
    neighbors.push({ x: position.x - 1, y: position.y - 1 });
    neighbors.push({ x: position.x - 1, y: position.y + height });
    neighbors.push({ x: position.x + width, y: position.y - 1 });
    neighbors.push({ x: position.x + width, y: position.y + height });
  }
  return neighbors;
};

var fastGetEmptyNeighborPositions = function fastGetEmptyNeighborPositions(game, entity, blockingEntityTypes) {
  if (entity.position == null) return [];
  var emptyPositions = [];
  var neighborPositions = getNeighborPositions(entity);
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = neighborPositions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var neighborPos = _step3.value;

      var neighbors = lookupInGrid(game.grid, neighborPos).filter(function (id) {
        return blockingEntityTypes.includes(game.entities[id].type);
      });
      if (neighbors.length == 0) {
        emptyPositions.push(neighborPos);
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

  return emptyPositions;
};

var fastGetNeighbors = function fastGetNeighbors(game, entity, includeDiagonal) {
  if (entity.position == null) return [];
  var neighborEntities = [];
  var neighborPositions = getNeighborPositions(entity, includeDiagonal);
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = neighborPositions[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var neighborPos = _step4.value;

      neighborEntities.push.apply(neighborEntities, _toConsumableArray(lookupInGrid(game.grid, neighborPos)));
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

  return neighborEntities.map(function (id) {
    return game.entities[id];
  });
};

var insideWorld = function insideWorld(game, pos) {
  return pos.x >= 0 && pos.x < game.worldWidth && pos.y >= 0 && pos.y < game.worldHeight;
};

var onScreen = function onScreen(game, pos) {
  var viewPos = game.viewPos;

  var e = 2; // to handle drag lag
  return pos.x >= viewPos.x - e && pos.y >= viewPos.y - e && pos.x <= viewPos.x + config.width + e && pos.y <= viewPos.y + config.height + e;
};

var getEntitiesInRadius = function getEntitiesInRadius(game, pos, radius) {
  var entities = [];
  for (var _x4 = -radius; _x4 <= radius; _x4++) {
    for (var _y4 = -radius; _y4 <= radius; _y4++) {
      if (_x4 * _x4 + _y4 * _y4 < radius * radius) {
        entities.push.apply(entities, _toConsumableArray(lookupInGrid(game.grid, { x: _x4 + pos.x, y: _y4 + pos.y })));
      }
    }
  }
  return entities.map(function (id) {
    return game.entities[id];
  });
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
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = entityTypes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var entityType = _step5.value;

      entities = entities.concat(game[entityType].map(function (id) {
        return game.entities[id];
      }));
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
  lookupInGrid: lookupInGrid,
  insideWorld: insideWorld,
  onScreen: onScreen,
  collides: collides,
  getSelectedAntIDs: getSelectedAntIDs,
  entitiesInMarquee: entitiesInMarquee,
  getEntitiesInRadius: getEntitiesInRadius
};
window.selectors = selectors; // for testing

module.exports = selectors;