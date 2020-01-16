'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/stateHelpers'),
    addEntity = _require2.addEntity,
    removeEntity = _require2.removeEntity;

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
    case 'UPDATE_NEXT_LOCATION_NAME':
      {
        var name = action.name;

        return _extends({}, game, {
          nextLocationName: name
        });
      }
    case 'ASSIGN_TASK':
      {
        var _task2 = action.task,
            ants = action.ants;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = ants[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _id = _step.value;

            game.entities[_id].task = _task2;
            game.entities[_id].taskStack = [];
            game.entities[_id].taskIndex = 0;
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
          return t.name === _task2.name;
        }).length > 0;
        if (!taskAdded) {
          game.tasks.push(_task2);
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
        var _id2 = action.id,
            theta = action.theta;

        if (game.entities[_id2] != null) {
          game.entities[_id2].theta = theta;
        }
        return game;
      }
    case 'SET_PREV_PHEROMONE':
      {
        var _id3 = action.id;

        return _extends({}, game, {
          prevPheromone: _id3
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
        var curPos = action.curPos;

        return _extends({}, game, {
          mouse: _extends({}, game.mouse, {
            curPos: curPos
          })
        });
      }
  }

  return game;
};

module.exports = { gameReducer: gameReducer };