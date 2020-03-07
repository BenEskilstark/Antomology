'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

var _require6 = require('../editor/palette'),
    makeEntityUnderMouse = _require6.makeEntityUnderMouse,
    makeEntitiesInMarquee = _require6.makeEntitiesInMarquee,
    deleteEntitiesUnderMouse = _require6.deleteEntitiesUnderMouse;

var _require7 = require('../entities/pheromone'),
    makePheromone = _require7.makePheromone;

var _require8 = require('../utils/stateHelpers'),
    lookupInGrid = _require8.lookupInGrid;

var _require9 = require('../state/tasks'),
    createGoToLocationTask = _require9.createGoToLocationTask,
    createDoAction = _require9.createDoAction;

var initMouseControlsSystem = function initMouseControlsSystem(store) {
  var dispatch = store.dispatch;


  var canvas = null;

  document.onmouseup = function (ev) {
    if (ev.target.id != 'canvas') return;
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(state.game, ev, canvas);

    if (ev.button == 0) {
      // left click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false });
      dispatch({ type: 'SET_VIEW_POS', viewPos: floor(state.game.viewPos) });
      if (gridPos == null) return;
      handleLeftClick(state, dispatch, gridPos);
      dispatch({ type: 'SET_USER_MODE', userMode: 'SELECT' });
    } else if (ev.button == 2) {
      // right click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false });
      if (gridPos == null) return;
      handleRightClick(state, dispatch, gridPos);
    }
  };

  document.onmousedown = function (ev) {
    if (ev.target.id != 'canvas') return;
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(state.game, ev, canvas);
    if (gridPos == null) return;
    var game = state.game;


    if (ev.button == 0) {
      // left click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: true, isDown: true, downPos: gridPos });
      if (game.userMode == 'MARK_TRAIL') {
        var clickedEntities = lookupInGrid(game.grid, gridPos).map(function (i) {
          return game.entities[i];
        });
        var clickedLocations = clickedEntities.filter(function (e) {
          return e.type === 'LOCATION';
        });
        var clickedPheromones = clickedEntities.filter(function (e) {
          return e.type === 'PHEROMONE';
        });

        if (clickedLocations.length > 0) {
          var loc = clickedLocations[0];
          if (game.curEdge == null) {
            dispatch({ type: 'CREATE_EDGE', start: loc.id });
          } else {
            console.log("does update edge inside mouse down ever happen??");
            var edge = game.edges[game.curEdge];
            dispatch({
              type: 'UPDATE_EDGE', id: edge.id, edge: _extends({}, edge, { end: loc.id })
            });
          }
          dispatch({
            type: 'CREATE_ENTITY',
            entity: makePheromone(gridPos, 0, 1, store.getState().game.curEdge)
          });
        } else if (clickedPheromones.length > 0) {
          var _edge = game.edges[clickedPheromones[0].edge];
          if (!_edge.end) {
            dispatch({ type: 'SET_CUR_EDGE', curEdge: _edge.id });
          }
          dispatch({
            type: 'CREATE_ENTITY',
            entity: makePheromone(gridPos, 0, 1, store.getState().game.curEdge)
          });
        }
      }
    } else if (ev.button == 2) {
      // right click
      dispatch({ type: 'SET_MOUSE_DOWN', isLeft: false, isDown: true, downPos: gridPos });
    }
  };

  document.onmousemove = function (ev) {
    if (canvas == null) {
      canvas = document.getElementById('canvas');
      if (canvas != null) {
        // don't open the normal right-click menu
        canvas.addEventListener('contextmenu', function (ev) {
          return ev.preventDefault();
        });
      }
    }
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(state.game, ev, canvas);
    var canvasPos = getMousePixel(ev, canvas);
    if (gridPos == null) return;
    handleMouseMove(state, dispatch, gridPos, canvasPos);
  };

  document.onwheel = function (ev) {
    var state = store.getState();
    if (state.game == null) return;
    var gridPos = getClickedPos(state.game, ev, canvas);
    if (gridPos == null) return;
    store.dispatch({ type: 'ZOOM', out: ev.wheelDelta < 0 ? 1 : -1 });
  };
};

////////////////////////////////////////////////////////////////////////////
// Mouse move
////////////////////////////////////////////////////////////////////////////
var handleMouseMove = function handleMouseMove(state, dispatch, gridPos, canvasPos) {
  if (state.game.mouse.isLeftDown) {
    if (state.editor != null) {
      var editor = state.editor;

      switch (editor.editorMode) {
        case 'CREATE_ENTITY':
          makeEntityUnderMouse(state, dispatch, editor.entityType, gridPos);
          break;
        case 'MARK_TRAIL':

          break;
        case 'DELETE_ENTITY':
          deleteEntitiesUnderMouse(state, dispatch, gridPos);
          break;
      }
      dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
    } else {
      switch (state.game.userMode) {
        case 'MARK_TRAIL':
          dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
          dragPheromoneTrail(state, dispatch, gridPos);
          break;
        case 'PAN':
          var dragDiffPixel = subtract(canvasPos, state.game.mouse.curPixel);
          doPan(state, dispatch, gridPos, canvasPos, dragDiffPixel);
          break;
        default:
          dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
          break;
      }
    }
  } else {
    dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
  }
};

var doPan = function doPan(state, dispatch, gridPos, canvasPos, dragDiffPixel) {
  if (equals(dragDiffPixel, { x: 0, y: 0 })) {
    dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
    return;
  }
  var dragDiff = multiply(dragDiffPixel, {
    x: config.width / config.canvasWidth,
    y: -1 * config.height / config.canvasHeight
  });
  var nextViewPos = subtract(state.game.viewPos, dragDiff);
  dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
  dispatch({ type: 'SET_VIEW_POS', viewPos: nextViewPos });
};

var dragPheromoneTrail = function dragPheromoneTrail(state, dispatch, gridPos) {
  if (state.game.curEdge == null) {
    return; // not creating an edge
  }
  var prevPheromone = state.game.entities[state.game.prevPheromone];
  if (prevPheromone == null) {
    dispatch({
      type: 'CREATE_ENTITY',
      entity: makePheromone(gridPos, 0 /* theta */, 1, state.game.curEdge, null)
    });
    return;
  }
  if (equals(gridPos, prevPheromone.position)) {
    return; // don't make another at its current spot
  }

  var prevPos = null;
  var prevPheromoneID = null;
  var cursor = _extends({}, prevPheromone.position);
  while (!equals(cursor, gridPos)) {
    var diff = subtract(gridPos, cursor);
    // initial case
    if (prevPos == null) {
      prevPos = _extends({}, cursor);
      prevPheromoneID = prevPheromone.id;
    }
    if (Math.abs(diff.x) > Math.abs(diff.y)) {
      cursor.x += diff.x / Math.abs(diff.x);
    } else {
      cursor.y += diff.y / Math.abs(diff.y);
    }
    var theta = vectorTheta(subtract(cursor, prevPos));
    var curPheromone = makePheromone(_extends({}, cursor), theta, 1, state.game.curEdge, prevPheromoneID);
    dispatch({
      type: 'CREATE_ENTITY',
      entity: curPheromone
    });
    dispatch({ type: 'UPDATE_THETA', id: prevPheromoneID, theta: theta });

    prevPheromoneID = curPheromone.id;
    prevPos = _extends({}, cursor);
  }
};

////////////////////////////////////////////////////////////////////////////
// Left click
////////////////////////////////////////////////////////////////////////////
var handleLeftClick = function handleLeftClick(state, dispatch, gridPos) {
  var game = state.game,
      editor = state.editor;

  if (editor == null) {
    switch (game.userMode) {
      case 'CREATE_LOCATION':
        createLocation(game, dispatch, gridPos);
        break;
      case 'SELECT':
        selectEntities(game, dispatch, gridPos);
        break;
      case 'MARK_TRAIL':
        createPheromoneTrail(game, dispatch, gridPos);
        break;
      case 'DELETE_LOCATION':
        deleteEntitiesUnderMouse(state, dispatch, gridPos, 'LOCATION');
        break;
    }
  } else {
    switch (editor.editorMode) {
      case 'CREATE_ENTITY':
        makeEntityUnderMouse(state, dispatch, editor.entityType, gridPos);
        break;
      case 'CREATE_LOCATION':
        createLocation(game, dispatch, gridPos);
        break;
      case 'MARK_TRAIL':

        break;
      case 'MARQUEE_ENTITY':
        makeEntitiesInMarquee(state, dispatch, editor.entityType);
        break;
      case 'DELETE_ENTITY':
        deleteEntitiesUnderMouse(state, dispatch, gridPos);
        break;
    }
  }
};

var createLocation = function createLocation(game, dispatch, gridPos) {
  var dimensions = subtract(gridPos, game.mouse.downPos);
  var locPosition = _extends({}, game.mouse.downPos);
  if (dimensions.x < 0) {
    locPosition.x = locPosition.x + dimensions.x;
  }
  if (dimensions.y < 0) {
    locPosition.y = locPosition.y + dimensions.y;
  }
  // making locations with buffer
  var newLocation = makeLocation(game.nextLocationName, Math.abs(dimensions.x) + 3, // off by one
  Math.abs(dimensions.y) + 3, subtract(locPosition, { x: 1, y: 1 }));
  dispatch({ type: 'CREATE_ENTITY', entity: newLocation });
};

var selectEntities = function selectEntities(game, dispatch, gridPos) {
  // handle selecting ants
  var mouse = game.mouse;

  var dims = subtract(mouse.curPos, mouse.downPos);
  var x = dims.x > 0 ? mouse.downPos.x : mouse.curPos.x;
  var y = dims.y > 0 ? mouse.downPos.y : mouse.curPos.y;
  var marqueeLocation = { position: { x: x, y: y }, width: Math.abs(dims.x) + 1, height: Math.abs(dims.y) + 1 };
  var clickedEntities = entitiesInMarquee(game, marqueeLocation).filter(function (e) {
    return config.selectableEntities.includes(e.type);
  }).filter(function (e) {
    return e.id != config.clickedPosition;
  });
  // const obeliskID = game.OBELISK[0];
  // if (clickedEntities.includes(obeliskID)) {
  //   clickedEntities = [obeliskID];
  // }
  var pheromonesInEdges = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = clickedEntities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entity = _step.value;

      if (entity.type === 'PHEROMONE') {
        var edge = game.edges[entity.edge];
        pheromonesInEdges.push.apply(pheromonesInEdges, _toConsumableArray(edge.pheromones));
      }
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

  if (clickedEntities.length > 0) {
    var clickedIDs = clickedEntities.map(function (e) {
      return e.id;
    });
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = pheromonesInEdges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var ph = _step2.value;

        if (!clickedIDs.includes(ph)) {
          clickedIDs.push(ph);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    var didSelectLocation = clickedEntities.filter(function (e) {
      return e.type === 'LOCATION';
    }).length > 0;
    if (didSelectLocation) {
      dispatch({ type: 'SET_INFO_TAB', infoTab: 'Locations' });
    }
    dispatch({
      type: 'SET_SELECTED_ENTITIES',
      entityIDs: clickedIDs.slice(0, config.maxSelectableAnts)
    });
  } else if (game.selectedEntities.length > 0) {
    dispatch({
      type: 'SET_SELECTED_ENTITIES',
      entityIDs: []
    });
  }
};

var createPheromoneTrail = function createPheromoneTrail(game, dispatch, gridPos) {
  dispatch({ type: 'SET_PREV_PHEROMONE', id: null });
  var clickedEntities = lookupInGrid(game.grid, gridPos).map(function (i) {
    return game.entities[i];
  });
  var clickedLocations = clickedEntities.filter(function (e) {
    return e.type === 'LOCATION';
  });

  if (clickedLocations.length > 0 && game.curEdge != null) {
    // TODO distinguish which location you're starting from/ending on
    var loc = clickedLocations[0];
    var edge = game.edges[game.curEdge];
    dispatch({
      type: 'UPDATE_EDGE', id: edge.id, edge: _extends({}, edge, { end: loc.id })
    });
  } else {
    dispatch({ type: 'SET_CUR_EDGE', curEdge: null });
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
    var putdownClicked = createDoAction('PUTDOWN', { position: gridPos, width: 1, height: 1 });
    if (state.game.antMode === 'EAT') {
      task.behaviorQueue.push(eatClicked);
    } else if (state.game.antMode === 'PICKUP') {
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
var getClickedPos = function getClickedPos(game, ev, canvas) {
  var pixel = getMousePixel(ev, canvas);
  if (pixel == null) return null;
  return canvasToGrid(game, pixel, false /* noFloor */);
};
var getMousePixel = function getMousePixel(ev, canvas) {
  if (!canvas) {
    return null;
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