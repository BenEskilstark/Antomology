// @flow

const {
  add,
  equals,
  subtract,
  distance,
  makeVector,
  vectorTheta,
} = require('../utils/vectors');
const {
  fastCollidesWith,
  fastGetEmptyNeighborPositions,
  fastGetNeighbors,
  collides,
  getEntitiesByType,
  filterEntitiesByType,
  insideWorld,
  getEntitiesInRadius,
} = require('../selectors/selectors');

///////////////////////////////////////////////////////////////////////////////
// EVALUATE CONDITION
///////////////////////////////////////////////////////////////////////////////
const evaluateCondition = (
  game: GameState, ant: Ant, condition: Condition,
): boolean => {
  let isTrue = false;
  const {not, comparator, payload} = condition;
  const {object} = payload;
  switch (condition.type) {
    case 'LOCATION': {
      // comparator must be EQUALS
      // ant is considered to be at a location if it is within its boundingRect
      let loc = object;
      if (typeof loc === 'string') {
        loc = getEntitiesByType(game, ['LOCATION']).filter(l => l.name === loc)[0];
      }
      isTrue = collides(game, ant, loc);
      break;
    }
    case 'HOLDING': {
      if (object === 'ANYTHING' && (ant.holding != null && ant.holding.type != null)) {
        isTrue = true;
      } else if (object === 'NOTHING' && (ant.holding == null || ant.holding.type == null)) {
        isTrue = true;
      } else if (
        object === 'DIRT' || object === 'FOOD' ||
        object === 'EGG' || object === 'LARVA' ||
        object === 'PUPA' || object === 'DEAD_ANT'
      ) {
        isTrue = ant.holding != null && ant.holding.type == object;
      } else {
        isTrue = (ant.holding == null && object == null) ||
          ant.holding.type == object; // object is the held type
      }
      break;
    }
    case 'NEIGHBORING': {
      // comparator must be EQUALS
      const neighbors = fastGetNeighbors(game, ant);
      if (object === 'ANYTHING') {
        isTrue = neighbors.length > 0;
      } else if (object === 'NOTHING') {
        isTrue = neighbors.length === 0;
      } else if (object === 'MARKED_DIRT') {
        let pheromoneNeighbors = neighbors
          .filter(e => e.type === 'PHEROMONE');
        let dirtNeighbors = neighbors
          .filter(e => e.type === 'DIRT');
        isTrue = false;
        for (const dirt of dirtNeighbors) {
          for (const pheromone of pheromoneNeighbors) {
            if (equals(dirt.position, pheromone.position)) {
              isTrue = true;
            }
          }
        }
      } else if (
        object === 'DIRT' || object === 'FOOD' ||
        object === 'EGG' || object === 'LARVA' ||
        object === 'PUPA' || object === 'DEAD_ANT' ||
        object === 'TRAIL'
      ) {
        let typeName = object;
        if (object === 'TRAIL') {
          typeName = 'PHEROMONE';
        }
        isTrue = neighbors.filter(n => n.type === typeName).length > 0;
      } else if (object != null && object.id != null) {
        isTrue = neighbors.filter(n => n.id === object.id).length > 0;
      } else if (typeof object === 'string') {
        isTrue = neighbors.filter(l => l.name === object).length > 0;
      }
      break;
    }
    case 'BLOCKED': {
      // comparator must be EQUALS
      isTrue = ant.blocked;
      break;
    }
    case 'IS_QUEEN': {
      // comparator must be EQUALS
      isTrue = ant.subType === 'QUEEN';
      break;
    }
    case 'RANDOM': {
      const value = object;
      const rand = Math.random();
      if (comparator === 'EQUALS') {
        isTrue = rand == value;
      } else if (comparator === 'LESS_THAN') {
        isTrue = rand < value;
      } else if (comparator === 'GREATER_THAN') {
        isTrue = rand > value;
      }
      break;
    }
    case 'CALORIES': {
      const value = object;
      const antCalories = ant.calories;
      if (comparator === 'EQUALS') {
        isTrue = antCalories == value;
      } else if (comparator === 'LESS_THAN') {
        isTrue = antCalories < value;
      } else if (comparator === 'GREATER_THAN') {
        isTrue = antCalories > value;
      }
      break;
    }
    case 'AGE': {
      // TODO: age, calories, random are very similar
      const value = object;
      const antAge = ant.age;
      if (comparator === 'EQUALS') {
        isTrue = antAge == value;
      } else if (comparator === 'LESS_THAN') {
        isTrue = antAge < value;
      } else if (comparator === 'GREATER_THAN') {
        isTrue = antAge > value;
      }
      break;
    }
  }

  return not ? !isTrue : isTrue;
};

module.exports = {evaluateCondition};
