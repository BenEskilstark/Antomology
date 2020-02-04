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

const followTrail = (): Behavior => {
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

module.exports = {
  followTrail,
}
