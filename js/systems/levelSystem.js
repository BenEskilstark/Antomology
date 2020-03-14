
const {config} = require('../config');

const initLevelSystem = (store) => {
  let time = -1;
  store.subscribe(() => {
    const state = store.getState();
    if (state.game == null) return;
    if (state.game.hydrated) return;
    if (state.levelActions == null || state.levelActions.length == 0) return;
    const {dispatch} = store;

    dispatch({type: 'HYDRATE_GAME'});
    for (const action of state.levelActions) {
      dispatch(action);
    }
  });
}

module.exports = {initLevelSystem};
