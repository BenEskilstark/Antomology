// a system for starting up the other systems

const {initRenderSystem} = require('./renderSystem');
const {initFoodSpawnSystem} = require('./foodSpawnSystem');
const {initMouseControlsSystem} = require('./mouseControlsSystem');
const {initKeyboardControlsSystem} = require('./keyboardControlsSystem');
const {initGameOverSystem} = require('./gameOverSystem');
const {initTickerSystem} = require('./tickerSyste');

const initSystems = (store: Store): void => {
  let gameMode = store.getState().mode;
  let prevGameState = store.getState().game;
  store.subscribe(() => {
    const nextGameMode = store.getState().mode;
    const game = store.getState().game;
    // game systems
    if (prevGameState == null && game != null && nextGameMode === 'GAME') {
      initRenderSystem(store);
      initMouseControlsSystem(store);
      initKeyboardControlsSystem(store);
      initGameOverSystem(store);
      initTickerSystem(store);
      // initFoodSpawnSystem(store);
      // const audio = document.getElementById('clayMusic1');
      // audio.play();

    // editor systems
    } else if (nextGameMode === 'EDITOR' && prevGameState == null && game != null) {
      initRenderSystem(store);
      initMouseControlsSystem(store);
      initKeyboardControlsSystem(store);
    }

    gameMode = nextGameMode;
    prevGameState = game;
  });
};

module.exports = {initSystems};
