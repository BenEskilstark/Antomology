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
      let y = randomIn(state.game.worldHeight - 10, state.game.worldHeight - 1);
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const food = makeFood(
            {x: x + i, y: y - j}, config.foodSpawnCalories, 'Crumb'
          );
          store.dispatch({type: 'CREATE_ENTITY', entity: food});
        }
      }
    }
  });
}

module.exports = {initFoodSpawnSystem};
