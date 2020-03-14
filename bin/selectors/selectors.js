'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var collides = function collides(game, entityA, entityB) {
  if (entityB == null) {
    console.error('collides cllsite');
  }
  if (entityA == null || entityB == null) {
    return false;
  }
  if (entityA.position == null || entityB.position == null) {
    return false;
  }
  if (entityA.width == null || entityA.height == null) {
    return false;
  }
  if (entityB.width == null || entityB.height == null) {
    return false;
  }

  // fall-back to testing shape overlaps
  if (entityA.isContraint || entityB.isConstraint) {
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
  }

  for (var _x = 0; _x < entityA.width; _x++) {
    for (var _y = 0; _y < entityA.height; _y++) {
      var thisSquare = lookupInGrid(game.grid, add(entityA.position, { x: _x, y: _y }));
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = thisSquare[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var id = _step.value;

          if (id == entityB.id) {
            return true;
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
  for (var _x2 = 0; _x2 < entityB.width; _x2++) {
    for (var _y2 = 0; _y2 < entityB.height; _y2++) {
      var _thisSquare = lookupInGrid(game.grid, add(entityB.position, { x: _x2, y: _y2 }));
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _thisSquare[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _id = _step2.value;

          if (_id == entityA.id) {
            return true;
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
  return false;
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
  for (var _x3 = position.x; _x3 < position.x + width; _x3++) {
    for (var _y3 = position.y; _y3 < position.y + height; _y3++) {
      var entitiesInSquare = lookupInGrid(game.grid, { x: _x3, y: _y3 });
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = entitiesInSquare[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var id = _step3.value;

          if (!entities.includes(id)) {
            entities.push(id);
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
  var collisions = [];
  if (entity.segmented) {
    var _position = entity.position,
        segments = entity.segments;

    collisions.push.apply(collisions, _toConsumableArray(lookupInGrid(game.grid, _position)));
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = segments[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var segment = _step4.value;

        var thisSquare = lookupInGrid(game.grid, segment.position);
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = thisSquare[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var id = _step5.value;

            if (!collisions.includes(id) && id != entity.id) {
              collisions.push(id);
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

    return collisions.map(function (i) {
      return game.entities[i];
    });
  }
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
  for (var _x4 = 0; _x4 < width; _x4++) {
    for (var _y4 = 0; _y4 < height; _y4++) {
      var _thisSquare2 = lookupInGrid(game.grid, add(entity.position, { x: _x4, y: _y4 }));
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = _thisSquare2[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var _id2 = _step6.value;

          if (!collisions.includes(_id2) && _id2 != entity.id) {
            collisions.push(_id2);
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
  for (var _x5 = position.x; _x5 < position.x + width; _x5++) {
    neighbors.push({ x: _x5, y: position.y + height });
    neighbors.push({ x: _x5, y: position.y - 1 });
  }
  for (var _y5 = position.y; _y5 < position.y + width; _y5++) {
    neighbors.push({ x: position.x - 1, y: _y5 });
    neighbors.push({ x: position.x + width, y: _y5 });
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
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = neighborPositions[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var neighborPos = _step7.value;

      var neighbors = lookupInGrid(game.grid, neighborPos).filter(function (id) {
        return blockingEntityTypes.includes(game.entities[id].type);
      });
      if (neighbors.length == 0) {
        emptyPositions.push(neighborPos);
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

  return emptyPositions;
};

var fastGetNeighbors = function fastGetNeighbors(game, entity, includeDiagonal) {
  if (entity.position == null) return [];
  var neighborEntities = [];
  var neighborPositions = getNeighborPositions(entity, includeDiagonal);
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = neighborPositions[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var neighborPos = _step8.value;

      neighborEntities.push.apply(neighborEntities, _toConsumableArray(lookupInGrid(game.grid, neighborPos)));
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
  for (var _x6 = -radius; _x6 <= radius; _x6++) {
    for (var _y6 = -radius; _y6 <= radius; _y6++) {
      if (_x6 * _x6 + _y6 * _y6 < radius * radius) {
        entities.push.apply(entities, _toConsumableArray(lookupInGrid(game.grid, { x: _x6 + pos.x, y: _y6 + pos.y })));
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
  var _iteratorNormalCompletion9 = true;
  var _didIteratorError9 = false;
  var _iteratorError9 = undefined;

  try {
    for (var _iterator9 = entityTypes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
      var entityType = _step9.value;

      entities = entities.concat(game[entityType].map(function (id) {
        return game.entities[id];
      }));
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

  return entities;
};

var filterEntitiesByType = function filterEntitiesByType(entities, entityTypes) {
  return entities.filter(function (e) {
    return entityTypes.includes(e.type);
  });
};

/////////////////////////////////////////////////////////////////
// Queen
/////////////////////////////////////////////////////////////////

var getQueen = function getQueen(game) {
  return game.ANT.map(function (id) {
    return game.entities[id];
  }).filter(function (a) {
    return a.subType === 'QUEEN';
  })[0];
};

var canLayEgg = function canLayEgg(game, ant) {
  if (ant.subType != 'QUEEN') return 'Not Queen';
  var nothingInTheWay = fastCollidesWith(game, ant).filter(function (e) {
    return config.antBlockingEntities.includes(e.type);
  }).length === 0;
  if (!nothingInTheWay) return 'Egg laying position blocked';

  var dirtBelow = lookupInGrid(game.grid, add(ant.position, { x: 0, y: -1 })).filter(function (id) {
    var e = game.entities[id];
    return e.type === 'DIRT' || e.type === 'STONE' || e.type === 'STUCK_STONE';
  }).length > 0;
  if (!dirtBelow) return 'No support below';

  if (ant.eggLayingCooldown > 0) return 'Too soon since last egg laid';

  return true;
};

/////////////////////////////////////////////////////////////////
// Gravity
/////////////////////////////////////////////////////////////////

var shouldFall = function shouldFall(game, entity) {
  if (!config.fallingEntities.includes(entity.type)) return false;
  if (!entity.position) return false;
  if (entity.lifted) return false;
  // TODO lifted (big)entities not affected by gravity for now
  var isBig = entity.toLift > 1;
  var isReadyToLift = entity.toLift <= entity.heldBy.length;
  // if (isBig && isReadyToLift && !entity.isLifted) continue;
  var positionBeneath = subtract(entity.position, { x: 0, y: 1 });
  var entitiesBeneath = fastCollidesWith(game, _extends({}, entity, { position: positionBeneath })).filter(function (e) {
    return config.stopFallingEntities.includes(e.type);
  }).length > 0;
  var entitiesSupporting = [];
  if (config.supportedEntities.includes(entity.type)) {
    entitiesSupporting = fastCollidesWith(game, entity).filter(function (e) {
      return config.supportingBackgroundTypes.includes(e.subType) || config.supportingForegroundTypes.includes(e.type) && entity.type != 'DIRT' // TODO doesn't well handle what
      // can climb on grass
      ;
    });
    if (config.climbingEntities.includes(entity.type)) {
      entitiesSupporting = entitiesSupporting.concat(fastGetNeighbors(game, entity, true /* diagonal */).filter(function (e) {
        return config.stopFallingEntities.includes(e.type);
      }));
    }
  }
  entitiesSupporting = entitiesSupporting.filter(function (e) {
    return e.id != entity.id;
  });
  return !entitiesSupporting.length > 0 && !entitiesBeneath && insideWorld(game, positionBeneath);
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
  getEntitiesInRadius: getEntitiesInRadius,
  shouldFall: shouldFall,
  canLayEgg: canLayEgg,
  getQueen: getQueen
};
window.selectors = selectors; // for testing

module.exports = selectors;