'use strict';

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../selectors/selectors'),
    collidesWith = _require2.collidesWith,
    getSelectedAntIDs = _require2.getSelectedAntIDs;

var _require3 = require('../utils/canvasHelpers'),
    canvasToGrid = _require3.canvasToGrid,
    gridToCanvas = _require3.gridToCanvas;

var initKeyboardControlsSystem = function initKeyboardControlsSystem(store) {
  var dispatch = store.dispatch;


  document.onkeydown = function (ev) {
    var state = store.getState();
    var time = state.game.time;

    switch (ev.keyCode) {
      case 37:
        {
          // left
          break;
        }
      case 38:
        {
          // up
          break;
        }
      case 39:
        {
          // right
          break;
        }
    }
  };

  document.onkeyup = function (ev) {
    var state = store.getState();
    var time = state.game.time;

    var target = null;
    switch (ev.keyCode) {
      case 37:
        {
          // left
          break;
        }
      case 38:
        {
          // up
          break;
        }
      case 39:
        {
          // right
          break;
        }
      case 32:
        {
          // space
          break;
        }
      case 16:
        {
          // shift
          break;
        }
    }
  };

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
      var clickedEntities = collidesWith({ position: gridPos, width: 1, height: 1 }, state.game.ants);
      // TODO: support multi-selection via marquee
      if (clickedEntities.length > 0) {
        dispatch({
          type: 'SET_SELECTED_ENTITIES',
          entityIDs: [clickedEntities[0].id]
        });
      } else {
        dispatch({
          type: 'SET_SELECTED_ENTITIES',
          entityIDs: []
        });
      }
    } else if (ev.button == 2) {
      // right click
      var selectedAntIDs = getSelectedAntIDs(state.game);
      var clickedLocation = {
        id: -1,
        name: 'Clicked Position',
        position: gridPos,
        width: 1,
        height: 1
      };
      if (selectedAntIDs.length > 0) {
        // TODO: good opportunity for abstraction
        var task = {
          name: 'Go To Position',
          behaviorQueue: [{
            type: 'DO_WHILE',
            done: false,
            condition: {
              type: 'LOCATION',
              not: true,
              comparator: 'EQUALS',
              object: clickedLocation
            },
            behavior: {
              type: 'DO_ACTION',
              done: false,
              action: {
                type: 'MOVE',
                object: clickedLocation
              }
            }
          }],
          index: 0,
          repeating: false
        };
        dispatch({
          type: 'ASSIGN_TASK',
          ants: selectedAntIDs,
          task: task
        });
      }
    }
  };
};

module.exports = { initKeyboardControlsSystem: initKeyboardControlsSystem };