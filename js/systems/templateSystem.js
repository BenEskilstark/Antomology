// no flow checking cuz it's annoying

import type {Store} from '../types';

/**
 * This function is a template to quickly create new systems
 */
const initTemplateSystem = (store: Store): void => {

  let time = store.getState().game.time;
  store.subscribe(() => {
    const state = store.getState();
    // only check on a new tick
    if (state.game.time == time) {
      return;
    }
    time = state.game.time;

    // TODO: dispatch stuff if certain conditions are met
  });
}

module.exports = {initTemplateSystem};
