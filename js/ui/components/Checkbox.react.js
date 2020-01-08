
const React = require('React');

/**
 * Props:
 *  checked: boolean
 *  onChange: (value: boolean) => void
 */
function Checkbox(props) {
  const {checked, onChange} = props;
  return (
    <input
      type='checkbox'
      checked={checked}
      onChange={() => {
        onChange(!checked);
      }}
    />
  );
}

module.exports = Checkbox;
