'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/vectors'),
    subtract = _require2.subtract,
    add = _require2.add;

/**
 * Render things into the canvas
 */
var initRenderSystem = function initRenderSystem(store) {

  var time = -1;
  var canvas = null;
  var ctx = null;
  var svg = null;
  store.subscribe(function () {
    var state = store.getState();
    if (state.game == null) return;
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

  // render non-location entities
  for (var id in game.entities) {
    var entity = game.entities[id];
    if (entity.position == null || entity.type == 'LOCATION') {
      continue;
    }
    renderEntity(state, ctx, entity);
  }
  // render locations last so they go on top
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = game.locations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _id = _step.value;

      var _entity = game.entities[_id];
      if (_entity.position == null || _entity.id === -1) {
        // don't render clicked location
        continue;
      }
      renderEntity(state, ctx, _entity);
    }

    // render marquees
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var mouse = game.mouse;

  if (mouse.isLeftDown && game.userMode !== 'MARK') {
    if (game.userMode === 'CREATE_LOCATION') {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.25)';
    } else if (game.userMode === 'SELECT') {
      ctx.fillStyle = 'rgba(10, 100, 10, 0.25)';
    }
    ctx.lineWidth = 2 / (config.canvasWidth / config.width);
    ctx.strokeStyle = 'black';

    var dims = subtract(mouse.curPos, mouse.downPos);
    var x = dims.x > 0 ? mouse.downPos.x : mouse.curPos.x;
    var y = dims.y > 0 ? mouse.downPos.y : mouse.curPos.y;
    ctx.fillRect(x, y, Math.abs(dims.x) + 1, Math.abs(dims.y) + 1);
    ctx.strokeRect(x, y, Math.abs(dims.x) + 1, Math.abs(dims.y) + 1);
  }

  ctx.restore();
};

var renderEntity = function renderEntity(state, ctx, entity) {
  ctx.save();
  // render relative to top left of grid square
  ctx.translate(entity.position.x, entity.position.y);
  switch (entity.type) {
    case 'ANT':
      {
        ctx.fillStyle = 'orange';
        if (!entity.alive) {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        } else if (entity.calories < config.antStartingCalories * config.antStarvationWarningThreshold) {
          ctx.fillStyle = 'rgba(250, 50, 0, 0.9)';
        }
        ctx.beginPath();
        var radius = entity.subType == 'QUEEN' ? entity.width / 2 : 0.8 * entity.width / 2;
        ctx.arc(entity.width / 2, entity.height / 2, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        if (state.game.selectedEntities.includes(entity.id)) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2 / (config.canvasWidth / config.width);
          ctx.stroke();
        }

        if (entity.holding != null) {
          var heldEntity = entity.holding;
          ctx.save();
          ctx.scale(0.45, 0.45);
          ctx.translate(1, 1);
          renderEntity(state, ctx, _extends({}, heldEntity, { position: { x: 0, y: 0 } }));
          ctx.restore();
        }
        break;
      }
    case 'DIRT':
      {
        ctx.fillStyle = 'brown';
        ctx.fillRect(0, 0, entity.width, entity.height);
        ctx.fillStyle = 'rgba(0, 0, 200,' + entity.marked * 0.5 + ')';
        ctx.fillRect(0, 0, entity.width, entity.height);
        break;
      }
    case 'LOCATION':
      {
        ctx.fillStyle = 'rgba(50, 50, 50, 0.2)';
        ctx.fillRect(0, 0, entity.width, entity.height);
        // gotta flip back for location label
        ctx.save();
        ctx.scale(1, -1);
        ctx.fillStyle = 'black';
        ctx.font = '1px Consolas';
        ctx.fillText(entity.name, 0, -1 * entity.height);
        ctx.restore();
        break;
      }
    case 'FOOD':
      {
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, entity.width, entity.height);
        break;
      }
    case 'EGG':
      {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        var _radius = entity.width / 2 * 0.4;
        ctx.arc(entity.width / 2, entity.height / 2, _radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        break;
      }
    case 'LARVA':
      {
        ctx.fillStyle = 'white';
        if (!entity.alive) {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        } else if (entity.calories < config.larvaStartingCalories * config.antStarvationWarningThreshold) {
          ctx.fillStyle = 'rgba(250, 50, 0, 0.9)';
        }
        ctx.beginPath();
        var _radius2 = entity.width / 2 * 0.5 + entity.calories / 10000;
        ctx.arc(entity.width / 2, entity.height / 2, _radius2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        break;
      }
    case 'PUPA':
      {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.fillRect(0, 0, entity.width, entity.height);
        break;
      }
  }
  ctx.restore();
};

module.exports = { initRenderSystem: initRenderSystem };