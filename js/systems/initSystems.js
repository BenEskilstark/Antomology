// a system for starting up the other systems

const {initRenderSystem} = require('./renderSystem');
const {initMouseControlsSystem} = require('./mouseControlsSystem');

let started = false; // TODO there's a better way to handle this...
const initSystems = (store: Store): void => {
  store.subscribe(() => {
    const state = store.getState();
    if (started || !state.game) {
      return;
    }
    started = true;

    initRenderSystem(store);
    initMouseControlsSystem(store);
  });
};

module.exports = {initSystems};
