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
        case 'FOOD':
          game.food.push(entity.id);
          break;
        case 'EGG':
          game.eggs.push(entity.id);
          break;
        case 'LARVA':
          game.larva.push(entity.id);
          break;
        case 'PUPA':
          game.pupa.push(entity.id);
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
    case 'UPDATE_TASK': {
      const {task} = action;
      const oldTask = game.tasks.filter(t => t.name === task.name)[0];
      oldTask.repeating = task.repeating;
      oldTask.behaviorQueue = task.behaviorQueue;
      return game;
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
