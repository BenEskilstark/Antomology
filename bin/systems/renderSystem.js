'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/vectors'),
    subtract = _require2.subtract,
    add = _require2.add,
    makeVector = _require2.makeVector,
    vectorTheta = _require2.vectorTheta;

var _require3 = require('../selectors/selectors'),
    onScreen = _require3.onScreen;

var _require4 = require('../utils/stateHelpers'),
    lookupInGrid = _require4.lookupInGrid;

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
      // ctx.imageSmoothingEnabled = false;
    }

    // clear
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    render(state, ctx);

    // render ticker
    if (state.game.ticker.text != '') {
      var _state$game$ticker = state.game.ticker,
          text = _state$game$ticker.text,
          curAge = _state$game$ticker.curAge,
          maxAge = _state$game$ticker.maxAge;

      ctx.save();
      var alpha = Math.min(1, curAge / 40);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
      ctx.font = '50px Consolas';
      ctx.fillText(text, 500, 100);
      ctx.restore();
    }
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
  // translate to viewPos
  ctx.translate(-1 * game.viewPos.x, -1 * game.viewPos.y);
  if (state.editor != null) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, game.worldWidth, game.worldHeight);
  }
  ////////////////////////////////////////////

  // sky first
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = game.BACKGROUND[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _id = _step.value;

      var _entity = game.entities[_id];
      if (!_entity.position) {
        console.log("entity with no position:", _entity);
      }
      if (!onScreen(game, _entity.position)) continue;

      renderEntity(state, ctx, _entity);
    }

    // then grass
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
    for (var _iterator2 = game.GRASS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _id2 = _step2.value;

      var _entity2 = game.entities[_id2];
      if (!_entity2.position) {
        console.log("entity with no position:", _entity2);
      }
      if (!onScreen(game, _entity2.position)) continue;

      renderEntity(state, ctx, _entity2);
    }

    // render non-location, non-ant entities
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

  for (var id in game.entities) {
    var entity = game.entities[id];
    if (entity.position == null) continue;
    if (entity.type == 'BACKGROUND') continue;
    if (entity.type == 'GRASS') continue;
    if (entity.type == 'LOCATION' || entity.type === 'ANT') continue;
    if (!onScreen(game, entity.position)) continue;
    var toRender = entity;
    if (!entity.visible && entity.lastSeenPos != null) {
      toRender = _extends({}, entity, { position: entity.lastSeenPos });
    }

    renderEntity(state, ctx, toRender);
  }
  // then render ants
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = game.ANT[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _id3 = _step3.value;

      var _entity3 = game.entities[_id3];
      if (_entity3.position == null) continue;
      if (!onScreen(game, _entity3.position)) continue;

      renderEntity(state, ctx, _entity3);
    }
    // render locations last so they go on top
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = game.LOCATION[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _id4 = _step4.value;

      var _entity4 = game.entities[_id4];
      if (_entity4.position == null) continue;
      if (_entity4.id === -1) continue; // don't render clicked location
      if (!onScreen(game, _entity4.position)) continue;

      renderEntity(state, ctx, _entity4);
    }

    // render marquees
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var mouse = game.mouse;

  if (mouse.isLeftDown && (state.editor == null && (game.userMode === 'SELECT' || game.userMode === 'CREATE_LOCATION') || state.editor != null && (state.editor.editorMode === 'MARQUEE_ENTITY' || state.editor.editorMode === 'CREATE_LOCATION'))) {
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

  // render cursor
  // TODO

  ctx.restore();
};

// NOTE when rendering underneath FoW, use inFog = true to not render infinitely
var renderEntity = function renderEntity(state, ctx, entity, inFog) {
  var game = state.game;

  var px = config.width / config.canvasWidth;
  ctx.save();
  if (!inFog) {
    // render relative to top left of grid square, but first translate for rotation
    // around the center
    ctx.translate(entity.position.x + entity.width / 2, entity.position.y + entity.height / 2);
    ctx.rotate(entity.theta);
    ctx.translate(-entity.width / 2, -entity.height / 2);
    ctx.lineWidth = px;
  }

  // handle fog
  if (!entity.visible && !inFog && state.game.fog) {
    var width = entity.width + 0.04;
    var height = entity.height + 0.04;
    if (entity.lastSeenPos == null || config.bugs.includes(entity.type)) {
      var aboveSeenBefore = lookupInGrid(game.grid, entity.position).map(function (i) {
        return game.entities[i];
      }).filter(function (e) {
        return config.entitiesInFog.includes(e.type);
      }).filter(function (e) {
        return !e.visible && e.lastSeenPos != null;
      }).length > 0;
      if (!aboveSeenBefore) {
        ctx.fillStyle = '#101010';
      } else {
        ctx.restore();
        return; // don't render unseen entities above unseen, seen-before entities
      }
    } else {
      renderEntity(state, ctx, entity, true);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  switch (entity.type) {
    case 'ANT':
      {
        ctx.fillStyle = '#0000CD';
        ctx.strokeStyle = '#0000CD';
        ctx.beginPath();
        if (!entity.alive) {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
          ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        } else if (entity.calories < config.antMaxCalories * config.antStarvationWarningThreshold) {
          ctx.fillStyle = 'rgba(250, 50, 0, 0.9)';
        }
        ctx.lineWidth = px;
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

        if (entity.holding != null && entity.holding.toLift == 1) {
          var heldEntity = entity.holding;
          ctx.save();
          ctx.scale(0.45, 0.45);
          ctx.translate(0.5, 1);
          renderEntity(state, ctx, _extends({}, heldEntity, { position: { x: 0, y: 0 } }));
          ctx.restore();
        }
        ctx.closePath();

        if (entity.hp > 0 && entity.hp < config.antStartingHP || entity.hp <= 0 && game.selectedEntities.includes(entity.id)) {
          renderHealthBar(state, ctx, entity, config.antStartingHP);
        }

        break;
      }
    case 'APHID':
      {
        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'green';
        if (!entity.alive) {
          ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        }
        ctx.lineWidth = px;
        // body
        var _radius = entity.width / 2 * 0.8;
        ctx.translate(entity.width / 2, entity.height / 2);
        ctx.beginPath();
        ctx.arc(0, 0, _radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.fill();
        // eye
        ctx.beginPath();
        ctx.fillStyle = 'black';
        var mult = entity.theta == 0 ? 1 : -1;
        ctx.arc(-1 * _radius / 2, mult * _radius * 0.7, _radius / 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'green';
        ctx.closePath();

        // legs
        ctx.beginPath();
        for (var _deg = 60; _deg <= 120; _deg += 30) {
          var _rad = _deg * Math.PI / 180;
          var _leg = makeVector(-_rad, entity.width / 2);
          ctx.moveTo(0, 0);
          ctx.lineTo(_leg.x, _leg.y * mult);
          ctx.stroke();
        }
        ctx.translate(-entity.width / 2, -entity.height / 2);
        ctx.closePath();

        if (entity.hp < config.aphidStartingHP) {
          renderHealthBar(state, ctx, entity, config.aphidStartingHP);
        }

        break;
      }
    case 'BEETLE':
      {
        ctx.fillStyle = 'purple';
        ctx.strokeStyle = 'purple';
        if (!entity.alive) {
          ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        }
        ctx.lineWidth = px;
        ctx.save();
        if (entity.theta < Math.PI / 2) {
          ctx.translate(entity.width / 2, 0);
          ctx.scale(-1, 1);
          ctx.translate(-entity.width / 2, 0);
        }
        var y = 0.8;
        // body
        var _radius2 = entity.height / 2;
        ctx.beginPath();
        ctx.arc(1, y, _radius2, 0, Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // head
        ctx.beginPath();
        ctx.arc(2, y, _radius2 / 3, 0, 2 * Math.PI);
        ctx.lineTo(2, y);
        ctx.closePath();
        ctx.fill();
        // eye
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(2, y, _radius2 / 3, 0, Math.PI / 2);
        ctx.lineTo(2, y);
        ctx.closePath();
        ctx.fill();

        // legs
        ctx.beginPath();
        ctx.fillStyle = 'purple';
        ctx.moveTo(1, 1);
        ctx.lineTo(0.66, 0);
        ctx.moveTo(1.33, 1);
        ctx.lineTo(1, 0);
        ctx.moveTo(1.5, 1);
        ctx.lineTo(1.75, 0);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        if (entity.hp < config.beetleStartingHP) {
          renderHealthBar(state, ctx, entity, config.beetleStartingHP);
        }

        break;
      }
    case 'WORM':
      {
        ctx.fillStyle = 'pink';
        // head
        var nextSegment = entity.segments[0];
        var headDir = vectorTheta(subtract(entity.position, nextSegment.position));
        ctx.save();
        ctx.translate(0.5, 0.5);
        ctx.rotate(headDir - Math.PI / 2);
        ctx.translate(-0.5, -0.5);
        ctx.fillRect(0, 0, 1, 0.5);
        ctx.beginPath();
        ctx.arc(0.5, 0.5, 0.5, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // body
        for (var i = 0; i < entity.segments.length - 1; i++) {
          var segment = entity.segments[i];
          var _relPos = subtract(segment.position, entity.position);
          ctx.fillRect(_relPos.x, _relPos.y, 1, 1);
        }
        // tail
        var tail = entity.segments[entity.segments.length - 1];
        var relPos = subtract(tail.position, entity.position);
        var prevTail = entity.segments[entity.segments.length - 2];
        var tailDir = vectorTheta(subtract(tail.position, prevTail.position));
        ctx.save();
        ctx.translate(relPos.x + 0.5, relPos.y + 0.5);
        ctx.rotate(tailDir - Math.PI / 2);
        ctx.translate(-1 * (relPos.x + 0.5), -1 * (relPos.y + 0.5));
        ctx.fillRect(relPos.x, relPos.y, 1, 0.5);
        ctx.beginPath();
        ctx.arc(relPos.x + 0.5, relPos.y + 0.5, 0.5, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (entity.hp < config.wormStartingHP) {
          renderHealthBar(state, ctx, entity, config.wormStartingHP);
        }
        break;
      }
    case 'CENTIPEDE':
      {
        // ctx.fillStyle = '#FAEBD7'; // off-white
        ctx.fillStyle = '#FF8C00'; // dark orange
        ctx.lineWidth = px;
        // head
        var _nextSegment = entity.segments[0];
        var _headDir = vectorTheta(subtract(entity.position, _nextSegment.position));
        ctx.save();
        ctx.translate(0.5, 0.5);
        ctx.rotate(_headDir - Math.PI / 2);
        ctx.translate(-0.5, -0.5);
        ctx.fillRect(0, 0, 1, 0.5);
        ctx.beginPath();
        // ctx.strokeStyle = '#FAEBD7'; // off-white
        ctx.strokeStyle = '#FF8C00'; // dark orange
        ctx.arc(0.5, 0.5, 0.5, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // body
        for (var _i = 0; _i < entity.segments.length - 1; _i++) {
          var nextSegmentPos = _i == 0 ? entity.position : entity.segments[_i - 1].position;
          var _segment = entity.segments[_i];
          var _relPos3 = subtract(_segment.position, entity.position);
          // legs
          var dir = vectorTheta(subtract(nextSegmentPos, _relPos3));
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = 'black';
          ctx.translate(_relPos3.x + 0.5, _relPos3.y + 0.5);
          ctx.rotate(dir);
          ctx.moveTo(0, 0);
          for (var j = 0; j < 2; j++) {
            var _leg2 = makeVector(Math.PI / 2 + Math.random() * 0.7, 1);
            ctx.lineTo(_leg2.x, _leg2.y);
            ctx.moveTo(0, 0);
            var _leg3 = makeVector(Math.PI / 2 + Math.random() * 0.7, 1);
            ctx.lineTo(_leg2.x, -1 * _leg2.y);
            ctx.stroke();
          }
          ctx.closePath();
          ctx.restore();

          ctx.fillRect(_relPos3.x, _relPos3.y, 1, 1);
        }
        // ctx.strokeStyle = '#FAEBD7'; // off-white
        ctx.strokeStyle = '#FF8C00'; // dark orange
        // tail
        var _tail = entity.segments[entity.segments.length - 1];
        var _relPos2 = subtract(_tail.position, entity.position);
        var _prevTail = entity.segments[entity.segments.length - 2];
        var _tailDir = vectorTheta(subtract(_tail.position, _prevTail.position));
        ctx.save();
        ctx.translate(_relPos2.x + 0.5, _relPos2.y + 0.5);
        ctx.rotate(_tailDir - Math.PI / 2);
        ctx.translate(-1 * (_relPos2.x + 0.5), -1 * (_relPos2.y + 0.5));
        ctx.fillRect(_relPos2.x, _relPos2.y, 1, 0.5);
        ctx.beginPath();
        ctx.arc(_relPos2.x + 0.5, _relPos2.y + 0.5, 0.5, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        if (entity.hp < config.centipedeStartingHP) {
          renderHealthBar(state, ctx, entity, config.centipedeStartingHP);
        }
        break;
      }
    case 'DRAGONFLY':
      {
        ctx.fillStyle = "#00008B";
        ctx.lineWidth = px;
        // head
        ctx.beginPath();
        ctx.arc(0.5, 0.5, 0.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.arc(0.4, 0.4, 0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        // body
        ctx.fillStyle = "#00008B";
        ctx.fillRect(0.75, 0.1, entity.width - 1, 0.8);
        // tail
        ctx.beginPath();
        ctx.arc(entity.width - 0.5, 0.5, 0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        // wings
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(2, 0.9);
        ctx.quadraticCurveTo(0.7, 2, 1.5, 6);
        ctx.quadraticCurveTo(2.3, 2, 2, 0.9);
        ctx.quadraticCurveTo(0.7, 2, 2.5, 6);
        ctx.quadraticCurveTo(2.3, 2, 2, 0.9);

        ctx.moveTo(2, 0.1);
        ctx.quadraticCurveTo(0.7, -2, 1.5, -5);
        ctx.quadraticCurveTo(2.3, -2, 2, 0.1);
        ctx.quadraticCurveTo(0.7, -2, 2.5, -5);
        ctx.quadraticCurveTo(2.3, -2, 2, 0.1);
        ctx.closePath();
        ctx.stroke();

        break;
      }
    case 'BACKGROUND':
      {
        var _width = entity.width + px / 2;
        var _height = entity.height + px / 2;
        if (entity.subType === 'SKY') {
          ctx.fillStyle = 'steelblue';
        } else if (entity.subType === 'DIRT') {
          ctx.fillStyle = '#CD853F';
        }
        ctx.fillRect(0, 0, _width, _height);
        break;
      }
    case 'STONE':
      {
        ctx.fillStyle = '#555555';
        var _width2 = entity.width + px / 2;
        var _height2 = entity.height + px / 2;
        ctx.fillRect(0, 0, _width2, _height2);
        break;
      }
    case 'STUCK_STONE':
      {
        ctx.fillStyle = '#444444';
        var _width3 = entity.width + px / 2;
        var _height3 = entity.height + px / 2;
        ctx.fillRect(0, 0, _width3, _height3);
        break;
      }
    case 'DIRT':
      {
        ctx.fillStyle = '#8B4513';
        var _width4 = entity.width + px / 2;
        var _height4 = entity.height + px / 2;
        ctx.fillRect(0, 0, _width4, _height4);
        break;
      }
    case 'OBELISK':
      {
        ctx.fillStyle = 'black';
        var _width5 = entity.width;
        var _height5 = entity.height;
        if (state.game.selectedEntities.includes(entity.id)) {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2 / (config.canvasWidth / config.width);
          ctx.strokeRect(0, 0, _width5, _height5);
        }
        ctx.fillRect(0, 0, _width5, _height5);
        if (entity.heldBy.length > 0) {
          var numerator = entity.heldBy.length;
          var denominator = entity.toLift;
          ctx.save();
          ctx.scale(1, -1);
          ctx.fillStyle = 'red';
          ctx.font = '1px Consolas';
          ctx.fillText(numerator + '/' + denominator, entity.width * 0.25, -1 * entity.height / 2);
          ctx.restore();
        }
        break;
      }
    case 'TARGET':
      {
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.lineWidth = 3 * px;
        var _radius3 = entity.width / 2;
        ctx.beginPath();
        ctx.arc(entity.width / 2, entity.height / 2, _radius3, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(entity.width / 2, entity.height / 2, _radius3 * 2 / 3, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(entity.width / 2, entity.height / 2, _radius3 * 1 / 3, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        break;
      }
    case 'GRASS':
      {
        ctx.fillStyle = '#8fbc8f';
        ctx.fillRect(0, 0, entity.width, entity.height);
        break;
      }
    case 'LOCATION':
      {
        ctx.fillStyle = 'rgba(50, 50, 50, 0.15)';
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.15)';
        if (state.game.selectedEntities.includes(entity.id)) {
          ctx.strokeStyle = '#FF6347';
        }
        ctx.fillRect(0, 0, entity.width, entity.height);
        // ctx.strokeRect(0, 0, entity.width, entity.height);
        ctx.fillRect(1, 1, entity.width - 2, entity.height - 2);
        ctx.strokeRect(1, 1, entity.width - 2, entity.height - 2);
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
        var sizeFactor = 0.5 * entity.calories / config.foodSpawnCalories + 0.5;
        ctx.fillRect(0, 0, entity.width * sizeFactor, entity.height * sizeFactor);
        break;
      }
    case 'EGG':
      {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        var _radius4 = entity.width / 2 * 0.4;
        ctx.arc(entity.width / 2, entity.height / 2, _radius4, 0, Math.PI * 2);
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
        var _radius5 = entity.width / 2 * 0.5 + entity.calories / 10000;
        ctx.arc(entity.width / 2, entity.height / 2, _radius5, 0, Math.PI * 2);
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
        if (entity.category === 1) {
          ctx.fillStyle = "rgba(0, 200, 0, " + alpha + ")";
          ctx.strokeStyle = "rgba(0, 200, 0, " + alpha + ")";
        } else if (entity.category === 2) {
          ctx.fillStyle = "rgba(0, 0, 200, " + alpha + ")";
          ctx.strokeStyle = "rgba(0, 0, 200, " + alpha + ")";
        } else if (entity.category === 3) {
          ctx.fillStyle = "rgba(200, 0, 0, " + alpha + ")";
          ctx.strokeStyle = "rgba(200, 0, 0, " + alpha + ")";
        }
        // if (state.game.selectedEntities.includes(entity.id)) {
        //  ctx.strokeStyle = '#FF6347';
        // }
        // relative to center
        ctx.translate(entity.width / 2, entity.height / 2);
        var _radius6 = entity.width / 2;
        ctx.beginPath();
        ctx.moveTo(_radius6, 0);
        ctx.lineTo(_radius6 / 3, -2 * _radius6 / 3);
        ctx.lineTo(_radius6 / 3, -1 * _radius6 / 3);
        ctx.lineTo(-1 * _radius6, -1 * _radius6 / 3);
        ctx.lineTo(-1 * _radius6, _radius6 / 3);
        ctx.lineTo(_radius6 / 3, _radius6 / 3);
        ctx.lineTo(_radius6 / 3, 2 * _radius6 / 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // shift back
        ctx.translate(-entity.width / 2, -entity.height / 2);
        ctx.restore();
        break;
      }
  }
  ctx.restore();
};

function renderHealthBar(state, ctx, entity, maxHealth) {
  ctx.save();
  // always render healthbar above entity no matter its theta
  ctx.translate(entity.width / 2, entity.height / 2);
  ctx.rotate(-entity.theta);
  ctx.translate(-entity.width / 2, -entity.height / 2);

  var barWidth = 2;
  var barHeight = 0.33;
  ctx.fillStyle = 'red';
  ctx.fillRect(-0.5, 1.33, barWidth, barHeight);

  ctx.fillStyle = 'green';
  var healthWidth = Math.max(entity.hp / maxHealth * barWidth, 0);
  ctx.fillRect(-0.5, 1.33, healthWidth, barHeight);

  ctx.strokeStyle = 'black';
  ctx.strokeRect(-0.5, 1.33, barWidth, barHeight);

  ctx.restore();
}

module.exports = { initRenderSystem: initRenderSystem };