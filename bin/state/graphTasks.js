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
    type: 'DO_HIGH_LEVEL_ACTION',
    action: {
      type: 'MOVE',
      payload: {
        object: locID
      }
    }
  };
};

var createFindPheromoneBehavior = function createFindPheromoneBehavior() {
  return {
    type: 'DO_HIGH_LEVEL_ACTION',
    action: {
      type: 'FIND_PHEROMONE',
      payload: {
        object: null
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

var createPickupEntityTask = function createPickupEntityTask(entity) {
  return {
    name: 'Pick Up Entity',
    repeating: false,
    behaviorQueue: [createDoAction('PICKUP', entity)]
  };
};

var createFindPheromoneTask = function createFindPheromoneTask() {
  return {
    name: 'Find Pheromone Trail',
    repeating: false,
    behaviorQueue: [createFindPheromoneBehavior()]
  };
};

var createFollowTrailTask = function createFollowTrailTask() {
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

var createFollowTrailInReverseTask = function createFollowTrailInReverseTask() {
  return {
    name: 'Follow Trail In Reverse',
    repeating: false,
    behaviorQueue: [{
      type: 'WHILE',
      condition: {
        type: 'NEIGHBORING',
        not: false,
        comparator: 'EQUALS',
        payload: { object: 'TRAIL' }
      },
      behavior: createMoveBehavior('REVERSE_TRAIL')
    }]
  };
};

var createHighLevelIdleTask = function createHighLevelIdleTask() {
  return {
    name: 'Idle',
    repeating: true,
    behaviorQueue: [{
      type: 'DO_HIGH_LEVEL_ACTION',
      action: {
        type: 'IDLE',
        payload: { object: null }
      }
    }]
  };
};

module.exports = {
  createRandomMoveInLocationTask: createRandomMoveInLocationTask,
  createFindPheromoneTask: createFindPheromoneTask,
  createFollowTrailTask: createFollowTrailTask,
  createFollowTrailInReverseTask: createFollowTrailInReverseTask,
  createPickupEntityTask: createPickupEntityTask,
  createHighLevelIdleTask: createHighLevelIdleTask
};