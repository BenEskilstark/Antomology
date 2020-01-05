// @flow

const React = require('react');
const {config} = require('../config');
const Game = require('./Game.react');
const Lobby = require('./Lobby.react');
const Button = require('./components/Button.react');

import type {State, Action} from '../types';

type Props = {
  state: State, // Game State
  dispatch: (action: Action) => Action
};

function Main(props: Props): React.Node {

  const content = React.useMemo(() => {
    if (props.state.game == null) {
      return <Lobby dispatch={props.dispatch} />;
    } else {
      return (
        <Game
          state={props.state}
          width={config.canvasWidth} height={config.canvasHeight}
          dispatch={props.dispatch}
        />
      );
    }
  }, [props.state, config.canvasHeight, config.canvasWidth, props.dispatch]);

  return (
      <React.Fragment>
        {content}
        {getModal(props)}
      </React.Fragment>
    );
}

function getModal(props: Props): React.Node {
  if (!props.modal) {
    return null;
  }
  const {title, text, buttons} = props.state.modal;
  const rect = document.getElementById('container').getBoundingClientRect();
  const buttonHTML = buttons.map(button => {
    return <Button label={button.label} onClick={button.onClick} />;
  });
  return (
    <div className="modal"
      style={{
        width: 300,
        top: (rect.height - 200) / 2,
        left: (rect.width - 300) / 2,
      }}>
      <h3><b>{title}</b></h3>
      {text}
      <div className="modalButtons">
        {buttonHTML}
      </div>
    </div>
  );
}

module.exports = Main;
