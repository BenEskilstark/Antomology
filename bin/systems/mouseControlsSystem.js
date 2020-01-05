'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../selectors/selectors'),
    collidesWith = _require2.collidesWith,
    getSelectedAntIDs = _require2.getSelectedAntIDs,
    getEntitiesByType = _require2.getEntitiesByType;

var _require3 = require('../utils/canvasHelpers'),
    canvasToGrid = _require3.canvasToGrid,
    gridToCanvas = _require3.gridToCanvas;

var _require4 = require('../utils/vectors'),
    add = _require4.add,
    subtract = _require4.subtract;

var _require5 = require('../entities/location'),
    makeLocation = _require5.makeLocation;

var initMouseControlsSystem = function initMouseControlsSystem(store) {
  var dispatch = store.dispatch;


  var canvas = null;
  document.onmouseup = function (ev) {
    var state = store.getState();
    // TODO: maybe a better way to get the canvas
    if (!canvas) {
      canvas = document.getElementById('canvas');
      // don't open the normal right-click menu
      canvas.addEventListener('contextmenu', function (ev) {
        return ev.preventDefault();
      });
      if (!canvas) {
        return;
      }
    }
    var rect = canvas.getBoundingClientRect();

    var canvasPos = {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top
    };
    var gridPos = canvasToGrid(canvasPos);

    if (ev.button == 0) {
      // left click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false });
      handleLeftClick(state, dispatch, gridPos, false /* isMouseDown */);
    } else if (ev.button == 2) {
      // right click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false });
      handleRightClick(state, dispatch, gridPos);
    }
  };

  document.onmousedown = function (ev) {
    var state = store.getState();
    // TODO: maybe a better way to get the canvas
    if (!canvas) {
      canvas = document.getElementById('canvas');
      // don't open the normal right-click menu
      canvas.addEventListener('contextmenu', function (ev) {
        return ev.preventDefault();
      });
      if (!canvas) {
        return;
      }
    }
    var rect = canvas.getBoundingClientRect();

    var canvasPos = {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top
    };
    var gridPos = canvasToGrid(canvasPos);

    if (ev.button == 0) {
      // left click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: true, isDown: true });
      if (state.game.userMode === 'CREATE_LOCATION') {
        dispatch({ type: 'START_CREATE_LOCATION', position: gridPos });
      }
    } else if (ev.button == 2) {
      // right click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: false, isDown: true });
    }
  };

  document.onmousemove = function (ev) {
    var state = store.getState();
    if (state.game.mouse.isLeftDown && state.game.userMode === 'MARK') {
      // TODO: maybe a better way to get the canvas
      if (!canvas) {
        canvas = document.getElementById('canvas');
        // don't open the normal right-click menu
        canvas.addEventListener('contextmenu', function (ev) {
          return ev.preventDefault();
        });
        if (!canvas) {
          return;
        }
      }
      var rect = canvas.getBoundingClientRect();

      var canvasPos = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
      };
      var gridPos = canvasToGrid(canvasPos);
      var clickedEntities = collidesWith({ position: gridPos, width: 1, height: 1 }, getEntitiesByType(state.game, 'DIRT'));
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

var handleLeftClick = function handleLeftClick(state, dispatch, gridPos) {
  // handle creating locations
  if (state.game.userMode === 'CREATE_LOCATION') {
    var dimensions = subtract(gridPos, state.game.tempLocation);
    var locPosition = _extends({}, state.game.tempLocation);
    if (dimensions.x < 0) {
      locPosition.x = locPosition.x + dimensions.x;
    }
    if (dimensions.y < 0) {
      locPosition.y = locPosition.y + dimensions.y;
    }
    var newLocation = makeLocation('test', // TODO
    Math.abs(dimensions.x) + 1, // off by one
    Math.abs(dimensions.y) + 1, locPosition);
    dispatch({ type: 'CREATE_ENTITY', entity: newLocation });
    return;
  }

  // handle selecting ants
  var clickedAnts = collidesWith({ position: gridPos, width: 1, height: 1 }, getEntitiesByType(state.game, 'ANT'));
  // TODO: support multi-selection via marquee
  if (clickedAnts.length > 0) {
    dispatch({
      type: 'SET_SELECTED_ENTITIES',
      entityIDs: clickedAnts.map(function (entity) {
        return entity.id;
      })
    });
  } else if (state.game.selectedEntities.length > 0) {
    dispatch({
      type: 'SET_SELECTED_ENTITIES',
      entityIDs: []
    });
  }
};

var handleRightClick = function handleRightClick(state, dispatch, gridPos) {
  var selectedAntIDs = getSelectedAntIDs(state.game);
  var clickedEntities = collidesWith({ position: gridPos, width: 1, height: 1 }, getEntitiesByType(state.game, 'DIRT'));
  var clickedEntity = clickedEntities[0];
  // TODO add config for which entities can be picked up
  var blocked = clickedEntity != null && clickedEntity.type != 'ANT';

  var clickedLocation = {
    id: -1,
    name: 'Clicked Position',
    position: blocked ? add(gridPos, { x: -1, y: -1 }) : gridPos,
    width: blocked ? 3 : 1,
    height: blocked ? 3 : 1
  };
  if (selectedAntIDs.length > 0) {
    // TODO: good opportunity for abstraction
    var task = {
      name: 'Go To Position',
      repeating: false,
      behaviorQueue: [{
        type: 'DO_WHILE',
        condition: {
          type: 'LOCATION',
          not: true,
          comparator: 'EQUALS',
          payload: {
            object: clickedLocation
          }
        },
        behavior: {
          type: 'DO_ACTION',
          action: {
            type: 'MOVE',
            payload: {
              object: clickedLocation
            }
          }
        }
      }]
    };
    var pickupClicked = {
      type: 'DO_ACTION',
      action: {
        type: 'PICKUP',
        payload: {
          object: clickedEntity
        }
      }
    };
    var putdownClicked = {
      type: 'DO_ACTION',
      action: {
        type: 'PUTDOWN',
        payload: {
          object: { position: gridPos }
        }
      }
    };
    task.behaviorQueue.push({
      type: 'CONDITIONAL',
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
    dispatch({
      type: 'ASSIGN_TASK',
      ants: selectedAntIDs,
      task: task
    });
  }
};

module.exports = { initMouseControlsSystem: initMouseControlsSystem };