import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FiPlay, FiUpload, FiCheckCircle, FiClock, FiTerminal, FiZap, FiCode, FiList, FiFileText
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LANGUAGE_IDS, getCodeOrBoilerplate, saveCode, clearCodeStorage,
    saveLastLanguage, getLastLanguage
} from "../utils/codeStorage";

// Configuration
const BACKEND_URL = import.meta.env.VITE_API_URL;
const SUBMISSION_URL = import.meta.env.VITE_SUBMISSION_URL;
const socket = io(SUBMISSION_URL);
const backendSocket = io(BACKEND_URL);

const STORAGE_PREFIX = "dsa";

export default function DSAContest({ session }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Read session from prop or location state
    const initialSession = session || location.state?.session || null;
    const [activeSession, setActiveSession] = useState(initialSession);

    // Context & State
    const [questions, setQuestions] = useState(initialSession?.questions || []);
    const [currentIndex, setCurrentIndex] = useState(0); // The user can change this freely
    const [isInitializing, setIsInitializing] = useState(true);

    const currentQuestion = questions[currentIndex];

    // Stats
    const [totalScore, setTotalScore] = useState(initialSession?.totalScore || 0);

    // Code & Editor
    const [language, setLanguage] = useState(getLastLanguage());
    const [codes, setCodes] = useState({});
    const [customInput, setCustomInput] = useState("");

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [rightTab, setRightTab] = useState("result");
    const isWaitingForResponse = useRef(false);
    const lastAction = useRef(null);

    // Timer & Admin Control
    const [totalTimeLeft, setTotalTimeLeft] = useState(null); // null = loading, seeded from server
    const [contestStopped, setContestStopped] = useState(false);
    const isSyncingRef = useRef(false); // Guard for visibility re-sync

    // Resizing State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
    const [editorHeight, setEditorHeight] = useState(60); // percentage
    const isResizingHorizontal = useRef(false);
    const isResizingVertical = useRef(false);

    // Admin Stop Listener
    useEffect(() => {
        const handleRoundStopped = (data) => {
            if (data.roundName === "dsa") {
                setContestStopped(true);
            }
        };
        backendSocket.on("round_stopped", handleRoundStopped);
        return () => backendSocket.off("round_stopped", handleRoundStopped);
    }, []);

    // Init & Resume Handling
    useEffect(() => {
        const initSession = async () => {
            const token = localStorage.getItem("dsaToken");
            if (!token) {
                navigate("/dsa");
                return;
            }

            try {
                const res = await fetch(`${BACKEND_URL}/dsa/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();

                if (res.ok) {
                    setActiveSession(data);
                } else {
                    alert(data.error || "Session expired");
                    navigate("/dsa");
                }
            } catch (err) {
                navigate("/dsa");
            } finally {
                setIsInitializing(false);
            }
        };

        // Always fetch the latest state from the backend on mount
        initSession();
    }, [navigate]);

    // Update state when activeSession arrives
    useEffect(() => {
        if (activeSession) {
            const fetchedQuestions = activeSession.questions || [];
            setQuestions(fetchedQuestions);
            setTotalScore(activeSession.totalScore || 0);

            // Seed totalTimeLeft from server
            if (activeSession.totalTimeLeft != null) {
                setTotalTimeLeft(activeSession.totalTimeLeft);
            }

            // Check local storage for previously saved index
            const savedIndexStr = localStorage.getItem("dsaCurrentIndex");
            let targetIndex = -1;

            if (savedIndexStr !== null) {
                const savedIndex = parseInt(savedIndexStr, 10);
                if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < fetchedQuestions.length) {
                    // Only restore it if it is NOT accepted
                    if (fetchedQuestions[savedIndex].status !== 'ACCEPTED') {
                        targetIndex = savedIndex;
                    }
                }
            }

            // Fallback: Find the first question that is not ACCEPTED
            if (targetIndex === -1) {
                for (let i = 0; i < fetchedQuestions.length; i++) {
                    if (fetchedQuestions[i].status !== 'ACCEPTED') {
                        targetIndex = i;
                        break;
                    }
                }
                if (targetIndex === -1) targetIndex = 0; // fallback if all solved
            }

            setCurrentIndex(targetIndex);
            localStorage.setItem("dsaCurrentIndex", targetIndex);
        }
    }, [activeSession]);

    // Timer — pure decrement, no client clock dependency
    useEffect(() => {
        if (!activeSession || totalTimeLeft === null) return;

        const timer = setInterval(() => {
            setTotalTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [activeSession, totalTimeLeft !== null]);

    // Handle contest end — fires from both interval ticks and re-sync updates
    useEffect(() => {
        if (totalTimeLeft === 0 && !contestStopped) {
            alert("Contest Over! Final score transmitted.");
            clearCodeStorage(STORAGE_PREFIX);
            localStorage.removeItem("dsaToken");
            navigate("/rounds");
        }
    }, [totalTimeLeft]);

    // Visibility re-sync — re-fetch server time when tab wakes up
    useEffect(() => {
        if (!activeSession?.userId) return;

        const handleVisibilityChange = async () => {
            if (document.visibilityState !== 'visible') return;
            if (isSyncingRef.current) return;
            isSyncingRef.current = true;

            try {
                const res = await axios.post(`${BACKEND_URL}/dsa/time-check`, {
                    userId: activeSession.userId
                });
                const { totalTimeLeft: serverTotal, contestEnded } = res.data;

                if (contestEnded || serverTotal <= 0) {
                    setTotalTimeLeft(0);
                    return;
                }

                setTotalTimeLeft(serverTotal);
            } catch (e) {
                console.error("Failed to re-sync DSA timer", e);
            } finally {
                isSyncingRef.current = false;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [activeSession?.userId]);


    // Socket Listener for Submissions
    useEffect(() => {
        if (activeSession?.userId) {
            socket.emit("join_user", activeSession.userId);
        }

        const handleSubmissionResult = async (data) => {
            if (!isWaitingForResponse.current) return;

            setIsRunning(false);
            isWaitingForResponse.current = false;

            if (lastAction.current === "run") {
                const out = data.stdout || data.stderr || "No output";
                setOutput(out);
                setStatusMessage("Run Complete");
                return;
            }

            // Handle FAILED / ERROR from dispatcher
            if (data.status === 'FAILED' || data.status === 'ERROR') {
                const errorDetail = data.error || data.stderr || data.stdout || "Submission failed. Contact admin.";
                setOutput(errorDetail);
                setStatusMessage("Error");
                return;
            }

            if (data.status === "ACCEPTED") {
                setStatusMessage("Accepted");
                setOutput("Correct Answer! Points awarded.");

                // Call backend to register points
                try {
                    const res = await axios.post(`${BACKEND_URL}/dsa/submit-result`, {
                        userId: activeSession.userId,
                        questionId: currentQuestion.id
                    });

                    const scoreData = res.data;
                    setTotalScore(scoreData.totalScore);

                    // Update local question status
                    setQuestions(prev => {
                        const newQ = [...prev];
                        newQ[currentIndex].status = 'ACCEPTED';
                        return newQ;
                    });

                    // Auto-navigate to next unsolved question after 2 seconds
                    setTimeout(() => {
                        setQuestions(currentQuestions => {
                            let nextUnsolvedIndex = -1;
                            for (let i = 0; i < currentQuestions.length; i++) {
                                if (currentQuestions[i].status !== 'ACCEPTED') {
                                    nextUnsolvedIndex = i;
                                    break;
                                }
                            }

                            if (nextUnsolvedIndex !== -1) {
                                setCurrentIndex(nextUnsolvedIndex);
                                localStorage.setItem("dsaCurrentIndex", nextUnsolvedIndex);
                                setOutput("");
                                setStatusMessage("");
                                setRightTab("result");
                            } else {
                                // All questions solved
                                alert("Congratulations! You have solved all questions.");
                            }
                            return currentQuestions;
                        });
                    }, 2000);

                } catch (err) {
                    console.error("Failed to sync score", err);
                    setOutput("Score sync failed. Contact admin.");
                }
            }
            else {
                const errorDetail = data.stderr || data.stdout || "Incorrect Answer. Try again!";
                setOutput(errorDetail);
                setStatusMessage("Wrong Answer");
            }
        };

        socket.on("submission_result", handleSubmissionResult);
        return () => socket.off("submission_result", handleSubmissionResult);
    }, [activeSession?.userId, currentQuestion, currentIndex]);


    // Action: Change Question
    const handleQuestionSelect = (idx) => {
        if (isRunning) {
            alert("Wait for the current operation to finish before navigating.");
            return;
        }
        if (questions[idx]?.status === 'ACCEPTED') {
            return; // Block access
        }
        setCurrentIndex(idx);
        localStorage.setItem("dsaCurrentIndex", idx);
        setOutput("");
        setStatusMessage("");
        setRightTab("result");
    };

    // Execution Handlers
    async function handleRun() {
        if (!currentQuestion) return;
        lastAction.current = "run";
        setIsRunning(true);
        setRightTab("result");
        setOutput("Running Custom Input...");
        setStatusMessage("Running...");
        isWaitingForResponse.current = true;

        const code = codes[currentQuestion.id]?.[language] || "";
        const langId = LANGUAGE_IDS[language];

        try {
            await axios.post(`${SUBMISSION_URL}/submit`, {
                user_id: activeSession.userId,
                problem_id: currentQuestion.id,
                language_id: langId,
                source_code: code,
                stdin: customInput,
                mode: "run"
            });
        } catch (error) {
            setIsRunning(false);
            isWaitingForResponse.current = false;
            setOutput("Error connecting to server.");
        }
    }

    async function handleSubmit() {
        if (!currentQuestion) return;
        lastAction.current = "submit";
        setIsRunning(true);
        setRightTab("result");
        setOutput("Submitting code to judge...");
        setStatusMessage("Judging...");
        isWaitingForResponse.current = true;

        const code = codes[currentQuestion.id]?.[language] || "";
        const langId = LANGUAGE_IDS[language];

        try {
            await axios.post(`${SUBMISSION_URL}/submit`, {
                user_id: activeSession.userId,
                problem_id: currentQuestion.id,
                language_id: langId,
                source_code: code,
                stdin: "",
                mode: "submit"
            });
        } catch (error) {
            setIsRunning(false);
            isWaitingForResponse.current = false;
            setOutput("Submission failed.");
        }
    }

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


    const formatTime = (s) => {
        const hr = Math.floor(s / 3600);
        const min = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${hr > 0 ? hr + ':' : ''}${min < 10 && hr > 0 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    if (isInitializing || !currentQuestion) {
        return (
            <div className="text-white min-h-screen bg-[#0c0202] flex flex-col gap-4 justify-center items-center">
                <FiPlay className="animate-spin text-[#f43f5e] text-4xl" />
                <span className="text-[#f43f5e] font-bold tracking-widest uppercase text-sm">Loading Contest Data...</span>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0c0202] text-[#eff1f6] font-sans overflow-hidden">

            {/* --- CONTEST STOPPED OVERLAY --- */}
            {contestStopped && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="text-center">
                        <div className="text-6xl mb-6">🛑</div>
                        <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">
                            Contest Stopped
                        </h1>
                        <p className="text-gray-400 text-lg mb-8">
                            The DSA Challenge has been stopped by the admin.<br />
                            Your progress has been saved.
                        </p>
                        <button
                            onClick={() => { clearCodeStorage(STORAGE_PREFIX); localStorage.removeItem("dsaToken"); navigate("/rounds"); }}
                            className="px-8 py-3 bg-[#f43f5e] hover:bg-rose-500 text-white font-bold rounded-xl uppercase tracking-wide transition shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                        >
                            Return to Rounds
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <nav className="h-[70px] bg-[#1a0606] border-b border-[#f43f5e]/20 flex items-center justify-between px-6 shrink-0 z-40 relative">
                {/* Left Side: Brand */}
                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-[#f43f5e] font-black tracking-widest uppercase italic text-sm">DSA Challenge</span>
                        <span className="text-xs text-white/50 tracking-widest uppercase">Round 3</span>
                    </div>

                    <div className="h-8 w-px bg-white/10"></div>

                    {/* Question Navigator */}
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-lg border border-[#f43f5e]/10">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => handleQuestionSelect(idx)}
                                disabled={q.status === 'ACCEPTED'}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-2
                                    ${currentIndex === idx ? "bg-[#f43f5e] text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]" :
                                        q.status === 'ACCEPTED' ? "bg-green-500/5 text-green-500/50 cursor-not-allowed border border-green-500/10" :
                                            "text-white/40 hover:text-white hover:bg-white/5"}
                                `}
                            >
                                Q{idx + 1}
                                {q.status === 'ACCEPTED' && <FiCheckCircle className={currentIndex === idx ? "text-white" : "text-green-500/50"} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Score, Timer & Actions */}
                <div className="flex items-center gap-6 relative z-10">
                    <div className="bg-black/40 px-6 py-2 rounded-xl border border-white/5 flex flex-col items-center">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none mb-1">Score</span>
                        <span className="font-mono text-xl font-black text-rose-300">
                            {totalScore}
                        </span>
                    </div>

                    <div className="flex flex-col items-center min-w-[80px]">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none mb-1">Time Left</span>
                        <span className={`font-mono text-2xl font-black leading-none ${totalTimeLeft !== null && totalTimeLeft < 300 ? "text-red-500 animate-pulse" : "text-[#f43f5e]"}`}>
                            {totalTimeLeft !== null ? formatTime(totalTimeLeft) : "--:--"}
                        </span>
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2"></div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase transition"
                            title="Run Code"
                        >
                            <FiPlay className={isRunning ? "animate-spin" : "text-green-500"} /> Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#f43f5e] to-[#e11d48] hover:from-[#fb923c] hover:to-[#f43f5e] text-white font-black uppercase tracking-wide transition shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                        >
                            {isRunning ? "Testing..." : "Submit"} <FiUpload />
                        </button>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT SPLIT */}
            <div className="flex flex-1 overflow-hidden bg-[#0c0202]">

                {/* LEFT PANEL: PROBLEM DESCRIPTION */}
                <div
                    style={{ width: `${leftPanelWidth}%` }}
                    className="flex flex-col bg-[#1a0606] border-r border-[#f43f5e]/10 relative shrink-0"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
                        <span className="text-8xl font-black font-mono">Q{currentIndex + 1}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-rose-900/50">
                        <div className="mb-6 flex gap-3 items-center">
                            <span className="px-3 py-1 rounded bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20 text-xs font-bold tracking-widest uppercase">
                                {currentQuestion.base_points} Points
                            </span>
                            {currentQuestion.status === 'ACCEPTED' && (
                                <span className="px-3 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold tracking-widest uppercase flex items-center gap-1">
                                    <FiCheckCircle /> Solved
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold mb-6 tracking-tight">{currentQuestion.title}</h1>

                        <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:shadow-inner text-slate-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {currentQuestion.description}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* HORIZONTAL RESIZE HANDLE */}
                <div
                    onMouseDown={startHorizontalResize}
                    className="w-2 hover:bg-rose-500/30 cursor-col-resize transition-colors duration-200 z-10 flex items-center justify-center group"
                >
                    <div className="w-[1px] h-8 bg-white/20 group-hover:bg-[#f43f5e]" />
                </div>

                {/* RIGHT PANEL: EDITOR & CONSOLE */}
                <div
                    id="right-panel-container"
                    style={{ width: `${100 - leftPanelWidth}%` }}
                    className="flex flex-col gap-0 min-w-0 shrink-0 bg-[#0d0605]"
                >
                    {/* TOP: EDITOR SECTION */}
                    <div
                        style={{ height: `${editorHeight}%` }}
                        className="flex flex-col border-b border-[#f43f5e]/10 shrink-0"
                    >
                        <div className="h-10 bg-[#140a0a] flex items-center justify-between px-4 shrink-0 border-b border-[#f43f5e]/10">
                            <div className="flex items-center gap-2">
                                <FiCode className="text-xs text-[#f43f5e]" />
                                <select
                                    value={language}
                                    onChange={(e) => { setLanguage(e.target.value); saveLastLanguage(e.target.value); }}
                                    className="bg-transparent text-[11px] font-bold text-gray-300 outline-none cursor-pointer hover:text-white transition uppercase tracking-wider"
                                >
                                    <option value="python" className="bg-[#140a0a]">Python</option>
                                    <option value="c" className="bg-[#140a0a]">C</option>
                                    <option value="cpp" className="bg-[#140a0a]">C++</option>
                                    <option value="java" className="bg-[#140a0a]">Java</option>
                                    <option value="go" className="bg-[#140a0a]">Go</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-[#1e1e1e]">
                            <Editor
                                height="100%"
                                language={language === "cpp" ? "cpp" : language}
                                theme="vs-dark"
                                value={codes[currentQuestion.id]?.[language] ?? getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language)}
                                onChange={(value) => {
                                    setCodes(prev => ({
                                        ...prev,
                                        [currentQuestion.id]: { ...prev[currentQuestion.id], [language]: value || "" }
                                    }));
                                    saveCode(STORAGE_PREFIX, currentQuestion.id, language, value || "");
                                }}
                                options={{
                                    fontSize: 14,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 },
                                    cursorStyle: 'block',
                                    lineHeight: 22,
                                }}
                            />
                        </div>
                    </div>

                    {/* VERTICAL RESIZE HANDLE */}
                    <div
                        onMouseDown={startVerticalResize}
                        className="h-2 hover:bg-rose-500/30 cursor-row-resize transition-colors duration-200 z-10 flex items-center justify-center group shrink-0"
                    >
                        <div className="h-[1px] w-8 bg-white/20 group-hover:bg-[#f43f5e]" />
                    </div>

                    {/* BOTTOM: CONSOLE SECTION */}
                    <div
                        style={{ height: `${100 - editorHeight}%` }}
                        className="flex flex-col bg-[#140a0a] shrink-0"
                    >
                        <div className="h-10 border-b border-[#f43f5e]/10 flex items-center justify-between px-4 shrink-0">
                            <div className="flex h-full gap-6">
                                <button
                                    onClick={() => setRightTab("testcase")}
                                    className={`flex items-center gap-2 h-full text-xs font-bold uppercase tracking-widest border-b-2 transition
                    ${rightTab === "testcase" ? "border-[#f43f5e] text-[#f43f5e]" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                                >
                                    <FiTerminal className={rightTab === "testcase" ? "text-[#f43f5e]" : ""} />
                                    Custom Input
                                </button>
                                <button
                                    onClick={() => setRightTab("result")}
                                    className={`flex items-center gap-2 h-full text-xs font-bold uppercase tracking-widest border-b-2 transition
                    ${rightTab === "result" ? "border-[#f43f5e] text-[#f43f5e]" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                                >
                                    <FiZap className={rightTab === "result" ? "text-[#f43f5e]" : ""} />
                                    Output Logs
                                </button>
                            </div>
                            <div className="px-3">
                                {statusMessage && (
                                    <span
                                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border
                        ${statusMessage === "Accepted" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                statusMessage === "Wrong Answer" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                    statusMessage === "Running..." ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                        "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/20"}`}
                                    >
                                        {statusMessage}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 p-0 overflow-hidden flex flex-col relative bg-[#1a0c0c]">
                            {rightTab === "testcase" ? (
                                <textarea
                                    className="w-full h-full bg-transparent p-4 font-mono text-sm text-gray-300 resize-none outline-none placeholder:text-gray-600"
                                    placeholder="Enter custom input here..."
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                />
                            ) : (
                                <div className="absolute inset-0 p-4 font-mono text-sm overflow-auto text-gray-300">
                                    {isRunning ? (
                                        <div className="flex items-center gap-3 text-rose-500/50 italic animate-pulse">
                                            <FiPlay className="animate-spin text-xs" />
                                            <span className="text-xs uppercase tracking-widest font-bold">Executing Code...</span>
                                        </div>
                                    ) : (
                                        <pre className={`whitespace-pre-wrap ${statusMessage === "Accepted" ? "text-green-400" : statusMessage === "Wrong Answer" || statusMessage === "Error" ? "text-red-400" : "text-gray-400"}`}>
                                            {output || <span className="text-gray-600 italic">No output yet. Run your code to see results.</span>}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
