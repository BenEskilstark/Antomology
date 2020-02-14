'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var editorReducer = function editorReducer(editor, action) {
  switch (action.type) {
    case 'SET_EDITOR_MODE':
      {
        var editorMode = action.editorMode;

        return _extends({}, editor, {
          editorMode: editorMode
        });
      }
    case 'SET_EDITOR_ENTITY':
      {
        var entityType = action.entityType;

        return _extends({}, editor, {
          entityType: entityType
        });
      }
  }
};

module.exports = { editorReducer: editorReducer };