'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('../config'),
    config = _require.config;

var gameReducer = function gameReducer(game, action) {
  switch (action.type) {
    case 'CREATE_ENTITY':
      {
        var entity = action.entity;

        game.entities[entity.id] = entity;
        switch (entity.type) {
          case 'LOCATION':
            game.locations.push(entity.id);
            break;
          case 'ANT':
            game.ants.push(entity.id);
            break;
          case 'DIRT':
            game.dirt.push(entity.id);
            break;
          case 'FOOD':
            game.food.push(entity.id);
            break;
        }
        return game;
      }
    case 'DESTROY_ENTITY':
      {
        var id = action.id;

        delete game.entities[id];
        // TODO handle clearing out the arrays
        return game;
      }
    case 'CREATE_ANT':
      {
        var ant = action.ant;

        game.ants.push(ant.id);
        game.entities[ant.id] = ant;
        return game;
      }
    case 'DESTROY_ANT':
      {
        var _id = action.id;

        game.ants = game.ants.filter(function (antID) {
          return antID != _id;
        });
        delete game.entities[_id];
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
    case 'ASSIGN_TASK':
      {
        var _task = action.task,
            ants = action.ants;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = ants[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _id2 = _step.value;

            game.entities[_id2].task = _task;
            game.entities[_id2].taskIndex = 0;
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
    case 'MARK_ENTITY':
      {
        var entityID = action.entityID,
            quantity = action.quantity;

        if (entityID != null && game.entities[entityID] != null) {
          game.entities[entityID].marked = quantity;
        }
        return game;
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