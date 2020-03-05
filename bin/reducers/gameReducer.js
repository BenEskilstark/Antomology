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

var _require5 = require('../selectors/selectors'),
    insideWorld = _require5.insideWorld;

var gameReducer = function gameReducer(game, action) {
  switch (action.type) {
    case 'CREATE_ENTITY':
      {
        var entity = action.entity;

        if (entity.position != null && !insideWorld(game, entity.position)) {
          return game;
        }
        if (entity.type == 'LOCATION') {
          // if trying to make a location with the same name as one that already exists,
          // just update the position of the currently-existing entity for that location
          var locationIDWithName = game.LOCATION.filter(function (l) {
            return game.entities[l].name === entity.name;
          })[0];
          if (locationIDWithName != null) {
            // is null for clicked location
            var locationEntity = game.entities[locationIDWithName];
            removeEntity(game, game.entities[locationIDWithName]);
            var updatedLocation = _extends({}, entity, { id: locationIDWithName,
              task: locationEntity != null ? locationEntity.task : entity.task
            });
            addEntity(game, updatedLocation);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = game.ANT[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var antID = _step.value;

                var ant = game.entities[antID];
                if (ant.location != null && ant.location.id === locationIDWithName) {
                  ant.location = updatedLocation;
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
          } else {
            addEntity(game, entity);
          }
        } else {
          addEntity(game, entity);
        }
        if (entity.type === 'PHEROMONE') {
          game.prevPheromone = entity.id;
          // TODO: remove or bring back edges
          // game.edges[entity.edge].pheromones.push(entity.id);
        }
        return game;
      }
    case 'DESTROY_ENTITY':
      {
        var id = action.id;

        if (game.LOCATION.includes(id)) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = game.ANT[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _antID = _step2.value;

              var _ant = game.entities[_antID];
              if (_ant.location != null && _ant.location.id === id) {
                _ant.location = null;
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
        }
        removeEntity(game, game.entities[id]);
        return game;
      }
    case 'SET_SELECTED_ENTITIES':
      {
        return _extends({}, game, {
          selectedEntities: action.entityIDs
        });
      }
    case 'TOGGLE_FOG':
      {
        var fog = action.fog;

        return _extends({}, game, {
          fog: fog
        });
      }
    case 'SET_GAME_OVER':
      {
        var gameOver = action.gameOver;

        return _extends({}, game, {
          gameOver: gameOver
        });
      }
    case 'SET_PHEROMONE_STRENGTH':
      {
        var selected = action.selected,
            strength = action.strength;

        if (selected) {
          return _extends({}, game, {
            selectedAntPheromoneStrength: strength
          });
        } else {
          return _extends({}, game, {
            allAntPheromoneStrength: strength
          });
        }
      }
    case 'SET_WORLD_SIZE':
      {
        var width = action.width,
            height = action.height;

        var nextWorldWidth = width != null ? width : game.worldWidth;
        var nextWorldHeight = height != null ? height : game.worldHeight;

        // delete entities outside the world
        var entitiesToDelete = [];
        for (var _id in game.entities) {
          var _entity = game.entities[_id];
          if (_entity == null) continue; // entity already deleted
          if (_entity.position.x >= nextWorldWidth || _entity.position.y >= nextWorldHeight) {
            entitiesToDelete.push(_entity);
          }
        }
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = entitiesToDelete[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _entity2 = _step3.value;

            removeEntity(game, _entity2);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return _extends({}, game, {
          worldWidth: nextWorldWidth,
          worldHeight: nextWorldHeight
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
        var _id2 = action.id,
            edge = action.edge;

        if (game.edges[_id2].end == null && edge.end != null) {
          game.entities[edge.end].incomingEdges.push(_id2);
        }
        game.edges[_id2] = edge;
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
        var _id3 = action.id,
            newName = action.newName;

        game.entities[_id3].name = newName;
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
            _id4 = action.id;

        var loc = game.entities[_id4];
        loc.task.repeating = false;
        loc.task.behaviorQueue = _task2.behaviorQueue;
        return game;
      }
    case 'ASSIGN_TASK':
      {
        var _task3 = action.task,
            ants = action.ants;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = ants[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _id5 = _step4.value;

            game.entities[_id5].task = _task3;
            game.entities[_id5].taskStack = [];
            game.entities[_id5].taskIndex = 0;
          }
          // add the task to the task array
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
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
    case 'SET_INFO_TAB':
      {
        var infoTab = action.infoTab;

        return _extends({}, game, {
          infoTab: infoTab
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
        var _id6 = action.id,
            theta = action.theta;

        if (game.entities[_id6] != null) {
          game.entities[_id6].theta = theta;
        }
        return game;
      }
    case 'SET_PREV_PHEROMONE':
      {
        var _id7 = action.id;

        return _extends({}, game, {
          prevPheromone: _id7
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

        var nextViewPos = {
          x: clamp(viewPos.x, 0, game.worldWidth - config.width),
          y: clamp(viewPos.y, 0, game.worldHeight - config.height)
        };
        return _extends({}, game, {
          viewPos: nextViewPos
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