'use strict';

///////////////////////////////////////////////////////////////////
// Building Blocks
///////////////////////////////////////////////////////////////////

var createDoAction = function createDoAction(type, object) {
  return {
    type: 'DO_ACTION',
    action: {
      type: type,
      payload: { object: object }
    }
  };
};

var createMoveBehavior = function createMoveBehavior(locOrType) {
  return createDoAction('MOVE', locOrType);
};

var followTrail = function followTrail() {
  return {
    name: 'Follow Trail',
    repeating: false,
    behaviorQueue: [{
      type: 'WHILE',
      condition: {
        type: 'NEIGHBORING',
        not: false,
        comparator: 'EQUALS',
        payload: { object: 'TRAIL' }
      },
      behavior: createMoveBehavior('TRAIL')
    }]
  };
};

module.exports = {
  followTrail: followTrail
};