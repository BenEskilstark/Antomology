// @flow

const {config} = require('../config');
const {
  addEntity,
  removeEntity,
} = require('../utils/stateHelpers');
const {clamp} = require('../utils/helpers');
const {createEdge} = require('../entities/edge');
const {insideWorld} = require('../selectors/selectors');

import type {State, GameState, Action} from '../types';

const gameReducer = (game: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'CREATE_ENTITY': {
      const {entity} = action;
      if (entity.position != null && !insideWorld(game, entity.position)) {
        return game;
      }
      if (entity.type == 'LOCATION') {
        // if trying to make a location with the same name as one that already exists,
        // just update the position of the currently-existing entity for that location
        const locationIDWithName = game.LOCATION.filter(l => {
          return game.entities[l].name === entity.name;
        })[0];
        if (locationIDWithName != null) {
          // is null for clicked location
          const locationEntity = game.entities[locationIDWithName];
          removeEntity(game, game.entities[locationIDWithName]);
          const updatedLocation = {
            ...entity, id: locationIDWithName,
            task: locationEntity != null ? locationEntity.task : entity.task,
          };
          addEntity(game, updatedLocation);
          for (const antID of game.ANT) {
            const ant = game.entities[antID];
            if (ant.location != null && ant.location.id === locationIDWithName) {
              ant.location = updatedLocation;
            }
          }
        } else {
          addEntity(game, entity);
        }
      } else {
        addEntity(game, entity);
      }
      if (entity.type === 'PHEROMONE') {
        game.prevPheromone = entity.id;
        // TODO: remove or bring back edges
        // game.edges[entity.edge].pheromones.push(entity.id);
      }
      return game;
    }
    case 'DESTROY_ENTITY': {
      const {id} = action;
      if (game.LOCATION.includes(id)) {
        for (const antID of game.ANT) {
          const ant = game.entities[antID];
          if (ant.location != null && ant.location.id === id) {
            ant.location = null;
          }
        }
      }
      removeEntity(game, game.entities[id]);
      return game;
    }
    case 'SET_SELECTED_ENTITIES': {
      return {
        ...game,
        selectedEntities: action.entityIDs,
      };
    }
    case 'TOGGLE_FOG': {
      const {fog} = action;
      return {
        ...game,
        fog,
      };
    }
    case 'SET_PHEROMONE_STRENGTH': {
      const {selected, strength} = action;
      if (selected) {
        return {
          ...game,
          selectedAntPheromoneStrength: strength,
        };
      } else {
        return {
          ...game,
          allAntPheromoneStrength: strength,
        };
      }
    }
    case 'SET_WORLD_SIZE': {
      const {width, height} = action;
      const nextWorldWidth = width != null ? width : game.worldWidth;
      const nextWorldHeight = height != null ? height : game.worldHeight;

      // delete entities outside the world
      const entitiesToDelete = [];
      for (const id in game.entities) {
        const entity = game.entities[id];
        if (entity == null) continue; // entity already deleted
        if (
          entity.position.x >= nextWorldWidth ||
          entity.position.y >= nextWorldHeight
        ) {
          entitiesToDelete.push(entity);
        }
      }
      for (const entity of entitiesToDelete) {
        removeEntity(game, entity);
      }

      return {
        ...game,
        worldWidth: nextWorldWidth,
        worldHeight: nextWorldHeight,
      }
    }
    case 'CREATE_EDGE': {
      const {start} = action;
      const newEdge = createEdge(start);
      game.edges[newEdge.id] = newEdge;
      game.curEdge = newEdge.id;
      game.entities[start].outgoingEdges.push(newEdge.id);
      return game;
    }
    case 'UPDATE_EDGE': {
      const {id, edge} = action;
      if (game.edges[id].end == null && edge.end != null) {
        game.entities[edge.end].incomingEdges.push(id);
      }
      game.edges[id] = edge;
      game.curEdge = null;
      return game;
    }
    case 'SET_CUR_EDGE': {
      const {curEdge} = action;
      return {
        ...game,
        curEdge,
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
    case 'UPDATE_LOCATION_NAME': {
      const {id, newName} = action;
      game.entities[id].name = newName;
      return game;
    }
    case 'UPDATE_NEXT_LOCATION_NAME': {
      const {name} = action;
      return {
        ...game,
        nextLocationName: name,
      };
    }
    case 'UPDATE_LOCATION_TASK': {
      const {task, id} = action;
      const loc = game.entities[id];
      loc.task.repeating = false;
      loc.task.behaviorQueue = task.behaviorQueue;
      return game;
    }
    case 'ASSIGN_TASK': {
      const {task, ants} = action;
      for (const id of ants) {
        game.entities[id].task = task;
        game.entities[id].taskStack = [];
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
    case 'UPDATE_THETA': {
      const {id, theta} = action;
      if (game.entities[id] != null) {
        game.entities[id].theta = theta;
      }
      return game;
    }
    case 'SET_PREV_PHEROMONE': {
      const {id} = action;
      return {
        ...game,
        prevPheromone: id,
      };
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
      const {curPos, curPixel} = action;
      return {
        ...game,
        mouse: {
          ...game.mouse,
          prevPos: {...game.mouse.curPos},
          curPos,
          prevPixel: {...game.mouse.curPixel},
          curPixel,
        },
      };
    }
    case 'SET_VIEW_POS': {
      const {viewPos} = action;
      const nextViewPos = {
        x: clamp(viewPos.x, 0, game.worldWidth - config.width),
        y: clamp(viewPos.y, 0, game.worldHeight - config.height),
      };
      return {
        ...game,
        viewPos: nextViewPos,
      };
    }
    case 'ZOOM': {
      const {out} = action;
      const widthToHeight = config.width / config.height;
      const zoomFactor = 1;
      const nextWidth = config.width + (widthToHeight * zoomFactor * out);
      const nextHeight = config.height + (widthToHeight * zoomFactor * out);
      if (
        nextWidth > game.worldWidth || nextHeight > game.worldHeight ||
        nextWidth < 1 || nextHeight < 1
      ) {
        return game; // don't zoom too far in or out
      }
      const widthDiff = nextWidth - config.width;
      const heightDiff = nextHeight - config.height;

      // zoom relative to the view position
      const nextViewPosX = game.viewPos.x - widthDiff / 2;
      const nextViewPosY = game.viewPos.y - heightDiff / 2;

      config.width = nextWidth;
      config.height = nextHeight;
      return {
        ...game,
        viewPos: {
          x: clamp(nextViewPosX, 0, game.worldWidth - config.width),
          y: clamp(nextViewPosY, 0, game.worldHeight - config.height),
        },
      };
    }
  }

  return game;
};

module.exports = {gameReducer};
