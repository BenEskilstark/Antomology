'use strict';

var _require = require('../config'),
    config = _require.config;

var initLevelSystem = function initLevelSystem(store) {
  var time = -1;
  store.subscribe(function () {
    var state = store.getState();
    if (state.game == null) return;
    if (state.game.hydrated) return;
    if (state.levelActions == null || state.levelActions.length == 0) return;
    var dispatch = store.dispatch;


    dispatch({ type: 'HYDRATE_GAME' });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = state.levelActions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var action = _step.value;

        dispatch(action);
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
  });
};

module.exports = { initLevelSystem: initLevelSystem };