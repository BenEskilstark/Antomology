'use strict';

///////////////////////////////////////////////////////////////
// general
///////////////////////////////////////////////////////////////

/**
 * Go towards the location until you're a neighbor, then try to advance
 * to the location separately. This way you get out of the while loop
 * even if the location is occupied
 */
var createGoToLocationTask = function createGoToLocationTask(locName) {
  return {
    name: 'Go To Location',
    repeating: false,
    behaviorQueue: [createGoToLocationNeighborBehavior(locName), createDoAction('MOVE', locName)]
  };
};
// Helpers for creating tasks/locations via the console

var createDoAction = function createDoAction(type, object) {
  return {
    type: 'DO_ACTION',
    action: {
      type: type,
      payload: {
        object: object
      }
    }
  };
};

var createIdleTask = function createIdleTask() {
  return {
    name: 'Idle',
    repeating: true,
    behaviorQueue: [createDoAction('IDLE', null)]
  };
};

var createLayEggTask = function createLayEggTask() {
  return {
    name: 'Lay Egg',
    repeating: false,
    behaviorQueue: [createDoAction('LAY', null)]
  };
};

///////////////////////////////////////////////////////////////
// move
///////////////////////////////////////////////////////////////

var createMoveBehavior = function createMoveBehavior(locName) {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'MOVE',
      payload: {
        object: locName != null ? locName : 'RANDOM'
      }
    }
  };
};

var createRandomMoveTask = function createRandomMoveTask() {
  return {
    name: 'Move Randomly',
    repeating: true,
    behaviorQueue: [createMoveBehavior()]
  };
};

///////////////////////////////////////////////////////////////
// go to location
///////////////////////////////////////////////////////////////

var createGoToLocationBehavior = function createGoToLocationBehavior(locName) {
  return {
    type: 'WHILE',
    condition: {
      type: 'LOCATION',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: locName
      }
    },
    behavior: createMoveBehavior(locName)
  };
};

var createGoToLocationNeighborBehavior = function createGoToLocationNeighborBehavior(locName) {
  return {
    type: 'WHILE',
    condition: {
      type: 'NEIGHBORING',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: locName
      }
    },
    behavior: createMoveBehavior(locName)
  };
};

var getIthLocation = function getIthLocation(game, i) {
  var locationID = game.LOCATION[i];
  return game.entities[locationID].name;
};

var getLocation = function getLocation(game, locationID) {
  return game.entities[locationID].name;
};

///////////////////////////////////////////////////////////////
// digging
///////////////////////////////////////////////////////////////

var createFindBlueprintBehavior = function createFindBlueprintBehavior() {
  return {
    type: 'WHILE',
    condition: {
      type: 'NEIGHBORING',
      not: true,
      comparator: 'EQUALS',
      payload: {
        object: 'MARKED'
      }
    },
    behavior: createMoveBehavior() // move randomly
  };
};

var createPickupBlueprintBehavior = function createPickupBlueprintBehavior() {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PICKUP',
      payload: {
        object: 'MARKED'
      }
    }
  };
};

var createFindDropOffLocationBehavior = function createFindDropOffLocationBehavior() {
  return {
    type: 'WHILE',
    condition: {
      type: 'RANDOM',
      not: false,
      comparator: 'LESS_THAN',
      payload: {
        object: 0.9
      }
    },
    behavior: createMoveBehavior()
  };
};

var createPutDownBehavior = function createPutDownBehavior() {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PUTDOWN',
      payload: {
        object: null // put down at current position
      }
    }
  };
};

var createPickupBlockerBehavior = function createPickupBlockerBehavior() {
  return {
    type: 'DO_ACTION',
    action: {
      type: 'PICKUP',
      payload: {
        object: 'BLOCKER'
      }
    }
  };
};

var createDigBlueprintTask = function createDigBlueprintTask(game) {
  return {
    name: 'Dig Out Blueprint',
    repeating: true,
    behaviorQueue: [
    // createGoToLocationBehavior('Colony Entrance'),
    {
      type: 'SWITCH_TASK',
      task: 'Move Dirt Out of the Way to the Entrance'
    }, createFindBlueprintBehavior(), createPickupBlueprintBehavior(), createGoToLocationBehavior('Colony Entrance'), createFindDropOffLocationBehavior(), createPutDownBehavior(), {
      type: 'SWITCH_TASK',
      task: 'Move Dirt Out of the Way to the Entrance'
    }]
  };
};

var createGoToColonyEntranceWithBlockerTask = function createGoToColonyEntranceWithBlockerTask(game) {
  return {
    name: 'Move Dirt Out of the Way to the Entrance',
    repeating: false,
    behaviorQueue: [{
      type: 'WHILE',
      condition: {
        type: 'LOCATION',
        not: true,
        comparator: 'EQUALS',
        payload: {
          object: 'Colony Entrance'
        }
      },
      behavior: {
        type: 'IF',
        condition: {
          type: 'BLOCKED',
          not: true,
          comparator: 'EQUALS',
          payload: {
            object: null
          }
        },
        behavior: createMoveBehavior('Colony Entrance'),
        elseBehavior: {
          type: 'SWITCH_TASK',
          done: false,
          task: 'Put Down Blocking Dirt'
        }
      }
    }]
  };
};

var createMoveBlockerTask = function createMoveBlockerTask() {
  return {
    name: 'Put Down Blocking Dirt',
    repeating: false,
    behaviorQueue: [createPickupBlockerBehavior(), createFindDropOffLocationBehavior(), createPutDownBehavior(), {
      type: 'SWITCH_TASK',
      task: 'Move Dirt Out of the Way to the Entrance'
    }]
  };
};

///////////////////////////////////////////////////////////////
// with dispatch
///////////////////////////////////////////////////////////////

var sendAllAntsToLocation = function sendAllAntsToLocation(index) {
  var game = store.getState().game;
  store.dispatch({
    type: 'ASSIGN_TASK',
    task: createGoToLocationTask(getIthLocation(game, index)),
    ants: game.ants
  });
};

var sendAllAntsToBlueprint = function sendAllAntsToBlueprint() {
  var game = store.getState().game;
  store.dispatch({
    type: 'ASSIGN_TASK',
    task: createDigBlueprintTask(game),
    ants: game.ants
  });
};

var tasks = {
  createGoToLocationTask: createGoToLocationTask,
  getLocation: getLocation,
  getIthLocation: getIthLocation,
  createMoveBehavior: createMoveBehavior,
  createRandomMoveTask: createRandomMoveTask,
  createMoveBlockerTask: createMoveBlockerTask,
  createGoToColonyEntranceWithBlockerTask: createGoToColonyEntranceWithBlockerTask,
  createDigBlueprintTask: createDigBlueprintTask,
  sendAllAntsToLocation: sendAllAntsToLocation,
  sendAllAntsToBlueprint: sendAllAntsToBlueprint,
  createDoAction: createDoAction,
  createIdleTask: createIdleTask,
  createLayEggTask: createLayEggTask
};
window.tasks = tasks;

module.exports = tasks;