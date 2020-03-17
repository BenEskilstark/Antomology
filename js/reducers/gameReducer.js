// @flow

const {config} = require('../config');
const {
  addEntity,
  removeEntity,
  antSwitchTask,
  lookupInGrid,
} = require('../utils/stateHelpers');
const {clamp} = require('../utils/helpers');
const {makeEntityByType} = require('../entities/makeEntityByType');
const {createEdge} = require('../entities/edge');
const {insideWorld} = require('../selectors/selectors');
const {createIdleTask} = require('../state/tasks');

import type {State, GameState, Action} from '../types';

const gameReducer = (game: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'CREATE_ENTITY': {
      const {entity} = action;
      createEntityReducer(game, entity);
      nextID = Math.max(nextID, entity.id + 1);
      return game;
    }
    case 'CREATE_MANY_ENTITIES': {
      const {entityType, pos, width, height, editorState} = action;
      const {x, y} = pos;
      if (game.entities[nextID] != null) {
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("NEXT_ID", nextID, game.entities[nextID]);
        console.log(game.entities[nextID + 1]);
        // nextID++;
      }
      for (let i = 0; i <= width; i++) {
        for (let j = 0; j <= height; j++) {
          const gridPos = {x: x + i, y: y + j};
          const occupied = lookupInGrid(game.grid, gridPos)
            .map(i => game.entities[i])
            .filter(e => e.type == entityType)
            .length > 0;
          if (!occupied) {
            const entity = makeEntityByType(game, editorState, entityType, gridPos);
            createEntityReducer(game, entity);
          }
        }
      }

      return game;
    }
    case 'DESTROY_ENTITY': {
      const {id} = action;
      game.selectedEntities = game.selectedEntities.filter(i => i != id);
      const entity = game.entities[id];
      if (entity == null) {
        return game; // TODO: shouldn't happen!
      }
      if (game.LOCATION.includes(id)) {
        for (const antID of game.ANT) {
          const ant = game.entities[antID];
          if (ant.location != null && ant.location.id === id) {
            ant.location = null;
          }
          if (ant.task != null && ant.task.name == entity.task.name) {
            antSwitchTask(game, ant, createIdleTask());
          }
        }
      }
      removeEntity(game, entity);
      return game;
    }
    case 'SET_SELECTED_ENTITIES': {
      const {entityIDs} = action;
      const prevSelected = [...game.selectedEntities];

      // deselected ants inside a location should take up that task
      for (const id of prevSelected) {
        if (!entityIDs.includes(id)) {
          const ant = game.entities[id];
          if (ant.type != 'ANT') continue;
          if (
            ant.location != null &&
            (ant.task == null || ant.task.name != ant.location.task.name)
          ) {
            antSwitchTask(game, ant, ant.location.task, [
              {name: 'Follow Trail', index: 0},
              {name: 'Find Pheromone Trail', index: 0},
            ]);
          }
        }
      }

      return {
        ...game,
        selectedEntities: entityIDs,
      };
    }
    case 'TOGGLE_FOG': {
      const {fog} = action;
      return {
        ...game,
        fog,
      };
    }
    case 'SET_GAME_OVER': {
      const {gameOver} = action;
      return {
        ...game,
        gameOver,
      };
    }
    case 'SET_PHEROMONE_CONDITION': {
      const {category, condition} = action;
      game.pheromones[category].condition = condition;
      return game;
    }
    case 'SET_PHEROMONE_STRENGTH': {
      const {category, strength} = action;
      game.pheromones[category].strength = strength;
      return game;
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
      const loc = game.entities[id];
      loc.name = newName;
      loc.task.name = newName;
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
    case 'SET_INFO_TAB': {
      const {infoTab} = action;
      return {
        ...game,
        infoTab,
      };
    }
    case 'SET_ANT_MODE': {
      const {antMode} = action;
      return {
        ...game,
        antMode,
      };
    }
    case 'SET_TICKER': {
      const {text, maxAge} = action;
      return {
        ...game,
        ticker: {
          text, maxAge,
          curAge: 0,
        },
      };
    }
    case 'SET_HOVER_CARD_JSX': {
      const {jsx} = action;
      return {
        ...game,
        hoverCard: {
          ...game.hoverCard,
          jsx,
          mouseStillTime: jsx == null ? 0 : game.hoverCard.mouseStillTime + 1,
        },
      };
    }
    case 'SET_HOVER_CARD_TIME': {
      const {mouseStillTime} = action;
      return {
        ...game,
        hoverCard: {
          ...game.hoverCard,
          mouseStillTime,
        },
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
      // TODO: this action isn't used by WASD, but is used on left click...
      const {viewPos, inEditor} = action;
      if (inEditor) {
        return {
          ...game,
          viewPos,
        };
      }
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
      const {out, inEditor} = action;
      const widthToHeight = config.width / config.height;
      const heightToWidth = config.height / config.width;
      const zoomFactor = 1;
      const nextWidth = config.width + (widthToHeight * zoomFactor * out);
      const nextHeight = config.height + (heightToWidth * zoomFactor * out);
      const widthDiff = nextWidth - config.width;
      const heightDiff = nextHeight - config.height;

      // zoom relative to the view position
      const nextViewPosX = game.viewPos.x - widthDiff / 2;
      const nextViewPosY = game.viewPos.y - heightDiff / 2;

      if (inEditor) {
        config.width = Math.max(nextWidth, 1);
        config.height = Math.max(nextHeight, 1);
        return {
          ...game,
          viewPos: {
            x: nextViewPosX,
            y: nextViewPosY,
          },
        };
      }
      if (
        nextWidth > game.worldWidth || nextHeight > game.worldHeight ||
        nextWidth < 1 || nextHeight < 1
      ) {
        return game; // don't zoom too far in or out
      }
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

const createEntityReducer = (game: Game, entity: Entity): void => {
  if (entity.position != null && !insideWorld(game, entity.position)) {
    return;
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
  } else if (entity.type === 'PHEROMONE') {
    game.prevPheromone = entity.id;
    const pheromonesAtPos = lookupInGrid(game.grid, entity.position)
      .map(id => game.entities[id])
      .filter(e => e.type == 'PHEROMONE')
      .filter(e => e.theta === entity.theta || entity.strength < 0);

    if (pheromonesAtPos.length == 0) {
      addEntity(game, entity);
    }
    for (const pher of pheromonesAtPos) {
      pher.quantity = clamp(
        entity.quantity + pher.quantity, 0, config.pheromoneMaxQuantity,
      );
    }

    // TODO: remove or bring back edges
    // game.edges[entity.edge].pheromones.push(entity.id);
  } else {
    addEntity(game, entity);
  }
}

module.exports = {gameReducer};
