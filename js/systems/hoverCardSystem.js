
const {config} = require('../config');
const {lookupInGrid} = require('../utils/stateHelpers');
const React = require('react');

const HOVERCARD_STYLE = {
  width: 160,
  padding: '4px',
  backgroundColor: 'white',
  border: '1px solid black',
  boxShadow: '1px 2px #111111',
};

const initHoverCardSystem = (store) => {
  let time = -1;
  let mousePos = {x: 0, y: 0};
  store.subscribe(() => {
    const state = store.getState();
    if (state.game == null) return;
    if (state.game.time == time) return;
    time = state.game.time;

    const dispatch = store.dispatch;
    const {game} = state;
    if (mousePos.x != game.mouse.curPos.x || mousePos.y != game.mouse.curPos.y) {
      mousePos = {...game.mouse.curPos};
      dispatch({type: 'SET_HOVER_CARD_JSX', jsx: null});
    } else {
      if (game.hoverCard.mouseStillTime == config.hoverCardDelay) {
        dispatch({type: 'SET_HOVER_CARD_JSX', jsx: getJSX(game, mousePos)});
      } else {
        dispatch({
          type: 'SET_HOVER_CARD_TIME',
          mouseStillTime: game.hoverCard.mouseStillTime + 1,
        });
      }
    }

  });
};

function getJSX(game, mousePos) {
  const entitiesAtMouse = lookupInGrid(game.grid, mousePos)
    .map(id => game.entities[id])
    .filter(e => e.visible || (e.lastSeenPos != null && e.type == 'DIRT'));

  const hoverCards = entitiesAtMouse.map(e => {
    switch (e.type) {
      case 'STONE':
      case 'STUCK_STONE':
        return stoneCard(e);
      case 'DIRT':
        return dirtCard(e);
      case 'WORM':
        return wormCard(e);
      case 'CENTIPEDE':
        return centipedeCard(e);
      case 'APHID':
        return aphidCard(e);
      case 'BEETLE':
        return beetleCard(e);
      case 'OBELISK':
        return obeliskCard(e);
      case 'FOOD':
        return foodCard(e);
      case 'TARGET':
        return targetCard(e);
    }
  });

  return (
    <span>
      {hoverCards}
    </span>
  );
}

function dirtCard(dirt) {
  return (
    <div
      key={'hoverCard_' + dirt.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Dirt</b></div>
      Just some dirt. Can be picked up and moved around.
    </div>
  );
}

function stoneCard(stone) {
  return (
    <div
      key={'hoverCard_' + stone.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Stone</b></div>
      Cannot be picked up or moved.
    </div>
  );
}

function targetCard(target) {
  return (
    <div
      key={'hoverCard_' + target.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Target</b></div>
      The obelisk demands that you take it here.
    </div>
  );
}

function wormCard(worm) {
  return (
    <div
      key={'hoverCard_' + worm.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Worm</b></div>
      <div>
        <b>HP: </b>{worm.hp + '/' + config.wormStartingHP}
      </div>
      <div><b>DMG: </b>{config.wormDamage}</div>
      A docile crawler that eats dirt.
    </div>
  );
}

function aphidCard(aphid) {
  return (
    <div
      key={'hoverCard_' + aphid.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Aphid</b></div>
      <div>
        <b>HP: </b>{aphid.hp + '/' + config.aphidStartingHP}
      </div>
      <div><b>DMG: </b>{config.aphidDamage}</div>
      A small critter that makes a good snack.
    </div>
  );
}

function beetleCard(beetle) {
  return (
    <div
      key={'hoverCard_' + beetle.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Beetle</b></div>
      <div>
        <b>HP: </b>{beetle.hp + '/' + config.beetleStartingHP}
      </div>
      <div><b>DMG: </b>{config.beetleDamage}</div>
      Bumbling food with legs -- but it fights back!
    </div>
  );
}

function obeliskCard(obelisk) {
  return (
    <div
      key={'hoverCard_' + obelisk.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Obelisk</b></div>
      A mysterious block that beckons the ants to take it to the target.
    </div>
  );
}

function foodCard(food) {
  return (
    <div
      key={'hoverCard_' + food.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Food</b></div>
      <div><b>Type:</b>{food.name}</div>
      Have ants feed this to larva to help them mature. Or eat the food
      themselves to keep from getting too hungry.
    </div>
  );
}

function centipedeCard(centipede) {
  return (
    <div
      key={'hoverCard_' + centipede.id}
      style={HOVERCARD_STYLE}
    >
      <div><b>Centipede</b></div>
      <div>
        <b>HP: </b>{centipede.hp + '/' + config.centipedeStartingHP}
      </div>
      <div><b>DMG: </b>{config.centipedeDamage}</div>
      A deadly insectovore that loves to eat eggs, larva, and pupa. Watch out!
    </div>
  );
}

module.exports = {initHoverCardSystem};
