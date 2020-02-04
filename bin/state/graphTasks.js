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

var createRandomMoveInLocationBehavior = function createRandomMoveInLocationBehavior(locID) {
  return {
    type: 'HIGH_LEVEL_DO_ACTION',
    action: {
      type: 'MOVE',
      payload: {
        object: locID
      }
    }
  };
};

///////////////////////////////////////////////////////////////////
// Tasks
///////////////////////////////////////////////////////////////////

var createRandomMoveInLocationTask = function createRandomMoveInLocationTask(locID) {
  return {
    name: 'Move in Location',
    repeating: true, // TODO ?
    behaviorQueue: [createRandomMoveInLocationBehavior(locID)]
  };
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
  createRandomMoveInLocationTask: createRandomMoveInLocationTask,
  followTrail: followTrail
};