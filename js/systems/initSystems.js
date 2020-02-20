// a system for starting up the other systems

const {initRenderSystem} = require('./renderSystem');
const {initFoodSpawnSystem} = require('./foodSpawnSystem');
const {initMouseControlsSystem} = require('./mouseControlsSystem');
const {initKeyboardControlsSystem} = require('./keyboardControlsSystem');

const initSystems = (store: Store): void => {
  let gameMode = store.getState().mode;
  store.subscribe(() => {
    const nextGameMode = store.getState().mode;
    // game systems
    if (gameMode === 'MENU' && nextGameMode === 'GAME') {
      initRenderSystem(store);
      initMouseControlsSystem(store);
      initKeyboardControlsSystem(store);
      // initFoodSpawnSystem(store);
      // const audio = document.getElementById('clayMusic1');
      // audio.play();

    // editor systems
    } else if (gameMode === 'MENU' && nextGameMode === 'EDITOR') {
      initRenderSystem(store);
      initMouseControlsSystem(store);
      initKeyboardControlsSystem(store);
    }

    gameMode = nextGameMode;
  });
};

module.exports = {initSystems};
