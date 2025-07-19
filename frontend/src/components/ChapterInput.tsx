import React from "react";

export interface ChapterInputProps {
  value?: string;
  onChange?: (chapter: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ChapterInput: React.FC<ChapterInputProps> = ({
  value,
  onChange,
  label = "Chapter",
  placeholder = "Enter chapter name or number",
  disabled = false,
  className = "",
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(value || "");

  // Sync with controlled value
  React.useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value, internalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const inputValue = value !== undefined ? value : internalValue;
  const inputId = "chapter-input";

  return (
    <div className={`chapter-input ${className}`}>
      <label htmlFor={inputId} className="chapter-input__label">
        {label}
      </label>
      <input
        id={inputId}
        className="chapter-input__field"
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
};

export default ChapterInput;