'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../entities/entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../entities/ant'),
    makeAnt = _require2.makeAnt;

var _require3 = require('../entities/dirt'),
    makeDirt = _require3.makeDirt;

var _require4 = require('../entities/food'),
    makeFood = _require4.makeFood;

var _require5 = require('../entities/location'),
    makeLocation = _require5.makeLocation;

var _require6 = require('../config'),
    config = _require6.config;

var _require7 = require('../utils/helpers'),
    randomIn = _require7.randomIn,
    insertInGrid = _require7.insertInGrid;

var tasks = require('../state/tasks');

var initGameState = function initGameState() {
  var gameState = {
    time: 0,
    tickInterval: null,
    antMode: 'PICKUP',
    userMode: 'SELECT',
    nextLocationName: 'Give Locations Unique Names',
    mouse: {
      isLeftDown: false,
      isRightDown: false,
      downPos: { x: 0, y: 0 },
      curPos: { x: 0, y: 0 }
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
    grid: []
  };

  // seed start location
  var colonyEntrance = makeLocation('Colony Entrance', 1, 1, { x: 25, y: 29 });
  gameState.entities[colonyEntrance.id] = colonyEntrance;
  gameState.locations.push(colonyEntrance.id);

  // initial tasks
  gameState.tasks = [tasks.createIdleTask(), _extends({}, tasks.createGoToLocationTask(colonyEntrance), { name: 'Go To Colony Entrance' }), tasks.createRandomMoveTask(), tasks.createDigBlueprintTask(gameState), tasks.createMoveBlockerTask(), tasks.createGoToColonyEntranceWithBlockerTask(gameState), tasks.createLayEggTask(), {
    name: 'Find Food',
    repeating: false,
    behaviorQueue: [{
      type: 'WHILE',
      condition: {
        type: 'NEIGHBORING',
        comparator: 'EQUALS',
        payload: {
          object: 'FOOD'
        },
        not: true
      },
      behavior: {
        type: 'DO_ACTION',
        action: {
          type: 'MOVE',
          payload: { object: 'RANDOM' }
        }
      }
    }, {
      type: 'DO_ACTION',
      action: {
        type: 'PICKUP',
        payload: { object: 'FOOD' }
      }
    }]
  }];

  // seed bottom 3/4's with dirt
  for (var x = 0; x < config.width; x++) {
    for (var y = 0; y < config.height; y++) {
      if (y < config.height * 0.6) {
        // if (x == colonyEntrance.position.x && y == colonyEntrance.position.y) {
        //   continue;
        // }
        // if (x == colonyEntrance.position.x && y == colonyEntrance.position.y - 1) {
        //   continue;
        // }
        var dirt = makeDirt({ x: x, y: y });
        gameState.entities[dirt.id] = dirt;
        gameState.dirt.push(dirt.id);
        insertInGrid(gameState.grid, { x: x, y: y }, dirt.id);
      }
    }
  }
  console.log('dirt amount: ', gameState.dirt.length);

  // seed ants
  for (var i = 0; i < 10; i++) {
    var position = {
      x: randomIn(0, config.width - 1),
      y: randomIn(Math.ceil(config.height * 0.6), config.height - 1)
    };
    var ant = makeAnt(position, 'WORKER');
    gameState.entities[ant.id] = ant;
    gameState.ants.push(ant.id);
    insertInGrid(gameState.grid, position, ant.id);
  }
  // const ant = makeAnt({x: 25, y: 30}, 'QUEEN');
  // gameState.entities[ant.id] = ant;
  // gameState.ants.push(ant.id);
  // const ant1 = makeAnt({x: 20, y: 30}, 'WORKER');
  // gameState.entities[ant1.id] = ant1;
  // gameState.ants.push(ant1.id);
  // const ant2 = makeAnt({x: 30, y: 30}, 'WORKER');
  // gameState.entities[ant2.id] = ant2;
  // gameState.ants.push(ant2.id);

  // seed food
  for (var _i = 0; _i < 15; _i++) {
    var _position = {
      x: randomIn(0, config.width - 1),
      y: randomIn(Math.ceil(config.height * 0.6) + 1, config.height - 1)
    };
    var food = makeFood(_position, 1000, 'Crumb');
    gameState.entities[food.id] = food;
    gameState.food.push(food.id);
    insertInGrid(gameState.grid, _position, food.id);
  }

  return gameState;
};

module.exports = { initGameState: initGameState };