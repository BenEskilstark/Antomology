
const React = require('React');

/**
 * Props:
 * options: Array<string>
 * selected: string // which option is selected
 * onChange: (string) => void
 */
const Dropdown = function(props: Props) {
  const {options, selected, onChange} = props;
  const optionTags = options.map(option => (
    <option key={'option_' + option} value={option}>
      {option}
    </option>
  ));
  optionTags.push(
    <option key='option_null' value={null}>
      NONE
    </option>
  );


  return (
    <select
      onChange={(ev) => {
        const val = ev.target.value;
        if (val != 'NONE') {
          onChange(val);
        }
      }}
      value={selected}
    >
      {optionTags}
    </select>
  );
}

module.exports = Dropdown;
