// @flow

import type {State} from '../types';

const initState = (): State => {
  return {
    mode: 'MENU',
    game: null,
    modal: null,
  };
}

module.exports = {initState};
