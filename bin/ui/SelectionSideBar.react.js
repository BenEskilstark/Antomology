'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var React = require('react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var Dropdown = require('./components/Dropdown.react');
var StatusCard = require('./StatusCard.react');
var useState = React.useState;


var PADDING = 4;

function SelectionSidebar(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game;

  var _useState = useState(false),
      _useState2 = _slicedToArray(_useState, 2),
      selectionHidden = _useState2[0],
      setSelectionHidden = _useState2[1];

  var selectionCards = game.selectedEntities.map(function (id) {
    return game.entities[id];
  }).filter(function (e) {
    return e.type != 'LOCATION';
  }).map(function (entity) {
    return React.createElement(StatusCard, {
      state: state, entity: entity, dispatch: dispatch,
      key: 'statusCard_' + entity.id
    });
  });
  var selectedAntsLabel = selectionCards.length > 0 ? React.createElement(
    'div',
    { style: { backgroundColor: 'white', padding: '3px', marginTop: 4 } },
    React.createElement(
      'b',
      null,
      'Selected Ants'
    ),
    " (" + selectionCards.length + ")",
    React.createElement(
      'b',
      null,
      ':'
    ),
    React.createElement(Button, {
      label: selectionHidden ? 'Show Selection' : 'Hide Selection',
      onClick: function onClick() {
        return setSelectionHidden(!selectionHidden);
      }
    })
  ) : null;

  return React.createElement(
    'div',
    {
      style: {
        width: 400,
        position: 'absolute',
        left: config.canvasWidth - (400 + PADDING),
        top: PADDING,
        overflowY: 'scroll',
        overflowX: 'hidden'
      }
    },
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: 'white',
          width: '100%',
          padding: '3px'
        }
      },
      'Right-click commands ants to:',
      React.createElement(Dropdown, {
        noNoneOption: true,
        options: ['PICKUP', 'EAT', 'FEED'],
        selected: game.antMode,
        displayOptions: ['Pick up [R]', 'Eat [E]', 'Feed [F]'],
        onChange: function onChange(antMode) {
          return dispatch({ type: 'SET_ANT_MODE', antMode: antMode });
        }
      })
    ),
    selectedAntsLabel,
    !selectionHidden ? selectionCards : null
  );
}

module.exports = SelectionSidebar;