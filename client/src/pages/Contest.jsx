import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { 
  FiPlay, FiUpload, FiSettings, FiUser, FiClock, 
  FiChevronLeft, FiChevronRight, FiList, FiTerminal,
  FiFileText, FiCheckCircle, FiCode, FiZap
} from "react-icons/fi";

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
  const [currentQuestion, setCurrentQuestion] = useState(session.questions?.[0] || null);
  const [codes, setCodes] = useState({});
  
  // Execution State
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState(""); 
  const [isRunning, setIsRunning] = useState(false);
  const [execTime, setExecTime] = useState(null);
  const [statusMessage, setStatusMessage] = useState(""); 

  // UI State
  const [leftTab, setLeftTab] = useState("description"); // description, editorial, solutions, submissions
  const [rightTab, setRightTab] = useState("testcase"); // testcase, result
  const [isProblemListOpen, setIsProblemListOpen] = useState(false);
  
  // Resizing State
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [editorHeight, setEditorHeight] = useState(60); // percentage
  const isResizingHorizontal = useRef(false);
  const isResizingVertical = useRef(false);
  
  const isWaitingForResponse = useRef(false);

  /* ---------------- RESIZING LOGIC ---------------- */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingHorizontal.current) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) {
          setLeftPanelWidth(newWidth);
        }
      }
      
      if (isResizingVertical.current) {
        const container = document.getElementById("right-panel-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
          if (newHeight > 20 && newHeight < 85) {
            setEditorHeight(newHeight);
          }
        }
      }
    };

    const handleMouseUp = () => {
      isResizingHorizontal.current = false;
      isResizingVertical.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startHorizontalResize = () => {
    isResizingHorizontal.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startVerticalResize = () => {
    isResizingVertical.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  /* ---------------- SOCKET LOGIC ---------------- */
useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    socket.emit("register", { token });
  }

  const handleSubmissionResult = (data) => {
    console.log("Socket received:", data);

    if (!isWaitingForResponse.current) return;

    setIsRunning(false);
    isWaitingForResponse.current = false;
    setRightTab("result");

    if (data.status === "ACCEPTED") {
      const cleanOutput = data.stdout
        ? data.stdout.trimEnd()
        : "Program finished successfully (No Output).";

      setOutput(cleanOutput);
      setExecTime(data.time);
      setStatusMessage("Accepted");
    } else {
      const errorMsg =
        data.stderr || data.error || data.stdout || "Unknown Error";

      setOutput(errorMsg);
      setStatusMessage(data.status || "Runtime Error");
    }
  };

  // ✅ NEW: force logout listener
  const handleForceLogout = () => {
    alert("You logged in from another device.");

    localStorage.removeItem("token");

    window.location.href = "/";
  };

  socket.on("submission_result", handleSubmissionResult);
  socket.on("force_logout", handleForceLogout);

  return () => {
    socket.off("submission_result", handleSubmissionResult);
    socket.off("force_logout", handleForceLogout);
  };
}, []);



  /* ---------------- HANDLERS ---------------- */
  function openQuestion(q) {
    setCurrentQuestion(q);
    setStatusMessage("");
    setOutput(""); 
    setExecTime(null);
    setLeftTab("description");
    setIsProblemListOpen(false);
  }

  async function handleRun() {
    if (!currentQuestion) {
        alert("Please select a question first.");
        return;
    }
    
    setIsRunning(true);
    setRightTab("result");
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
    <div className="h-screen flex flex-col bg-[#1a1a1a] text-[#eff1f6] font-sans overflow-hidden">

      {/* TOP NAVIGATION BAR */}
      <nav className="h-[50px] bg-[#282828] border-b border-[#3e3e3e] flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4 relative">
          <div 
            onClick={() => setIsProblemListOpen(!isProblemListOpen)}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white cursor-pointer transition py-2"
          >
            <FiList className="text-lg" />
            <span>Problem List</span>
          </div>
          
          {/* DROPDOWN PROBLEM LIST */}
          {isProblemListOpen && (
            <div className="absolute top-12 left-0 w-80 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 bg-[#333333] border-b border-[#3e3e3e] text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Select Mission
                </div>
                <div className="max-h-96 overflow-y-auto py-1">
                    {(session.questions || []).map((q, i) => (
                        <button
                            key={q.id}
                            onClick={() => openQuestion(q)}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-[#3e3e3e] transition-colors flex items-center gap-3
                                ${currentQuestion?.id === q.id ? "text-orange-500 bg-[#333333]" : "text-gray-300"}`}
                        >
                            <span className="text-xs font-mono opacity-40">0{i + 1}</span>
                            <span className="truncate">{q.title}</span>
                            {currentQuestion?.id === q.id && <FiZap className="ml-auto text-orange-500" />}
                        </button>
                    ))}
                </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-400">
            <FiChevronLeft className="cursor-pointer hover:text-white" />
            <FiChevronRight className="cursor-pointer hover:text-white" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#3e3e3e] hover:bg-[#4e4e4e] rounded text-sm font-medium transition disabled:opacity-50 min-w-[80px] justify-center"
          >
            <FiPlay className={`text-xs ${isRunning ? 'animate-pulse' : 'text-green-500 fill-green-500'}`} />
            <span>{isRunning ? "Running" : "Run"}</span>
          </button>
          <button
            onClick={submit}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#3e3e3e] hover:bg-[#4e4e4e] text-orange-500 rounded text-sm font-bold transition"
          >
            <FiUpload className="text-xs" />
            <span>Submit</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <FiSettings className="cursor-pointer hover:text-white" />
          <div className="flex items-center gap-2 text-sm font-mono bg-[#333333] px-3 py-1 rounded-full text-orange-400 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
            <FiClock />
            <span>00:00:00</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white cursor-pointer group transition">
            <span className="text-xs font-medium hidden md:block text-gray-400 group-hover:text-white">{session.team || "Team"}</span>
            <div className="w-8 h-8 rounded-full bg-[#3e3e3e] flex items-center justify-center border border-[#4e4e4e]">
              <FiUser />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden p-2 gap-0 bg-[#1a1a1a]">

        {/* LEFT PANEL: PROBLEM DESCRIPTION */}
        <div 
          style={{ width: `${leftPanelWidth}%` }}
          className="flex flex-col bg-[#282828] rounded-xl overflow-hidden border border-[#3e3e3e] shadow-lg shrink-0"
        >
          {/* Tabs Header */}
          <div className="h-10 bg-[#333333] flex items-center px-2 shrink-0 border-b border-[#3e3e3e]">
            {[
              { id: "description", label: "Description", icon: <FiFileText /> },
              { id: "submissions", label: "Submissions", icon: <FiClock /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id)}
                className={`flex items-center gap-2 px-4 h-full text-xs font-medium border-b-2 transition
                  ${leftTab === tab.id ? "border-orange-500 text-white bg-[#282828]" : "border-transparent text-gray-400 hover:text-gray-200"}`}
              >
                <span className={leftTab === tab.id ? "text-orange-500" : ""}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#4e4e4e]">
            {currentQuestion ? (
              <div className="max-w-3xl">
                <h1 className="text-2xl font-black mb-3 tracking-tight">
                  {currentQuestion.title}
                </h1>
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">Easy</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer hover:text-gray-300 transition">
                    <FiSettings className="rotate-90 text-[10px]" /> Topics
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer hover:text-gray-300 transition">
                    <FiUser className="text-[10px]" /> Companies
                  </span>
                </div>

                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-[#eff1f6] leading-relaxed mb-8 whitespace-pre-wrap font-sans text-sm opacity-90">
                    {currentQuestion.description}
                  </p>
                  
                  {/* Mock Examples if description doesn't have them */}
                  {!currentQuestion.description?.includes("Example") && (
                    <div className="space-y-6">
                      <div className="bg-[#333333]/50 p-5 rounded-xl border border-[#3e3e3e]">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-orange-500/80">Example 1:</h4>
                        <div className="font-mono text-sm space-y-2">
                          <div className="flex gap-2">
                            <span className="text-gray-500 font-bold w-12 shrink-0">Input:</span>
                            <code className="text-gray-300">nums = [2,7,11,15], target = 9</code>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500 font-bold w-12 shrink-0">Output:</span>
                            <code className="text-gray-300">[0,1]</code>
                          </div>
                          <div className="flex gap-2 mt-2 pt-2 border-t border-white/5 text-xs text-gray-400 italic">
                            <span>Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 rounded-full bg-[#333333] flex items-center justify-center mb-4 border border-[#3e3e3e]">
                    <FiList className="text-2xl opacity-50" />
                </div>
                <p className="text-sm font-medium">Select a mission from the list</p>
              </div>
            )}
          </div>
        </div>

        {/* HORIZONTAL RESIZE HANDLE */}
        <div 
          onMouseDown={startHorizontalResize}
          className="w-2 hover:bg-orange-500/30 cursor-col-resize transition-colors duration-200 z-10 flex items-center justify-center group"
        >
          <div className="w-[3px] h-12 bg-gray-600 group-hover:bg-orange-500" />
        </div>

        {/* RIGHT PANEL: EDITOR & CONSOLE */}
        <div 
          id="right-panel-container"
          style={{ width: `${100 - leftPanelWidth}%` }}
          className="flex flex-col gap-0 min-w-0 shrink-0"
        >
          
          {/* TOP: EDITOR SECTION */}
          <div 
            style={{ height: `${editorHeight}%` }}
            className="flex flex-col bg-[#282828] rounded-xl overflow-hidden border border-[#3e3e3e] shadow-lg relative shrink-0"
          >
            <div className="h-10 bg-[#333333] flex items-center justify-between px-3 shrink-0 border-b border-[#3e3e3e]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#282828] border border-[#3e3e3e]">
                    <FiCode className="text-xs text-orange-500" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent text-[11px] font-bold text-gray-300 outline-none cursor-pointer hover:text-white transition uppercase tracking-wider"
                    >
                        <option value="python" className="bg-[#282828]">Python</option>
                        <option value="cpp" className="bg-[#282828]">C++</option>
                        <option value="java" className="bg-[#282828]">Java</option>
                    </select>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <FiSettings className="text-sm cursor-pointer hover:text-white" />
              </div>
            </div>
            
            <div className="flex-1 relative bg-[#1e1e1e]">
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
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                  cursorStyle: 'block',
                  lineHeight: 22,
                  renderLineHighlight: 'all'
                }}
              />
            </div>
          </div>

          {/* VERTICAL RESIZE HANDLE */}
          <div 
            onMouseDown={startVerticalResize}
            className="h-2 hover:bg-orange-500/30 cursor-row-resize transition-colors duration-200 z-10 flex items-center justify-center group shrink-0"
          >
            <div className="h-[1px] w-8 bg-gray-600 group-hover:bg-orange-500" />
          </div>

          {/* BOTTOM: CONSOLE SECTION */}
          <div 
            style={{ height: `${100 - editorHeight}%` }}
            className="flex flex-col bg-[#282828] rounded-xl overflow-hidden border border-[#3e3e3e] shadow-lg shrink-0"
          >
            <div className="h-10 bg-[#333333] flex items-center px-2 shrink-0 border-b border-[#3e3e3e] justify-between">
              <div className="flex h-full">
                <button
                  onClick={() => setRightTab("testcase")}
                  className={`flex items-center gap-2 px-4 h-full text-xs font-medium border-b-2 transition
                    ${rightTab === "testcase" ? "border-orange-500 text-white bg-[#282828]" : "border-transparent text-gray-400 hover:text-gray-200"}`}
                >
                  <FiTerminal className={rightTab === "testcase" ? "text-orange-500" : "text-green-500"} />
                  Testcase
                </button>
                <button
                  onClick={() => setRightTab("result")}
                  className={`flex items-center gap-2 px-4 h-full text-xs font-medium border-b-2 transition
                    ${rightTab === "result" ? "border-orange-500 text-white bg-[#282828]" : "border-transparent text-gray-400 hover:text-gray-200"}`}
                >
                  <FiZap className={rightTab === "result" ? "text-orange-500" : "text-blue-500"} />
                  Test Result
                </button>
              </div>
              <div className="px-3">
                 {statusMessage && (
                   <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${statusMessage === "Accepted" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                            {statusMessage}
                        </span>
                        {execTime && <span className="text-[10px] text-gray-500 font-mono">{execTime}s</span>}
                   </div>
                 )}
              </div>
            </div>

            <div className="flex-1 p-4 overflow-hidden flex flex-col bg-[#1a1a1a]/50">
              {rightTab === "testcase" ? (
                <div className="flex flex-col h-full">
                  <span className="text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-widest">Execution Input</span>
                  <textarea 
                    className="flex-1 w-full bg-[#1e1e1e] p-4 font-mono text-sm text-gray-300 resize-none outline-none border border-[#3e3e3e] rounded-lg focus:border-orange-500/30 transition shadow-inner"
                    placeholder="Enter custom input here..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex flex-col h-full">
                   <span className="text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-widest">System Output</span>
                   <div className="flex-1 w-full bg-[#1e1e1e] p-4 font-mono text-sm rounded-lg border border-[#3e3e3e] overflow-auto shadow-inner">
                      {isRunning ? (
                        <div className="flex items-center gap-3 text-orange-500/50 italic animate-pulse">
                          <FiPlay className="animate-spin text-xs" />
                          <span className="text-xs uppercase tracking-widest font-bold">Processing transmission...</span>
                        </div>
                      ) : (
                        <pre className={`whitespace-pre-wrap ${statusMessage === "Accepted" ? "text-gray-300" : "text-red-400"}`}>
                          {output || <span className="text-gray-700 italic opacity-50">Transmit code to receive feedback</span>}
                        </pre>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}