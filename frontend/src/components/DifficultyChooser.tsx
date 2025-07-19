import React from "react";

export interface DifficultyChooserProps {
  choices?: string[];
  value?: string;
  onChange?: (difficulty: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_DIFFICULTY_CHOICES = ["easy", "medium", "difficult"];

export const DifficultyChooser: React.FC<DifficultyChooserProps> = ({
  choices = DEFAULT_DIFFICULTY_CHOICES,
  value,
  onChange,
  label = "Select Difficulty",
  disabled = false,
  className = "",
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(value || choices[0]);

  React.useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value, internalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDifficulty = e.target.value;
    if (onChange) {
      onChange(newDifficulty);
    } else {
      setInternalValue(newDifficulty);
    }
  };

  const selectedValue = value !== undefined ? value : internalValue;
  const selectId = "difficulty-chooser-select";

  return (
    <div className={`difficulty-chooser ${className}`}>
      <label htmlFor={selectId} className="difficulty-chooser__label">
        {label}
      </label>
      <select
        id={selectId}
        className="difficulty-chooser__select"
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
      >
        {choices.map((diff) => (
          <option key={diff} value={diff}>
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DifficultyChooser;