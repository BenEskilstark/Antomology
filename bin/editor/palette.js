'use strict';

var _require = require('../entities/makeEntityByType'),
    makeEntityByType = _require.makeEntityByType;

var _require2 = require('../utils/stateHelpers'),
    lookupInGrid = _require2.lookupInGrid;

var _require3 = require('../utils/vectors'),
    subtract = _require3.subtract;

var makeEntityUnderMouse = function makeEntityUnderMouse(state, dispatch, entityType, gridPos) {
  var occupied = lookupInGrid(state.game.grid, gridPos).map(function (i) {
    return state.game.entities[i];
  }).filter(function (e) {
    return e.type == entityType;
  }).length > 0;
  if (!occupied) {
    var entity = makeEntityByType(state.editor.entityType, gridPos);
    dispatch({ type: 'CREATE_ENTITY', entity: entity });
  }
};

var makeEntitiesInMarquee = function makeEntitiesInMarquee(state, dispatch, entityType) {
  var game = state.game;
  var mouse = game.mouse;

  var dims = subtract(mouse.curPos, mouse.downPos);
  var x = dims.x > 0 ? mouse.downPos.x : mouse.curPos.x;
  var y = dims.y > 0 ? mouse.downPos.y : mouse.curPos.y;
  for (var i = 0; i < Math.abs(dims.x) + 1; i++) {
    for (var j = 0; j < Math.abs(dims.y) + 1; j++) {
      makeEntityUnderMouse(state, dispatch, entityType, { x: x + i, y: y + j });
    }
  }
};

var deleteEntitiesUnderMouse = function deleteEntitiesUnderMouse(state, dispatch, gridPos) {
  var ids = lookupInGrid(state.game.grid, gridPos);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = ids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var id = _step.value;

      dispatch({ type: 'DESTROY_ENTITY', id: id });
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
};

module.exports = {
  makeEntityUnderMouse: makeEntityUnderMouse,
  makeEntitiesInMarquee: makeEntitiesInMarquee,
  deleteEntitiesUnderMouse: deleteEntitiesUnderMouse
};