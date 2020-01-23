'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../entities/entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../entities/ant'),
    makeAnt = _require2.makeAnt;

var _require3 = require('../entities/dirt'),
    makeDirt = _require3.makeDirt;

var _require4 = require('../entities/stone'),
    makeStone = _require4.makeStone;

var _require5 = require('../entities/background'),
    makeBackground = _require5.makeBackground;

var _require6 = require('../entities/food'),
    makeFood = _require6.makeFood;

var _require7 = require('../entities/location'),
    makeLocation = _require7.makeLocation;

var _require8 = require('../config'),
    config = _require8.config;

var _require9 = require('../utils/helpers'),
    randomIn = _require9.randomIn;

var _require10 = require('../utils/stateHelpers'),
    addEntity = _require10.addEntity,
    insertInGrid = _require10.insertInGrid;

var tasks = require('../state/tasks');

var initGameState = function initGameState(level) {
  switch (level) {
    case 0:
      return level0();
    case 1:
      return level1();
  }
};

////////////////////////////////////////////////////////////////////////////
// Levels
////////////////////////////////////////////////////////////////////////////

var level1 = function level1() {
  var game = baseState(100, 100);
  addEntity(game, makeAnt({ x: 25, y: 30 }, 'QUEEN'));
  addEntity(game, makeAnt({ x: 20, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 30, y: 30 }, 'WORKER'));

  return game;
};

var level0 = function level0() {
  var game = baseState(500, 100);
  // seed start location
  var clickedLocation = _extends({}, makeLocation('Clicked Position', 1, 1, { x: 0, y: 0 }), { id: config.clickedPosition
  });
  addEntity(game, clickedLocation);
  var colonyEntrance = _extends({}, makeLocation('Colony Entrance', 1, 1, { x: 25, y: 29 }), { id: config.colonyEntrance
  });
  addEntity(game, colonyEntrance);

  // initial tasks
  game.tasks = [tasks.createIdleTask(), _extends({}, tasks.createGoToLocationTask(colonyEntrance), { name: 'Go To Colony Entrance' }), tasks.createRandomMoveTask(), tasks.createDigBlueprintTask(game), tasks.createMoveBlockerTask(), tasks.createGoToColonyEntranceWithBlockerTask(game), tasks.createLayEggTask(), tasks.createFollowTrailTask(), {
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

  // seed background
  for (var x = 0; x < game.worldWidth; x++) {
    for (var y = 0; y < game.worldHeight; y++) {
      if (y >= game.worldHeight * 0.3) {
        addEntity(game, makeBackground({ x: x, y: y }, 'SKY'));
      }
      if (y < game.worldHeight * 0.5) {
        addEntity(game, makeBackground({ x: x, y: y }, 'DIRT'));
      }
    }
  }

  // seed bottom 1/4's with dirt
  for (var _x = 0; _x < game.worldWidth; _x++) {
    for (var _y = 0; _y < game.worldHeight; _y++) {
      if (_y < game.worldHeight * 0.3) {
        if (_x == colonyEntrance.position.x && _y == colonyEntrance.position.y) {
          continue;
        }
        if (_x == colonyEntrance.position.x && _y == colonyEntrance.position.y - 1) {
          continue;
        }
        addEntity(game, makeDirt({ x: _x, y: _y }));
      }
    }
  }

  // seed ants
  for (var i = 0; i < 1000; i++) {
    var position = {
      x: randomIn(0, game.worldWidth - 1),
      y: randomIn(Math.ceil(game.worldHeight * 0.6), game.worldHeight - 1)
    };
    var ant = makeAnt(position, 'WORKER');
    addEntity(game, ant);
  }
  addEntity(game, makeAnt({ x: 25, y: 30 }, 'QUEEN'));
  addEntity(game, makeAnt({ x: 20, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 30, y: 30 }, 'WORKER'));

  // add stone
  addEntity(game, makeStone({ x: 35, y: 35 }));

  // seed food
  for (var _i = 0; _i < 15; _i++) {
    var _position = {
      x: randomIn(0, game.worldWidth - 1),
      y: randomIn(Math.ceil(game.worldHeight * 0.6) + 1, game.worldHeight - 1)
    };
    var food = makeFood(_position, 1000, 'Crumb');
    addEntity(game, food);
  }

  return game;
};

////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////

var baseState = function baseState(worldWidth, worldHeight) {
  var game = {
    time: 0,
    tickInterval: null,
    antMode: 'PICKUP',
    userMode: 'SELECT',
    nextLocationName: 'Give Locations Unique Names',
    prevPheromone: null,
    mouse: {
      isLeftDown: false,
      isRightDown: false,
      downPos: { x: 0, y: 0 },
      curPos: { x: 0, y: 0 },
      curPixel: { x: 0, y: 0 },
      prevPixel: { x: 0, y: 0 }
    },

    worldWidth: worldWidth,
    worldHeight: worldHeight,
    viewPos: { x: 0, y: 0 },

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
    BACKGROUND: [],

    tasks: [],
    grid: []
  };

  return game;
};

module.exports = { initGameState: initGameState };