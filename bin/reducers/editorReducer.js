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
    case 'SET_EDITOR_ANT_SUBTYPE':
      {
        var subType = action.subType;

        return _extends({}, editor, {
          antSubType: subType
        });
      }
    case 'SET_EDITOR_BACKGROUND_TYPE':
      {
        var backgroundType = action.backgroundType;

        return _extends({}, editor, {
          backgroundType: backgroundType
        });
      }
    case 'SET_EDITOR_ALLOW_DELETE_BACKGROUND':
      {
        var allow = action.allow;

        return _extends({}, editor, {
          allowDeleteBackground: allow
        });
      }
  }
};

module.exports = { editorReducer: editorReducer };