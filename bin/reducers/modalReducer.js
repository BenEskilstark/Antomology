'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var _require = require('../selectors/selectors');

_objectDestructuringEmpty(_require);

var modalReducer = function modalReducer(state, action) {
  switch (action.type) {
    case 'DISMISS_MODAL':
      return _extends({}, state, {
        modal: null
      });
    case 'SET_MODAL':
      {
        var modal = action.modal;

        return _extends({}, state, {
          modal: modal
        });
      }
  }
  return state;
};

module.exports = { modalReducer: modalReducer };