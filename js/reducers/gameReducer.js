// @flow

const {config} = require('../config');
const {
  addEntity,
  removeEntity,
} = require('../utils/stateHelpers');

import type {State, GameState, Action} from '../types';

const gameReducer = (game: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'CREATE_ENTITY': {
      const {entity} = action;
      if (entity.type == 'LOCATION') {
        // if trying to make a location with the same name as one that already exists,
        // just update the position of the currently-existing entity for that location
        const locationIDWithName = game.LOCATION.filter(l => {
          return game.entities[l].name === entity.name;
        })[0];
        if (locationIDWithName != null) {
          removeEntity(game, game.entities[locationIDWithName]);
          addEntity(game, {...entity, id: locationIDWithName});
        } else {
          addEntity(game, entity);
        }
      } else {
        addEntity(game, entity);
      }
      return game;
    }
    case 'DESTROY_ENTITY': {
      const {id} = action;
      removeEntity(game, game.entities[id]);
      return game;
    }
    case 'CREATE_ANT': {
      const {ant} = action;
      addEntity(game, ant);
      return game;
    }
    case 'DESTROY_ANT': {
      const {id} = action;
      removeEntity(game, game.entities[id]);
      return game;
    }
    case 'SET_SELECTED_ENTITIES': {
      return {
        ...game,
        selectedEntities: action.entityIDs,
      };
    }
    case 'CREATE_TASK': {
      const {task} = action;
      return {
        ...game,
        tasks: [...game.tasks, task],
      };
    }
    case 'UPDATE_TASK': {
      const {task} = action;
      const oldTask = game.tasks.filter(t => t.name === task.name)[0];
      oldTask.repeating = task.repeating;
      oldTask.behaviorQueue = task.behaviorQueue;
      return game;
    }
    case 'UPDATE_NEXT_LOCATION_NAME': {
      const {name} = action;
      return {
        ...game,
        nextLocationName: name,
      };
    }
    case 'ASSIGN_TASK': {
      const {task, ants} = action;
      for (const id of ants) {
        game.entities[id].task = task;
        game.entities[id].taskIndex = 0;
      }
      // add the task to the task array
      const taskAdded = game.tasks.filter(t => t.name === task.name).length > 0;
      if (!taskAdded) {
        game.tasks.push(task);
      }
      return game;
    }
    case 'SET_USER_MODE': {
      const {userMode} = action;
      return {
        ...game,
        userMode,
      };
    }
    case 'SET_ANT_MODE': {
      const {antMode} = action;
      return {
        ...game,
        antMode,
      };
    }
    case 'MARK_ENTITY': {
      const {entityID, quantity} = action;
      if (entityID != null && game.entities[entityID] != null) {
        game.entities[entityID].marked = quantity;
      }
      return game;
    }
    case 'SET_MOUSE_DOWN': {
      const {isLeft, isDown, downPos} = action;
      return {
        ...game,
        mouse: {
          ...game.mouse,
          isLeftDown: isLeft ? isDown : game.mouse.isLeftDown,
          isRightDown: isLeft ? game.mouse.isRightDOwn : isDown,
          downPos: isDown && downPos != null ? downPos : game.mouse.downPos,
        },
      };
    }
    case 'SET_MOUSE_POS': {
      const {curPos} = action;
      return {
        ...game,
        mouse: {
          ...game.mouse,
          curPos,
        },
      };
    }
  }

  return game;
};

module.exports = {gameReducer};
