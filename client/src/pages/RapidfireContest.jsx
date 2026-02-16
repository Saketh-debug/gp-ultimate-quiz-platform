
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FiPlay, FiUpload, FiClock, FiTerminal, FiZap, FiAlertTriangle, FiCheckCircle
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

// Configuration
const BACKEND_URL = import.meta.env.VITE_API_URL;
const SUBMISSION_URL = import.meta.env.VITE_SUBMISSION_URL;
const socket = io(SUBMISSION_URL);

const LANGUAGE_IDS = {
    python: 71, // Python 3.8
    cpp: 54,    // GCC 9.2
    java: 62,   // OpenJDK 13
    go: 60,     // Go 1.13.5
};

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
    const [language, setLanguage] = useState("python");
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
    const [totalTimeLeft, setTotalTimeLeft] = useState(45 * 60); // 45 mins

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

            // Use backend-provided currentIndex instead of guessing
            if (activeSession.questions && activeSession.questions.length > 0) {
                const resumeIndex = activeSession.currentIndex ?? 0;

                setCurrentIndex(resumeIndex);

                const qTime = activeSession.questions[resumeIndex].timeLeft ?? QUESTION_DURATION;
                setTimeLeft(qTime);
            }
        }
    }, [activeSession]);

    // Timers
    useEffect(() => {
        if (!activeSession || timeLeft === null) return;

        const timer = setInterval(() => {
            // Total Contest Timer
            const now = new Date();
            const end = new Date(activeSession.endTime);
            const diff = Math.floor((end - now) / 1000);

            setTotalTimeLeft(diff > 0 ? diff : 0);

            if (diff <= 0) {
                clearInterval(timer);
                alert("Contest Over!");
                localStorage.removeItem("userToken"); // Clear session
                navigate("/rounds");
                return;
            }

            // Question Timer — pure updater, no side effects
            setTimeLeft((prev) => {
                if (prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeSession, currentIndex]);

    // Handle question timer expiry — separate from the interval to avoid side effects in state updater
    useEffect(() => {
        if (timeLeft === 0) {
            handleNextQuestion();
        }
    }, [timeLeft]);

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
                setCodes(prev => ({ ...prev, [nextQ.id]: prev[nextQ.id] || "" })); // Preserve code if exists

                // Notify Backend to start timer for this new question and get timeLeft
                try {
                    const res = await axios.post(`${BACKEND_URL}/rapidfire/start-question`, {
                        userId: activeSession.userId,
                        questionId: nextQ.id
                    });
                    setTimeLeft(res.data.timeLeft ?? QUESTION_DURATION);
                } catch (e) {
                    console.error("Failed to sync timer", e);
                    setTimeLeft(QUESTION_DURATION); // Fallback
                }

            } else {
                alert("All questions completed!");
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

        const handleSubmissionResult = (data) => {
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
            // 1. ACCEPTED -> Next Question
            if (data.status === "ACCEPTED") {
                setStatusMessage("Accepted");
                setOutput("Correct! Moving to next question...");
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

        const code = codes[currentQuestion.id] || "";
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

        const code = codes[currentQuestion.id] || "";
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

            {/* HEADER */}
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
                            {formatTime(Math.min(timeLeft, totalTimeLeft))}
                        </span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total Time</span>
                        <span className="font-mono text-xl text-orange-400">
                            {formatTime(totalTimeLeft)}
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

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT: DESCRIPTION */}
                <div className="w-1/2 p-6 overflow-y-auto bg-[#1a1a1a] border-r border-[#3e3e3e]">
                    <h1 className="text-3xl font-bold mb-4">{currentQuestion.title}</h1>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentQuestion.description}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* RIGHT: EDITOR */}
                <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
                    <div className="h-10 bg-[#282828] border-b border-[#3e3e3e] flex items-center justify-between px-4">
                        <span className="text-xs font-bold text-gray-500 uppercase">Code Editor</span>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-[#333] text-xs text-white px-2 py-1 rounded border border-white/10 focus:outline-none"
                        >
                            <option value="python">Python 3</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="go">Go</option>
                        </select>
                    </div>
                    <div className="flex-1 border-b border-[#3e3e3e]">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={codes[currentQuestion.id] || ""}
                            onChange={(val) => setCodes(prev => ({ ...prev, [currentQuestion.id]: val }))}
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 }
                            }}
                        />
                    </div>


                    {/* CONSOLE */}
                    <div className="h-[200px] bg-[#282828] flex flex-col">
                        <div className="h-10 bg-[#333] border-b border-[#3e3e3e] flex items-center px-4 justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setRightTab("input")}
                                    className={`text-xs font-bold uppercase transition ${rightTab === "input" ? "text-orange-500 underline underline-offset-4" : "text-gray-400 hover:text-white"}`}
                                >
                                    Custom Input
                                </button>
                                <button
                                    onClick={() => setRightTab("result")}
                                    className={`text-xs font-bold uppercase transition ${rightTab === "result" ? "text-orange-500 underline underline-offset-4" : "text-gray-400 hover:text-white"}`}
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

                        <div className="flex-1 overflow-hidden relative">
                            {rightTab === "input" ? (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter custom input here..."
                                    className="w-full h-full bg-[#1e1e1e] p-4 text-sm font-mono text-gray-300 focus:outline-none resize-none"
                                />
                            ) : (
                                <div className="absolute inset-0 p-4 font-mono text-sm overflow-auto text-gray-300">
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
