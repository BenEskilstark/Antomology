'use strict';

var _require = require('../utils/vectors'),
    add = _require.add,
    equals = _require.equals,
    subtract = _require.subtract,
    distance = _require.distance,
    makeVector = _require.makeVector,
    vectorTheta = _require.vectorTheta;

var _require2 = require('../selectors/selectors'),
    fastCollidesWith = _require2.fastCollidesWith,
    fastGetEmptyNeighborPositions = _require2.fastGetEmptyNeighborPositions,
    fastGetNeighbors = _require2.fastGetNeighbors,
    collides = _require2.collides,
    getEntitiesByType = _require2.getEntitiesByType,
    filterEntitiesByType = _require2.filterEntitiesByType,
    insideWorld = _require2.insideWorld,
    getEntitiesInRadius = _require2.getEntitiesInRadius;

///////////////////////////////////////////////////////////////////////////////
// EVALUATE CONDITION
///////////////////////////////////////////////////////////////////////////////


var evaluateCondition = function evaluateCondition(game, ant, condition) {
  var isTrue = false;
  var not = condition.not,
      comparator = condition.comparator,
      payload = condition.payload;
  var object = payload.object;

  switch (condition.type) {
    case 'LOCATION':
      {
        // comparator must be EQUALS
        // ant is considered to be at a location if it is within its boundingRect
        var loc = object;
        if (typeof loc === 'string') {
          loc = getEntitiesByType(game, ['LOCATION']).filter(function (l) {
            return l.name === loc;
          })[0];
        }
        isTrue = collides(game, ant, loc);
        break;
      }
    case 'HOLDING':
      {
        if (object === 'ANYTHING' && ant.holding != null && ant.holding.type != null) {
          isTrue = true;
        } else if (object === 'NOTHING' && (ant.holding == null || ant.holding.type == null)) {
          isTrue = true;
        } else if (object === 'DIRT' || object === 'FOOD' || object === 'EGG' || object === 'LARVA' || object === 'PUPA' || object === 'DEAD_ANT') {
          isTrue = ant.holding != null && ant.holding.type == object;
        } else {
          isTrue = ant.holding == null && object == null || ant.holding.type == object; // object is the held type
        }
        break;
      }
    case 'NEIGHBORING':
      {
        // comparator must be EQUALS
        var neighbors = fastGetNeighbors(game, ant);
        if (object === 'ANYTHING') {
          isTrue = neighbors.length > 0;
        } else if (object === 'NOTHING') {
          isTrue = neighbors.length === 0;
        } else if (object === 'MARKED_DIRT') {
          var pheromoneNeighbors = neighbors.filter(function (e) {
            return e.type === 'PHEROMONE';
          });
          var dirtNeighbors = neighbors.filter(function (e) {
            return e.type === 'DIRT';
          });
          isTrue = false;
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
                  var pheromone = _step2.value;

                  if (equals(dirt.position, pheromone.position)) {
                    isTrue = true;
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
        } else if (object === 'DIRT' || object === 'FOOD' || object === 'EGG' || object === 'LARVA' || object === 'PUPA' || object === 'DEAD_ANT' || object === 'TRAIL') {
          var typeName = object;
          if (object === 'TRAIL') {
            typeName = 'PHEROMONE';
          }
          isTrue = neighbors.filter(function (n) {
            return n.type === typeName;
          }).length > 0;
        } else if (object != null && object.id != null) {
          isTrue = neighbors.filter(function (n) {
            return n.id === object.id;
          }).length > 0;
        } else if (typeof object === 'string') {
          isTrue = neighbors.filter(function (l) {
            return l.name === object;
          }).length > 0;
        }
        break;
      }
    case 'BLOCKED':
      {
        // comparator must be EQUALS
        isTrue = ant.blocked;
        break;
      }
    case 'IS_QUEEN':
      {
        // comparator must be EQUALS
        isTrue = ant.subType === 'QUEEN';
        break;
      }
    case 'RANDOM':
      {
        var value = object;
        var rand = Math.random();
        if (comparator === 'EQUALS') {
          isTrue = rand == value;
        } else if (comparator === 'LESS_THAN') {
          isTrue = rand < value;
        } else if (comparator === 'GREATER_THAN') {
          isTrue = rand > value;
        }
        break;
      }
    case 'CALORIES':
      {
        var _value = object;
        var antCalories = ant.calories;
        if (comparator === 'EQUALS') {
          isTrue = antCalories == _value;
        } else if (comparator === 'LESS_THAN') {
          isTrue = antCalories < _value;
        } else if (comparator === 'GREATER_THAN') {
          isTrue = antCalories > _value;
        }
        break;
      }
    case 'AGE':
      {
        // TODO: age, calories, random are very similar
        var _value2 = object;
        var antAge = ant.age;
        if (comparator === 'EQUALS') {
          isTrue = antAge == _value2;
        } else if (comparator === 'LESS_THAN') {
          isTrue = antAge < _value2;
        } else if (comparator === 'GREATER_THAN') {
          isTrue = antAge > _value2;
        }
        break;
      }
  }

  return not ? !isTrue : isTrue;
};

module.exports = { evaluateCondition: evaluateCondition };