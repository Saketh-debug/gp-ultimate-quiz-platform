import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:3000");

export default function Contest({ session }) {

  const [language, setLanguage] = useState("python");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [codes, setCodes] = useState({});
  const [message, setMessage] = useState("");

  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(160);
  const [activeTab, setActiveTab] = useState("console");

  const dragRef = useRef(false);

  /* ---------------- SOCKET (UNCHANGED) ---------------- */
  useEffect(() => {
    socket.emit("register", { userId: session.userId });

    socket.on("force_logout", () => {
      alert("This token was used on another device.");
      window.location.reload();
    });

    return () => socket.off("force_logout");
  }, [session.userId]);

  /* ---------------- OPEN QUESTION (UNCHANGED) ---------------- */
  async function openQuestion(q) {
    setCurrentQuestion(q);
    setMessage("");

    await fetch("http://localhost:3000/question/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.userId,
        questionId: q.id,
      }),
    });
  }

  /* ---------------- SUBMIT (UNCHANGED) ---------------- */
  async function submit() {
    if (!currentQuestion) return;

    const code = codes[currentQuestion.id] || "";

    const res = await fetch("http://localhost:3000/question/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.userId,
        questionId: currentQuestion.id,
        code,
        language,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage(`Accepted in ${data.timeTaken}s, +${data.score} points`);
      setActiveTab("result");
      setConsoleOpen(true);
    } else {
      setMessage(data.message || "Submission failed");
      setActiveTab("console");
      setConsoleOpen(true);
    }
  }

  /* ---------------- Console Resize ---------------- */
  function startDrag() {
    dragRef.current = true;
  }

  function stopDrag() {
    dragRef.current = false;
  }

  function onDrag(e) {
    if (!dragRef.current) return;
    setConsoleHeight(prev =>
      Math.max(120, prev - e.movementY)
    );
  }

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, []);

  /* ================= UI ================= */

  return (
    <div className="h-screen flex flex-col bg-background-dark text-martian-text font-display">

      {/* HEADER */}
      <header className="h-14 bg-panel-dark border-b border-border-dark flex items-center justify-between px-6">
        <div>
          <h3 className="font-bold text-white">{session.team}</h3>
          <p className="text-xs text-martian-muted">{session.college}</p>
        </div>

        <div className="text-primary font-mono font-bold">
          Ends at {new Date(session.endTime).toLocaleTimeString()}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <aside className="w-[420px] bg-panel-dark border-r border-border-dark flex flex-col">

          <div className="p-4 border-b border-border-dark">
            <select
              className="w-full bg-background-dark border border-border-dark rounded px-3 py-2"
              value={currentQuestion?.id || ""}
              onChange={(e) =>
                openQuestion(
                  session.questions.find(q => q.id === e.target.value)
                )
              }
            >
              <option value="">Select Question</option>
              {session.questions.map((q, i) => (
                <option key={q.id} value={q.id}>
                  Q{i + 1}. {q.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {currentQuestion ? (
              <>
                <h2 className="text-xl font-bold text-white">
                  {currentQuestion.title}
                </h2>
                <p className="mt-4 text-martian-muted">
                  {currentQuestion.description}
                </p>
              </>
            ) : (
              <p className="text-martian-muted">
                Select a question to begin
              </p>
            )}
          </div>
        </aside>

        {/* EDITOR */}
        <section className="flex-1 flex flex-col">

          {/* Editor Top */}
          <div className="h-10 border-b border-border-dark bg-panel-dark flex items-center justify-between px-4">
            <span className="text-xs font-bold">
              solution.{language}
            </span>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-border-dark/50 border border-border-dark text-xs px-3 py-1 rounded"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Editor */}
          <div className="flex-1 bg-[#050303]">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              theme="vs-dark"
              value={currentQuestion ? codes[currentQuestion.id] || "" : ""}
              onChange={(value) =>
                currentQuestion &&
                setCodes(prev => ({
                  ...prev,
                  [currentQuestion.id]: value || "",
                }))
              }
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Bottom Controls */}
          <div className="h-12 border-t border-border-dark bg-panel-dark flex items-center justify-between px-4">
            <button
              onClick={() => setConsoleOpen(!consoleOpen)}
              className="text-xs font-bold uppercase text-martian-muted hover:text-primary"
            >
              Console
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setConsoleOpen(true)}
                className="px-4 py-1 border border-primary text-primary text-xs font-bold rounded"
              >
                Run
              </button>

              <button
                onClick={submit}
                className="px-6 py-1 bg-primary text-white text-xs font-bold rounded"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Console */}
          {consoleOpen && (
            <div style={{ height: consoleHeight }} className="bg-black border-t border-border-dark flex flex-col">

              {/* Drag Bar */}
              <div
                onMouseDown={startDrag}
                className="h-2 cursor-row-resize bg-border-dark"
              />

              {/* Tabs */}
              <div className="flex border-b border-border-dark">
                <button
                  onClick={() => setActiveTab("console")}
                  className={`px-4 py-2 text-xs font-bold ${
                    activeTab === "console"
                      ? "text-primary"
                      : "text-martian-muted"
                  }`}
                >
                  Console
                </button>

                <button
                  onClick={() => setActiveTab("result")}
                  className={`px-4 py-2 text-xs font-bold ${
                    activeTab === "result"
                      ? "text-primary"
                      : "text-martian-muted"
                  }`}
                >
                  Result
                </button>
              </div>

              <div className="flex-1 p-4 font-mono text-sm text-martian-accent overflow-auto">
                {message || "Console ready."}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* STATUS BAR */}
      <div className="h-6 bg-primary text-black text-[10px] px-4 flex justify-between items-center font-bold">
        <span>{language.toUpperCase()} • UTF-8 • 4 Spaces</span>
        <span>Martian Runtime Active</span>
      </div>
    </div>
  );
}
