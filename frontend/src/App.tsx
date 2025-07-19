import React, { useState, useRef, useEffect } from "react";
import GradeSelector from "./components/GradeSelector";
import ChapterInput from "./components/ChapterInput";
import MaterialTypeSelector from "./components/MaterialTypeSelector";
import DifficultyChooser from "./components/DifficultyChooser";
import OutputDisplay from "./components/OutputDisplay";
import DownloadButtons from "./components/DownloadButtons";
import StreamSelector from "./components/StreamSelector";
import "./App.css";

// Use env variable for backend base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const STREAMS = [
  "Science",
  "Commerce with Maths",
  "Commerce without Maths",
  "Humanities",
];

// Progress-based status text
function getFillerText(progress: number): string {
  if (progress < 20) return "Analyzing chapters...";
  if (progress < 40) return "Retrieving context...";
  if (progress < 60) return "Crafting questions...";
  if (progress < 75) return "Ensuring every chapter is covered...";
  if (progress < 90) return "Formatting section marks...";
  if (progress < 100) return "Almost done! Reviewing for quality...";
  return "Generated Output!";
}

// Fun fact / quote / trivia messages
const ENTERTAINMENT_MESSAGES = [
  "Did you know? The world's largest lesson plan covers over 200 subjects!",
  "🎲 Fun Fact: Teachers make more minute-by-minute decisions than any other profession.",
  "Trivia: The first known worksheet was used in the 19th century.",
  "Tip: You can generate worksheets for multiple chapters at once!",
  "Project trivia: DIRO.ai is powered by Retrieval-Augmented Generation (RAG)!",
  "“Education is the most powerful weapon which you can use to change the world.” – Nelson Mandela",
  "🎓 Did you know? There are over 60 million teachers in the world.",
  "🧠 Fun Trivia: The part of your brain that processes reading lights up when you read worksheets!",
  "Trivia: The word 'syllabus' comes from a misreading of a Greek word in old Latin manuscripts.",
  "Keep going! Every great lesson starts with a click.",
  "Did you Know: The co-developer, Divyabhanu, is a big Club Penguin fan.",
  "Language Trivia: The word 'school' comes from the Greek word “scholē”, which meant “leisure.” 🤯"
  "Did you Know: The co-developer, Rohan, has over a million SpiderMan merchandise lying around him right now."
];

const App: React.FC = () => {
  // UI State
  const [grade, setGrade] = useState<string>("1");
  const [stream, setStream] = useState<string>("");
  const [chapter, setChapter] = useState<string>("");
  const [materialType, setMaterialType] = useState<string>("Question paper");
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [maxMarks, setMaxMarks] = useState<number | "">("");
  const [output, setOutput] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);

  // Progress bar state
  const [progress, setProgress] = useState<number>(0);

  // Entertainment slider
  const [entertainmentIdx, setEntertainmentIdx] = useState<number>(0);
  const entertainmentIntervalRef = useRef<number | null>(null);

  // For legacy/future-proofing
  const progressIntervalRef = useRef<number | null>(null);

  // Theme state for light/dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const needsStream =
    grade === "Grade 11" || grade === "Grade 12" || grade === "11" || grade === "12";

  // Download handlers
  const handleDownloadPDF = async () => {
    const res = await fetch(`${API_BASE_URL}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: output, filetype: "pdf" }),
    });
    if (!res.ok) {
      alert("Failed to export PDF!");
      return;
    }
    const { file_path } = await res.json();

    window.open(
      `${API_BASE_URL}/api/download?file_path=${encodeURIComponent(file_path)}`
    );
  };

  const handleDownloadWord = async () => {
    const res = await fetch(`${API_BASE_URL}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: output, filetype: "docx" }),
    });
    if (!res.ok) {
      alert("Failed to export Word file!");
      return;
    }
    const { file_path } = await res.json();

    window.open(
      `${API_BASE_URL}/api/download?file_path=${encodeURIComponent(file_path)}`
    );
  };

  // Real progress via SSE
  const handleGenerate = async () => {
    setGenerating(true);
    setOutput("");
    setProgress(0);

    // Entertainment slider: start cycling from a random message
    setEntertainmentIdx(Math.floor(Math.random() * ENTERTAINMENT_MESSAGES.length));
    if (entertainmentIntervalRef.current !== null) {
      clearInterval(entertainmentIntervalRef.current);
      entertainmentIntervalRef.current = null;
    }
    entertainmentIntervalRef.current = window.setInterval(() => {
      setEntertainmentIdx(idx => (idx + 1) % ENTERTAINMENT_MESSAGES.length);
    }, 5000);

    // Compose query params for SSE endpoint
    const params = new URLSearchParams({
      grade,
      chapter,
      material_type: materialType,
      difficulty,
    });
    if (needsStream && stream) {
      params.append("stream", stream);
    }
    if (materialType.trim().toLowerCase() === "question paper" && maxMarks) {
      params.append("max_marks", String(maxMarks));
    }

    // Use EventSource for SSE from FastAPI
    const eventSource = new window.EventSource(
      `${API_BASE_URL}/api/generate_stream?${params.toString()}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.progress === "number") {
          setProgress(data.progress);
        }
        if (data.output) {
          setOutput(
            `Generated ${materialType} (Grade: ${grade}${
              needsStream && stream ? `, Stream: ${stream}` : ""
            }, Chapter: ${chapter}, Difficulty: ${difficulty}${
              materialType.trim().toLowerCase() === "question paper" && maxMarks
                ? `, Max Marks: ${maxMarks}`
                : ""
            })\n\n${data.output}`
          );
          setGenerating(false);
          setProgress(100);
          if (eventSource) eventSource.close();
          if (entertainmentIntervalRef.current !== null) {
            clearInterval(entertainmentIntervalRef.current);
            entertainmentIntervalRef.current = null;
          }
        }
        if (data.error) {
          alert("Error: " + data.error);
          setGenerating(false);
          setProgress(100);
          if (eventSource) eventSource.close();
          if (entertainmentIntervalRef.current !== null) {
            clearInterval(entertainmentIntervalRef.current);
            entertainmentIntervalRef.current = null;
          }
        }
      } catch (err) {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setGenerating(false);
      if (eventSource) eventSource.close();
      if (entertainmentIntervalRef.current !== null) {
        clearInterval(entertainmentIntervalRef.current);
        entertainmentIntervalRef.current = null;
      }
      alert("An error occurred while generating the material.");
    };
  };

  const isQuestionPaper = materialType.trim().toLowerCase() === "question paper";
  const isLessonPlan = materialType.trim().toLowerCase() === "lesson plan";

  const handleMaterialTypeChange = (type: string) => {
    setMaterialType(type);
    if (type.trim().toLowerCase() === "lesson plan") {
      setDifficulty("");
    } else if (difficulty === "") {
      setDifficulty("easy");
    }
  };

  useEffect(() => {
    if (!needsStream) setStream("");
  }, [grade]); // eslint-disable-line

  // Reset progress when generating
  useEffect(() => {
    if (generating) {
      setProgress(0);
      // Entertainment slider is handled in handleGenerate for reset/start
    }
  }, [generating]);

  // When output arrives, keep bar at 100, stop entertainment slider
  useEffect(() => {
    if (output) {
      setProgress(100);
      if (entertainmentIntervalRef.current !== null) {
        clearInterval(entertainmentIntervalRef.current);
        entertainmentIntervalRef.current = null;
      }
    }
  }, [output]);

  // On unmount, clear intervals (future-proof)
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (entertainmentIntervalRef.current !== null) {
        clearInterval(entertainmentIntervalRef.current);
        entertainmentIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`app-main-bg ${theme}-theme`}>
      <div className={`generator-container ${theme}-theme`}>
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.25em"
          }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? "🌙" : "☀️"}
        </button>
        <div className="generator-title">DIRO.ai: Material Generation Assistant</div>
        <form
          className="input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
        >
          <div className="input-row">
            <GradeSelector value={grade} onChange={setGrade} />
          </div>
          <div className="input-row">
            <ChapterInput value={chapter} onChange={setChapter} />
          </div>
          {needsStream && (
            <div className="input-row">
              <StreamSelector value={stream} onChange={setStream} />
            </div>
          )}
          <div className="input-row">
            <MaterialTypeSelector value={materialType} onChange={handleMaterialTypeChange} />
            {!isLessonPlan && (
              <DifficultyChooser value={difficulty} onChange={setDifficulty} />
            )}
          </div>
          {isQuestionPaper && (
            <div className="input-row">
              <label>
                Maximum Marks:&nbsp;
                <input
                  type="number"
                  min={1}
                  value={maxMarks}
                  onChange={e => setMaxMarks(e.target.value === "" ? "" : Number(e.target.value))}
                  required={isQuestionPaper}
                  placeholder="Enter total marks"
                  style={{ width: "110px" }}
                />
              </label>
            </div>
          )}
          <button
            className="generate-btn"
            type="submit"
            disabled={
              !chapter ||
              generating ||
              (isQuestionPaper && (!maxMarks || isNaN(Number(maxMarks)) || Number(maxMarks) < 1)) ||
              (needsStream && !stream)
            }
          >
            {generating ? (
              <>
                <span className="generate-spinner"></span>
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </form>

        {/* Progress Bar and Filler Text */}
        {(generating || progress > 0) && (
          <div className="generate-slider-container">
            <div className={`generate-slider-bar ${theme}-theme`}>
              <div
                className={`generate-slider-fill ${theme}-theme`}
                style={{
                  width: `${progress}%`,
                  transition: generating ? "width 0.45s cubic-bezier(.4,0,.2,1)" : "width 0.2s"
                }}
              />
            </div>
            {(generating || (progress === 100 && output)) && (
              <>
                <div className={`generate-slider-filler-text ${theme}-theme`}>
                  {progress === 100 && output
                    ? <>Generated Output! <span style={{ color: "#B6901B" }}>(100%)</span></>
                    : <>{getFillerText(progress)} <span style={{ color: "#B6901B" }}>({Math.round(progress)}%)</span></>
                  }
                </div>
                {/* Entertainment/quote/trivia slider -- only show while generating */}
                {generating && (
                  <div className={`generate-slider-entertainment-text ${theme}-theme`}>
                    {ENTERTAINMENT_MESSAGES[entertainmentIdx]}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {output && (
          <div className="output-section">
            <OutputDisplay title="Generated Output" content={output} />
            <DownloadButtons
              onDownloadPDF={handleDownloadPDF}
              onDownloadWord={handleDownloadWord}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App
