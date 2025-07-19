import React from "react";

export interface GradeSelectorProps {
  grades?: string[];
  value?: string;
  onChange?: (grade: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

export const GradeSelector: React.FC<GradeSelectorProps> = ({
  grades = DEFAULT_GRADES,
  value,
  onChange,
  label = "Select Grade",
  disabled = false,
  className = "",
}) => {
  // Uncontrolled state
  const [internalValue, setInternalValue] = React.useState<string>(value || grades[0]);

  // Sync internal state when value prop changes (controlled mode)
  React.useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value, internalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGrade = e.target.value;
    if (onChange) onChange(newGrade);
    else setInternalValue(newGrade);
  };

  const selectedValue = value !== undefined ? value : internalValue;
  const selectId = "grade-select";

  return (
    <div className={`grade-selector ${className}`}>
      <label htmlFor={selectId} className="grade-selector__label">
        {label}
      </label>
      <select
        id={selectId}
        className="grade-selector__select"
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
      >
        {grades.map((grade) => (
          <option key={grade} value={grade}>
            {grade}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GradeSelector;