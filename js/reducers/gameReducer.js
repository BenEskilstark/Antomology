// @flow

const {config} = require('../config');

import type {State, GameState, Action} from '../types';

const gameReducer = (game: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'CREATE_ENTITY': {
      const {entity} = action;
      game.entities[entity.id] = entity;
      switch (entity.type) {
        case 'LOCATION':
          game.locations.push(entity.id);
          break;
        case 'ANT':
          game.ants.push(entity.id);
          break;
        case 'DIRT':
          game.dirt.push(entity.id);
          break;
      }
      return game;
    }
    case 'DESTROY_ENTITY': {
      const {id} = action;
      delete game.entities[id];
      // TODO handle clearing out the arrays
      return game;
    }
    case 'CREATE_ANT': {
      const {ant} = action;
      game.ants.push(ant.id);
      game.entities[ant.id] = ant;
      return game;
    }
    case 'DESTROY_ANT': {
      const {id} = action;
      game.ants = game.ants.filter(antID => antID != id);
      delete game.entities[id];
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
    case 'ASSIGN_TASK': {
      const {task, ants} = action;
      for (const id of ants) {
        game.entities[id].task = task;
        game.entities[id].taskIndex = 0;
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
    case 'MARK_ENTITY': {
      const {entityID, quantity} = action;
      if (entityID != null && game.entities[entityID] != null) {
        game.entities[entityID].marked = quantity;
      }
      return game;
    }
    case 'SET_MOUSE_DOWN': {
      const {isLeft, isDown} = action;
      return {
        ...game,
        mouse: {
          isLeftDown: isLeft ? isDown : game.mouse.isLeftDown,
          isRightDown: isLeft ? game.mouse.isRightDOwn : isDown,
        },
      };
    }
    case 'START_CREATE_LOCATION': {
      const {position} = action;
      return {
        ...game,
        tempLocation: position,
      };
    }

  }

  return game;
};

module.exports = {gameReducer};
