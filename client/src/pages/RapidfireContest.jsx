
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
    FiPlay, FiUpload, FiClock, FiTerminal, FiZap, FiAlertTriangle, FiCheckCircle,
    FiSettings, FiFileText, FiCode, FiRotateCcw, FiCopy, FiCheck
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LANGUAGE_IDS, BOILERPLATE, getCodeOrBoilerplate, saveCode, clearCodeStorage,
    saveLastLanguage, getLastLanguage
} from "../utils/codeStorage";
import { formatErrorForDisplay } from "../utils/errorFormatter";
import useContestProctoring from "../hooks/useContestProctoring";

// Configuration
const BACKEND_URL = import.meta.env.VITE_API_URL;
const SUBMISSION_URL = import.meta.env.VITE_SUBMISSION_URL;
// Socket connects to load-balancer for submission results (LB has no auth)
const socket = io(SUBMISSION_URL);

const STORAGE_PREFIX = "rapidfire";
const QUESTION_DURATION = 300; // 5 minutes

const CodeBlock = ({ inline, children, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (inline) {
        return (
            <code className="bg-[#3e3e3e] px-1.5 py-0.5 rounded text-gray-200 text-sm font-mono border border-white/5" {...props}>
                {children}
            </code>
        );
    }

    const handleCopy = () => {
        let text = Array.isArray(children)
            ? children.map(c => typeof c === 'string' ? c : c?.props?.children || '').join('')
            : String(children || '');
        text = text.replace(/\n$/, '');
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="relative bg-[#333333]/50 p-5 rounded-xl border border-[#3e3e3e] mb-6 font-mono text-sm group">
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 rounded-md bg-[#282828] border border-[#3e3e3e] text-gray-400 hover:text-white hover:border-orange-500/50 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center gap-1.5 shadow-sm"
                title="Copy to clipboard"
            >
                {isCopied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                {isCopied && <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Copied!</span>}
            </button>
            <pre className="overflow-x-auto mt-0 mb-0" {...props}><code>{children}</code></pre>
        </div>
    );
};

const markdownComponents = {
    p: ({ children }) => <p className="text-[#eff1f6] leading-relaxed mb-4 text-[15px] font-sans opacity-90">{children}</p>,
    code: CodeBlock,
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
    h3: ({ children }) => <h3 className="text-lg font-bold mt-8 mb-4 text-white">{children}</h3>,
    h4: ({ children }) => <h4 className="text-md font-bold mt-6 mb-3 text-white">{children}</h4>,
    ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
    li: ({ children }) => <li className="text-gray-300">{children}</li>
};

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
    const [rightTab, setRightTab] = useState("input");
    const isWaitingForResponse = useRef(false);
    const lastAction = useRef(null); // 'run' or 'submit'
    const isAdvancingRef = useRef(false); // Prevent re-entry into handleNextQuestion

    // Timer State
    const [timeLeft, setTimeLeft] = useState(null); // null = loading, seeded from backend
    const [totalTimeLeft, setTotalTimeLeft] = useState(null); // null = loading, seeded from backend
    const isSyncingRef = useRef(false); // Guard for visibility re-sync

    // Scoring State
    const [rapidfireScore, setRapidfireScore] = useState(0);

    // Completion overlay
    const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
    const [completionMessage, setCompletionMessage] = useState("");
    const isContestEndedRef = useRef(false);

    // Proctoring
    const { showWarning, warningMessage, warningButtonText, warningAction, violationCount, cleanupProctoring } = useContestProctoring("rapidfire", {
        contestEnded: totalTimeLeft === 0,
        onDisqualify: () => {
            cleanupProctoring();
            clearCodeStorage(STORAGE_PREFIX);
            localStorage.removeItem("userToken");
            localStorage.removeItem("userAccessCode");
            navigate("/rapidfire");
        }
    });

    // UI State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
    const [editorHeight, setEditorHeight] = useState(60); // percentage
    const isResizingHorizontal = useRef(false);
    const isResizingVertical = useRef(false);
    const editorRef = useRef(null);
    const prevEditorKeyRef = useRef(null); // tracks "questionId__language" to detect real switches
    // Authenticated backend socket ref — created lazily in initSession with JWT
    const backendSocketRef = useRef(null);

    // 401 interceptor — if ANY authenticated API call is rejected, navigate back to join
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            res => res,
            err => {
                if (err.response?.status === 401 && !isContestEndedRef.current) {
                    navigate('/rapidfire');
                }
                return Promise.reject(err);
            }
        );
        return () => {
            // Disconnect authenticated backend socket on unmount
            backendSocketRef.current?.disconnect();
            backendSocketRef.current = null;
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    // Resume / Load Logic
    useEffect(() => {
        const initSession = async () => {
            const accessCode = localStorage.getItem("userAccessCode");
            if (!accessCode) {
                navigate("/rapidfire");
                return;
            }

            try {
                const res = await fetch(`${BACKEND_URL}/rapidfire/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: accessCode }),
                });
                const data = await res.json();

                if (res.ok) {
                    if (data.accessToken) localStorage.setItem('userToken', data.accessToken);
                    setActiveSession(data);

                    // Create an authenticated backend socket so the server
                    // can map this userId → socketId in userSockets.
                    // Disconnect any stale socket from a previous page load.
                    if (backendSocketRef.current) backendSocketRef.current.disconnect();
                    const jwt = data.accessToken;
                    const bSocket = io(BACKEND_URL, { auth: { token: jwt } });
                    backendSocketRef.current = bSocket;

                    // Emit register inside the connect callback so the socket
                    // is guaranteed to be connected before sending.
                    bSocket.on('connect', () => {
                        bSocket.emit('register');
                    });

                    // Listen for force_logout — another device joined with the same token
                    bSocket.on('force_logout', () => {
                        alert('Your session was taken over on another device.');
                        navigate('/rapidfire');
                    });
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

            // Seed score from server so it survives page reloads
            if (activeSession.currentScore != null) {
                setRapidfireScore(activeSession.currentScore);
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

    // Auto-populate customInput with sample_input when question changes
    useEffect(() => {
        if (currentQuestion) {
            setCustomInput(currentQuestion.sample_input || "");
        }
    }, [currentIndex]);

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

    // triggerCompletion — called from timer expiry and all-questions-done paths
    function triggerCompletion(msg) {
        if (isContestEndedRef.current) return; // prevent double-fire
        isContestEndedRef.current = true;
        cleanupProctoring();
        clearCodeStorage(STORAGE_PREFIX);
        // Tokens are kept alive until the user clicks the button
        // so ProtectedContestRoute doesn't kick in on a re-render
        setCompletionMessage(msg);
        setShowCompletionOverlay(true);
    }

    // Handle contest end — fires from both interval ticks and re-sync updates
    useEffect(() => {
        if (totalTimeLeft === 0) {
            triggerCompletion(`Contest Over! Your Rapidfire Score: ${rapidfireScore} points`);
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
            if (isContestEndedRef.current) return; // don't sync after contest ended
            isSyncingRef.current = true;

            try {
                const jwt = localStorage.getItem('userToken');
                const res = await axios.post(`${BACKEND_URL}/rapidfire/time-check`, {}, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
                const { totalTimeLeft: serverTotal, questionTimeLeft, currentIndex: serverIndex, contestEnded } = res.data;

                if (contestEnded || serverTotal <= 0) {
                    setTotalTimeLeft(0);
                    return;
                }

                setTotalTimeLeft(serverTotal);
                if (questionTimeLeft <= 0) {
                    // Question expired while away — backend advance is authoritative
                    setCurrentIndex(serverIndex);
                    setTimeLeft(0); // triggers timeLeft effect → handleNextQuestion
                } else {
                    // Question still running — only sync timers, don't touch currentIndex
                    setTimeLeft(questionTimeLeft);
                }
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
                    const jwt = localStorage.getItem('userToken');
                    const res = await axios.post(`${BACKEND_URL}/rapidfire/start-question`, {
                        questionId: nextQ.id
                    }, {
                        headers: { Authorization: `Bearer ${jwt}` }
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
                triggerCompletion(`All questions completed! Your Rapidfire Score: ${rapidfireScore} points`);
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
            if (isContestEndedRef.current) return; // ignore late results after completion

            setIsRunning(false);
            isWaitingForResponse.current = false;

            // Handle RUN result (Custom Input)
            if (lastAction.current === "run") {
                const hasError = data.status === 'ERROR' || data.status === 'FAILED';
                const out = data.stdout || data.stderr || (hasError ? "Runtime Error" : "No output");
                setOutput(out);
                if (hasError) {
                    const { label } = formatErrorForDisplay(data);
                    setStatusMessage(label);
                } else {
                    setStatusMessage("Run Complete");
                }
                return;
            }

            // Handle SUBMIT result (Evaluation)
            // 1. ACCEPTED -> Score + Next Question
            if (data.status === "ACCEPTED") {
                setStatusMessage("Accepted");

                // Score is computed server-side (dispatcher calls submit-result internally).
                // It arrives pre-attached to the socket payload — no separate API call needed.
                if (data.scoreAwarded != null) {
                    setRapidfireScore(data.totalRoundScore);
                    setOutput(`Correct! +${data.scoreAwarded} pts (Total: ${data.totalRoundScore})`);
                } else {
                    setOutput("Correct! Moving to next question...");
                }

                setTimeout(() => {
                    handleNextQuestion();
                }, 1500);
            }
            // 2. WRONG ANSWER / ERROR -> Stay and Retry
            else {
                const { label, message } = formatErrorForDisplay(data);
                setOutput(data.stderr || data.stdout || message);
                setStatusMessage(label);
            }
        };

        socket.on("submission_result", handleSubmissionResult);
        return () => socket.off("submission_result", handleSubmissionResult);
    }, [activeSession?.userId, currentIndex, questions.length]);

    const handleResetCode = () => {
        if (!currentQuestion || !editorRef.current) return;
        // setValue triggers onChange → which updates codes state + saves to localStorage
        editorRef.current.setValue(BOILERPLATE[language] || "");
    };

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
            const jwt = localStorage.getItem('userToken');
            await axios.post(`${BACKEND_URL}/submit`, {
                // user_id is NOT sent — server injects from JWT
                problem_id: currentQuestion.id,
                language_id: langId,
                source_code: code,
                stdin: customInput,
                mode: "run"
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
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

        const code = codes[currentQuestion.id]?.[language] || getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language);
        const langId = LANGUAGE_IDS[language];

        try {
            const jwt = localStorage.getItem('userToken');
            await axios.post(`${BACKEND_URL}/submit`, {
                // user_id is NOT sent — server injects from JWT
                problem_id: currentQuestion.id,
                language_id: langId,
                source_code: code,
                stdin: "",
                mode: "submit"
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
        } catch (error) {
            setIsRunning(false);
            isWaitingForResponse.current = false;
            setOutput("Submission failed.");
        }
    }

    // Imperatively set editor value ONLY when question or language changes, not on every keystroke
    useEffect(() => {
        if (!editorRef.current || !currentQuestion) return;
        const key = `${currentQuestion.id}__${language}`;
        if (prevEditorKeyRef.current === key) return; // same question+lang — no-op
        prevEditorKeyRef.current = key;

        const newValue = codes[currentQuestion.id]?.[language]
            ?? getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language);
        editorRef.current.setValue(newValue);
    }, [currentQuestion?.id, language]);

    // Format Time
    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    if (!currentQuestion) return <div className="text-white">Loading...</div>;

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-[#eff1f6] font-sans overflow-hidden">

            {/* COMPLETION OVERLAY */}
            {showCompletionOverlay && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md">
                    <div className="bg-[#1f1f1f] border border-orange-500/30 rounded-2xl p-12 max-w-md w-full shadow-[0_0_80px_rgba(255,140,0,0.2)] text-center">
                        <div className="text-7xl mb-6">🏆</div>
                        <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-widest">Round Complete!</h2>
                        <p className="text-gray-300 mb-8 leading-relaxed text-base">{completionMessage}</p>
                        <p className="text-orange-400/70 text-sm mb-8">Check the leaderboard to see where you stand among other teams.</p>
                        <button
                            onClick={() => {
                                localStorage.removeItem("userToken");
                                localStorage.removeItem("userAccessCode");
                                navigate("/leaderboard");
                            }}
                            className="w-full px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl uppercase tracking-widest transition shadow-[0_0_30px_rgba(255,100,0,0.4)] flex items-center justify-center gap-3 text-sm"
                        >
                            <span>View Leaderboard</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            )}

            {/* PROCTORING WARNING OVERLAY */}
            {showWarning && !showCompletionOverlay && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="bg-[#1f1f1f] border border-orange-500/30 rounded-2xl p-10 max-w-md w-full shadow-[0_0_60px_rgba(255,100,0,0.15)] text-center">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-widest">Warning</h2>
                        <p className="text-gray-300 mb-4 leading-relaxed">{warningMessage}</p>
                        <p className="text-sm text-orange-400/70 mb-8 font-bold">Violations recorded: {violationCount}</p>
                        <button
                            onClick={warningAction}
                            className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl uppercase tracking-wide transition shadow-[0_0_20px_rgba(255,100,0,0.3)] w-full"
                        >
                            {warningButtonText}
                        </button>
                    </div>
                </div>
            )}

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
                    <div className="bg-[#333] h-8 px-4 rounded-full border border-white/10 flex items-center gap-2 mr-2 shadow-inner">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Score</span>
                        <span className="text-orange-400 font-mono font-bold text-sm">{rapidfireScore}</span>
                        <FiZap className="text-orange-500 text-sm" />
                    </div>
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
                                    rehypePlugins={[rehypeRaw]}
                                    components={markdownComponents}
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
                                <button
                                    onClick={handleResetCode}
                                    disabled={isRunning}
                                    title="Reset to default boilerplate"
                                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#282828] border border-[#3e3e3e] text-gray-400 hover:text-orange-400 hover:border-orange-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-bold uppercase tracking-wider"
                                >
                                    <FiRotateCcw className="text-xs" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-[#1e1e1e]">
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                defaultValue={getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language)}
                                onMount={(editor) => { editorRef.current = editor; }}
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
                                <div className="absolute inset-0 p-4 font-mono text-sm overflow-y-auto text-gray-300 whitespace-pre-wrap">
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
