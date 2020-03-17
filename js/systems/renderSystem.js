
const {config} = require('../config');
const {
  subtract, add, makeVector, vectorTheta,
} = require('../utils/vectors');
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

    // render ticker
    if (state.game.ticker.text != '') {
      const {text, curAge, maxAge} = state.game.ticker;
      ctx.save();
      const alpha = Math.min(1, curAge / 40);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
      ctx.font = '50px Consolas';
      ctx.fillText(text, 500, 100);
      ctx.restore();
    }
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
  if (state.editor != null) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, game.worldWidth, game.worldHeight);
  }
  ////////////////////////////////////////////

  // sky first
  for (const id of game.BACKGROUND) {
    const entity = game.entities[id];
    if (!entity.position) {
      console.log("entity with no position:", entity);
    }
    if (!onScreen(game, entity.position)) continue;

    renderEntity(state, ctx, entity);
  }

  // then grass
  for (const id of game.GRASS) {
    const entity = game.entities[id];
    if (!entity.position) {
      console.log("entity with no position:", entity);
    }
    if (!onScreen(game, entity.position)) continue;

    renderEntity(state, ctx, entity);
  }

  // render non-location, non-ant entities
  for (const id in game.entities) {
    const entity = game.entities[id];
    if (entity.position == null) continue;
    if (entity.type == 'BACKGROUND') continue;
    if (entity.type == 'GRASS') continue;
    if (entity.type == 'LOCATION' || entity.type === 'ANT') continue;
    if (entity.type == 'TARGET') continue;
    if (!onScreen(game, entity.position)) continue;
    let toRender = entity;
    if (!entity.visible && entity.lastSeenPos != null) {
      toRender = {...entity, position: entity.lastSeenPos};
    }

    renderEntity(state, ctx, toRender);
  }
  // then render TARGET
  for (const id of game.TARGET) {
    const entity = game.entities[id];
    if (entity.position == null) continue;
    if (!onScreen(game, entity.position)) continue;
    renderEntity(state, ctx, entity);
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
    mouse.isLeftDown && ((state.editor == null &&
    (game.userMode === 'SELECT' || game.userMode === 'CREATE_LOCATION'))
    ||
    (state.editor != null && (
      state.editor.editorMode === 'MARQUEE_ENTITY' ||
      state.editor.editorMode === 'CREATE_LOCATION'))
  )) {
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

  // render cursor
  // TODO

  ctx.restore();

}

// NOTE when rendering underneath FoW, use inFog = true to not render infinitely
const renderEntity = (
  state: State, ctx: any, entity: Entity, inFog: boolean,
): void => {
  const {game} = state;
  const px = config.width / config.canvasWidth;
  ctx.save();
  if (!inFog) {
    // render relative to top left of grid square, but first translate for rotation
    // around the center
    ctx.translate(
      entity.position.x + entity.width / 2,
      entity.position.y + entity.height / 2,
    );
    ctx.rotate(entity.theta);
    ctx.translate(-entity.width / 2, -entity.height / 2);
    ctx.lineWidth = px;
  }

  // handle fog
  if (!entity.visible && !inFog && state.game.fog) {
    const width = entity.width + 0.04;
    const height = entity.height + 0.04;
    if (entity.lastSeenPos == null || config.bugs.includes(entity.type)) {
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
      renderEntity(state, ctx, entity, true);
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
        config.antMaxCalories * config.antStarvationWarningThreshold
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

      if (
        (entity.hp > 0 && entity.hp < config.antStartingHP && entity.alive) ||
        (entity.hp <= 0 && game.selectedEntities.includes(entity.id))
      ) {
        renderHealthBar(state, ctx, entity, config.antStartingHP);
      }

      break;
    }
    case 'APHID': {
      ctx.fillStyle = 'green';
      ctx.strokeStyle = 'green';
      if (!entity.alive) {
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
      }
      ctx.lineWidth = px;
      // body
      const radius = entity.width / 2 * 0.8;
      ctx.translate(entity.width / 2, entity.height / 2);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.fill();
      // eye
      ctx.beginPath();
      ctx.fillStyle = 'black';
      const mult = entity.theta == 0 ? 1 : -1;
      ctx.arc(-1*radius / 2, mult * radius * 0.7, radius / 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'green';
      ctx.closePath();

      // legs
      ctx.beginPath();
      for (let deg = 60; deg <= 120; deg += 30) {
        const rad = deg * Math.PI / 180;
        const leg1 = makeVector(-rad, entity.width / 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(leg1.x, leg1.y * mult);
        ctx.stroke();
      }
      ctx.translate(-entity.width / 2, -entity.height / 2);
      ctx.closePath();

      if (entity.hp < config.aphidStartingHP) {
        renderHealthBar(state, ctx, entity, config.aphidStartingHP);
      }

      break;
    }
    case 'BEETLE': {
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
      const y = 0.8
      // body
      const radius = entity.height / 2;
      ctx.beginPath();
      ctx.arc(1, y, radius, 0, Math.PI);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      // head
      ctx.beginPath();
      ctx.arc(2, y, radius / 3, 0, 2 * Math.PI);
      ctx.lineTo(2, y);
      ctx.closePath();
      ctx.fill();
      // eye
      ctx.beginPath();
      ctx.fillStyle = 'black';
      ctx.arc(2, y, radius / 3, 0, Math.PI / 2);
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
    case 'WORM': {
      ctx.fillStyle = 'pink';
      // head
      const nextSegment = entity.segments[0];
      const headDir = vectorTheta(subtract(entity.position, nextSegment.position));
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
      for (let i = 0; i < entity.segments.length - 1; i++) {
        const segment = entity.segments[i];
        const relPos = subtract(segment.position, entity.position);
        ctx.fillRect(relPos.x, relPos.y, 1, 1);
      }
      // tail
      const tail = entity.segments[entity.segments.length - 1];
      const relPos = subtract(tail.position, entity.position);
      const prevTail = entity.segments[entity.segments.length - 2];
      const tailDir = vectorTheta(subtract(tail.position, prevTail.position));
      ctx.save();
      ctx.translate(relPos.x + 0.5, relPos.y + 0.5);
      ctx.rotate(tailDir - Math.PI / 2);
      ctx.translate(-1* (relPos.x + 0.5), -1 * (relPos.y + 0.5));
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
    case 'CENTIPEDE': {
      // ctx.fillStyle = '#FAEBD7'; // off-white
      ctx.fillStyle = '#FF8C00'; // dark orange
      ctx.lineWidth = px;
      // head
      const nextSegment = entity.segments[0];
      const headDir = vectorTheta(subtract(entity.position, nextSegment.position));
      ctx.save();
      ctx.translate(0.5, 0.5);
      ctx.rotate(headDir - Math.PI / 2);
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
      for (let i = 0; i < entity.segments.length - 1; i++) {
        const nextSegmentPos = i == 0
          ? entity.position
          : entity.segments[i-1].position;
        const segment = entity.segments[i];
        const relPos = subtract(segment.position, entity.position);
        // legs
        const dir = vectorTheta(subtract(nextSegmentPos, relPos));
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.translate(relPos.x + 0.5, relPos.y + 0.5);
        ctx.rotate(dir);
        ctx.moveTo(0, 0);
        for (let j = 0; j < 2; j++) {
          const leg1 = makeVector(Math.PI / 2 + Math.random() * 0.7, 1);
          ctx.lineTo(leg1.x, leg1.y);
          ctx.moveTo(0, 0);
          const leg2 = makeVector(Math.PI / 2 + Math.random() * 0.7, 1);
          ctx.lineTo(leg1.x, -1 * leg1.y);
          ctx.stroke();
        }
        ctx.closePath();
        ctx.restore();

        ctx.fillRect(relPos.x, relPos.y, 1, 1);
      }
      // ctx.strokeStyle = '#FAEBD7'; // off-white
      ctx.strokeStyle = '#FF8C00'; // dark orange
      // tail
      const tail = entity.segments[entity.segments.length - 1];
      const relPos = subtract(tail.position, entity.position);
      const prevTail = entity.segments[entity.segments.length - 2];
      const tailDir = vectorTheta(subtract(tail.position, prevTail.position));
      ctx.save();
      ctx.translate(relPos.x + 0.5, relPos.y + 0.5);
      ctx.rotate(tailDir - Math.PI / 2);
      ctx.translate(-1* (relPos.x + 0.5), -1 * (relPos.y + 0.5));
      ctx.fillRect(relPos.x, relPos.y, 1, 0.5);
      ctx.beginPath();
      ctx.arc(relPos.x + 0.5, relPos.y + 0.5, 0.5, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (entity.hp < config.centipedeStartingHP) {
        renderHealthBar(state, ctx, entity, config.centipedeStartingHP);
      }
      break;
    }
    case 'DRAGONFLY': {
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
    case 'STUCK_STONE': {
      ctx.fillStyle = '#444444';
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
    case 'TARGET': {
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      ctx.lineWidth = 3 * px;
      const radius = entity.width / 2;
      ctx.beginPath();
      ctx.arc(entity.width / 2, entity.height / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(entity.width / 2, entity.height / 2, radius * 2/3, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(entity.width / 2, entity.height / 2, radius * 1/3, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'GRASS': {
      ctx.fillStyle = '#8fbc8f';
      ctx.fillRect(0, 0, entity.width, entity.height);
      break;
    }
    case 'LOCATION': {
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

function renderHealthBar(state, ctx, entity, maxHealth) {
  ctx.save();
  // always render healthbar above entity no matter its theta
  ctx.translate(
    entity.width / 2,
    entity.height / 2,
  );
  ctx.rotate(-entity.theta);
  ctx.translate(-entity.width / 2, -entity.height / 2);

  const barWidth = 2;
  const barHeight = 0.33;
  ctx.fillStyle = 'red';
  ctx.fillRect(
    -0.5, 1.33,
    barWidth, barHeight,
  );

  ctx.fillStyle = 'green';
  const healthWidth = Math.max(entity.hp / maxHealth * barWidth, 0);
  ctx.fillRect(
    -0.5, 1.33,
    healthWidth, barHeight,
  );

  ctx.strokeStyle = 'black';
  ctx.strokeRect(
    -0.5, 1.33,
    barWidth, barHeight,
  );

  ctx.restore();
}

module.exports = {initRenderSystem};
