// @flow
// Helpers for creating tasks/locations via the console

import type {Task, Location, Behavior, GameState} from '../types';

///////////////////////////////////////////////////////////////
// general
///////////////////////////////////////////////////////////////

/**
 * Go towards the location until you're a neighbor, then try to advance
 * to the location separately. This way you get out of the while loop
 * even if the location is occupied
 */
const createGoToLocationTask = (location: Location): Task => {
  return {
    name: 'Go To Location',
    repeating: false,
    behaviorQueue: [
      createGoToLocationNeighborBehavior(location),
      createDoAction('MOVE', location),
    ],
  };
};

const createDoAction = (type: string, object: mixed): Behavior => {
  return {
    type: 'DO_ACTION',
    action: {
      type,
      payload: {
        object,
      },
    },
  };
};

const createIdleTask = (): Task => {
  return {
    name: 'Idle',
    repeating: true,
    behaviorQueue: [
      createDoAction('IDLE', null),
    ],
  }
}

const createLayEggTask = (): Task => {
  return {
    name: 'Lay Egg',
    repeating: false,
    behaviorQueue: [
      createDoAction('LAY', null),
    ],
  };
}

///////////////////////////////////////////////////////////////
// move
///////////////////////////////////////////////////////////////

const createMoveBehavior = (location: ?Location): Behavior => {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'MOVE',
      payload: {
        object: location != null ? location : 'RANDOM',
      },
    },
  };
};

const createRandomMoveTask = (): Task => {
  return {
    name: 'Move Randomly',
    repeating: true,
    behaviorQueue: [
      createMoveBehavior(),
    ],
  };
};

///////////////////////////////////////////////////////////////
// go to location
///////////////////////////////////////////////////////////////

const createGoToLocationBehavior = (location: Location): Behavior => {
  return {
    type: 'WHILE',
    condition: {
      type: 'LOCATION',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: location,
      },
    },
    behavior: createMoveBehavior(location),
  };
}

const createGoToLocationNeighborBehavior = (location: Loaction): Behavior => {
  return {
    type: 'WHILE',
    condition: {
      type: 'NEIGHBORING',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: location,
      },
    },
    behavior: createMoveBehavior(location),
  };
}

const getIthLocation = (game: GameState, i: number): Location => {
  const locationID = game.locations[i];
  return game.entities[locationID];
}

const getLocation = (game: GameState, locationID: number): Location => {
  return game.entities[locationID];
}

///////////////////////////////////////////////////////////////
// digging
///////////////////////////////////////////////////////////////

const createFindBlueprintBehavior = (): Behavior => {
  return {
    type: 'WHILE',
    condition: {
      type: 'NEIGHBORING',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: 'MARKED',
      },
    },
    behavior: createMoveBehavior(), // move randomly
  };
};

const createPickupBlueprintBehavior = (): Behavior => {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PICKUP',
      payload: {
        object: 'MARKED',
      },
    },
  };
};

const createFindDropOffLocationBehavior = (): Behavior => {
  return {
    type: 'WHILE',
    condition: {
      type: 'RANDOM',
      not: false,
      comparator: 'LESS_THAN',
      payload: {
        object: 0.9,
      },
    },
    behavior: createMoveBehavior(),
  };
};

const createPutDownBehavior = (): Behavior => {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PUTDOWN',
      payload: {
        object: null, // put down at current position
      },
    },
  };
}

const createPickupBlockerBehavior = (): Behavior => {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PICKUP',
      payload: {
        object: 'BLOCKER',
      },
    },
  };
}

const createDigBlueprintTask = (game: GameState): Task => {
  return {
    name: 'Dig Out Blueprint',
    repeating: true,
    behaviorQueue: [
      createGoToLocationBehavior(getIthLocation(game, 0)),
      createFindBlueprintBehavior(),
      createPickupBlueprintBehavior(),
      createGoToLocationBehavior(getIthLocation(game, 0)),
      createFindDropOffLocationBehavior(),
      createPutDownBehavior(),
      {
        type: 'SWITCH_TASK',
        task: 'Move Dirt Out of the Way to the Entrance',
      },
    ],
  };
};

const createGoToColonyEntranceWithBlockerTask = (game: GameState): Task => {
  return {
    name: 'Move Dirt Out of the Way to the Entrance',
    repeating: false,
    behaviorQueue: [
      {
        type: 'WHILE',
        condition: {
          type: 'LOCATION',
          not: true,
          comparator: 'EQUALS',
          payload: {
            object: getIthLocation(game, 0),
          },
        },
        behavior: {
          type: 'IF',
          condition: {
            type: 'BLOCKED',
            not: true,
            comparator: 'EQUALS',
            payload: {
              object: null,
            },
          },
          behavior: createMoveBehavior(getIthLocation(game, 0)),
          elseBehavior: {
            type: 'SWITCH_TASK',
            done: false,
            task: 'Put Down Blocking Dirt',
          },
        },
      },
      {
        type: 'SWITCH_TASK',
        task: 'Dig Out Blueprint',
      },
    ],
  };
}

const createMoveBlockerTask = (): Task => {
  return {
    name: 'Put Down Blocking Dirt',
    repeating: false,
    behaviorQueue: [
      createPickupBlockerBehavior(),
      createFindDropOffLocationBehavior(),
      createPutDownBehavior(),
      {
        type: 'SWITCH_TASK',
        task: 'Move Dirt Out of the Way to the Entrance',
      },
    ],
  };
};


///////////////////////////////////////////////////////////////
// with dispatch
///////////////////////////////////////////////////////////////

const sendAllAntsToLocation = (index: number): void => {
  const game = store.getState().game;
  store.dispatch({
    type: 'ASSIGN_TASK',
    task: createGoToLocationTask(getIthLocation(game, index)),
    ants: game.ants,
  });
};

const sendAllAntsToBlueprint = (): void => {
  const game = store.getState().game;
  store.dispatch({
    type: 'ASSIGN_TASK',
    task: createDigBlueprintTask(game),
    ants: game.ants,
  });
};

const tasks = {
  createGoToLocationTask,
  getLocation,
  getIthLocation,
  createMoveBehavior,
  createRandomMoveTask,
  createMoveBlockerTask,
  createGoToColonyEntranceWithBlockerTask,
  createDigBlueprintTask,
  sendAllAntsToLocation,
  sendAllAntsToBlueprint,
  createDoAction,
  createIdleTask,
  createLayEggTask,
};
window.tasks = tasks;

module.exports = tasks;
