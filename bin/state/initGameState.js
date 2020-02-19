'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../entities/entity'),
    makeEntity = _require.makeEntity;

var _require2 = require('../entities/ant'),
    makeAnt = _require2.makeAnt;

var _require3 = require('../entities/dirt'),
    makeDirt = _require3.makeDirt;

var _require4 = require('../entities/obelisk'),
    makeObelisk = _require4.makeObelisk;

var _require5 = require('../entities/stone'),
    makeStone = _require5.makeStone;

var _require6 = require('../entities/background'),
    makeBackground = _require6.makeBackground;

var _require7 = require('../entities/food'),
    makeFood = _require7.makeFood;

var _require8 = require('../entities/location'),
    makeLocation = _require8.makeLocation;

var _require9 = require('../config'),
    config = _require9.config;

var _require10 = require('../utils/helpers'),
    randomIn = _require10.randomIn;

var _require11 = require('../utils/stateHelpers'),
    addEntity = _require11.addEntity,
    insertInGrid = _require11.insertInGrid;

var tasks = require('../state/tasks');
var graphTasks = require('../state/graphTasks');

var _require12 = require('../levels/level1'),
    level1 = _require12.level1;

var _require13 = require('../levels/level2'),
    level2 = _require13.level2;

var initGameState = function initGameState(level) {
  switch (level) {
    case -1:
      return baseState(50, 50);
    case 0:
      return level0();
    case 1:
      return _extends({}, level1(), {
        time: 0,
        tickInterval: null
      });
    case 2:
      return _extends({}, level2(), {
        time: 0,
        tickInterval: null
      });
  }
};

////////////////////////////////////////////////////////////////////////////
// Levels
////////////////////////////////////////////////////////////////////////////

var level0 = function level0() {
  var game = baseState(100, 100);
  var colonyEntrance = makeLocation('Colony Entrance', 5, 5, { x: 25, y: 30 });
  // ...makeLocation('Colony Entrance', 5, 5, {x: 25, y: 29}), id: config.colonyEntrance,
  // };
  addEntity(game, colonyEntrance);

  var locationTwo = makeLocation('Location Two', 5, 5, { x: 40, y: 30 });
  addEntity(game, locationTwo);

  // seed background
  for (var x = 0; x < game.worldWidth; x++) {
    for (var y = 0; y < game.worldHeight; y++) {
      if (y >= game.worldHeight * 0.35) {
        addEntity(game, makeBackground({ x: x, y: y }, 'SKY'));
      }
      if (y < game.worldHeight * 0.35) {
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
  // for (let i = 0; i < 1000; i++) {
  //   const position = {
  //     x: randomIn(0, game.worldWidth - 1),
  //     y: randomIn(Math.ceil(game.worldHeight * 0.6), game.worldHeight - 1),
  //   };
  //   const ant = makeAnt(position, 'WORKER');
  //   addEntity(game, ant);
  // }
  addEntity(game, makeAnt({ x: 25, y: 30 }, 'QUEEN'));
  addEntity(game, makeAnt({ x: 18, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 30, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 28, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 32, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 33, y: 30 }, 'WORKER'));
  addEntity(game, makeAnt({ x: 35, y: 30 }, 'WORKER'));

  // add obelisk
  addEntity(game, makeObelisk({ x: 20, y: 40 }, 4, 8));

  // add stone
  addEntity(game, makeStone({ x: 35, y: 35 }));

  // seed food
  for (var i = 0; i < 15; i++) {
    var position = {
      x: randomIn(0, game.worldWidth - 1),
      y: randomIn(Math.ceil(game.worldHeight * 0.6) + 1, game.worldHeight - 1)
    };
    var food = makeFood(position, 1000, 'Crumb');
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
    curEdge: null,

    edges: {},

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
    OBELISK: [],
    BACKGROUND: [],

    tasks: [],
    grid: [],

    fog: true
  };

  // seed start location
  var clickedLocation = _extends({}, makeLocation('Clicked Position', 1, 1, { x: 0, y: 0 }), { id: config.clickedPosition
  });
  addEntity(game, clickedLocation);

  // initial tasks
  game.tasks = [tasks.createIdleTask(), tasks.createRandomMoveTask(), tasks.createDigBlueprintTask(game), tasks.createMoveBlockerTask(), tasks.createGoToColonyEntranceWithBlockerTask(game), tasks.createLayEggTask(), tasks.createHoldingAndIdleTask(), graphTasks.createFindPheromoneTask(), graphTasks.createFollowTrailTask(), graphTasks.createFollowTrailInReverseTask(), {
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

  return game;
};

module.exports = { initGameState: initGameState };