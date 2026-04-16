import React, { useState, useRef, useEffect } from "react";
import GradeSelector from "./components/GradeSelector";
import ChapterInput from "./components/ChapterInput";
import OutputDisplay from "./components/OutputDisplay";
import DownloadButtons from "./components/DownloadButtons";
import StreamSelector from "./components/StreamSelector";
import "./App.css";

// ── Material types (3 only) ──────────────────────────────────────────────────
const MATERIAL_TYPES = [
  { id: "Question paper", label: "Question Paper", icon: "📝", iconBg: "#eef1fd" },
  { id: "Worksheet",      label: "Worksheet",      icon: "✏️", iconBg: "#fff8e7" },
  { id: "Lesson plan",    label: "Lesson Plan",    icon: "📖", iconBg: "#e9faf1" },
];

const DIFFICULTY_LEVELS = [
  { id: "easy",   label: "Easy"   },
  { id: "medium", label: "Medium" },
  { id: "hard",   label: "Hard"   },
];

// ── Progress filler text ─────────────────────────────────────────────────────
function getFillerText(progress: number): string {
  if (progress < 20)  return "Analyzing chapters...";
  if (progress < 40)  return "Retrieving context...";
  if (progress < 60)  return "Crafting questions...";
  if (progress < 75)  return "Ensuring every chapter is covered...";
  if (progress < 90)  return "Formatting section marks...";
  if (progress < 100) return "Almost done! Reviewing for quality...";
  return "Generated Output!";
}

// ── Entertainment messages ───────────────────────────────────────────────────
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
  "Language Trivia: The word 'school' comes from the Greek word “scholē”, which meant “leisure.” 🤯",
  "Did you Know: The co-developer, Rohan, has over a million Spider-Man merchandise lying around him right now.",
];

// ── Component ────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [grade, setGrade]               = useState<string>("1");
  const [stream, setStream]             = useState<string>("");
  const [chapter, setChapter]           = useState<string>("");
  const [materialType, setMaterialType] = useState<string>("Question paper");
  const [difficulty, setDifficulty]     = useState<string>("easy");
  const [maxMarks, setMaxMarks]         = useState<number | "">(40);
  const [output, setOutput]             = useState<string>("");
  const [generating, setGenerating]     = useState<boolean>(false);
  const [progress, setProgress]         = useState<number>(0);
  const [entertainmentIdx, setEntertainmentIdx] = useState<number>(0);
  const entertainmentIntervalRef = useRef<number | null>(null);
  const progressIntervalRef      = useRef<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const needsStream =
    grade === "Grade 11" || grade === "Grade 12" ||
    grade === "11"       || grade === "12";

  const isQuestionPaper = materialType.trim().toLowerCase() === "question paper";
  const isLessonPlan    = materialType.trim().toLowerCase() === "lesson plan";

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMaterialTypeChange = (type: string) => {
    setMaterialType(type);
    if (type.trim().toLowerCase() === "lesson plan") {
      setDifficulty("");
    } else if (difficulty === "") {
      setDifficulty("easy");
    }
  };

  const handleDownloadPDF = async () => {
    const res = await fetch("http://localhost:8000/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: output, filetype: "pdf" }),
    });
    if (!res.ok) { alert("Failed to export PDF!"); return; }
    const { file_path } = await res.json();
    window.open(`http://localhost:8000/api/download?file_path=${encodeURIComponent(file_path)}`);
  };

  const handleDownloadWord = async () => {
    const res = await fetch("http://localhost:8000/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: output, filetype: "docx" }),
    });
    if (!res.ok) { alert("Failed to export Word file!"); return; }
    const { file_path } = await res.json();
    window.open(`http://localhost:8000/api/download?file_path=${encodeURIComponent(file_path)}`);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setOutput("");
    setProgress(0);
    setEntertainmentIdx(Math.floor(Math.random() * ENTERTAINMENT_MESSAGES.length));

    if (entertainmentIntervalRef.current !== null) {
      clearInterval(entertainmentIntervalRef.current);
    }
    entertainmentIntervalRef.current = window.setInterval(() => {
      setEntertainmentIdx(idx => (idx + 1) % ENTERTAINMENT_MESSAGES.length);
    }, 5000);

    const params = new URLSearchParams({
      grade,
      chapter,
      material_type: materialType,
      difficulty,
    });
    if (needsStream && stream)   params.append("stream", stream);
    if (isQuestionPaper && maxMarks) params.append("max_marks", String(maxMarks));

    const eventSource = new window.EventSource(
      `http://localhost:8000/api/generate_stream?${params.toString()}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.progress === "number") setProgress(data.progress);
        if (data.output) {
          setOutput(
            `Generated ${materialType} (Grade: ${grade}` +
            `${needsStream && stream ? `, Stream: ${stream}` : ""}, ` +
            `Chapter: ${chapter}, Difficulty: ${difficulty}` +
            `${isQuestionPaper && maxMarks ? `, Max Marks: ${maxMarks}` : ""})\n\n` +
            data.output
          );
          setGenerating(false);
          setProgress(100);
          eventSource.close();
          if (entertainmentIntervalRef.current !== null)
            clearInterval(entertainmentIntervalRef.current);
        }
        if (data.error) {
          alert("Error: " + data.error);
          setGenerating(false);
          setProgress(100);
          eventSource.close();
          if (entertainmentIntervalRef.current !== null)
            clearInterval(entertainmentIntervalRef.current);
        }
      } catch (_) { /* ignore parse errors */ }
    };

    eventSource.onerror = () => {
      setGenerating(false);
      eventSource.close();
      if (entertainmentIntervalRef.current !== null)
        clearInterval(entertainmentIntervalRef.current);
      alert("An error occurred while generating the material.");
    };
  };

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { if (!needsStream) setStream(""); }, [grade]); // eslint-disable-line
  useEffect(() => { if (generating) setProgress(0); }, [generating]);
  useEffect(() => {
    if (output) {
      setProgress(100);
      if (entertainmentIntervalRef.current !== null)
        clearInterval(entertainmentIntervalRef.current);
    }
  }, [output]);
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current      !== null) clearInterval(progressIntervalRef.current);
      if (entertainmentIntervalRef.current !== null) clearInterval(entertainmentIntervalRef.current);
    };
  }, []);

  const isDisabled =
    !chapter ||
    generating ||
    (isQuestionPaper && (!maxMarks || isNaN(Number(maxMarks)) || Number(maxMarks) < 1)) ||
    (needsStream && !stream);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-root">

      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-logo">DIRO<span>.ai</span></div>
        <div className="topbar-right">
          <span className="topbar-sub">Material Generation</span>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <span>{theme === "light" ? "🌙" : "☀️"}</span>
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="hero">
        <h1>Create Teaching Materials</h1>
        <p>Generate question papers, worksheets &amp; lesson plans — tailored to your grade and chapter.</p>
      </div>

      {/* ── Main form card ── */}
      <div className="card-pull">
        <div className="main-card">
          <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>

            {/* Class details */}
            <div className="section-label">Class details</div>
            <div className="field-row">
              <div className="field">
                <label>Grade</label>
                <GradeSelector value={grade} onChange={setGrade} />
              </div>
              <div className="field">
                <label>Chapter / Topic</label>
                <ChapterInput value={chapter} onChange={setChapter} />
              </div>
            </div>

            {needsStream && (
              <div className="field-row">
                <div className="field field-full">
                  <label>Stream</label>
                  <StreamSelector value={stream} onChange={setStream} />
                </div>
              </div>
            )}

            <div className="divider" />

            {/* Material type tiles */}
            <div className="section-label">Material type</div>
            <div className="type-grid">
              {MATERIAL_TYPES.map(m => (
                <div
                  key={m.id}
                  className={`type-btn${materialType.toLowerCase() === m.id.toLowerCase() ? " active" : ""}`}
                  onClick={() => handleMaterialTypeChange(m.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && handleMaterialTypeChange(m.id)}
                >
                  <div className="type-icon" style={{ background: m.iconBg }}>{m.icon}</div>
                  <div className="type-name">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Difficulty pills — hidden for Lesson Plan */}
            {!isLessonPlan && (
              <>
                <div className="section-label">Difficulty</div>
                <div className="difficulty-row">
                  {DIFFICULTY_LEVELS.map(d => (
                    <div
                      key={d.id}
                      className={`diff-btn ${d.id}${difficulty === d.id ? " active" : ""}`}
                      onClick={() => setDifficulty(d.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === "Enter" && setDifficulty(d.id)}
                    >
                      {d.label}
                    </div>
                  ))}
                </div>
                <div className="divider" />
              </>
            )}

            {/* Max marks slider — only for Question Paper */}
            {isQuestionPaper && (
              <>
                <div className="section-label">Maximum marks</div>
                <div className="marks-row">
                  <label>Marks</label>
                  <div className="marks-slider">
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={maxMarks || 40}
                      onChange={e => setMaxMarks(Number(e.target.value))}
                    />
                  </div>
                  <div className="marks-value">{maxMarks || 40}</div>
                </div>
              </>
            )}

            {/* Generate button */}
            <button className="gen-btn" type="submit" disabled={isDisabled}>
              {generating ? (
                <><span className="generate-spinner" />Generating...</>
              ) : (
                <><span>Generate Material</span><span className="star">✦</span></>
              )}
            </button>

          </form>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {(generating || progress > 0) && (
        <div className="card-pull progress-area">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                transition: generating
                  ? "width 0.45s cubic-bezier(.4,0,.2,1)"
                  : "width 0.2s",
              }}
            />
          </div>
          <div className="progress-label">
            {progress === 100 && output ? (
              <>Generated Output! <span className="progress-pct">(100%)</span></>
            ) : (
              <>{getFillerText(progress)} <span className="progress-pct">({Math.round(progress)}%)</span></>
            )}
          </div>
          {generating && (
            <div className="entertainment-text">
              {ENTERTAINMENT_MESSAGES[entertainmentIdx]}
            </div>
          )}
        </div>
      )}

      {/* ── Output ── */}
      {output && (
        <div className="card-pull output-area">
          <div className="output-card">
            <div className="output-header">
              <div className="output-title">Generated Output</div>
            </div>
            <OutputDisplay title="" content={output} />
            <DownloadButtons
              onDownloadPDF={handleDownloadPDF}
              onDownloadWord={handleDownloadWord}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
