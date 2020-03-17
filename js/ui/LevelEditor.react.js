// @flow

const React = require('react');
const Canvas = require('./Canvas.react');
const {config} = require('../config');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Dropdown = require('./components/Dropdown.react');
const NumberField = require('./components/NumberField.react');
const {useState, useMemo, useEffect} = React;

import type {Action, State} from '../types';

type Props = {
  width: number,
  height: number,
  dispatch: (action: Action) => void,
  state: State,
};

function LevelEditor(props: Props): React.Node {
  return (
    <div
      id="background"
      className="background"
      // style={{
      //   overflow: 'hidden',
      //   height: '100%',
      //   width: '66%',
      //   position: 'relative',
      //   margin: 'auto',
      // }}
    >
      <Canvas
        width={props.width} height={props.height}
      />
      <Sidebar state={props.state} dispatch={props.dispatch}
        width={props.width} height={props.height}
      />
    </div>
  );
}

function Sidebar(props: {state: State, dispatch: Action => void}): React.Node {
  const {state, dispatch} = props;
  const {game, editor} = state;

  const entityPicker = (
    <Dropdown
      noNoneOption={true}
      options={[
        'ANT', 'BACKGROUND', 'DIRT', 'EGG', 'FOOD', 'LARVA',
        'OBELISK', 'PUPA', 'STONE', 'STUCK_STONE', 'TARGET', 'GRASS',
        'APHID', 'BEETLE', 'DRAGONFLY', 'WORM', 'CENTIPEDE',
      ]}
      selected={editor.entityType}
      onChange={(entityType) => {
        dispatch({type: 'SET_EDITOR_ENTITY', entityType});
      }}
    />
  );

  const backgroundPicker = (
    <div>
      <Dropdown
        noNoneOption={true}
        options={['SKY', 'DIRT']}
        selected={editor.backgroundType}
        onChange={(backgroundType) => {
          dispatch({type: 'SET_EDITOR_BACKGROUND_TYPE', backgroundType});
        }}
      />
    </div>
  );

  const antSubTypePicker = (
    <div>
      <Dropdown
        noNoneOption={true}
        options={['QUEEN', 'WORKER']}
        selected={editor.antSubType}
        onChange={(subType) => {
          dispatch({type: 'SET_EDITOR_ANT_SUBTYPE', subType});
        }}
      />
    </div>
  );

  const allowDeleteBackgroundToggle = (
    <div>
      Delete Background Too:
      <Checkbox
        checked={editor.allowDeleteBackground}
        onChange={(allow) => {
          dispatch({type: 'SET_EDITOR_ALLOW_DELETE_BACKGROUND', allow});
        }}
      />
    </div>
  );

  const [importedGame, setImportedGame] = useState('');

  const locationNameField = (
    <input type="text" value={game.nextLocationName}
      onChange={(ev) => {
        dispatch({type: 'UPDATE_NEXT_LOCATION_NAME', name: ev.target.value});
      }}
    />
  );

  return (
    <div
      style={{
        border: '1px solid black',
        display: 'inline-block',
        width: 500,
        position: 'absolute',
        left: props.width,
        // height: props.height,
        overflowY: 'scroll',
        backgroundColor: 'white',
      }}
    >
      <div><b>Tools</b></div>
      <div>
        World Size:
        <div style={{paddingLeft: 10}}>
          Width:
          <NumberField value={game.worldWidth}
            submitOnBlur={true}
            onlyInt={true}
            onChange={(width) => {
              dispatch({type: 'SET_WORLD_SIZE', width});
            }}
          />
        </div>
        <div style={{paddingLeft: 10}}>
          Height:
          <NumberField value={game.worldHeight}
            submitOnBlur={true}
            onlyInt={true}
            onChange={(height) => {
              dispatch({type: 'SET_WORLD_SIZE', height});
            }}
          />
        </div>
      </div>
      <div>
        Left-click and drag will:
        <Dropdown
          noNoneOption={true}
          options={[
            'CREATE_ENTITY', 'DELETE_ENTITY', 'CREATE_LOCATION', 'MARK_TRAIL',
            'MARQUEE_ENTITY',
          ]}
          selected={editor.editorMode}
          onChange={(editorMode) => {
            dispatch({type: 'SET_EDITOR_MODE', editorMode});
          }}
        />
        {
          editor.editorMode === 'CREATE_ENTITY' ||
          editor.editorMode === 'MARQUEE_ENTITY'
          ? entityPicker : null
        }
        {(
            editor.editorMode === 'CREATE_ENTITY' ||
            editor.editorMode === 'MARQUEE_ENTITY'
          ) && editor.entityType === 'ANT'
          ? antSubTypePicker : null
        }
        {(
            editor.editorMode === 'CREATE_ENTITY' ||
            editor.editorMode === 'MARQUEE_ENTITY'
          ) && editor.entityType === 'BACKGROUND'
          ? backgroundPicker : null
        }
        {
          editor.editorMode === 'DELETE_ENTITY'
          ? allowDeleteBackgroundToggle : null
        }
        {
          editor.editorMode === 'CREATE_LOCATION'
          ? locationNameField : null
        }
      </div>
      <div>
        Fog of War:
        <Checkbox
          checked={game.fog}
          onChange={(fog) => dispatch({type: 'TOGGLE_FOG', fog})}
        />
      </div>
      <div>
        <Button label="Export Level as JSON"
          onClick={() => {
            console.log(JSON.stringify(editor.actions));
          }}
        />
        <Button label="Import Level from JSON"
          onClick={() => {
            if (importedGame != '') {
              //dispatch({type: 'APPLY_GAME_STATE', game: importedGame});
              for (const action of importedGame) {
                dispatch(action);
              }
              setImportedGame('');
            }
          }}
        />
        <input type="text" style={{width: '50px'}}
          value={importedGame == '' ? '' : JSON.stringify(importedGame)}
          onChange={(ev) => {
            setImportedGame(JSON.parse(ev.target.value));
          }}
        />
      </div>
    </div>
  );
}

module.exports = LevelEditor;
