'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var React = require('react');

var _require = require('../selectors/selectors');

_objectDestructuringEmpty(_require);

var Button = require('./components/Button.react');
var useState = React.useState;


function Lobby(props) {
  var dispatch = props.dispatch;

  var _useState = useState(''),
      _useState2 = _slicedToArray(_useState, 2),
      importedGameActions = _useState2[0],
      setImportedGameActions = _useState2[1];

  return React.createElement(
    'div',
    null,
    React.createElement(
      'span',
      null,
      React.createElement(Button, {
        label: 'Start Test Level',
        onClick: function onClick() {
          dispatch({ type: 'START', level: 0 });
          dispatch({ type: 'START_TICK', updateSim: true });
        }
      }),
      React.createElement(Button, {
        label: 'Start Level 1',
        onClick: function onClick() {
          dispatch({ type: 'START', level: 1 });
          dispatch({ type: 'START_TICK', updateSim: true });
        }
      }),
      React.createElement(Button, {
        label: 'Start Level 2',
        onClick: function onClick() {
          dispatch({ type: 'START', level: 2 });
          dispatch({ type: 'START_TICK', updateSim: true });
        }
      })
    ),
    React.createElement(
      'div',
      null,
      React.createElement(Button, {
        label: 'Level Editor',
        onClick: function onClick() {
          dispatch({ type: 'START_EDITOR' });
          dispatch({ type: 'START_TICK', updateSim: false });
        }
      })
    ),
    React.createElement(
      'div',
      null,
      React.createElement(Button, { label: 'Play Imported Level from JSON',
        onClick: function onClick() {
          dispatch({ type: 'START', level: -1 });
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = importedGameActions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _action = _step.value;

              dispatch(_action);
            }
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

          setImportedGameActions('');
          dispatch({ type: 'START_TICK', updateSim: true });
        }
      }),
      React.createElement('input', { type: 'text', style: { width: '50px' },
        value: importedGameActions == '' ? '' : JSON.stringify(importedGameActions),
        onChange: function onChange(ev) {
          setImportedGameActions(JSON.parse(ev.target.value));
        }
      })
    )
  );
}

module.exports = Lobby;