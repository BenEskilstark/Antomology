// @flow

import type {
  Task, Location, Behavior, Action, GameState, Condition,
} from '../types';

///////////////////////////////////////////////////////////////////
// Building Blocks
///////////////////////////////////////////////////////////////////

const createDoAction = (type: string, object: mixed): Behavior => {
  return {
    type: 'DO_ACTION',
    action: {
      type,
      payload: {object},
    },
  };
};

const createMoveBehavior = (locOrType: string): Behavior => {
  return createDoAction('MOVE', locOrType);
};

const createRandomMoveInLocationBehavior = (locID: EntityID): Behavior => {
  return {
    type: 'DO_HIGH_LEVEL_ACTION',
    action: {
      type: 'MOVE',
      payload: {
        object: locID,
      },
    }
  };
};

const createFindPheromoneBehavior = (): Behavior => {
  return {
    type: 'DO_HIGH_LEVEL_ACTION',
    action: {
      type: 'FIND_PHEROMONE',
      payload: {
        object: null,
      },
    }
  };
};

///////////////////////////////////////////////////////////////////
// Tasks
///////////////////////////////////////////////////////////////////

const createRandomMoveInLocationTask = (locID: EntityID): Task => {
  return {
    name: 'Move in Location',
    repeating: true, // TODO ?
    behaviorQueue: [
      createRandomMoveInLocationBehavior(locID),
    ],
  };
};

const createPickupEntityTask = (entity:Entity): Task => {
  return {
    name: 'Pick Up Entity',
    repeating: false,
    behaviorQueue:[
      createDoAction('PICKUP', entity),
    ],
  };
};

const createFindPheromoneTask = (): Task => {
  return {
    name: 'Find Pheromone Trail',
    repeating: false,
    behaviorQueue: [
      createFindPheromoneBehavior(),
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
          payload: {object: 'TRAIL'},
        },
        behavior: createMoveBehavior('TRAIL'),
      },
    ],
  };
};

const createFollowTrailInReverseTask = (): Task => {
  return {
    name: 'Follow Trail In Reverse',
    repeating: false,
    behaviorQueue: [
      {
        type: 'WHILE',
        condition: {
          type: 'NEIGHBORING',
          not: false,
          comparator: 'EQUALS',
          payload: {object: 'TRAIL'},
        },
        behavior: createMoveBehavior('REVERSE_TRAIL'),
      },
    ],
  };
};

const createHighLevelIdleTask = (): Task => {
  return {
    name: 'Idle',
    repeating: true,
    behaviorQueue:  [
      {
        type: 'DO_HIGH_LEVEL_ACTION',
        action: {
          type: 'IDLE',
          payload: {object: null},
        }
      }
    ]
  };
};


module.exports = {
  createRandomMoveInLocationTask,
  createFindPheromoneTask,
  createFollowTrailTask,
  createFollowTrailInReverseTask,
  createPickupEntityTask,
  createHighLevelIdleTask,
}
