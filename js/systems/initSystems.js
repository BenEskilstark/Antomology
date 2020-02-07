// a system for starting up the other systems

const {initRenderSystem} = require('./renderSystem');
const {initFoodSpawnSystem} = require('./foodSpawnSystem');
const {initMouseControlsSystem} = require('./mouseControlsSystem');

const initSystems = (store: Store): void => {
  initRenderSystem(store);
  initMouseControlsSystem(store);
  initFoodSpawnSystem(store);
  // const audio = document.getElementById('clayMusic1');
  // audio.play();
};

module.exports = {initSystems};
