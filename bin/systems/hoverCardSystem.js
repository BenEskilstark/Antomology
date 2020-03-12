'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../utils/stateHelpers'),
    lookupInGrid = _require2.lookupInGrid;

var React = require('react');

var HOVERCARD_STYLE = {
  width: 160,
  padding: '4px',
  backgroundColor: 'white',
  border: '1px solid black',
  boxShadow: '1px 2px #111111'
};

var initHoverCardSystem = function initHoverCardSystem(store) {
  var time = -1;
  var mousePos = { x: 0, y: 0 };
  store.subscribe(function () {
    var state = store.getState();
    if (state.game == null) return;
    if (state.game.time == time) return;
    time = state.game.time;

    var dispatch = store.dispatch;
    var game = state.game;

    if (mousePos.x != game.mouse.curPos.x || mousePos.y != game.mouse.curPos.y) {
      mousePos = _extends({}, game.mouse.curPos);
      dispatch({ type: 'SET_HOVER_CARD_JSX', jsx: null });
    } else {
      if (game.hoverCard.mouseStillTime > config.hoverCardDelay) {
        dispatch({ type: 'SET_HOVER_CARD_JSX', jsx: getJSX(game, mousePos) });
      } else {
        dispatch({
          type: 'SET_HOVER_CARD_TIME',
          mouseStillTime: game.hoverCard.mouseStillTime + 1
        });
      }
    }
  });
};

function getJSX(game, mousePos) {
  var entitiesAtMouse = lookupInGrid(game.grid, mousePos).map(function (id) {
    return game.entities[id];
  }).filter(function (e) {
    return e.visible || e.type == 'DIRT';
  });

  var hoverCards = entitiesAtMouse.map(function (e) {
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
      case 'OBELISK':
        return obeliskCard(e);
      case 'FOOD':
        return foodCard(e);
      case 'TARGET':
        return targetCard(e);
    }
  });

  return React.createElement(
    'span',
    null,
    hoverCards
  );
}

function dirtCard(dirt) {
  return React.createElement(
    'div',
    {
      key: 'hoverCard_' + dirt.id,
      style: HOVERCARD_STYLE
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Dirt'
      )
    ),
    'Just some dirt. Can be picked up and moved around.'
  );
}

function stoneCard(stone) {
  return React.createElement(
    'div',
    {
      key: 'hoverCard_' + stone.id,
      style: HOVERCARD_STYLE
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Stone'
      )
    ),
    'Cannot be picked up or moved.'
  );
}

function targetCard(target) {
  return React.createElement(
    'div',
    {
      key: 'hoverCard_' + target.id,
      style: HOVERCARD_STYLE
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Target'
      )
    ),
    'The obelisk demands that you take it here.'
  );
}

function wormCard(worm) {
  return React.createElement(
    'div',
    {
      key: 'hoverCard_' + worm.id,
      style: HOVERCARD_STYLE
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Worm'
      )
    ),
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'HP: '
      ),
      worm.hp + '/' + config.wormStartingHP
    ),
    'A docile crawler that eats dirt.'
  );
}

function aphidCard(aphid) {
  return React.createElement(
    'div',
    {
      key: 'hoverCard_' + aphid.id,
      style: HOVERCARD_STYLE
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Aphid'
      )
    ),
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'HP: '
      ),
      aphid.hp + '/' + config.aphidStartingHP
    ),
    'A small critter that makes a good snack.'
  );
}

function obeliskCard(obelisk) {
  return React.createElement(
    'div',
    {
      key: 'hoverCard_' + obelisk.id,
      style: HOVERCARD_STYLE
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Obelisk'
      )
    ),
    'A mysterious block that beckons the ants to take it to the target.'
  );
}

function foodCard(food) {
  return React.createElement(
    'div',
    {
      key: 'hoverCard_' + food.id,
      style: HOVERCARD_STYLE
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Food'
      )
    ),
    'Have ants feed this to larva to help them mature. Or eat the food themselves to keep from getting too hungry.'
  );
}

function centipedeCard(centipede) {
  return React.createElement(
    'div',
    {
      key: 'hoverCard_' + centipede.id,
      style: HOVERCARD_STYLE
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Centipede'
      )
    ),
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'HP: '
      ),
      centipede.hp + '/' + config.centipedeStartingHP
    ),
    'A deadly insectovore that loves to eat eggs, larva, and pupa. Watch out!'
  );
}

module.exports = { initHoverCardSystem: initHoverCardSystem };