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

var _require4 = require('../utils/helpers'),
    lookupInGrid = _require4.lookupInGrid;

/////////////////////////////////////////////////////////////////
// Collisions
/////////////////////////////////////////////////////////////////

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

var collidesWith = function collidesWith(entityA, entities) {
  var collisions = [];
  if (Array.isArray(entities)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var entityB = _step.value;

        if (entityA.id === entityB.id) {
          continue;
        }
        if (collides(entityA, entityB)) {
          collisions.push(entityB);
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
  } else {
    for (var entityID in entities) {
      var _entityB = entities[entityID];
      if (entityA.id === _entityB.id) {
        continue;
      }
      if (collides(entityA, _entityB)) {
        collisions.push(_entityB);
      }
    }
  }

  // don't collide with yourself ever
  return collisions.filter(function (e) {
    return e.id != entityA.id;
  });
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
  });
};

var fastGetEmptyNeighborPositions = function fastGetEmptyNeighborPositions(game, entity) {
  if (entity.position == null) return [];
  var emptyPositions = [];
  var neighborPositions = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = neighborPositions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var neighborVec = _step2.value;

      if (lookupInGrid(game.grid, add(entity.position, neighborVec)).length === 0) {
        emptyPositions.push(add(entity.position, neighborVec));
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

  return emptyPositions;
};

/////////////////////////////////////////////////////////////////
// Neighbors
/////////////////////////////////////////////////////////////////

// get all entities in the radius of the given entity excluding itself
// TODO only supports entities of size = 1
var getNeighborhoodEntities = function getNeighborhoodEntities(entity, entities, radius) {
  var neighborEntities = [];
  var neighborPositions = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = neighborPositions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var neighborVec = _step3.value;

      neighborEntities.push.apply(neighborEntities, _toConsumableArray(collidesWith(_extends({}, entity, { position: add(entity.position, neighborVec) }), entities)));
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

  return neighborEntities;
};

var getEmptyNeighborPositions = function getEmptyNeighborPositions(entity, entities) {
  var emptyPositions = [];
  var neighborPositions = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = neighborPositions[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var neighborVec = _step4.value;

      var free = collidesWith(_extends({}, entity, { position: add(entity.position, neighborVec) }), entities);
      if (free.length === 0) {
        emptyPositions.push(add(entity.position, neighborVec));
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

  return emptyPositions;
};

var insideWorld = function insideWorld(pos) {
  return pos.x >= 0 && pos.x < config.width && pos.y >= 0 && pos.y < config.height;
};

/////////////////////////////////////////////////////////////////
// Entities by type
/////////////////////////////////////////////////////////////////

var getSelectedAntIDs = function getSelectedAntIDs(game) {
  return game.selectedEntities.filter(function (id) {
    return game.ants.includes(id);
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

      switch (entityType) {
        case 'ANT':
          entities = entities.concat(game.ants.map(function (id) {
            return game.entities[id];
          }));
          break;
        case 'DIRT':
          entities = entities.concat(game.dirt.map(function (id) {
            return game.entities[id];
          }));
          break;
        case 'LOCATION':
          entities = entities.concat(game.locations.map(function (id) {
            return game.entities[id];
          }));
          break;
        case 'FOOD':
          entities = entities.concat(game.food.map(function (id) {
            return game.entities[id];
          }));
          break;
        case 'EGG':
          entities = entities.concat(game.eggs.map(function (id) {
            return game.entities[id];
          }));
          break;
        case 'LARVA':
          entities = entities.concat(game.larva.map(function (id) {
            return game.entities[id];
          }));
          break;
        case 'PUPA':
          entities = entities.concat(game.pupa.map(function (id) {
            return game.entities[id];
          }));
          break;
        case 'DEAD_ANT':
          entities = entities.concat(game.deadAnts.map(function (id) {
            return game.entities[id];
          }));
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

  return entities;
};

var selectors = {
  collides: collides,
  collidesWith: collidesWith,
  fastCollidesWith: fastCollidesWith,
  fastGetEmptyNeighborPositions: fastGetEmptyNeighborPositions,
  getSelectedAntIDs: getSelectedAntIDs,
  getNeighborhoodEntities: getNeighborhoodEntities,
  getEmptyNeighborPositions: getEmptyNeighborPositions,
  getEntitiesByType: getEntitiesByType,
  insideWorld: insideWorld
};
window.selectors = selectors; // for testing

module.exports = selectors;