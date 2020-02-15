// @flow

import type {EditorState, Action} from '../types';

const editorReducer = (editor: EditorState, action: Action): EditorState => {
  switch (action.type) {
    case 'SET_EDITOR_MODE': {
      const {editorMode} = action;
      return {
        ...editor,
        editorMode,
      };
    }
    case 'SET_EDITOR_ENTITY': {
      const {entityType} = action;
      return {
        ...editor,
        entityType,
      };
    }
    case 'SET_EDITOR_ANT_SUBTYPE': {
      const {subType} = action;
      return {
        ...editor,
        antSubType: subType,
      };
    }
    case 'SET_EDITOR_BACKGROUND_TYPE': {
      const {backgroundType} = action;
      return {
        ...editor,
        backgroundType,
      };
    }
    case 'SET_EDITOR_ALLOW_DELETE_BACKGROUND': {
      const {allow} = action;
      return {
        ...editor,
        allowDeleteBackground: allow,
      };
    }
  }
};

module.exports = {editorReducer};
