const React = require('React');

// props:
// options: Array<string>
// selected: string
// onChange: (option) => void

class RadioPicker extends React.Component {
  render() {
    const optionToggles = [];
    for (const option of this.props.options) {
      optionToggles.push(
        <div className="radioOption">
          {option}
          <input type="radio"
            className="radioCheckbox"
            key={'radioOption_' + option}
            value={option}
            checked={option === this.props.selected}
            onChange={() => this.props.onChange(option)}
          />
        </div>
      );
    }

    return (
      <div>
        {optionToggles}
      </div>
    );
  }
}

module.exports = RadioPicker;
