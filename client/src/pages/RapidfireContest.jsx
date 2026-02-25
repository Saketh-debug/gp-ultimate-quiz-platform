
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FiPlay, FiUpload, FiClock, FiTerminal, FiZap, FiAlertTriangle, FiCheckCircle,
    FiSettings, FiFileText, FiCode
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

const STORAGE_PREFIX = "rapidfire";
const QUESTION_DURATION = 180; // 3 minutes

export default function RapidfireContest({ session }) { // Prop session is fallback
    const navigate = useNavigate();
    const location = useLocation();

    // Use prop if available (e.g. testing wrapper), else use null to force fetch
    const [activeSession, setActiveSession] = useState(session || null);

    // Session State
    const [questions, setQuestions] = useState(activeSession?.questions || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentQuestion = questions[currentIndex];

    // Code State
    const [language, setLanguage] = useState(getLastLanguage());
    const [codes, setCodes] = useState({});
    const [customInput, setCustomInput] = useState("");

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [rightTab, setRightTab] = useState("result");
    const isWaitingForResponse = useRef(false);
    const lastAction = useRef(null); // 'run' or 'submit'
    const isAdvancingRef = useRef(false); // Prevent re-entry into handleNextQuestion

    // Timer State
    const [timeLeft, setTimeLeft] = useState(null); // null = loading, seeded from backend
    const [totalTimeLeft, setTotalTimeLeft] = useState(null); // null = loading, seeded from backend
    const isSyncingRef = useRef(false); // Guard for visibility re-sync

    // Scoring State
    const [rapidfireScore, setRapidfireScore] = useState(0);
    const submittedQuestionIdRef = useRef(null); // Captures questionId at submit time (edge case #10)

    // UI State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
    const [editorHeight, setEditorHeight] = useState(60); // percentage
    const isResizingHorizontal = useRef(false);
    const isResizingVertical = useRef(false);

    // Resume / Load Logic
    useEffect(() => {
        const initSession = async () => {
            const token = localStorage.getItem("userToken");
            if (!token) {
                navigate("/rapidfire");
                return;
            }

            try {
                // We use the same JOIN endpoint, it handles resume intelligently now
                const res = await fetch(`${BACKEND_URL}/rapidfire/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();

                if (res.ok) {
                    setActiveSession(data);
                } else {
                    alert(data.error || "Session expired");
                    navigate("/rapidfire");
                }
            } catch (err) {
                navigate("/rapidfire");
            }
        };

        if (!session) {
            initSession();
        }
    }, []); // Only run once on mount

    useEffect(() => {
        if (activeSession) {
            setQuestions(activeSession.questions || []);

            // Seed totalTimeLeft from server
            if (activeSession.totalTimeLeft != null) {
                setTotalTimeLeft(activeSession.totalTimeLeft);
            }

            // Use backend-provided currentIndex instead of guessing
            if (activeSession.questions && activeSession.questions.length > 0) {
                const resumeIndex = activeSession.currentIndex ?? 0;

                setCurrentIndex(resumeIndex);

                const qTime = activeSession.questions[resumeIndex].timeLeft ?? QUESTION_DURATION;
                setTimeLeft(qTime);
            }
        }
    }, [activeSession]);

    // Timers — pure decrement, no client clock dependency
    useEffect(() => {
        if (!activeSession || timeLeft === null || totalTimeLeft === null) return;

        const timer = setInterval(() => {
            // Decrement both timers by 1 each second
            setTotalTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
            setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [activeSession, currentIndex, timeLeft !== null, totalTimeLeft !== null]);

    // Handle contest end — fires from both interval ticks and re-sync updates
    useEffect(() => {
        if (totalTimeLeft === 0) {
            alert(`Contest Over! Your Rapidfire Score: ${rapidfireScore} points`);
            clearCodeStorage(STORAGE_PREFIX);
            localStorage.removeItem("userToken");
            navigate("/rounds");
        }
    }, [totalTimeLeft]);

    // Handle question timer expiry — separate from the interval to avoid side effects in state updater
    useEffect(() => {
        if (timeLeft === 0 && totalTimeLeft > 0) {
            handleNextQuestion();
        }
    }, [timeLeft]);

    // Visibility re-sync — re-fetch server times when tab wakes up
    useEffect(() => {
        if (!activeSession?.userId) return;

        const handleVisibilityChange = async () => {
            if (document.visibilityState !== 'visible') return;
            if (isSyncingRef.current) return;
            isSyncingRef.current = true;

            try {
                const res = await axios.post(`${BACKEND_URL}/rapidfire/time-check`, {
                    userId: activeSession.userId
                });
                const { totalTimeLeft: serverTotal, questionTimeLeft, currentIndex: serverIndex, contestEnded } = res.data;

                if (contestEnded || serverTotal <= 0) {
                    setTotalTimeLeft(0);
                    return;
                }

                setTotalTimeLeft(serverTotal);
                setCurrentIndex(serverIndex);
                setTimeLeft(questionTimeLeft);
            } catch (e) {
                console.error("Failed to re-sync timers", e);
            } finally {
                isSyncingRef.current = false;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [activeSession?.userId]);

    // Resizing Logic
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

    async function handleNextQuestion() {
        // Prevent re-entry (guard is set by the timeLeft effect or here for other callers)
        if (isAdvancingRef.current) return;
        isAdvancingRef.current = true;

        try {
            if (currentIndex < questions.length - 1) {
                const nextIdx = currentIndex + 1;
                const nextQ = questions[nextIdx];

                setCurrentIndex(nextIdx);
                setOutput("");
                setStatusMessage("");
                setRightTab("result");
                // Code for the next question will be loaded from localStorage via getCodeOrBoilerplate in the editor

                // Notify Backend to start timer for this new question and get timeLeft
                try {
                    const res = await axios.post(`${BACKEND_URL}/rapidfire/start-question`, {
                        userId: activeSession.userId,
                        questionId: nextQ.id
                    });
                    setTimeLeft(res.data.timeLeft ?? QUESTION_DURATION);
                    if (res.data.totalTimeLeft != null) {
                        setTotalTimeLeft(res.data.totalTimeLeft);
                    }
                } catch (e) {
                    console.error("Failed to sync timer", e);
                    setTimeLeft(QUESTION_DURATION); // Fallback
                }

            } else {
                alert(`All questions completed! Your Rapidfire Score: ${rapidfireScore} points`);
                clearCodeStorage(STORAGE_PREFIX);
                localStorage.removeItem("userToken"); // Clear session
                navigate("/rounds");
            }
        } finally {
            isAdvancingRef.current = false;
        }
    }

    // Socket Listener
    useEffect(() => {
        if (activeSession?.userId) {
            socket.emit("join_user", activeSession.userId);
        }

        const handleSubmissionResult = async (data) => {
            if (!isWaitingForResponse.current) return;

            setIsRunning(false);
            isWaitingForResponse.current = false;

            // Handle RUN result (Custom Input)
            if (lastAction.current === "run") {
                const out = data.stdout || data.stderr || "No output";
                setOutput(out);
                setStatusMessage("Run Complete");
                return;
            }

            // Handle SUBMIT result (Evaluation)
            // 1. ACCEPTED -> Score + Next Question
            if (data.status === "ACCEPTED") {
                setStatusMessage("Accepted");

                // Call /submit-result IMMEDIATELY (before advance delay)
                // Uses submittedQuestionIdRef to avoid stale closure (edge case #10)
                const qId = submittedQuestionIdRef.current;
                try {
                    const res = await axios.post(`${BACKEND_URL}/rapidfire/submit-result`, {
                        userId: activeSession.userId,
                        questionId: qId
                    });
                    const { scoreAwarded, totalRoundScore } = res.data;
                    setRapidfireScore(totalRoundScore);
                    setOutput(`Correct! +${scoreAwarded} pts (Total: ${totalRoundScore})`);
                } catch (err) {
                    console.error("Failed to sync score", err);
                    setOutput("Correct! Moving to next question...");
                }

                setTimeout(() => {
                    handleNextQuestion();
                }, 1500);
            }
            // 2. WRONG ANSWER / ERROR -> Stay and Retry
            else {
                const errorDetail = data.stderr || data.stdout || "Incorrect Answer. Try again!";
                setOutput(errorDetail);
                setStatusMessage("Wrong Answer");
            }
        };

        socket.on("submission_result", handleSubmissionResult);
        return () => socket.off("submission_result", handleSubmissionResult);
    }, [activeSession?.userId, currentIndex, questions.length]);

    async function handleRun() {
        if (!currentQuestion) return;
        lastAction.current = "run";
        setIsRunning(true);
        setRightTab("result");
        setOutput("Running...");
        setStatusMessage("Running...");
        isWaitingForResponse.current = true;

        const code = codes[currentQuestion.id]?.[language] || getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language);
        const langId = LANGUAGE_IDS[language];

        try {
            await axios.post(`${SUBMISSION_URL}/submit`, {
                user_id: activeSession.userId,
                problem_id: currentQuestion.id,
                language_id: langId,
                source_code: code,
                stdin: customInput, // Custom input from the new tab
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
        setOutput("Submitting...");
        setStatusMessage("Judging...");
        isWaitingForResponse.current = true;
        submittedQuestionIdRef.current = currentQuestion.id; // Capture for scoring (edge case #10)

        const code = codes[currentQuestion.id]?.[language] || getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language);
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

    // Format Time
    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    if (!currentQuestion) return <div className="text-white">Loading...</div>;

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-[#eff1f6] font-sans overflow-hidden">

            {/* TOP NAVIGATION BAR */}
            <nav className="h-[60px] bg-[#282828] border-b border-[#3e3e3e] flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <span className="text-orange-500 font-bold tracking-widest uppercase">Rapid Fire</span>
                    <div className="bg-[#333] px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Question</span>
                        <span className="text-white font-bold">{currentIndex + 1} / {questions.length}</span>
                    </div>
                </div>

                {/* TIMERS */}
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Question Timer</span>
                        <span className={`font-mono text-xl font-bold ${timeLeft < 30 ? "text-red-500 animate-pulse" : "text-white"}`}>
                            {totalTimeLeft !== null && timeLeft !== null ? formatTime(Math.min(timeLeft, totalTimeLeft)) : "--:--"}
                        </span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total Time</span>
                        <span className="font-mono text-xl text-orange-400">
                            {totalTimeLeft !== null ? formatTime(totalTimeLeft) : "--:--"}
                        </span>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 rounded bg-[#3e3e3e] hover:bg-[#4e4e4e] text-white text-sm font-bold transition"
                    >
                        <FiPlay className={isRunning ? "animate-spin" : "text-green-500"} /> Run
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-6 py-2 rounded bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold transition shadow-lg shadow-orange-500/20"
                    >
                        <FiUpload /> Submit
                    </button>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden p-2 gap-0 bg-[#1a1a1a]">

                {/* LEFT PANEL: PROBLEM DESCRIPTION */}
                <div
                    style={{ width: `${leftPanelWidth}%` }}
                    className="flex flex-col bg-[#282828] rounded-xl overflow-hidden border border-[#3e3e3e] shadow-lg shrink-0"
                >
                    {/* Header */}
                    <div className="h-10 bg-[#333333] flex items-center px-4 shrink-0 border-b border-[#3e3e3e]">
                        <div className="flex items-center gap-2">
                            <FiFileText className="text-xs text-orange-500" />
                            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Description</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#4e4e4e]">
                        <div className="max-w-3xl">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    {currentIndex + 1}. {currentQuestion.title}
                                </h1>
                            </div>

                            <h4 className="text-lg font-bold mb-4 text-white">Description</h4>

                            <div className="prose prose-invert prose-sm max-w-none markdown-content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ children }) => <p className="text-[#eff1f6] leading-relaxed mb-4 text-[15px] font-sans opacity-90">{children}</p>,
                                        code: ({ inline, children, ...props }) => {
                                            return inline ? (
                                                <code className="bg-[#3e3e3e] px-1.5 py-0.5 rounded text-gray-200 text-sm font-mono border border-white/5" {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <div className="bg-[#333333]/50 p-5 rounded-xl border border-[#3e3e3e] mb-6 font-mono text-sm">
                                                    <pre className="overflow-x-auto" {...props}><code>{children}</code></pre>
                                                </div>
                                            );
                                        },
                                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                        em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                                        h3: ({ children }) => <h3 className="text-lg font-bold mt-8 mb-4 text-white">{children}</h3>,
                                        h4: ({ children }) => <h4 className="text-md font-bold mt-6 mb-3 text-white">{children}</h4>,
                                        ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
                                        li: ({ children }) => <li className="text-gray-300">{children}</li>
                                    }}
                                >
                                    {currentQuestion.description}
                                </ReactMarkdown>
                            </div>
                        </div>
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
                                <div className="flex items-center gap-2 px-2 py-1">
                                    <FiCode className="text-xs text-orange-500" />
                                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                                        {language === "python" ? "Main.py" : language === "cpp" ? "Main.cpp" : language === "java" ? "Main.java" : language === "c" ? "Main.c" : "Main.go"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#282828] border border-[#3e3e3e]">
                                    <FiSettings className="text-xs text-gray-400" />
                                    <select
                                        value={language}
                                        onChange={(e) => { setLanguage(e.target.value); saveLastLanguage(e.target.value); }}
                                        className="bg-transparent text-[11px] font-bold text-gray-300 outline-none cursor-pointer hover:text-white transition uppercase tracking-wider"
                                    >
                                        <option value="python" className="bg-[#282828]">Python</option>
                                        <option value="c" className="bg-[#282828]">C</option>
                                        <option value="cpp" className="bg-[#282828]">C++</option>
                                        <option value="java" className="bg-[#282828]">Java</option>
                                        <option value="go" className="bg-[#282828]">Go</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-[#1e1e1e]">
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={codes[currentQuestion.id]?.[language] ?? getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language)}
                                onChange={(val) => {
                                    setCodes(prev => ({
                                        ...prev,
                                        [currentQuestion.id]: { ...prev[currentQuestion.id], [language]: val }
                                    }));
                                    saveCode(STORAGE_PREFIX, currentQuestion.id, language, val);
                                }}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </div>

                    {/* VERTICAL RESIZE HANDLE */}
                    <div
                        onMouseDown={startVerticalResize}
                        className="h-2 hover:bg-orange-500/30 cursor-row-resize transition-colors duration-200 z-10 flex items-center justify-center group"
                    >
                        <div className="w-12 h-[3px] bg-gray-600 group-hover:bg-orange-500" />
                    </div>

                    {/* BOTTOM: CONSOLE SECTION */}
                    <div
                        style={{ height: `${100 - editorHeight}%` }}
                        className="flex flex-col bg-[#282828] rounded-xl overflow-hidden border border-[#3e3e3e] shadow-lg relative shrink-0"
                    >
                        <div className="h-10 bg-[#333333] flex items-center justify-between px-4 shrink-0 border-b border-[#3e3e3e]">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setRightTab("input")}
                                    className={`text-xs font-bold uppercase transition ${rightTab === "input" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-white"}`}
                                >
                                    Custom Input
                                </button>
                                <button
                                    onClick={() => setRightTab("result")}
                                    className={`text-xs font-bold uppercase transition ${rightTab === "result" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-white"}`}
                                >
                                    Output
                                </button>
                            </div>

                            {statusMessage && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusMessage === "Accepted" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                    {statusMessage}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
                            {rightTab === "input" ? (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter custom input here..."
                                    className="w-full h-full bg-[#1e1e1e] p-4 text-sm font-mono text-gray-300 focus:outline-none resize-none"
                                />
                            ) : (
                                <div className="absolute inset-0 p-4 font-mono text-sm overflow-y-auto text-gray-300">
                                    {output || <span className="opacity-30 italic">Ready for execution...</span>}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
