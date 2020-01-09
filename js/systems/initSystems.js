// a system for starting up the other systems

const {initRenderSystem} = require('./renderSystem');
const {initFoodSpawnSystem} = require('./foodSpawnSystem');
const {initMouseControlsSystem} = require('./mouseControlsSystem');

const initSystems = (store: Store): void => {
  initRenderSystem(store);
  initMouseControlsSystem(store);
  initFoodSpawnSystem(store);
};

module.exports = {initSystems};
