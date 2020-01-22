'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/vectors'),
    subtract = _require2.subtract,
    add = _require2.add,
    makeVector = _require2.makeVector;

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

  ////////////////////////////////////////////
  // canvas scaling
  ////////////////////////////////////////////
  // scale world to the canvas

  ctx.save();
  // set the origin to the bottom left instead of top right
  ctx.translate(0, config.canvasHeight);
  ctx.scale(1, -1);
  ctx.scale(config.canvasWidth / config.width, config.canvasHeight / config.height);
  // translate to view port
  ctx.translate(-1 * game.viewPos.x, -1 * game.viewPos.y);
  ////////////////////////////////////////////

  // render non-location entities
  for (var id in game.entities) {
    var entity = game.entities[id];
    if (entity.position == null || entity.type == 'LOCATION' || entity.type === 'ANT') {
      continue;
    }
    renderEntity(state, ctx, entity);
  }
  // then render ants
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = game.ANT[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _id = _step.value;

      var _entity = game.entities[_id];
      if (_entity.position == null) {
        continue;
      }
      renderEntity(state, ctx, _entity);
    }
    // render locations last so they go on top
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = game.LOCATION[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _id2 = _step2.value;

      var _entity2 = game.entities[_id2];
      if (_entity2.position == null || _entity2.id === -1) {
        // don't render clicked location
        continue;
      }
      renderEntity(state, ctx, _entity2);
    }

    // render marquees
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var mouse = game.mouse;

  if (mouse.isLeftDown && (game.userMode === 'SELECT' || game.userMode === 'CREATE_LOCATION')) {
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

  // render cursor
  // TODO
};

var renderEntity = function renderEntity(state, ctx, entity) {
  ctx.save();
  // render relative to top left of grid square, but first translate for rotation
  // around the center
  ctx.translate(entity.position.x + entity.width / 2, entity.position.y + entity.height / 2);
  ctx.rotate(entity.theta);
  ctx.translate(-entity.width / 2, -entity.height / 2);
  switch (entity.type) {
    case 'ANT':
      {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        if (!entity.alive) {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
          ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        } else if (entity.calories < config.antStartingCalories * config.antStarvationWarningThreshold) {
          ctx.fillStyle = 'rgba(250, 50, 0, 0.9)';
        }
        ctx.lineWidth = 1 / (config.canvasWidth / config.width);
        if (state.game.selectedEntities.includes(entity.id)) {
          ctx.strokeStyle = '#FF6347';
          ctx.fillStyle = '#FF6347';
        }
        // body
        var radius = entity.subType == 'QUEEN' ? entity.width / 2 : 0.8 * entity.width / 2;
        radius = radius / 2;
        ctx.arc(entity.width / 2 + 2 * radius, entity.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.arc(entity.width / 2, entity.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.arc(entity.width / 2 - 2 * radius, entity.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        // legs
        ctx.translate(entity.width / 2, entity.height / 2);
        for (var deg = 60; deg <= 120; deg += 30) {
          var rad = deg * Math.PI / 180;
          var leg1 = makeVector(rad, entity.width * 0.7);
          var leg2 = makeVector(-rad, entity.width * 0.7);
          ctx.moveTo(0, 0);
          ctx.lineTo(leg1.x, leg1.y);
          ctx.stroke();
          ctx.moveTo(0, 0);
          ctx.lineTo(leg2.x, leg2.y);
          ctx.stroke();
        }
        ctx.translate(-entity.width / 2, -entity.height / 2);

        if (entity.holding != null) {
          var heldEntity = entity.holding;
          ctx.save();
          ctx.scale(0.45, 0.45);
          ctx.translate(0.5, 1);
          renderEntity(state, ctx, _extends({}, heldEntity, { position: { x: 0, y: 0 } }));
          ctx.restore();
        }
        ctx.closePath();
        break;
      }
    case 'DIRT':
      {
        ctx.fillStyle = '#8B4513';
        var width = entity.width + 0.04;
        var height = entity.height + 0.04;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0, 0, 200,' + entity.marked * 0.5 + ')';
        ctx.fillRect(0, 0, width, height);
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
        var sizeFactor = entity.calories / config.foodSpawnCalories;
        ctx.fillRect(0, 0, entity.width * sizeFactor, entity.height * sizeFactor);
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
        if (state.game.selectedEntities.includes(entity.id)) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2 / (config.canvasWidth / config.width);
          ctx.stroke();
        }
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
        if (state.game.selectedEntities.includes(entity.id)) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2 / (config.canvasWidth / config.width);
          ctx.stroke();
        }
        break;
      }
    case 'PUPA':
      {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.fillRect(0, 0, entity.width, entity.height);
        if (state.game.selectedEntities.includes(entity.id)) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2 / (config.canvasWidth / config.width);
          ctx.strokeRect(0, 0, entity.width, entity.height);
        }
        break;
      }
    case 'PHEROMONE':
      {
        ctx.save();
        var alpha = 0.75 * (entity.quantity / config.pheromoneMaxQuantity) + 0.25;
        ctx.fillStyle = "rgba(0, 200, 0, " + alpha + ")";
        // relative to center
        ctx.translate(entity.width / 2, entity.height / 2);
        var _radius3 = entity.width / 2;
        ctx.beginPath();
        ctx.moveTo(_radius3, 0);
        ctx.lineTo(_radius3 / 3, -2 * _radius3 / 3);
        ctx.lineTo(_radius3 / 3, -1 * _radius3 / 3);
        ctx.lineTo(-1 * _radius3, -1 * _radius3 / 3);
        ctx.lineTo(-1 * _radius3, _radius3 / 3);
        ctx.lineTo(_radius3 / 3, _radius3 / 3);
        ctx.lineTo(_radius3 / 3, 2 * _radius3 / 3);
        ctx.closePath();
        ctx.fill();
        // shift back
        ctx.translate(-entity.width / 2, -entity.height / 2);
        ctx.restore();
        break;
      }
  }
  ctx.restore();
};

module.exports = { initRenderSystem: initRenderSystem };