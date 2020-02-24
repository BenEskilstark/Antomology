'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var React = require('react');
var Canvas = require('./Canvas.react');

var _require = require('../config'),
    config = _require.config;

var Button = require('./components/Button.react');
var Checkbox = require('./components/Checkbox.react');
var Dropdown = require('./components/Dropdown.react');
var NumberField = require('./components/NumberField.react');
var useState = React.useState,
    useMemo = React.useMemo,
    useEffect = React.useEffect;


function LevelEditor(props) {
  return React.createElement(
    'div',
    { className: 'background', id: 'background' },
    React.createElement(Canvas, {
      width: props.width, height: props.height
    }),
    React.createElement(Sidebar, { state: props.state, dispatch: props.dispatch })
  );
}

function Sidebar(props) {
  var state = props.state,
      dispatch = props.dispatch;
  var game = state.game,
      editor = state.editor;


  var entityPicker = React.createElement(Dropdown, {
    noNoneOption: true,
    options: ['ANT', 'BACKGROUND', 'DIRT', 'EGG', 'FOOD', 'LARVA', 'OBELISK', 'PUPA', 'STONE', 'STUCK_STONE', 'TARGET', 'GRASS'],
    selected: editor.entityType,
    onChange: function onChange(entityType) {
      dispatch({ type: 'SET_EDITOR_ENTITY', entityType: entityType });
    }
  });

  var backgroundPicker = React.createElement(
    'div',
    null,
    React.createElement(Dropdown, {
      noNoneOption: true,
      options: ['SKY', 'DIRT'],
      selected: editor.backgroundType,
      onChange: function onChange(backgroundType) {
        dispatch({ type: 'SET_EDITOR_BACKGROUND_TYPE', backgroundType: backgroundType });
      }
    })
  );

  var antSubTypePicker = React.createElement(
    'div',
    null,
    React.createElement(Dropdown, {
      noNoneOption: true,
      options: ['QUEEN', 'WORKER'],
      selected: editor.antSubType,
      onChange: function onChange(subType) {
        dispatch({ type: 'SET_EDITOR_ANT_SUBTYPE', subType: subType });
      }
    })
  );

  var allowDeleteBackgroundToggle = React.createElement(
    'div',
    null,
    'Delete Background Too:',
    React.createElement(Checkbox, {
      checked: editor.allowDeleteBackground,
      onChange: function onChange(allow) {
        dispatch({ type: 'SET_EDITOR_ALLOW_DELETE_BACKGROUND', allow: allow });
      }
    })
  );

  var _useState = useState(''),
      _useState2 = _slicedToArray(_useState, 2),
      importedGame = _useState2[0],
      setImportedGame = _useState2[1];

  var locationNameField = React.createElement('input', { type: 'text', value: game.nextLocationName,
    onChange: function onChange(ev) {
      dispatch({ type: 'UPDATE_NEXT_LOCATION_NAME', name: ev.target.value });
    }
  });

  return React.createElement(
    'div',
    {
      style: {
        border: '1px solid black',
        display: 'inline-block',
        width: 500,
        position: 'absolute',
        left: config.canvasWidth,
        height: config.canvasHeight,
        overflowY: 'scroll'
      }
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'b',
        null,
        'Tools'
      )
    ),
    React.createElement(
      'div',
      null,
      'World Size:',
      React.createElement(
        'div',
        { style: { paddingLeft: 10 } },
        'Width:',
        React.createElement(NumberField, { value: game.worldWidth,
          submitOnEnter: true,
          onChange: function onChange(width) {
            dispatch({ type: 'SET_WORLD_SIZE', width: width });
          }
        })
      ),
      React.createElement(
        'div',
        { style: { paddingLeft: 10 } },
        'Height:',
        React.createElement(NumberField, { value: game.worldHeight,
          submitOnEnter: true,
          onChange: function onChange(height) {
            dispatch({ type: 'SET_WORLD_SIZE', height: height });
          }
        })
      )
    ),
    React.createElement(
      'div',
      null,
      'Left-click and drag will:',
      React.createElement(Dropdown, {
        noNoneOption: true,
        options: ['CREATE_ENTITY', 'DELETE_ENTITY', 'CREATE_LOCATION', 'MARK_TRAIL', 'MARQUEE_ENTITY'],
        selected: editor.editorMode,
        onChange: function onChange(editorMode) {
          dispatch({ type: 'SET_EDITOR_MODE', editorMode: editorMode });
        }
      }),
      editor.editorMode === 'CREATE_ENTITY' || editor.editorMode === 'MARQUEE_ENTITY' ? entityPicker : null,
      (editor.editorMode === 'CREATE_ENTITY' || editor.editorMode === 'MARQUEE_ENTITY') && editor.entityType === 'ANT' ? antSubTypePicker : null,
      (editor.editorMode === 'CREATE_ENTITY' || editor.editorMode === 'MARQUEE_ENTITY') && editor.entityType === 'BACKGROUND' ? backgroundPicker : null,
      editor.editorMode === 'DELETE_ENTITY' ? allowDeleteBackgroundToggle : null,
      editor.editorMode === 'CREATE_LOCATION' ? locationNameField : null
    ),
    React.createElement(
      'div',
      null,
      'Fog of War:',
      React.createElement(Checkbox, {
        checked: game.fog,
        onChange: function onChange(fog) {
          return dispatch({ type: 'TOGGLE_FOG', fog: fog });
        }
      })
    ),
    React.createElement(
      'div',
      null,
      React.createElement(Button, { label: 'Export Level as JSON',
        onClick: function onClick() {
          console.log(JSON.stringify(game));
        }
      }),
      React.createElement(Button, { label: 'Import Level from JSON',
        onClick: function onClick() {
          if (importedGame != '') {
            dispatch({ type: 'APPLY_GAME_STATE', game: importedGame });
            setImportedGame('');
          }
        }
      }),
      React.createElement('input', { type: 'text', style: { width: '50px' },
        value: importedGame == '' ? '' : JSON.stringify(importedGame),
        onChange: function onChange(ev) {
          setImportedGame(JSON.parse(ev.target.value));
        }
      })
    )
  );
}

module.exports = LevelEditor;