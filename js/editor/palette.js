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
  if (!occupied) {
    const entity = makeEntityByType(state, state.editor.entityType, gridPos);
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
  for (let i = 0; i < Math.abs(dims.x) + 1; i++) {
    for (let j = 0; j < Math.abs(dims.y) + 1; j++) {
      makeEntityUnderMouse(
        state, dispatch, entityType,
        {x: x + i, y: y + j},
      );
    }
  }
};

const deleteEntitiesUnderMouse = (
  state: State,
  dispatch: (Action) => Action,
  gridPos: Vector,
): void => {
  const ids = lookupInGrid(state.game.grid, gridPos);
  for (const id of ids) {
    if (!state.editor.allowDeleteBackground) {
      if (state.game.BACKGROUND.includes(id)) {
        continue;
      }
    }
    dispatch({type: 'DESTROY_ENTITY', id});
  }
};

module.exports = {
  makeEntityUnderMouse,
  makeEntitiesInMarquee,
  deleteEntitiesUnderMouse,
};
