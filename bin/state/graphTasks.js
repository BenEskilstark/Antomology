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

var createFindPheromoneTask = function createFindPheromoneTask() {
  return {
    name: 'Find Pheromone Trail',
    repeating: false,
    behaviorQueue: [createFindPheromoneBehavior()]
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
  createFindPheromoneTask: createFindPheromoneTask,
  followTrail: followTrail
};