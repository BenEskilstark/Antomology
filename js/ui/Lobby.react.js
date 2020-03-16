// @flow

const React = require('react');
const {
} = require('../selectors/selectors');
const Button = require('./components/Button.react');
const {useState} = React;

import type {State, Action} from '../types';

type Props = {
  dispatch: (action: Action) => Action,
};

function Lobby(props: Props): React.Node {
  const {dispatch} = props;

  const [importedGameActions, setImportedGameActions] = useState('');

  return (
    <div>
      <span>
        <Button
          label="Start Test Level"
          onClick={() => {
            dispatch({type: 'START', level: 0});
            dispatch({type: 'START_TICK', updateSim: true});
          }}
        />
        <Button
          label="Start Level 1"
          onClick={() => {
            dispatch({type: 'START', level: 1});
            dispatch({type: 'START_TICK', updateSim: true});
          }}
        />
        <Button
          label="Start Level 2"
          onClick={() => {
            dispatch({type: 'START', level: 2});
            dispatch({type: 'START_TICK', updateSim: true});
          }}
        />
      </span>
      <div>
        <Button
          label="Level Editor"
            onClick={() => {
              dispatch({type: 'START_EDITOR'});
              dispatch({type: 'START_TICK', updateSim: false});
            }}
        />
      </div>
      <div>
        <Button label="Play Imported Level from JSON"
          onClick={() => {
            dispatch({type: 'START', level: -1});
            for (const action of importedGameActions) {
              dispatch(action);
            }
            setImportedGameActions('');
            dispatch({type: 'START_TICK', updateSim: true});
          }}
        />
        <input type="text" style={{width: '50px'}}
          value={importedGameActions == '' ? '' : JSON.stringify(importedGameActions)}
          onChange={(ev) => {
            setImportedGameActions(JSON.parse(ev.target.value));
          }}
        />
      </div>
    </div>
  );
}

module.exports = Lobby;
