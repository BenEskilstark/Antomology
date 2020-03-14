'use strict';

var initState = function initState() {
  return {
    mode: 'MENU',
    game: null,
    modal: null,
    editor: null,
    levelActions: null
  };
};

module.exports = { initState: initState };