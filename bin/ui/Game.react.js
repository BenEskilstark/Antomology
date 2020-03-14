'use strict';

var React = require('react');
var Canvas = require('./Canvas.react');
var InfoSidebar = require('./InfoSidebar.react');
var SelectionSidebar = require('./SelectionSidebar.react');
var useEffect = React.useEffect;

var _require = require('../state/tasks'),
    createLayEggTask = _require.createLayEggTask;

var _require2 = require('../config'),
    config = _require2.config;

var _require3 = require('../selectors/selectors'),
    getQueen = _require3.getQueen;

function Game(props) {
  var dispatch = props.dispatch,
      state = props.state;

  //////////////////////////////////////////////////////////////////////////////
  // Register hotkeys
  //////////////////////////////////////////////////////////////////////////////

  var fKey = state.game.hotKeys.onKeyDown['F'];
  useEffect(function () {
    return registerHotkeys(dispatch);
  }, [fKey != null]);

  var hoverCard = React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        top: props.state.game.mouse.curPixel.y + 4,
        left: props.state.game.mouse.curPixel.x + 4
      }
    },
    props.state.game.hoverCard.jsx
  );

  return React.createElement(
    'div',
    {
      className: 'background', id: 'background',
      style: {
        position: 'relative'
      }
    },
    React.createElement(Canvas, {
      width: props.width, height: props.height
    }),
    React.createElement(InfoSidebar, { state: props.state, dispatch: props.dispatch }),
    React.createElement(SelectionSidebar, { state: props.state, dispatch: props.dispatch }),
    props.state.game.hoverCard.jsx != null ? hoverCard : null
  );
}

var registerHotkeys = function registerHotkeys(dispatch) {
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'space',
    fn: function fn(s) {
      var state = s.getState();
      var isPaused = state.game.tickInterval == null;
      if (isPaused) {
        s.dispatch({ type: 'START_TICK', updateSim: true });
      } else {
        s.dispatch({ type: 'STOP_TICK' });
      }
    }
  });

  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'E',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_ANT_MODE', antMode: 'EAT' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'F',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_ANT_MODE', antMode: 'FEED' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'R',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_ANT_MODE', antMode: 'PICKUP' });
    }
  });

  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'Z',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_USER_MODE', userMode: 'SELECT' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'C',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_USER_MODE', userMode: 'CREATE_LOCATION' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'X',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_USER_MODE', userMode: 'DELETE_LOCATION' });
    }
  });

  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'U',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'Colony Status' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'L',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'Locations' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'H',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'Pheromones' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'K',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'Options' });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'N',
    fn: function fn(s) {
      return s.dispatch({ type: 'SET_INFO_TAB', infoTab: 'None' });
    }
  });

  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'Q',
    fn: function fn(s) {
      var game = s.getState().game;
      if (game == null) return;
      var queenID = getQueen(game).id;
      s.dispatch({ type: 'SET_SELECTED_ENTITIES', entityIDs: [queenID] });
    }
  });
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'G',
    fn: function fn(s) {
      var game = s.getState().game;
      if (game == null) return;
      var queenID = getQueen(game).id;
      s.dispatch({ type: 'ASSIGN_TASK', task: createLayEggTask(), ants: [queenID] });
    }
  });
};

module.exports = Game;