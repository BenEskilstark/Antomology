// @flow

const {makeEntity} = require('../entities/entity');
const {makeAnt} = require('../entities/ant');
const {makeDirt} = require('../entities/dirt');
const {makeFood} = require('../entities/food');
const {makeLocation} = require('../entities/location');
const {config} = require('../config');
const {randomIn} = require('../utils/helpers');
const tasks = require('../state/tasks');

import type {GameState} from '../types';

const initGameState = (): GameState => {
  const gameState = {
    time: 0,
    tickInterval: null,
    antMode: 'PICKUP',
    userMode: 'SELECT',
    nextLocationName: 'Give Locations Unique Names',
    mouse: {
      isLeftDown: false,
      isRightDown: false,
      downPos: {x: 0, y: 0},
      curPos: {x: 0, y: 0},
    },
    selectedEntities: [],
    entities: {},
    ants: [],
    dirt: [],
    food: [],
    eggs: [],
    larva: [],
    pupa: [],
    deadAnts: [],
    locations: [],
    tasks: [],
  };

  // seed start location
  const colonyEntrance = makeLocation(
    'Colony Entrance',
    1, 1, {x: 25, y: 29},
  );
  gameState.entities[colonyEntrance.id] = colonyEntrance;
  gameState.locations.push(colonyEntrance.id);

  // initial tasks
  gameState.tasks = [
    tasks.createIdleTask(),
    {...tasks.createGoToLocationTask(colonyEntrance), name: 'Go To Colony Entrance'},
    tasks.createRandomMoveTask(),
    tasks.createDigBlueprintTask(gameState),
    tasks.createMoveBlockerTask(),
    tasks.createGoToColonyEntranceWithBlockerTask(gameState),
    tasks.createLayEggTask(),
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
      if (y < config.height * 0.6 && Math.random() < 0.99) {
        if (x == colonyEntrance.position.x && y == colonyEntrance.position.y) {
          continue;
        }
        if (x == colonyEntrance.position.x && y == colonyEntrance.position.y - 1) {
          continue;
        }
        const dirt = makeDirt({x, y});
        gameState.entities[dirt.id] = dirt;
        gameState.dirt.push(dirt.id);
      }
    }
  }

  // seed ants
  const ant = makeAnt({x: 25, y: 30}, 'QUEEN');
  gameState.entities[ant.id] = ant;
  gameState.ants.push(ant.id);
  const ant1 = makeAnt({x: 20, y: 30}, 'WORKER');
  gameState.entities[ant1.id] = ant1;
  gameState.ants.push(ant1.id);
  const ant2 = makeAnt({x: 30, y: 30}, 'WORKER');
  gameState.entities[ant2.id] = ant2;
  gameState.ants.push(ant2.id);

  // seed food
  for (let i = 0; i < 15; i++) {
    const position = {
      x: randomIn(0, config.width),
      y: randomIn(Math.ceil(config.height * 0.6) + 1, config.height),
    };
    const food = makeFood(position, 1000, 'Crumb');
    gameState.entities[food.id] = food;
    gameState.food.push(food.id);
  }

  return gameState;
}

module.exports = {initGameState};
