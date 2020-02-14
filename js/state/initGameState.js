// @flow

const {makeEntity} = require('../entities/entity');
const {makeAnt} = require('../entities/ant');
const {makeDirt} = require('../entities/dirt');
const {makeObelisk} = require('../entities/obelisk');
const {makeStone} = require('../entities/stone');
const {makeBackground} = require('../entities/background');
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
const graphTasks = require('../state/graphTasks');

import type {GameState} from '../types';

const initGameState = (level: number): GameState => {
  switch (level) {
    case -1:
      return baseState(50, 50);
    case 0:
      return level0();
    case 1:
      return level1();
  }
}

////////////////////////////////////////////////////////////////////////////
// Levels
////////////////////////////////////////////////////////////////////////////

const level1 = (): GameState => {
  const game = baseState(100, 100);
  addEntity(game, makeAnt({x: 25, y: 30}, 'QUEEN'));
  addEntity(game, makeAnt({x: 20, y: 30}, 'WORKER'));
  addEntity(game, makeAnt({x: 30, y: 30}, 'WORKER'));

  return game;
}

const level0 = (): GameState => {
  const game = baseState(100, 100);
  const colonyEntrance = makeLocation('Colony Entrance', 5, 5, {x: 25, y: 30});
    // ...makeLocation('Colony Entrance', 5, 5, {x: 25, y: 29}), id: config.colonyEntrance,
  // };
  addEntity(game, colonyEntrance);

  const locationTwo = makeLocation('Location Two', 5, 5, {x: 40, y: 30});
  addEntity(game, locationTwo);

  // seed background
  for (let x = 0; x < game.worldWidth; x++) {
    for (let y = 0; y < game.worldHeight; y++) {
      if (y >= game.worldHeight * 0.35) {
        addEntity(game, makeBackground({x, y}, 'SKY'));
      }
      if (y < game.worldHeight * 0.35) {
        addEntity(game, makeBackground({x, y}, 'DIRT'));
      }
    }
  }

  // seed bottom 1/4's with dirt
  for (let x = 0; x < game.worldWidth; x++) {
    for (let y = 0; y < game.worldHeight; y++) {
      if (y < game.worldHeight * 0.3) {
        if (x == colonyEntrance.position.x && y == colonyEntrance.position.y) {
          continue;
        }
        if (x == colonyEntrance.position.x && y == colonyEntrance.position.y - 1) {
          continue;
        }
        addEntity(game, makeDirt({x, y}));
      }
    }
  }

  // seed ants
  // for (let i = 0; i < 1000; i++) {
  //   const position = {
  //     x: randomIn(0, game.worldWidth - 1),
  //     y: randomIn(Math.ceil(game.worldHeight * 0.6), game.worldHeight - 1),
  //   };
  //   const ant = makeAnt(position, 'WORKER');
  //   addEntity(game, ant);
  // }
  addEntity(game, makeAnt({x: 25, y: 30}, 'QUEEN'));
  addEntity(game, makeAnt({x: 18, y: 30}, 'WORKER'));
  addEntity(game, makeAnt({x: 30, y: 30}, 'WORKER'));
  addEntity(game, makeAnt({x: 28, y: 30}, 'WORKER'));
  addEntity(game, makeAnt({x: 32, y: 30}, 'WORKER'));
  addEntity(game, makeAnt({x: 33, y: 30}, 'WORKER'));
  addEntity(game, makeAnt({x: 35, y: 30}, 'WORKER'));

  // add obelisk
  addEntity(game, makeObelisk({x: 20, y: 40}, 4, 8));

  // add stone
  addEntity(game, makeStone({x: 35, y: 35}));

  // seed food
  for (let i = 0; i < 15; i++) {
    const position = {
      x: randomIn(0, game.worldWidth - 1),
      y: randomIn(Math.ceil(game.worldHeight * 0.6) + 1, game.worldHeight - 1),
    };
    const food = makeFood(position, 1000, 'Crumb');
    addEntity(game, food);
  }

  return game;
}

////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////

const baseState = (worldWidth: number, worldHeight: number): GameState => {
  const game = {
    time: 0,
    tickInterval: null,
    antMode: 'PICKUP',
    userMode: 'SELECT',

    nextLocationName: 'Give Locations Unique Names',
    prevPheromone: null,
    curEdge: null,

    edges: {},

    mouse: {
      isLeftDown: false,
      isRightDown: false,
      downPos: {x: 0, y: 0},
      curPos: {x: 0, y: 0},
      curPixel: {x: 0, y: 0},
      prevPixel: {x: 0, y: 0},
    },

    worldWidth,
    worldHeight,
    viewPos: {x: 0, y: 0},

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
    STONE: [],
    OBELISK: [],
    BACKGROUND: [],

    tasks: [],
    grid: [],

    fog: true,
  };

  // seed start location
  const clickedLocation = {
    ...makeLocation('Clicked Position', 1, 1, {x:0, y:0}), id: config.clickedPosition,
  }
  addEntity(game, clickedLocation);

  // initial tasks
  game.tasks = [
    tasks.createIdleTask(),
    tasks.createRandomMoveTask(),
    tasks.createDigBlueprintTask(game),
    tasks.createMoveBlockerTask(),
    tasks.createGoToColonyEntranceWithBlockerTask(game),
    tasks.createLayEggTask(),
    tasks.createHoldingAndIdleTask(),
    graphTasks.createFindPheromoneTask(),
    graphTasks.createFollowTrailTask(),
    graphTasks.createFollowTrailInReverseTask(),
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

  return game;
}

module.exports = {initGameState};
