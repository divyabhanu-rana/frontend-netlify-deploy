import React from "react";

export interface DownloadButtonsProps {
  onDownloadPDF?: () => void;
  onDownloadWord?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  onDownloadPDF,
  onDownloadWord,
  disabled = false,
  className = "",
  style = {},
}) => {
  return (
    <div className={`download-buttons-row ${className}`} style={style}>
      <button
        type="button"
        className="download-btn"
        onClick={onDownloadPDF}
        disabled={disabled}
      >
        Download as PDF
      </button>
      <button
        type="button"
        className="download-btn"
        onClick={onDownloadWord}
        disabled={disabled}
      >
        Download as Word
      </button>
    </div>
  );
};

export default DownloadButtons;