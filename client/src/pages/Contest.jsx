import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";

// Configuration
const BACKEND_URL = "http://localhost:3100";
const socket = io(BACKEND_URL);

const LANGUAGE_IDS = {
  python: 71, 
  cpp: 54,    
  java: 62,   
};

export default function Contest({ session }) {
  // --- STATE ---
  const [language, setLanguage] = useState("python");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [codes, setCodes] = useState({});
  
  // Execution State
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState(""); 
  const [isRunning, setIsRunning] = useState(false);
  const [execTime, setExecTime] = useState(null);
  const [statusMessage, setStatusMessage] = useState(""); 

  // UI State
  const [isPanelExpanded, setIsPanelExpanded] = useState(false); // Controls bottom panel height
  
  const isWaitingForResponse = useRef(false);

  /* ---------------- SOCKET LOGIC ---------------- */
  useEffect(() => {
    if (session?.userId) {
        socket.emit("join_user", session.userId);
    }

    const handleSubmissionResult = (data) => {
      console.log("Socket received:", data);

      if (!isWaitingForResponse.current) return;

      setIsRunning(false);
      isWaitingForResponse.current = false;

      // Handle Output
      if (data.status === "ACCEPTED") {
        const cleanOutput = data.stdout ? data.stdout.trimEnd() : "Program finished successfully (No Output).";
        setOutput(cleanOutput);
        setExecTime(data.time);
        setStatusMessage("Success");
      } else {
        const errorMsg = data.stderr || data.error || data.stdout || "Unknown Error";
        setOutput(errorMsg);
        setStatusMessage(`Error: ${data.status}`);
      }
    };

    socket.on("submission_result", handleSubmissionResult);

    return () => {
      socket.off("submission_result", handleSubmissionResult);
    };
  }, [session.userId]);

  /* ---------------- HANDLERS ---------------- */
  async function openQuestion(q) {
    setCurrentQuestion(q);
    setStatusMessage("");
    setOutput(""); 
    setExecTime(null);
    setIsPanelExpanded(false); // Collapse panel when switching questions
  }

  async function handleRun() {
    if (!currentQuestion) {
        alert("Please select a question first.");
        return;
    }
    
    // 1. EXPAND PANEL & SHOW "RUNNING"
    setIsPanelExpanded(true); 
    setIsRunning(true);
    setOutput("Executing...");
    setExecTime(null);
    setStatusMessage("Running...");
    
    isWaitingForResponse.current = true; 

    const code = codes[currentQuestion.id] || "";
    const langId = LANGUAGE_IDS[language];

    try {
      await axios.post(`${BACKEND_URL}/submit`, {
        user_id: session.userId,
        problem_id: currentQuestion.id,
        language_id: langId,
        source_code: code,
        stdin: customInput 
      });
    } catch (error) {
      console.error(error);
      setIsRunning(false);
      setOutput("Connection Error: Is the backend server running?\n" + error.message);
      isWaitingForResponse.current = false;
    }
  }

  async function submit() {
    alert("Submit functionality is disabled. Please use 'Run' to test your code.");
  }

  /* ================= UI RENDER ================= */
  return (
    <div className="h-screen flex flex-col bg-[#1a0805] text-white font-['Space_Grotesk']">

      {/* HEADER */}
      <header className="h-14 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-md shrink-0">
        <div>
          <h3 className="font-bold text-orange-500">{session.team || "Team Name"}</h3>
          <p className="text-xs text-white/50">{session.college || "College"}</p>
        </div>
        <div className="text-orange-500 font-mono font-bold tracking-widest">
            00:00:00
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-[350px] bg-black/20 border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold text-orange-500/50 uppercase tracking-widest mb-2">
                Mission Objectives
            </h3>
            <div className="flex flex-col gap-2">
                {(session.questions || []).map((q, i) => (
                    <button
                    key={q.id}
                    onClick={() => openQuestion(q)}
                    className={`w-full text-left px-4 py-3 rounded border transition-all duration-200
                        ${currentQuestion?.id === q.id 
                        ? "bg-orange-500/10 border-orange-500 text-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                        : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white"}`}
                    >
                    <span className="text-xs font-mono opacity-50 mr-2">#{i + 1}</span>
                    {q.title}
                    </button>
                ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {currentQuestion ? (
              <>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {currentQuestion.title}
                </h2>
                <div className="h-1 w-10 bg-orange-500 mt-2 mb-6"/>
                <p className="text-white/70 leading-relaxed font-sans text-sm">
                  {currentQuestion.description}
                </p>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20">
                <span className="text-4xl mb-2">⚡</span>
                <p>Select a transmission to decode</p>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN AREA */}
        <section className="flex-1 flex flex-col min-w-0">

          {/* LANGUAGE BAR */}
          <div className="h-10 border-b border-white/10 bg-black/40 flex items-center justify-between px-4 shrink-0">
            <span className="text-xs font-bold text-orange-500/50 uppercase tracking-widest">
              source_code.{language}
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border border-white/20 text-xs px-3 py-1 rounded text-white/70 focus:border-orange-500 outline-none"
            >
              <option value="python" className="text-black">Python</option>
              <option value="cpp" className="text-black">C++</option>
              <option value="java" className="text-black">Java</option>
            </select>
          </div>

          {/* EDITOR (Flex-1 to take remaining space) */}
          <div className="flex-1 relative bg-[#050303] min-h-0">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              theme="vs-dark"
              value={currentQuestion ? codes[currentQuestion.id] || "" : ""}
              onChange={(value) =>
                currentQuestion &&
                setCodes(prev => ({ ...prev, [currentQuestion.id]: value || "" }))
              }
              options={{
                fontSize: 15,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 }
              }}
            />
          </div>

          {/* BOTTOM PANEL (Persistent Container) */}
          <div 
            className={`border-t border-white/10 bg-[#0a0505] flex flex-col transition-all duration-300 ease-in-out shrink-0
              ${isPanelExpanded ? "h-[300px]" : "h-16"}`} // Collapsed: 64px, Expanded: 300px
          >
            {/* CONTROL BAR */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
              <button 
                onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition"
              >
                <span>{isPanelExpanded ? "▼ Collapse" : "▲ Expand Console"}</span>
              </button>

              <div className="text-xs font-mono">
                {statusMessage && (
                   <span className={statusMessage.includes("Error") ? "text-red-500" : "text-emerald-500"}>
                     {statusMessage} {execTime && `(${execTime}s)`}
                   </span>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className={`px-6 py-1.5 border text-xs font-bold rounded transition uppercase tracking-wider flex items-center gap-2
                      ${isRunning 
                          ? "border-white/10 text-white/30 cursor-wait"
                          : "border-orange-500/50 text-orange-500 hover:bg-orange-500/10"}`}
                >
                  {isRunning && <span className="animate-spin">⟳</span>}
                  {isRunning ? "Running..." : "Run Code"}
                </button>

                <button
                  onClick={submit}
                  className="px-8 py-1.5 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-500 shadow-lg shadow-orange-600/20 transition uppercase tracking-wider"
                >
                  Submit
                </button>
              </div>
            </div>

            {/* EXPANDED CONTENT (Input / Output Split) */}
            <div className={`flex-1 flex overflow-hidden ${!isPanelExpanded && "hidden"}`}>
              
              {/* LEFT: INPUT */}
              <div className="w-1/2 border-r border-white/10 flex flex-col p-4">
                <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">
                  Input
                </h3>
                <textarea 
                  className="flex-1 w-full bg-white/5 p-3 font-mono text-sm text-white/80 resize-none outline-none border border-white/10 rounded focus:border-orange-500/50"
                  placeholder="Enter input here..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                />
              </div>

              {/* RIGHT: OUTPUT */}
              <div className="w-1/2 flex flex-col p-4 bg-black/20">
                <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">
                  Output
                </h3>
                <div className="flex-1 w-full overflow-auto rounded border border-white/5 bg-[#050303] p-3">
                  <pre className={`font-mono text-sm whitespace-pre-wrap ${output.toLowerCase().includes("error") ? "text-red-400" : "text-emerald-400"}`}>
                    {output || <span className="text-white/20 italic">Run code to see output...</span>}
                  </pre>
                </div>
              </div>

            </div>
          </div>

        </section>
      </div>
    </div>
  );
}