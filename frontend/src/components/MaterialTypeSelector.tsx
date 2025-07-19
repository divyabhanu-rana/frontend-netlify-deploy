import React from "react";

export interface MaterialTypeSelectorProps {
  materialTypes?: string[];
  value?: string;
  onChange?: (materialType: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  // NEW: for controlled maxMarks input
  maxMarks?: number | "";
  onMaxMarksChange?: (marks: number | "") => void;
}

const DEFAULT_MATERIAL_TYPES = [
  "Question paper",
  "Worksheet",
  "Lesson Plan",
];

export const MaterialTypeSelector: React.FC<MaterialTypeSelectorProps> = ({
  materialTypes = DEFAULT_MATERIAL_TYPES,
  value,
  onChange,
  label = "Select Material Type",
  disabled = false,
  className = "",
  maxMarks,
  onMaxMarksChange,
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(
    value || materialTypes[0]
  );

  React.useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value, internalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    if (onChange) {
      onChange(newType);
    } else {
      setInternalValue(newType);
    }
  };

  const selectedValue = value !== undefined ? value : internalValue;
  const selectId = "material-type-select";

  // Helper: is Question Paper selected?
  const isQuestionPaper = selectedValue.trim().toLowerCase() === "question paper";

  return (
    <div className={`material-type-selector ${className}`}>
      <label htmlFor={selectId} className="material-type-selector__label">
        {label}
      </label>
      <select
        id={selectId}
        className="material-type-selector__select"
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
      >
        {materialTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {isQuestionPaper && typeof onMaxMarksChange === "function" && (
        <div className="material-type-selector__max-marks" style={{ marginTop: "8px" }}>
          <label>
            Maximum Marks:&nbsp;
            <input
              type="number"
              min={1}
              value={typeof maxMarks === "number" || maxMarks === "" ? maxMarks : ""}
              onChange={e =>
                onMaxMarksChange(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              required
              placeholder="Enter total marks"
              style={{ width: "110px" }}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default MaterialTypeSelector;