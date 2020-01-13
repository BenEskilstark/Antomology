const {config} = require('../config');
const {subtract, add} = require('../utils/vectors');

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
    }

    // clear
    ctx.fillStyle = 'steelblue';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    render(state, ctx);
  });
}


const render = (state: State, ctx: any): void => {
  const {game} = state;

  // scale world to the canvas
  ctx.save();
  // set the origin to the bottom left instead of top right
  ctx.translate(0, config.canvasHeight);
  ctx.scale(1, -1);
  ctx.scale(
    config.canvasWidth / config.width,
    config.canvasHeight / config.height,
  );

  // render non-location entities
  for (const id in game.entities) {
    const entity = game.entities[id];
    if (entity.position == null || entity.type == 'LOCATION') {
      continue;
    }
    renderEntity(state, ctx, entity);
  }
  // render locations last so they go on top
  for (const id of game.locations) {
    const entity = game.entities[id];
    if (entity.position == null || entity.id === -1) {
      // don't render clicked location
      continue;
    }
    renderEntity(state, ctx, entity);
  }

  // render marquees
  const {mouse} = game;
  if (mouse.isLeftDown && game.userMode !== 'MARK') {
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
}

const renderEntity = (state: State, ctx: any, entity: Entity): void => {
  ctx.save();
  // render relative to top left of grid square
  ctx.translate(
    entity.position.x,
    entity.position.y,
  );
  switch (entity.type) {
    case 'ANT': {
      ctx.fillStyle = 'orange';
      if (!entity.alive) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      } else if (
        entity.calories <
        config.antStartingCalories * config.antStarvationWarningThreshold
      ) {
        ctx.fillStyle = 'rgba(250, 50, 0, 0.9)';
      }
      ctx.beginPath();
      const radius = entity.subType == 'QUEEN' ? entity.width / 2 : 0.8 * entity.width / 2;
      ctx.arc(entity.width / 2, entity.height / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      if (state.game.selectedEntities.includes(entity.id)) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 / (config.canvasWidth / config.width);
        ctx.stroke();
      }

      if (entity.holding != null) {
        const heldEntity = entity.holding;
        ctx.save();
        ctx.scale(0.45, 0.45);
        ctx.translate(1, 1);
        renderEntity(state, ctx, {...heldEntity, position: {x: 0, y: 0}});
        ctx.restore();
      }
      break;
    }
    case 'DIRT': {
      ctx.fillStyle = 'brown';
      ctx.fillRect(0, 0, entity.width, entity.height);
      ctx.fillStyle = 'rgba(0, 0, 200,' + entity.marked * 0.5 + ')';
      ctx.fillRect(0, 0, entity.width, entity.height);
      break;
    }
    case 'LOCATION': {
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
    case 'FOOD': {
      ctx.fillStyle = 'green';
      const sizeFactor = entity.calories / config.foodSpawnCalories;
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
  }
  ctx.restore();
}

module.exports = {initRenderSystem};
