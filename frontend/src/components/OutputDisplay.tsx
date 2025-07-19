import React from "react";

export interface OutputDisplayProps {
  title?: string;
  content: string | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({
  title = "Output",
  content,
  className = "",
  style = {},
}) => {
  return (
    <div className={`output-display ${className}`} style={style}>
      {title && <h2 className="output-display__title">{title}</h2>}
      <div className="output-display__content">
        {typeof content === "string" ? (
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{content}</pre>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

export default OutputDisplay;