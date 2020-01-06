// @flow
// Helpers for creating tasks/locations via the console

import type {Task, Location, Behavior, GameState} from '../types';

///////////////////////////////////////////////////////////////
// general
///////////////////////////////////////////////////////////////

const createGoToLocationTask = (location: Location): Task => {
  return {
    name: 'Go To Location',
    repeating: false,
    behaviorQueue: [
      createGoToLocationBehavior(location),
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
    type: 'DO_WHILE',
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
    type: 'DO_WHILE',
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
    type: 'DO_WHILE',
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
    name: 'Find Blueprint',
    repeating: true,
    behaviorQueue: [
      createFindBlueprintBehavior(),
      createPickupBlueprintBehavior(),
      createGoToLocationBehavior(getIthLocation(game, 0)),
      createFindDropOffLocationBehavior(),
      createPutDownBehavior(),
      {
        type: 'SWITCH_TASK',
        task: createGoToColonyEntranceWithBlockerTask,
      },
    ],
  };
};

const createGoToColonyEntranceWithBlockerTask = (game: GameState): Task => {
  return {
    name: 'Return to Entrance with Blocker',
    repeating: false,
    behaviorQueue: [
      {
        type: 'DO_WHILE',
        condition: {
          type: 'LOCATION',
          not: true,
          comparator: 'EQUALS',
          payload: {
            object: getIthLocation(game, 0),
          },
        },
        behavior: {
          type: 'CONDITIONAL',
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
            task: createMoveBlockerTask,
          },
        },
      },
      {
        type: 'SWITCH_TASK',
        task: createDigBlueprintTask,
      },
    ],
  };
}

const createMoveBlockerTask = (game: GameState): Task => {
  return {
    name: 'Move Blocker',
    repeating: false,
    behaviorQueue: [
      createPickupBlockerBehavior(),
      createFindDropOffLocationBehavior(),
      createPutDownBehavior(),
      {
        type: 'SWITCH_TASK',
        task: createGoToColonyEntranceWithBlockerTask,
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
  sendAllAntsToLocation,
  sendAllAntsToBlueprint,
  createDoAction,
};
window.tasks = tasks;

module.exports = tasks;
