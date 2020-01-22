'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../selectors/selectors'),
    getSelectedAntIDs = _require2.getSelectedAntIDs,
    fastCollidesWith = _require2.fastCollidesWith,
    getEntitiesByType = _require2.getEntitiesByType,
    entitiesInMarquee = _require2.entitiesInMarquee;

var _require3 = require('../utils/canvasHelpers'),
    canvasToGrid = _require3.canvasToGrid,
    gridToCanvas = _require3.gridToCanvas;

var _require4 = require('../utils/vectors'),
    add = _require4.add,
    subtract = _require4.subtract,
    equals = _require4.equals,
    makeVector = _require4.makeVector,
    vectorTheta = _require4.vectorTheta,
    multiply = _require4.multiply,
    floor = _require4.floor;

var _require5 = require('../entities/location'),
    makeLocation = _require5.makeLocation;

var _require6 = require('../entities/pheromone'),
    makePheromone = _require6.makePheromone;

var _require7 = require('../utils/stateHelpers'),
    lookupInGrid = _require7.lookupInGrid;

var _require8 = require('../state/tasks'),
    createGoToLocationTask = _require8.createGoToLocationTask,
    createDoAction = _require8.createDoAction;

var initMouseControlsSystem = function initMouseControlsSystem(store) {
  var dispatch = store.dispatch;


  var canvas = null;
  document.onmouseup = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(state.game, ev);

    if (ev.button == 0) {
      // left click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false });
      dispatch({ type: 'SET_VIEW_POS', viewPos: floor(state.game.viewPos) });
      if (gridPos == null) return;
      handleLeftClick(state, dispatch, gridPos);
    } else if (ev.button == 2) {
      // right click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false });
      if (gridPos == null) return;
      handleRightClick(state, dispatch, gridPos);
    }
  };

  document.onmousedown = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(state.game, ev);
    if (gridPos == null) return;

    if (ev.button == 0) {
      // left click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: true, isDown: true, downPos: gridPos });
    } else if (ev.button == 2) {
      // right click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: false, isDown: true, downPos: gridPos });
    }
  };

  document.onmousemove = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(state.game, ev);
    var canvasPos = getMousePixel(ev);
    if (gridPos == null) return;
    handleMouseMove(state, dispatch, gridPos, canvasPos);
  };

  document.onwheel = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(state.game, ev);
    if (gridPos == null) return;
    store.dispatch({ type: 'ZOOM', out: ev.wheelDelta < 0 ? 1 : -1 });
  };
};

////////////////////////////////////////////////////////////////////////////
// Mouse move
////////////////////////////////////////////////////////////////////////////

var handleMouseMove = function handleMouseMove(state, dispatch, gridPos, canvasPos) {
  if (state.game.mouse.isLeftDown && state.game.userMode === 'MARK_TRAIL') {
    dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
    var prevPheromone = state.game.entities[state.game.prevPheromone];
    if (prevPheromone == null) {
      dispatch({
        type: 'CREATE_ENTITY',
        entity: makePheromone(gridPos, theta, 1)
      });
      return;
    }
    if (equals(gridPos, prevPheromone.position)) {
      return; // don't make another at its current spot
    }
    var theta = vectorTheta(subtract(gridPos, prevPheromone.position));
    var xDiff = Math.abs(gridPos.x - prevPheromone.position.x);
    var yDiff = Math.abs(gridPos.y - prevPheromone.position.y);
    if (xDiff > 1 || yDiff > 1 || xDiff == 1 && yDiff == 1) {
      theta = 0; // no theta update if they aren't neighbors
    } else {
      dispatch({ type: 'UPDATE_THETA', id: prevPheromone.id, theta: theta });
    }
    var pheromone = lookupInGrid(state.game.grid, gridPos).filter(function (id) {
      return state.game.entities[id].type === 'PHEROMONE';
    }).map(function (id) {
      return state.game.entities[id];
    })[0];
    if (pheromone != null) {
      if (pheromone.theta != theta) {
        dispatch({ type: 'UPDATE_THETA', id: pheromone.id, theta: theta });
        dispatch({ type: 'SET_PREV_PHEROMONE', id: pheromone.id });
      }
    } else {
      dispatch({
        type: 'CREATE_ENTITY',
        entity: makePheromone(gridPos, theta, 1)
      });
    }
  } else if (state.game.mouse.isLeftDown && state.game.userMode === 'PAN') {
    var dragDiffPixel = subtract(canvasPos, state.game.mouse.curPixel);
    if (equals(dragDiffPixel, { x: 0, y: 0 })) {
      dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
      return;
    }
    // const nextViewPosPixel = subtract(gridToCanvas(state.game, state.game.viewPos), dragDiff);
    // const nextViewPos = canvasToGrid(state.game, nextViewPosPixel);
    var dragDiff = multiply(dragDiffPixel, { x: config.width / config.canvasWidth, y: -1 * config.height / config.canvasHeight });
    var nextViewPos = subtract(state.game.viewPos, dragDiff);
    if (nextViewPos.x < 0 || nextViewPos.y < 0 || nextViewPos.x + config.width > state.game.worldWidth || nextViewPos.y + config.height > state.game.worldHeight) {
      dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
      return;
    }
    dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
    dispatch({ type: 'SET_VIEW_POS', viewPos: nextViewPos });
  } else {
    dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
  }
};
////////////////////////////////////////////////////////////////////////////
// Left click
////////////////////////////////////////////////////////////////////////////

var handleLeftClick = function handleLeftClick(state, dispatch, gridPos) {
  // handle creating locations
  if (state.game.userMode === 'CREATE_LOCATION') {
    var dimensions = subtract(gridPos, state.game.mouse.downPos);
    var locPosition = _extends({}, state.game.mouse.downPos);
    if (dimensions.x < 0) {
      locPosition.x = locPosition.x + dimensions.x;
    }
    if (dimensions.y < 0) {
      locPosition.y = locPosition.y + dimensions.y;
    }
    var newLocation = makeLocation(state.game.nextLocationName, Math.abs(dimensions.x) + 1, // off by one
    Math.abs(dimensions.y) + 1, locPosition);
    dispatch({ type: 'CREATE_ENTITY', entity: newLocation });
    return;
  } else if (state.game.userMode === 'SELECT') {
    // handle selecting ants
    var mouse = state.game.mouse;

    var dims = subtract(mouse.curPos, mouse.downPos);
    var x = dims.x > 0 ? mouse.downPos.x : mouse.curPos.x;
    var y = dims.y > 0 ? mouse.downPos.y : mouse.curPos.y;
    var marqueeLocation = { position: { x: x, y: y }, width: Math.abs(dims.x) + 1, height: Math.abs(dims.y) + 1 };
    var clickedAnts = entitiesInMarquee(state.game, marqueeLocation).filter(function (e) {
      return config.selectableEntities.includes(e.type);
    });
    if (clickedAnts.length > 0) {
      dispatch({
        type: 'SET_SELECTED_ENTITIES',
        entityIDs: clickedAnts.slice(0, config.maxSelectableAnts).map(function (e) {
          return e.id;
        })
      });
    } else if (state.game.selectedEntities.length > 0) {
      dispatch({
        type: 'SET_SELECTED_ENTITIES',
        entityIDs: []
      });
    }
  }
};

////////////////////////////////////////////////////////////////////////////
// Right click
////////////////////////////////////////////////////////////////////////////

var handleRightClick = function handleRightClick(state, dispatch, gridPos) {
  var selectedAntIDs = getSelectedAntIDs(state.game);
  var clickedEntity = entitiesInMarquee(state.game, { position: gridPos, width: 1, height: 1 }).filter(function (e) {
    return config.antPickupEntities.includes(e.type);
  })[0];
  var clickedFood = entitiesInMarquee(state.game, { position: gridPos, width: 1, height: 1 }).filter(function (e) {
    return config.antEatEntities.includes(e.type);
  })[0];
  // TODO add config for which entities block the ant
  var blocked = clickedEntity != null || clickedFood != null;

  var clickedLocation = _extends({}, makeLocation('Clicked Position', 1, 1, gridPos), { id: config.clickedPosition
  });
  dispatch({ type: 'CREATE_ENTITY', entity: clickedLocation });
  if (selectedAntIDs.length > 0) {
    var task = createGoToLocationTask(clickedLocation);
    task.name = 'Go To Clicked Location';
    var eatClicked = createDoAction('EAT', clickedFood);
    var pickupClicked = createDoAction('PICKUP', clickedEntity);
    var putdownClicked = createDoAction('PUTDOWN', { position: gridPos });
    if (state.game.antMode === 'EAT') {
      task.behaviorQueue.push(eatClicked);
    } else if (state.game.antMode === 'PICKUP') {
      if (clickedEntity != null && (clickedEntity.type === 'LARVA' || clickedEntity.type === 'ANT')) {
        task.behaviorQueue.push(createDoAction('FEED', null));
      } else {
        task.behaviorQueue.push({
          type: 'IF',
          condition: {
            type: 'HOLDING',
            comparator: 'EQUALS',
            payload: {
              object: 'NOTHING'
            }
          },
          behavior: pickupClicked,
          elseBehavior: putdownClicked
        });
      }
    } else if (state.game.antMode === 'FEED') {
      if (clickedEntity != null && clickedEntity.type === 'FOOD') {
        task.behaviorQueue.push({
          type: 'IF',
          condition: {
            type: 'HOLDING',
            comparator: 'EQUALS',
            payload: {
              object: 'NOTHING'
            }
          },
          behavior: pickupClicked,
          elseBehavior: putdownClicked
        });
      } else {
        task.behaviorQueue.push(createDoAction('FEED', null));
      }
    }
    dispatch({
      type: 'ASSIGN_TASK',
      ants: selectedAntIDs,
      task: task
    });
    // make this task always refer to most recently clicked location
    dispatch({ type: 'UPDATE_TASK', task: task });
  }
};

////////////////////////////////////////////////////////////////////////////
// click -> position helpers
////////////////////////////////////////////////////////////////////////////

var canvas = null;
var getClickedPos = function getClickedPos(game, ev, noFloor) {
  var pixel = getMousePixel(ev);
  if (pixel == null) return null;
  return canvasToGrid(game, pixel, noFloor);
};
var getMousePixel = function getMousePixel(ev) {
  if (!canvas) {
    canvas = document.getElementById('canvas');
    // don't open the normal right-click menu
    canvas.addEventListener('contextmenu', function (ev) {
      return ev.preventDefault();
    });
    if (!canvas) {
      return null;
    }
  }
  var rect = canvas.getBoundingClientRect();

  var canvasPos = {
    x: ev.clientX - rect.left,
    y: ev.clientY - rect.top
  };
  // return null if clicked outside the canvas:
  if (canvasPos.x < 0 || canvasPos.y < 0 || canvasPos.x > config.canvasWidth || canvasPos.y > config.canvasHeight) {
    return null;
  }
  return canvasPos;
};

module.exports = { initMouseControlsSystem: initMouseControlsSystem };