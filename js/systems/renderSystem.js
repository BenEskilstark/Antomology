const {config} = require('../config');
const {subtract, add, makeVector} = require('../utils/vectors');
const {onScreen} = require('../selectors/selectors');
const {lookupInGrid} = require('../utils/stateHelpers');

import type {Store, Game} from '../types';

/**
 * Render things into the canvas
 */
const initRenderSystem = (store: Store): void => {

  let time = -1;
  let canvas = null;
  let ctx = null;
  let svg = null;
  store.subscribe(() => {
    const state = store.getState();
    if (state.game == null) return
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
  });
}


const render = (state: State, ctx: any): void => {
  const {game} = state;

  ////////////////////////////////////////////
  // canvas scaling
  ////////////////////////////////////////////
  // scale world to the canvas
  ctx.save();
  // set the origin to the bottom left instead of top right
  ctx.translate(0, config.canvasHeight);
  ctx.scale(1, -1);
  ctx.scale(
    config.canvasWidth / config.width,
    config.canvasHeight / config.height,
  );
  // translate to viewPos
  ctx.translate(-1 * game.viewPos.x, -1 * game.viewPos.y);
  ////////////////////////////////////////////

  // sky first
  for (const id of game.BACKGROUND) {
    const entity = game.entities[id];
    if (!onScreen(game, entity.position)) continue;

    renderEntity(state, ctx, entity);
  }

  // render non-location, non-ant entities
  for (const id in game.entities) {
    const entity = game.entities[id];
    if (entity.position == null) continue;
    if (entity.type == 'BACKGROUND') continue;
    if (entity.type == 'LOCATION' || entity.type === 'ANT') continue;
    if (!onScreen(game, entity.position)) continue;
    let toRender = entity;
    if (!entity.visible && entity.lastSeenPos != null) {
      toRender = {...entity, position: entity.lastSeenPos};
    }

    renderEntity(state, ctx, toRender);
  }
  // then render ants
  for (const id of game.ANT) {
    const entity = game.entities[id];
    if (entity.position == null) continue;
    if (!onScreen(game, entity.position)) continue;

    renderEntity(state, ctx, entity);
  }
  // render locations last so they go on top
  for (const id of game.LOCATION) {
    const entity = game.entities[id];
    if (entity.position == null) continue;
    if (entity.id === -1) continue; // don't render clicked location
    if (!onScreen(game, entity.position)) continue;

    renderEntity(state, ctx, entity);
  }

  // render marquees
  const {mouse} = game;
  if (
    mouse.isLeftDown &&
    (game.userMode === 'SELECT' || game.userMode === 'CREATE_LOCATION')
  ) {
    if (game.userMode === 'CREATE_LOCATION') {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.25)';
    } else if (game.userMode === 'SELECT') {
      ctx.fillStyle = 'rgba(10, 100, 10, 0.25)';
    }
    ctx.lineWidth = 2 / (config.canvasWidth / config.width);
    ctx.strokeStyle = 'black';

    const dims = subtract(mouse.curPos, mouse.downPos);
    const x = dims.x > 0 ? mouse.downPos.x : mouse.curPos.x;
    const y = dims.y > 0 ? mouse.downPos.y : mouse.curPos.y;
    ctx.fillRect(x, y, Math.abs(dims.x) + 1, Math.abs(dims.y) + 1);
    ctx.strokeRect(x, y, Math.abs(dims.x) + 1, Math.abs(dims.y) + 1);
  }

  ctx.restore();

  // render cursor
  // TODO
}

// NOTE when rendering underneath FoW, use noRecursion = true to not render infinitely
const renderEntity = (
  state: State, ctx: any, entity: Entity, noRecursion: boolean,
): void => {
  const {game} = state;
  const px = config.width / config.canvasWidth;
  ctx.save();
  // render relative to top left of grid square, but first translate for rotation
  // around the center
  ctx.translate(
    entity.position.x + entity.width / 2,
    entity.position.y + entity.height / 2,
  );
  ctx.rotate(entity.theta);
  ctx.translate(-entity.width / 2, -entity.height / 2);
  ctx.lineWidth = px;

  // handle fog
  if (!entity.visible && !noRecursion) {
    const width = entity.width + 0.04;
    const height = entity.height + 0.04;
    if (entity.lastSeenPos == null) {
      const aboveSeenBefore = lookupInGrid(game.grid, entity.position)
        .map(i => game.entities[i])
        .filter(e => config.entitiesInFog.includes(e.type))
        .filter(e => !e.visible && e.lastSeenPos != null)
        .length > 0;
      if (!aboveSeenBefore) {
        ctx.fillStyle = '#101010';
      } else {
        ctx.restore();
        return; // don't render unseen entities above unseen, seen-before entities
      }
    } else {
      renderEntity(state, ctx, {...entity, position: {x: 0, y: 0}}, true);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  switch (entity.type) {
    case 'ANT': {
      ctx.fillStyle = '#0000CD';
      ctx.strokeStyle = '#0000CD';
      ctx.beginPath();
      if (!entity.alive) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
      } else if (
        entity.calories <
        config.antStartingCalories * config.antStarvationWarningThreshold
      ) {
        ctx.fillStyle = 'rgba(250, 50, 0, 0.9)';
      }
      ctx.lineWidth = px;
      if (state.game.selectedEntities.includes(entity.id)) {
        ctx.strokeStyle = '#FF6347';
        ctx.fillStyle = '#FF6347';
      }
      // body
      let radius = entity.subType == 'QUEEN' ? entity.width / 2 : 0.8 * entity.width / 2;
      radius = radius/2;
      ctx.arc(entity.width / 2 + 2 * radius, entity.height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.arc(entity.width / 2, entity.height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.arc(entity.width / 2 - 2 * radius, entity.height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // legs
      ctx.translate(entity.width / 2, entity.height / 2);
      for (let deg = 60; deg <= 120; deg += 30) {
        const rad = deg * Math.PI / 180;
        const leg1 = makeVector(rad, entity.width*0.7);
        const leg2 = makeVector(-rad, entity.width*0.7);
        ctx.moveTo(0, 0);
        ctx.lineTo(leg1.x, leg1.y);
        ctx.stroke();
        ctx.moveTo(0, 0);
        ctx.lineTo(leg2.x, leg2.y);
        ctx.stroke();
      }
      ctx.translate(-entity.width / 2, -entity.height / 2);


      if (entity.holding != null && entity.holding.toLift == 1) {
        const heldEntity = entity.holding;
        ctx.save();
        ctx.scale(0.45, 0.45);
        ctx.translate(0.5, 1);
        renderEntity(state, ctx, {...heldEntity, position: {x: 0, y: 0}});
        ctx.restore();
      }
      ctx.closePath();
      break;
    }
    case 'BACKGROUND': {
      const width = entity.width + px/2;
      const height = entity.height + px/2;
      if (entity.subType === 'SKY') {
        ctx.fillStyle = 'steelblue';
      } else if (entity.subType === 'DIRT') {
        ctx.fillStyle = '#CD853F';
      }
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'STONE': {
      ctx.fillStyle = '#555555';
      const width = entity.width + px/2;
      const height = entity.height + px/2;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'DIRT': {
      ctx.fillStyle = '#8B4513';
      const width = entity.width + px/2;
      const height = entity.height + px/2;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'OBELISK': {
      ctx.fillStyle = 'black';
      const width = entity.width;
      const height = entity.height;
      if (state.game.selectedEntities.includes(entity.id)) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 / (config.canvasWidth / config.width);
        ctx.strokeRect(0, 0, width, height);
      }
      ctx.fillRect(0, 0, width, height);
      if (entity.heldBy.length > 0) {
        const numerator = entity.heldBy.length;
        const denominator = entity.toLift;
        ctx.save();
        ctx.scale(1, -1);
        ctx.fillStyle = 'red';
        ctx.font = '1px Consolas';
        ctx.fillText(
          numerator + '/' + denominator,
          entity.width * 0.25,
          -1 * entity.height / 2,
        );
        ctx.restore();
      }
      break;
    }
    case 'LOCATION': {
      ctx.fillStyle = 'rgba(50, 50, 50, 0.2)';
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.2)';
      if (state.game.selectedEntities.includes(entity.id)) {
        ctx.strokeStyle = '#FF6347';
      }
      ctx.fillRect(0, 0, entity.width, entity.height);
      ctx.strokeRect(0, 0, entity.width, entity.height);
      // gotta flip back for location label
      ctx.save();
      ctx.scale(1, -1);
      ctx.fillStyle = 'black';
      ctx.font = '1px Consolas';
      ctx.fillText(entity.name, 0, -1 * entity.height);
      ctx.restore();
      break;
    }
    case 'FOOD': {
      ctx.fillStyle = 'green';
      const sizeFactor = 0.5 * entity.calories / config.foodSpawnCalories + 0.5;
      ctx.fillRect(0, 0, entity.width * sizeFactor, entity.height * sizeFactor);
      break;
    }
    case 'EGG': {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      const radius = entity.width / 2 * 0.4;
      ctx.arc(entity.width / 2, entity.height / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      if (state.game.selectedEntities.includes(entity.id)) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 / (config.canvasWidth / config.width);
        ctx.stroke();
      }
      break;
    }
    case 'LARVA': {
      ctx.fillStyle = 'white';
      if (!entity.alive) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      } else if (
        entity.calories <
        config.larvaStartingCalories * config.antStarvationWarningThreshold
      ) {
        ctx.fillStyle = 'rgba(250, 50, 0, 0.9)';
      }
      ctx.beginPath();
      const radius = entity.width / 2 * 0.5 + entity.calories / 10000;
      ctx.arc(entity.width / 2, entity.height / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      if (state.game.selectedEntities.includes(entity.id)) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 / (config.canvasWidth / config.width);
        ctx.stroke();
      }
      break;
    }
    case 'PUPA': {
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
    case 'PHEROMONE': {
      ctx.save();
      const alpha = 0.75 * (entity.quantity / config.pheromoneMaxQuantity) + 0.25;
      ctx.fillStyle = "rgba(0, 200, 0, " + alpha + ")";
      ctx.strokeStyle = "rgba(0, 200, 0, " + alpha + ")";
      if (state.game.selectedEntities.includes(entity.id)) {
        ctx.strokeStyle = '#FF6347';
      }
      // relative to center
      ctx.translate(entity.width / 2, entity.height / 2);
      const radius = entity.width / 2;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(radius / 3, -2 * radius / 3);
      ctx.lineTo(radius / 3, -1 * radius / 3);
      ctx.lineTo(-1 * radius, -1 * radius / 3);
      ctx.lineTo(-1 * radius , radius / 3);
      ctx.lineTo(radius / 3, radius / 3);
      ctx.lineTo(radius / 3, 2 * radius / 3);
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
}

module.exports = {initRenderSystem};
