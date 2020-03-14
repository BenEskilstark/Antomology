// @flow

const {makeEntityByType} = require('../entities/makeEntityByType');
const {lookupInGrid} = require('../utils/stateHelpers');
const {subtract} = require('../utils/vectors');

import type {State, Action, EntityType, Vector} from '../types';

const makeEntityUnderMouse = (
  state: State,
  dispatch: (Action) => Action,
  entityType: EntityType,
  gridPos: Vector,
): void => {
  const occupied = lookupInGrid(state.game.grid, gridPos)
    .map(i => state.game.entities[i])
    .filter(e => e.type == entityType)
    .length > 0;
  const {antSubType, backgroundType} = state.editor;
  if (!occupied) {
    const entity = makeEntityByType(
      state.game,
      {antSubType, backgroundType},
      entityType, gridPos,
    );
    dispatch({type: 'CREATE_ENTITY', entity});
  }
};

const makeEntitiesInMarquee = (
  state: State,
  dispatch: (Action) => Action,
  entityType: EntityType,
): void => {
  const {game} = state;
  const {mouse} = game;
  const dims = subtract(mouse.curPos, mouse.downPos);
  const x = dims.x > 0 ? mouse.downPos.x : mouse.curPos.x;
  const y = dims.y > 0 ? mouse.downPos.y : mouse.curPos.y;

  const {antSubType, backgroundType} = state.editor;
  dispatch({
    type: 'CREATE_MANY_ENTITIES',
    pos: {x, y},
    width: Math.abs(dims.x),
    height: Math.abs(dims.y),
    editorState: {antSubType, backgroundType},
    entityType,
  });
};

const deleteEntitiesUnderMouse = (
  state: State,
  dispatch: (Action) => Action,
  gridPos: Vector,
  type: ?EntityType, // only delete entities of this type
): void => {
  const ids = lookupInGrid(state.game.grid, gridPos);
  for (const id of ids) {
    if (state.editor != null && !state.editor.allowDeleteBackground) {
      if (state.game.BACKGROUND.includes(id)) {
        continue;
      }
    }
    if (type != null && state.game.entities[id].type !== type) {
      continue;
    }
    dispatch({type: 'DESTROY_ENTITY', id});
  }
};

module.exports = {
  makeEntityUnderMouse,
  makeEntitiesInMarquee,
  deleteEntitiesUnderMouse,
};
