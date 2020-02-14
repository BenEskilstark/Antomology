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
  }
};

module.exports = {editorReducer};
