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
    subtract = _require4.subtract;

var _require5 = require('../entities/location'),
    makeLocation = _require5.makeLocation;

var _require6 = require('../state/tasks'),
    createGoToLocationTask = _require6.createGoToLocationTask,
    createDoAction = _require6.createDoAction;

var initMouseControlsSystem = function initMouseControlsSystem(store) {
  var dispatch = store.dispatch;


  var canvas = null;
  document.onmouseup = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(ev);
    if (gridPos == null) return;

    if (ev.button == 0) {
      // left click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false });
      handleLeftClick(state, dispatch, gridPos);
    } else if (ev.button == 2) {
      // right click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false });
      handleRightClick(state, dispatch, gridPos);
    }
  };

  document.onmousedown = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(ev);
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
    var gridPos = getClickedPos(ev);
    if (gridPos == null) return;
    dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos });
    if (state.game.mouse.isLeftDown && state.game.userMode === 'MARK') {
      var clickedEntities = fastCollidesWith(state.game, { position: gridPos, width: 1, height: 1 }).filter(function (e) {
        return e.type === 'DIRT';
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = clickedEntities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var clickedEntity = _step.value;

          dispatch({
            type: 'MARK_ENTITY',
            entityID: clickedEntity.id,
            quantity: 1
          });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  };
};

var canvas = null;
var getClickedPos = function getClickedPos(ev) {
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
  return canvasToGrid(canvasPos);
};

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
  } else if (state.game.userMode === 'MARK') {
    var clickedEntity = entitiesInMarquee(state.game, { position: gridPos, width: 1, height: 1 }).filter(function (e) {
      return e.type == 'DIRT';
    })[0];
    if (clickedEntity != null) {
      dispatch({
        type: 'MARK_ENTITY',
        entityID: clickedEntity.id,
        quantity: 1
      });
    }
  }
};

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

module.exports = { initMouseControlsSystem: initMouseControlsSystem };