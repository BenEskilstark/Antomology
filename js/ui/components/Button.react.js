const React = require('React');

// props:
// id: ?string
// label: string
// onClick: () => void
// disabled: optional boolean
// hotkey: optional number // ascii code for the key to trigger it

class Button extends React.Component {

  componentWillUnmount() {
    // document.onkeydown = null;
  }

  render() {
    const {props} = this;
    const id = props.id || props.label;

    if (props.hotkey != null) {
      // document.onkeydown = (ev) => {
      //   if (ev.keyCode === props.hotkey && !props.disabled) {
      //     props.onClick();
      //   }
      // }
    }

    return (
      <button type="button"
        key={id || label}
        className={props.disabled ? 'buttonDisable' : ''}
        id={id.toUpperCase() + '_button'}
        onClick={props.disabled ? () => {} : props.onClick}
        disabled={props.disabled}
      >
        {props.label}
      </button>
    );
  }
}

module.exports = Button;
