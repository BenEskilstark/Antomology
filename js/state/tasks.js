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
const createGoToLocationTask = (locName: string): Task => {
  return {
    name: 'Go To Location',
    repeating: false,
    behaviorQueue: [
      createGoToLocationNeighborBehavior(locName),
      createDoAction('MOVE', locName),
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
    // HACK: this is the same as createHighLevelIdleTask!
    behaviorQueue: [
      {
        type: 'DO_HIGH_LEVEL_ACTION',
        action: {
          type: 'IDLE',
          payload: {object: null},
        },
      },
    ],
  }
}

const createHoldingAndIdleTask = (): Task => {
  return {
    name: 'Holding and Idle',
    repeating: true,
    behaviorQueue: [
      createDoAction('IDLE', null),
    ],
  };
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

const createFollowTrailTask = (): Task => {
  return {
    name: 'Follow Trail',
    repeating: false,
    behaviorQueue: [
      {
        type: 'WHILE',
        condition: {
          type: 'NEIGHBORING',
          not: false,
          comparator: 'EQUALS',
          payload: {
            object: 'TRAIL',
          },
        },
        behavior: createMoveBehavior('TRAIL'),
      },
    ]
  };
}

///////////////////////////////////////////////////////////////
// move
///////////////////////////////////////////////////////////////

const createMoveBehavior = (locName: ?string): Behavior => {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'MOVE',
      payload: {
        object: locName != null ? locName : 'RANDOM',
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

const createGoToLocationBehavior = (locName: string): Behavior => {
  return {
    type: 'WHILE',
    condition: {
      type: 'LOCATION',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: locName,
      },
    },
    behavior: createMoveBehavior(locName),
  };
}

const createGoToLocationNeighborBehavior = (locName: string): Behavior => {
  return {
    type: 'WHILE',
    condition: {
      type: 'NEIGHBORING',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: locName,
      },
    },
    behavior: createMoveBehavior(locName),
  };
}

const getIthLocation = (game: GameState, i: number): string => {
  const locationID = game.LOCATION[i];
  return game.entities[locationID].name;
}

const getLocation = (game: GameState, locationID: number): string => {
  return game.entities[locationID].name;
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
        object: 'MARKED_DIRT',
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
        object: 'MARKED_DIRT',
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
      // createGoToLocationBehavior('Colony Entrance'),
      {
        type: 'SWITCH_TASK',
        task: 'Move Dirt Out of the Way to the Entrance',
      },
      createFindBlueprintBehavior(),
      createPickupBlueprintBehavior(),
      createGoToLocationBehavior('Colony Entrance'),
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
            object: 'Colony Entrance',
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
          behavior: createMoveBehavior('Colony Entrance'),
          elseBehavior: {
            type: 'SWITCH_TASK',
            done: false,
            task: 'Put Down Blocking Dirt',
          },
        },
      },
      // {
      //   type: 'SWITCH_TASK',
      //   task: 'Dig Out Blueprint',
      // },
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
  createGoToLocationBehavior,
  createDigBlueprintTask,
  sendAllAntsToLocation,
  sendAllAntsToBlueprint,
  createDoAction,
  createIdleTask,
  createLayEggTask,
  createFollowTrailTask,
  createHoldingAndIdleTask,
};
window.tasks = tasks;

module.exports = tasks;
