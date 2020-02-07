'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/stateHelpers'),
    addEntity = _require2.addEntity,
    removeEntity = _require2.removeEntity;

var _require3 = require('../utils/helpers'),
    clamp = _require3.clamp;

var _require4 = require('../entities/edge'),
    createEdge = _require4.createEdge;

var gameReducer = function gameReducer(game, action) {
  switch (action.type) {
    case 'CREATE_ENTITY':
      {
        var entity = action.entity;

        if (entity.type == 'LOCATION') {
          // if trying to make a location with the same name as one that already exists,
          // just update the position of the currently-existing entity for that location
          var locationIDWithName = game.LOCATION.filter(function (l) {
            return game.entities[l].name === entity.name;
          })[0];
          if (locationIDWithName != null) {
            removeEntity(game, game.entities[locationIDWithName]);
            addEntity(game, _extends({}, entity, { id: locationIDWithName }));
          } else {
            addEntity(game, entity);
          }
        } else {
          addEntity(game, entity);
        }
        if (entity.type === 'PHEROMONE') {
          game.prevPheromone = entity.id;
          game.edges[entity.edge].pheromones.push(entity.id);
        }
        return game;
      }
    case 'DESTROY_ENTITY':
      {
        var id = action.id;

        removeEntity(game, game.entities[id]);
        return game;
      }
    case 'SET_SELECTED_ENTITIES':
      {
        return _extends({}, game, {
          selectedEntities: action.entityIDs
        });
      }
    case 'CREATE_EDGE':
      {
        var start = action.start;

        var newEdge = createEdge(start);
        game.edges[newEdge.id] = newEdge;
        game.curEdge = newEdge.id;
        game.entities[start].outgoingEdges.push(newEdge.id);
        return game;
      }
    case 'UPDATE_EDGE':
      {
        var _id = action.id,
            edge = action.edge;

        if (game.edges[_id].end == null && edge.end != null) {
          game.entities[edge.end].incomingEdges.push(_id);
        }
        game.edges[_id] = edge;
        game.curEdge = null;
        return game;
      }
    case 'SET_CUR_EDGE':
      {
        var curEdge = action.curEdge;

        return _extends({}, game, {
          curEdge: curEdge
        });
      }
    case 'CREATE_TASK':
      {
        var task = action.task;

        return _extends({}, game, {
          tasks: [].concat(_toConsumableArray(game.tasks), [task])
        });
      }
    case 'UPDATE_TASK':
      {
        var _task = action.task;

        var oldTask = game.tasks.filter(function (t) {
          return t.name === _task.name;
        })[0];
        oldTask.repeating = _task.repeating;
        oldTask.behaviorQueue = _task.behaviorQueue;
        return game;
      }
    case 'UPDATE_LOCATION_NAME':
      {
        var _id2 = action.id,
            newName = action.newName;

        game.entities[_id2].name = newName;
        return game;
      }
    case 'UPDATE_NEXT_LOCATION_NAME':
      {
        var name = action.name;

        return _extends({}, game, {
          nextLocationName: name
        });
      }
    case 'UPDATE_LOCATION_TASK':
      {
        var _task2 = action.task,
            _id3 = action.id;

        var loc = game.entities[_id3];
        loc.task.repeating = false;
        loc.task.behaviorQueue = _task2.behaviorQueue;
        return game;
      }
    case 'ASSIGN_TASK':
      {
        var _task3 = action.task,
            ants = action.ants;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = ants[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _id4 = _step.value;

            game.entities[_id4].task = _task3;
            game.entities[_id4].taskStack = [];
            game.entities[_id4].taskIndex = 0;
          }
          // add the task to the task array
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

        var taskAdded = game.tasks.filter(function (t) {
          return t.name === _task3.name;
        }).length > 0;
        if (!taskAdded) {
          game.tasks.push(_task3);
        }
        return game;
      }
    case 'SET_USER_MODE':
      {
        var userMode = action.userMode;

        return _extends({}, game, {
          userMode: userMode
        });
      }
    case 'SET_ANT_MODE':
      {
        var antMode = action.antMode;

        return _extends({}, game, {
          antMode: antMode
        });
      }
    case 'UPDATE_THETA':
      {
        var _id5 = action.id,
            theta = action.theta;

        if (game.entities[_id5] != null) {
          game.entities[_id5].theta = theta;
        }
        return game;
      }
    case 'SET_PREV_PHEROMONE':
      {
        var _id6 = action.id;

        return _extends({}, game, {
          prevPheromone: _id6
        });
      }
    case 'SET_MOUSE_DOWN':
      {
        var isLeft = action.isLeft,
            isDown = action.isDown,
            downPos = action.downPos;

        return _extends({}, game, {
          mouse: _extends({}, game.mouse, {
            isLeftDown: isLeft ? isDown : game.mouse.isLeftDown,
            isRightDown: isLeft ? game.mouse.isRightDOwn : isDown,
            downPos: isDown && downPos != null ? downPos : game.mouse.downPos
          })
        });
      }
    case 'SET_MOUSE_POS':
      {
        var curPos = action.curPos,
            curPixel = action.curPixel;

        return _extends({}, game, {
          mouse: _extends({}, game.mouse, {
            prevPos: _extends({}, game.mouse.curPos),
            curPos: curPos,
            prevPixel: _extends({}, game.mouse.curPixel),
            curPixel: curPixel
          })
        });
      }
    case 'SET_VIEW_POS':
      {
        var viewPos = action.viewPos;

        return _extends({}, game, {
          viewPos: viewPos
        });
      }
    case 'ZOOM':
      {
        var out = action.out;

        var widthToHeight = config.width / config.height;
        var zoomFactor = 1;
        var nextWidth = config.width + widthToHeight * zoomFactor * out;
        var nextHeight = config.height + widthToHeight * zoomFactor * out;
        if (nextWidth > game.worldWidth || nextHeight > game.worldHeight || nextWidth < 1 || nextHeight < 1) {
          return game; // don't zoom too far in or out
        }
        var widthDiff = nextWidth - config.width;
        var heightDiff = nextHeight - config.height;

        // zoom relative to the view position
        var nextViewPosX = game.viewPos.x - widthDiff / 2;
        var nextViewPosY = game.viewPos.y - heightDiff / 2;

        config.width = nextWidth;
        config.height = nextHeight;
        return _extends({}, game, {
          viewPos: {
            x: clamp(nextViewPosX, 0, game.worldWidth - config.width),
            y: clamp(nextViewPosY, 0, game.worldHeight - config.height)
          }
        });
      }
  }

  return game;
};

module.exports = { gameReducer: gameReducer };