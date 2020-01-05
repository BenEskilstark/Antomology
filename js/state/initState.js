// @flow

import type {State} from '../types';

const initState = (): State => {
  return {
    game: null,
    modal: null,
  };
}

module.exports = {initState};
