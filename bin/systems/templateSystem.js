'use strict';

/**
 * This function is a template to quickly create new systems
 */
var initTemplateSystem = function initTemplateSystem(store) {

  var time = -1;
  store.subscribe(function () {
    var state = store.getState();
    if (state.game == null) return;
    // only check on a new tick
    if (state.game.time == time) {
      return;
    }
    time = state.game.time;

    // TODO: dispatch stuff if certain conditions are met
  });
}; // no flow checking cuz it's annoying

module.exports = { initTemplateSystem: initTemplateSystem };