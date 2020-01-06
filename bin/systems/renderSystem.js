'use strict';

var _require = require('../config'),
    config = _require.config;

/**
 * Render things into the canvas
 */
var initRenderSystem = function initRenderSystem(store) {

  var time = store.getState().game.time;
  var canvas = null;
  var ctx = null;
  var svg = null;
  store.subscribe(function () {
    var state = store.getState();
    // only check on a new tick
    if (state.game.time == time && state.game.tickInterval != null) {
      return;
    }
    // important to track time this way so this only happens once per tick
    time = state.game.time;

    if (!canvas) {
      canvas = document.getElementById('canvas');
      if (!canvas) return; // don't break
      ctx = canvas.getContext('2d');
    }

    // clear
    ctx.fillStyle = 'steelblue';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    render(state, ctx);
  });
};

var render = function render(state, ctx) {
  var game = state.game;

  // scale world to the canvas

  ctx.save();
  // set the origin to the bottom left instead of top right
  ctx.translate(0, config.canvasHeight);
  ctx.scale(1, -1);
  ctx.scale(config.canvasWidth / config.width, config.canvasHeight / config.height);

  for (var id in game.entities) {
    var entity = game.entities[id];
    if (entity.position == null) {
      continue;
    }
    renderEntity(state, ctx, entity);
  }
  for (var _id in game.locations) {}

  ctx.restore();
};

var renderEntity = function renderEntity(state, ctx, entity) {
  ctx.save();
  // render relative to top left of grid square
  ctx.translate(entity.position.x, entity.position.y);
  switch (entity.type) {
    case 'ANT':
      ctx.fillStyle = 'orange';
      if (!entity.alive) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      } else if (entity.calories < config.antStartingCalories * config.antStarvationWarningThreshold) {
        ctx.fillStyle = 'rgba(250, 50, 0, 0.9)';
      }
      ctx.beginPath();
      ctx.arc(entity.width / 2, entity.height / 2, entity.width / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      if (state.game.selectedEntities.includes(entity.id)) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 / (config.canvasWidth / config.width);
        ctx.stroke();
      }

      if (entity.holding != null) {
        var heldEntity = entity.holding;
        switch (heldEntity.type) {
          case 'DIRT':
            ctx.fillStyle = 'brown';
            ctx.fillRect(0, heldEntity.height / 2, heldEntity.width / 2, heldEntity.height / 2);
            break;
        }
      }
      break;
    case 'DIRT':
      ctx.fillStyle = 'brown';
      ctx.fillRect(0, 0, entity.width, entity.height);
      ctx.fillStyle = 'rgba(0, 0, 200,' + entity.marked * 0.5 + ')';
      ctx.fillRect(0, 0, entity.width, entity.height);
      break;
    case 'LOCATION':
      ctx.fillStyle = 'rgba(50, 50, 50, 0.2)';
      ctx.fillRect(0, 0, entity.width, entity.height);
      break;
    case 'FOOD':
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 0, entity.width, entity.height);
      break;
  }
  ctx.restore();
};

module.exports = { initRenderSystem: initRenderSystem };