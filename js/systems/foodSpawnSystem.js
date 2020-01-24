// no flow checking cuz it's annoying

const {config} = require('../config');
const {makeFood} = require('../entities/food');
const {randomIn} = require('../utils/helpers');
const {
  fastCollidesWith,
  getEntitiesByType,
} = require('../selectors/selectors');

import type {Store} from '../types';

const initFoodSpawnSystem = (store: Store): void => {

  let time = -1;
  store.subscribe(() => {
    const state = store.getState();
    if (state.game == null) return;
    // only check on a new tick
    if (state.game.time == time) {
      return;
    }
    time = state.game.time;

    if (Math.random() < config.foodSpawnRate) {
      let x = randomIn(0, state.game.worldWidth - 1);
      let y = randomIn(0, state.game.worldHeight - 1);
      if (
        fastCollidesWith(state.game, {position: {x, y}, width: 1, height: 1})
          .filter(e => config.antBlockingEntities.includes(e.type))
          .length == 0
      ) {
        const food = makeFood({x, y}, config.foodSpawnCalories, 'Crumb');
        store.dispatch({type: 'CREATE_ENTITY', entity: food});
      }
    }
  });
}

module.exports = {initFoodSpawnSystem};
