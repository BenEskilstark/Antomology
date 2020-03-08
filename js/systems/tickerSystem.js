
const {config} = require('../config');

const initTickerSystem = (store) => {
  let time = -1;
  store.subscribe(() => {
    const state = store.getState();
    if (state.game == null) return;
    // only check on a new tick
    if (state.game.time == time) return;
    // important track time this way
    time = state.game.time;
    const {level} = state.game;

    switch (level) {
      case 1:
        level1Ticker(state.game, store.dispatch);
        break;
      case 2:
        level2Ticker(state.game, store.dispatch);
        break;
    }
  });
}

function level1Ticker(game, dispatch) {
  const {time} = game;

  if (time == 5) {
    dispatch({type: 'SET_TICKER', text: 'WELCOME', maxAge: 50});
  }
}


function level2Ticker(game, dispatch) {
  const {time} = game;
}
