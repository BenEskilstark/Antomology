// @flow

const {makeEntity} = require('../entities/entity');
const {makeAnt} = require('../entities/ant');
const {makeDirt} = require('../entities/dirt');
const {makeFood} = require('../entities/food');
const {makeLocation} = require('../entities/location');
const {config} = require('../config');
const {
  randomIn,
} = require('../utils/helpers');
const {
  addEntity,
  insertInGrid,
} = require('../utils/stateHelpers');
const tasks = require('../state/tasks');

import type {GameState} from '../types';

const initGameState = (level: number): GameState => {
  switch (level) {
    case 0:
      return level0();
    case 1:
      return level1();
  }
}

const level1 = (): GameState => {
  const gameState = {
    time: 0,
    tickInterval: null,
    antMode: 'PICKUP',
    userMode: 'SELECT',
    nextLocationName: 'Give Locations Unique Names',
    prevPheromone: null,
    mouse: {
      isLeftDown: false,
      isRightDown: false,
      downPos: {x: 0, y: 0},
      curPos: {x: 0, y: 0},
    },

    entities: {},
    selectedEntities: [],
    ANT: [],
    DIRT: [],
    FOOD: [],
    EGG: [],
    LARVA: [],
    PUPA: [],
    DEAD_ANT: [], // TODO: not actually implemented
    LOCATION: [],
    PHEROMONE: [],

    tasks: [],
    grid: [],
  };
  addEntity(gameState, makeAnt({x: 25, y: 30}, 'QUEEN'));
  addEntity(gameState, makeAnt({x: 20, y: 30}, 'WORKER'));
  addEntity(gameState, makeAnt({x: 30, y: 30}, 'WORKER'));

  return gameState;
}

const level0 = (): GameState => {
  const gameState = {
    time: 0,
    tickInterval: null,
    antMode: 'PICKUP',
    userMode: 'SELECT',
    nextLocationName: 'Give Locations Unique Names',
    prevPheromone: null,
    mouse: {
      isLeftDown: false,
      isRightDown: false,
      downPos: {x: 0, y: 0},
      curPos: {x: 0, y: 0},
    },

    entities: {},
    selectedEntities: [],
    ANT: [],
    DIRT: [],
    FOOD: [],
    EGG: [],
    LARVA: [],
    PUPA: [],
    DEAD_ANT: [], // TODO: not actually implemented
    LOCATION: [],
    PHEROMONE: [],

    tasks: [],
    grid: [],
  };

  // seed start location
  const clickedLocation = {
    ...makeLocation('Clicked Position', 1, 1, {x:0, y:0}), id: config.clickedPosition,
  }
  addEntity(gameState, clickedLocation);
  const colonyEntrance = {
    ...makeLocation('Colony Entrance', 1, 1, {x: 25, y: 29}), id: config.colonyEntrance,
  };
  addEntity(gameState, colonyEntrance);

  // initial tasks
  gameState.tasks = [
    tasks.createIdleTask(),
    {...tasks.createGoToLocationTask(colonyEntrance), name: 'Go To Colony Entrance'},
    tasks.createRandomMoveTask(),
    tasks.createDigBlueprintTask(gameState),
    tasks.createMoveBlockerTask(),
    tasks.createGoToColonyEntranceWithBlockerTask(gameState),
    tasks.createLayEggTask(),
    tasks.createFollowTrailTask(),
    {
      name: 'Find Food',
      repeating: false,
      behaviorQueue: [
        {
          type: 'WHILE',
          condition: {
            type: 'NEIGHBORING',
            comparator: 'EQUALS',
            payload: {
              object: 'FOOD',
            },
            not: true,
          },
          behavior: {
            type: 'DO_ACTION',
            action: {
              type: 'MOVE',
              payload: {object: 'RANDOM'},
            },
          },
        },
        {
          type: 'DO_ACTION',
          action: {
            type: 'PICKUP',
            payload: {object: 'FOOD'},
          },
        },
      ],
    },
  ];

  // seed bottom 3/4's with dirt
  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
      if (y < config.height * 0.6) {
        if (x == colonyEntrance.position.x && y == colonyEntrance.position.y) {
          continue;
        }
        if (x == colonyEntrance.position.x && y == colonyEntrance.position.y - 1) {
          continue;
        }
        addEntity(gameState, makeDirt({x, y}));
      }
    }
  }

  // seed ants
  // for (let i = 0; i < 10; i++) {
  //   const position = {
  //     x: randomIn(0, config.width - 1),
  //     y: randomIn(Math.ceil(config.height * 0.6), config.height - 1),
  //   };
  //   const ant = makeAnt(position, 'WORKER');
  //   addEntity(gameState, ant);
  // }
  addEntity(gameState, makeAnt({x: 25, y: 30}, 'QUEEN'));
  addEntity(gameState, makeAnt({x: 20, y: 30}, 'WORKER'));
  addEntity(gameState, makeAnt({x: 30, y: 30}, 'WORKER'));

  // seed food
  for (let i = 0; i < 15; i++) {
    const position = {
      x: randomIn(0, config.width - 1),
      y: randomIn(Math.ceil(config.height * 0.6) + 1, config.height - 1),
    };
    const food = makeFood(position, 1000, 'Crumb');
    addEntity(gameState, food);
  }

  return gameState;
}

module.exports = {initGameState};
