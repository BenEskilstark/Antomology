'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../utils/errors'),
    invariant = _require.invariant;

var _require2 = require('../utils/vectors'),
    subtract = _require2.subtract,
    distance = _require2.distance,
    add = _require2.add;

var _require3 = require('../config'),
    config = _require3.config;

// TODO: collides should handle entities with arbitrary sizes
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
    if (entityB.position.y + entityB.width > entityA.position.y && entityB.position.y + entityB.width <= entityA.position.y + entityA.width) {
      yOverlap = true;
    }
  } else {
    if (entityA.position.y + entityA.width > entityB.position.y && entityA.position.y + entityA.width <= entityB.position.y + entityB.width) {
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

  return collisions;
};

var getSelectedAntIDs = function getSelectedAntIDs(game) {
  return game.selectedEntities.filter(function (id) {
    return game.ants.includes(id);
  });
};

var getNeighborhoodLocation = function getNeighborhoodLocation(entity, radius) {
  var rad = radius != null ? radius : 1;
  return {
    position: add(entity.position, { x: -rad, y: -rad }),
    width: rad * 2 + 1, // +1 to include inner space itself
    height: rad * 2 + 1
  };
};

// get all entities in the radius of the given entity excluding itself
var getNeighborhoodEntities = function getNeighborhoodEntities(entity, entities, radius) {
  var rad = radius != null ? radius : 1;
  var neighborhoodLocation = getNeighborhoodLocation(entity, rad);
  return collidesWith(neighborhoodLocation, entities).filter(function (e) {
    return e.id != entity.id;
  });
};

var getEmptyNeighborPositions = function getEmptyNeighborPositions(entity, entities) {
  var emptyPositions = [];
  var neighborPositions = [{ x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = neighborPositions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var neighborVec = _step2.value;

      var free = collidesWith(_extends({}, entity, { position: add(entity.position, neighborVec) }), entities);
      if (free.length === 0) {
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

var getEntitiesByType = function getEntitiesByType(game, entityType) {
  switch (entityType) {
    case 'ANT':
      {
        return game.ants.map(function (id) {
          return game.entities[id];
        });
      }
    case 'DIRT':
      {
        return game.dirt.map(function (id) {
          return game.entities[id];
        });
      }
    case 'LOCATION':
      {
        return game.locations.map(function (id) {
          return game.entities[id];
        });
      }
  }
};

var selectors = {
  collides: collides,
  collidesWith: collidesWith,
  getSelectedAntIDs: getSelectedAntIDs,
  getNeighborhoodLocation: getNeighborhoodLocation,
  getNeighborhoodEntities: getNeighborhoodEntities,
  getEmptyNeighborPositions: getEmptyNeighborPositions,
  getEntitiesByType: getEntitiesByType
};
window.selectors = selectors; // for testing

module.exports = selectors;