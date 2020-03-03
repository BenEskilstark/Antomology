
const React = require('React');

/**
 * Props:
 * options: Array<string>
 * displayOptions: ?Array<string>
 * selected: string // which option is selected
 * onChange: (string) => void
 * noNoneOption: optional boolean // if provided, won't use NONE option
 */
const Dropdown = function(props: Props) {
  const {options, noNoneOption, selected, onChange, displayOptions} = props;
  const optionTags = options.map((option, i) => {
    const label = displayOptions != null && displayOptions[i] != null
      ? displayOptions[i]
      : option;
    return (
      <option key={'option_' + option} value={option}>
        {label}
      </option>
    );
  });
  if (!noNoneOption) {
    optionTags.push(
      <option key='option_null' value={null}>
        NONE
      </option>
    );
  }


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
