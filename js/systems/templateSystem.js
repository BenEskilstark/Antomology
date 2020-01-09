// no flow checking cuz it's annoying

import type {Store} from '../types';

/**
 * This function is a template to quickly create new systems
 */
const initTemplateSystem = (store: Store): void => {

  let time = -1
  store.subscribe(() => {
    const state = store.getState();
    if (state.game == null) return;
    // only check on a new tick
    if (state.game.time == time) {
      return;
    }
    time = state.game.time;

    // TODO: dispatch stuff if certain conditions are met
  });
}

module.exports = {initTemplateSystem};
