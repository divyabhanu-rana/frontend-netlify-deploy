import React from "react";

export interface StreamSelectorProps {
  streams?: string[];
  value?: string;
  onChange?: (stream: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_STREAMS = [
  "Science",
  "Commerce with Maths",
  "Commerce without Maths",
  "Humanities",
];

const StreamSelector: React.FC<StreamSelectorProps> = ({
  streams = DEFAULT_STREAMS,
  value,
  onChange,
  label = "Select Stream",
  disabled = false,
  className = "",
}) => {
  // Uncontrolled state
  const [internalValue, setInternalValue] = React.useState<string>(value || "");

  // Sync internal state when value prop changes (controlled mode)
  React.useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStream = e.target.value;
    if (onChange) onChange(newStream);
    else setInternalValue(newStream);
  };

  const selectedValue = value !== undefined ? value : internalValue;
  const selectId = "stream-select";

  return (
    <div className={`stream-selector ${className}`}>
      <label htmlFor={selectId} className="stream-selector__label">
        {label}
      </label>
      <select
        id={selectId}
        className="stream-selector__select"
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
      >
        <option value="" disabled>
          -- Select Stream --
        </option>
        {streams.map((stream) => (
          <option key={stream} value={stream}>
            {stream}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StreamSelector;