// @flow

const {
  add,
  equals,
  subtract,
  distance,
  makeVector,
  vectorTheta,
} = require('../utils/vectors');
const {config} = require('../config');
const {sin, cos, abs, sqrt} = Math;
const {
  createIdleTask,
  createGoToLocationBehavior,
} = require('../state/tasks');
const {invariant} = require('../utils/errors');
const {
  randomIn,
  normalIn,
  oneOf,
  deleteFromArray,
  getInnerLocation,
} = require('../utils/helpers');
const {
  insertInGrid,
  deleteFromGrid,
  lookupInGrid,
  addEntity,
  removeEntity,
  moveEntity,
  changeEntityType,
  pickUpEntity,
  putDownEntity,
  maybeMoveEntity,
  antEatEntity,
  antMakePheromone,
  antSwitchTask,
  maybeMoveTowardsLocation,
  maybeDoRandomMove,
} = require('../utils/stateHelpers');
const {
  fastCollidesWith,
  fastGetEmptyNeighborPositions,
  fastGetNeighbors,
  collides,
  getEntitiesByType,
  filterEntitiesByType,
  insideWorld,
  getEntitiesInRadius,
  shouldFall,
  canLayEgg,
} = require('../selectors/selectors');
const {makeEgg} = require('../entities/egg');

const doAction = (
  game: GameState, ant: Ant, action: AntAction,
): void => {
  const {payload} = action;
  let {object, constraint} = payload;
  let actionType = action.type;

  // first handle ants that are holding a big entity
  if (ant.holding != null && ant.holding.toLift > 1) {
    const bigEntity = ant.holding;

    // if (bigEntity.toLift > bigEntity.heldBy.length) {
    //   // if the ant is assigned something else to do, drop it
    //   if (action.type !== 'PUTDOWN' && action.type !== 'IDLE') {
    //     putDownEntity(game, ant);
    //   }
    // }
  }

  // split out idle first since it could involve a random move
  let obj = object;
  if (actionType === 'IDLE') {
    // unstack, similar to moving out of the way of placed dirt
    const stackedAnts = fastCollidesWith(game, ant)
      .filter(e => config.antBlockingEntities.includes(e.type) || e.type == 'ANT');
    if (stackedAnts.length > 0) {
      const freePositions = fastGetEmptyNeighborPositions(
        game, ant, config.antBlockingEntities,
      );
      if (freePositions.length > 0) {
        moveEntity(game, ant, oneOf(freePositions));
      }
    } else {
      const rand = Math.random();
      if (rand < 0.05) {
        // only move if unselected
        if (!game.selectedEntities.includes(ant.id)) {
          actionType = 'MOVE';
          obj = 'RANDOM';
          if (ant.location != null) {
            constraint = getInnerLocation(ant.location);
          }
        }
      } else if (rand < 0.1) {
        const factor = Math.random() < 0.5 ? 1 : -1;
        ant.theta += factor * Math.PI/2;
      } else {
        ant.calories += 1; // calories don't go down if you fully idle
      }
    }
    ant.prevPosition = {...ant.position};
  }

  // then handle the actually-assigned action
  switch (actionType) {
    case 'IDLE': {
      // placeholder
      break;
    }
    case 'MOVE': {
      let loc = object;
      if (obj === 'TRAIL' || obj === 'REVERSE_TRAIL') {
        const pheromone = oneOf(
          lookupInGrid(game.grid, ant.position)
            .map(id => game.entities[id])
            .filter(e => e.type === 'PHEROMONE')
        );
        if (pheromone != null) {
          if (obj === 'REVERSE_TRAIL') {
            const prevPheromone = game.entities[pheromone.prevPheromone];
            if (prevPheromone != null) {
              const diff = subtract(prevPheromone.position, pheromone.position);
              const dir = makeVector(vectorTheta(diff), 1)
              loc = {position: add(ant.position, dir)};
            } else {
              obj = 'RANDOM';
            }
          } else {
            const dir = makeVector(pheromone.theta, 1)
            loc = {position: add(ant.position, dir)};
          }
        } else {
          antSwitchTask(game, ant, createIdleTask());
          ant.taskIndex = -1; // HACK for switching tasks inside a task
          break;
        }
      }
      if (obj === 'RANDOM') {
        maybeDoRandomMove(game, ant, ['NO_REVERSE'], constraint);
        break;
      } else if (
        obj != 'TRAIL' && obj != 'REVERSE_TRAIL' && typeof obj === 'string'
      ) {
        loc = getEntitiesByType(game, ['LOCATION']).filter(l => l.name === obj)[0];
      }
      const didMove = maybeMoveTowardsLocation(game, ant, loc.position);
      if (didMove === true) {
        antMakePheromone(game, ant);
        ant.blocked = false;
        ant.blockedBy = null;
      } else {
        ant.blocked = true;
        // TODO blockedBy requires ants to be 1x1
        ant.blockedBy = didMove;
      }
      break;
    }
    case 'PICKUP': {
      let entityToPickup = object;
      if (entityToPickup === 'BLOCKER') {
        entityToPickup = ant.blockedBy;
      } else if (entityToPickup === 'MARKED_DIRT') {
        const neighbors = fastGetNeighbors(game, ant);
        let pheromoneNeighbors = neighbors
          .filter(e => e.type === 'PHEROMONE');
        let dirtNeighbors = neighbors
          .filter(e => e.type === 'DIRT');
        const markedDirt = [];
        for (const dirt of dirtNeighbors) {
          for (const pheromone of pheromoneNeighbors) {
            if (equals(dirt.position, pheromone.position)) {
              markedDirt.push(dirt);
            }
          }
        }
        entityToPickup = oneOf(markedDirt);
      } else if (
        entityToPickup === 'DIRT' || entityToPickup === 'FOOD' ||
        entityToPickup === 'EGG' || entityToPickup === 'LARVA' ||
        entityToPickup === 'PUPA' || entityToPickup === 'DEAD_ANT'
      ) {
        entityToPickup = oneOf(
          fastGetNeighbors(game, ant)
            .filter(e => e.type == entityToPickup)
            .filter(e => {
              if (constraint != null) {
                return collides(game, e, constraint);
              } else {
                return true;
              }
            })
        );
      } else if (entityToPickup != null && entityToPickup.position != null ) {
        entityToPickup = fastGetNeighbors(game, ant)
          .filter(e => e.id === entityToPickup.id)[0];
      }
      if (entityToPickup == null || entityToPickup.position == null) {
        break;
      }
      if (ant.holding == null) {
        pickUpEntity(game, ant, entityToPickup);
        if (entityToPickup.toLift > 1) {
          const bigEntity = entityToPickup;
          const targetLoc = {
            position: {
              x: Math.round(bigEntity.position.x + bigEntity.width / 2),
              y: bigEntity.lifted ? bigEntity.position.y - 1 : bigEntity.position.y,
            },
            width: 1,
            height: 1,
          };
          const goToLocationBehavior = createGoToLocationBehavior(targetLoc);
          antSwitchTask(game, ant, {
            name: 'Picking up ' + bigEntity.type,
            repeating: false,
            behaviorQueue: [
              goToLocationBehavior,
              {
                type: 'SWITCH_TASK',
                task: 'Holding and Idle'
              }
            ],
          });
          ant.taskIndex = -1; // HACK to switch tasks inside a task
        }
      }
      break;
    }
    case 'PUTDOWN': {
      let locationToPutdown = object;
      if (locationToPutdown == null) {
        locationToPutdown = {position: ant.position, width: 1, height: 1};
      }
      const putDownFree = fastCollidesWith(game, locationToPutdown)
        .filter(e => {
          return config.antBlockingEntities.includes(e.type) ||
            e.type === 'PHEROMONE';
        })
        .length === 0;
      if (
        collides(game, ant, locationToPutdown) &&
        ant.holding != null && putDownFree
      ) {
        const toPutDown = ant.holding;
        putDownEntity(game, ant);
        // move the ant out of the way if dropped entity won't fall
        if (!shouldFall(game, toPutDown)) {
          const freePositions = fastGetEmptyNeighborPositions(
            game, ant, config.antBlockingEntities,
          );
          if (freePositions.length > 0) {
            moveEntity(game, ant, freePositions[0]);
          }
        }
      }
      break;
    }
    case 'EAT': {
      let entityToEat = object;
      const neighborFood = fastGetNeighbors(game, ant)
        .filter(e => e.type === 'FOOD');
      if (entityToEat == null) {
        entityToEat = oneOf(neighborFood);
      } else if (entityToEat.id != null) {
        entityToEat = neighborFood.filter(f => f.id == entityToEat.id)[0];
      }
      if (entityToEat == null) break;
      antEatEntity(game, ant, entityToEat);
      break;
    }
    case 'FEED': {
      const typeToFeed = object;
      const feedableEntities = fastGetNeighbors(game, ant)
        .filter(e => ['ANT', 'LARVA'].includes(e.type));
      if (
        ant.holding != null && ant.holding.type === 'FOOD' &&
        feedableEntities.length > 0
      ) {
        let fedEntity = null;
        if (typeToFeed === 'LARVA') {
          for (const e of feedableEntities) {
            if (e.type === 'LARVA') {
              fedEntity = e;
              break;
            }
          }
        } else if (typeToFeed === 'QUEEN') {
          for (const e of feedableEntities) {
            if (e.subType === 'QUEEN') {
              fedEntity = e;
              break;
            }
          }
        } else if (typeToFeed === null || typeToFeed === 'RANDOM') {
          fedEntity = oneOf(feedableEntities);
        }
        if (fedEntity != null) {
          const ateAll = antEatEntity(game, fedEntity, ant.holding);
          if (ateAll) {
            ant.holding = null;
          }
        }
      }
      break;
    }
    case 'MARK': {
      // TODO
      break;
    }
    case 'LAY': {
      if (canLayEgg(game, ant) === true) {
        const egg = makeEgg(ant.position, 'WORKER'); // TODO
        addEntity(game, egg);
        // move the ant out of the way
        const freePositions = fastGetEmptyNeighborPositions(
          game, ant, config.antBlockingEntities,
        );
        ant.eggLayingCooldown = config.eggLayingCooldown;
        if (freePositions.length > 0) {
          moveEntity(game, ant, freePositions[0]);
        }
      }
      break;
    }
    case 'COMMUNICATE': {
      // TODO
      break;
    }
  }

};

const doHighLevelAction = (
  game: GameState, ant: Ant, action: AntAction,
): boolean => {
  const {payload} = action;
  let {object} = payload;
  let actionType = action.type;
  let done = false;

  switch (actionType) {
    case 'IDLE': {
      doAction(game, ant, {type: 'IDLE', payload: {object: null}});
      break;
    }
    // high level move is a random move inside a location
    case 'MOVE': {
      doAction(
        game, ant,
        {
          type: 'MOVE',
          payload: {object: 'RANDOM', constraint: action.payload.object}
        },
      );
      break;
    }
    // high level pickup moves around randomly inside location until
    // item type you want to pickup is encountered
    case 'PICKUP': {
      const constraint = getInnerLocation(ant.location);
      doAction(
        game, ant, {type: 'PICKUP', payload: {object, constraint}},
      );
      if (!ant.holding) {
        doAction(
          game, ant,
          {
            type: 'MOVE',
            payload: {object: 'RANDOM', constraint}
          },
        );
      } else {
        done = true;
      }
      break;
    }
    case 'PUTDOWN': {
      if (ant.accumulator == null) {
        ant.accumulator = Math.round(Math.random() * 10) + 10;
      }
      if (ant.accumulator <= 0) {
        doAction(
          game, ant, {type: 'PUTDOWN', payload: {object: null}},
        );
      } else {
        doAction(
          game, ant,
          {
            type: 'MOVE',
            payload: {object: 'RANDOM', constraint: getInnerLocation(ant.location)}
          },
        );
        ant.accumulator--;
      }
      if (!ant.holding) {
        ant.accumulator = null;
        done = true;
      }
      break;
    }
    case 'FIND_PHEROMONE': {
      const onPheromone = fastCollidesWith(game, ant)
        .filter(e => e.type === 'PHEROMONE')
        // .filter(p => game.edges[p.edge].end != ant.location)
        // filter to pheromones that point out of location
        .filter(p => {
          const locPointedAt = add(
            makeVector(p.theta, 1),
            p.position,
          );

          return !collides(
            game, ant.location, {position: locPointedAt, width: 1, height: 1},
          );
        })
        .length > 0;
      if (onPheromone) {
        done = true;
      } else {
        doAction(
          game, ant,
          {
            type: 'MOVE',
            payload: {object: 'RANDOM', constraint: ant.location}
          },
        );
      }
      break;
    }
    case 'FEED': {
      if (!ant.holding || ant.holding.type != 'FOOD') {
        done = true;
      } else {
        doAction(game, ant, {type: 'FEED', payload: {object}});
        doAction(
          game, ant,
          {
            type: 'MOVE',
            payload: {object: 'RANDOM', constraint: getInnerLocation(ant.location)}
          },
        );
      }
      break;
    }
    case 'EAT': {
      const startCalories = ant.calories;
      doAction(
        game, ant,
        {
          type: 'MOVE',
          payload: {object: 'RANDOM', constraint: getInnerLocation(ant.location)}
        },
      );
      doAction(game, ant, {type: 'EAT', payload: {object: null}});
      if (ant.calories > startCalories) {
        done = true;
      }
      break;
    }
    case 'LAY': {
      doAction(
        game, ant,
        {
          type: 'MOVE',
          payload: {object: 'RANDOM', constraint: getInnerLocation(ant.location)}
        },
      );
      doAction(game, ant, {type: 'LAY', payload: {object: null}});
    }
      break;
  }
  return done;
};

module.exports = {doAction, doHighLevelAction};
