import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
    FiPlay, FiUpload, FiCheckCircle, FiClock, FiTerminal, FiZap, FiCode, FiList, FiFileText, FiRotateCcw, FiCopy, FiCheck
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LANGUAGE_IDS, BOILERPLATE, getCodeOrBoilerplate, saveCode, clearCodeStorage,
    saveLastLanguage, getLastLanguage
} from "../utils/codeStorage";
import { formatErrorForDisplay } from "../utils/errorFormatter";
import useContestProctoring from "../hooks/useContestProctoring";
import useIsCompactLayout from "../hooks/useIsCompactLayout";

// Configuration
const BACKEND_URL = import.meta.env.VITE_API_URL;
const SUBMISSION_URL = import.meta.env.VITE_SUBMISSION_URL;
const socket = io(SUBMISSION_URL); // LB has no auth

const STORAGE_PREFIX = "dsa";

const PreBlock = ({ node, children, className, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);

    let textToCopy = '';
    const extractText = (n) => {
        if (typeof n === 'string' || typeof n === 'number') return String(n);
        if (Array.isArray(n)) return n.map(extractText).join('');
        if (n?.props?.children) return extractText(n.props.children);
        return '';
    };

    if (children) {
        textToCopy = extractText(children).replace(/\n$/, '');
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.warn('Copy failed:', err);
        }
    };

    return (
        <div className="relative group not-prose my-4">
            <button
                onClick={handleCopy}
                onCopy={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[#1a1a1a] border border-[#3e3e3e] text-gray-400 hover:text-white hover:border-[#f43f5e]/50 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center gap-1.5 shadow-sm font-sans"
                title="Copy to clipboard"
            >
                {isCopied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                {isCopied && <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Copied!</span>}
            </button>
            <pre className={className || ''} {...props}>{children}</pre>
        </div>
    );
};

const markdownComponents = {
    pre: PreBlock
};

/* ── Completion overlay with auto-redirect countdown ── */
function DSACompletionOverlay({ completionMessage, countdown, setCountdown, onRedirect }) {
    useEffect(() => {
        if (countdown <= 0) {
            onRedirect();
            return;
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="bg-[#1a0606] border border-[#f43f5e]/30 rounded-2xl p-12 max-w-md w-full shadow-[0_0_80px_rgba(244,63,94,0.2)] text-center">
                <div className="text-7xl mb-6">🏆</div>
                <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-widest">Round Complete!</h2>
                <p className="text-gray-300 mb-8 leading-relaxed text-base">{completionMessage}</p>
                <p className="text-[#f43f5e]/70 text-sm mb-8">
                    Redirecting to leaderboard in <span className="font-black text-[#f43f5e]">{countdown}</span>s...
                </p>
                <button
                    onClick={onRedirect}
                    className="w-full px-8 py-4 bg-[#f43f5e] hover:bg-rose-500 text-white font-black rounded-xl uppercase tracking-widest transition shadow-[0_0_30px_rgba(244,63,94,0.4)] flex items-center justify-center gap-3 text-sm"
                >
                    <span>View Leaderboard ({countdown})</span>
                    <span>→</span>
                </button>
            </div>
        </div>
    );
}

export default function DSAContest({ session }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isCompactLayout = useIsCompactLayout();

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
    const [rightTab, setRightTab] = useState("testcase");
    const isWaitingForResponse = useRef(false);
    const lastAction = useRef(null);

    // Timer & Admin Control
    const [totalTimeLeft, setTotalTimeLeft] = useState(null); // null = loading, seeded from server
    const [contestStopped, setContestStopped] = useState(false);
    const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
    const [completionMessage, setCompletionMessage] = useState("");
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const isSyncingRef = useRef(false); // Guard for visibility re-sync
    const isContestEndedRef = useRef(false); // Guard for completion

    // Proctoring
    const { showWarning, warningMessage, warningButtonText, warningAction, violationCount, cleanupProctoring } = useContestProctoring("dsa", {
        contestEnded: totalTimeLeft === 0 || contestStopped,
        teamName: activeSession?.team,
        backendUrl: BACKEND_URL,
        onDisqualify: () => {
            cleanupProctoring();
            clearCodeStorage(STORAGE_PREFIX);
            localStorage.removeItem("dsaToken");
            localStorage.removeItem("dsaCurrentIndex");
            localStorage.removeItem("dsaAccessCode"); // fix: was missing, unlike other contest pages
            navigate("/dsa");
        }
    });

    // Resizing State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
    const [editorHeight, setEditorHeight] = useState(60); // percentage
    const isResizingHorizontal = useRef(false);
    const isResizingVertical = useRef(false);
    const editorRef = useRef(null);
    const prevEditorKeyRef = useRef(null); // tracks "questionId__language" to detect real switches
    // Authenticated backend socket ref — created lazily in initSession with JWT
    const backendSocketRef = useRef(null);

    // Pause state
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(false); // stable ref for use inside callbacks/effects
    const activeSessionRef = useRef(null); // stable ref for closures

    // Keep ref in sync with state
    useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);

    // Admin Stop Listener + force_logout + 401 interceptor
    useEffect(() => {
        // 401 interceptor — navigate back to join if JWT rejected
        const interceptor = axios.interceptors.response.use(
            res => res,
            err => {
                if (err.response?.status === 401 && !isContestEndedRef.current) navigate('/dsa');
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

    // Init & Resume Handling
    useEffect(() => {
        const initSession = async () => {
            const accessCode = localStorage.getItem("dsaAccessCode");
            if (!accessCode) {
                navigate("/dsa");
                return;
            }

            try {
                const res = await fetch(`${BACKEND_URL}/dsa/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: accessCode }), // send raw access code
                });
                const data = await res.json();

                if (res.ok) {
                    // Update stored JWT (server issues fresh JWT on resume)
                    if (data.accessToken) localStorage.setItem('dsaToken', data.accessToken);
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
                        navigate('/dsa');
                    });

                    // ── Pause / Resume listeners ──
                    bSocket.on('round_paused', ({ roundName }) => {
                        if (roundName === 'dsa') {
                            setIsPaused(true);
                            isPausedRef.current = true;
                        }
                    });

                    bSocket.on('round_resumed', ({ roundName }) => {
                        if (roundName === 'dsa') {
                            setIsPaused(false);
                            isPausedRef.current = false;
                            // Re-sync timer from server (end_time has been shifted forward)
                            handleDSATimeReSync();
                        }
                    });

                    // Listen for admin round_stopped broadcast
                    bSocket.on('round_stopped', (data) => {
                        if (data.roundName === 'dsa') {
                            setContestStopped(true);
                        }
                    });
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

            // Always sync pause state from server on join/resume
            // (covers reload-during-pause — socket won't replay past round_paused events)
            const seededPaused = activeSession.isPaused === true;
            setIsPaused(seededPaused);
            isPausedRef.current = seededPaused;

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

    // Auto-populate customInput with sample_input when question changes
    useEffect(() => {
        if (currentQuestion) {
            setCustomInput(currentQuestion.sample_input || "");
        }
    }, [currentIndex]);

    // Timer — pure decrement, no client clock dependency
    // Interval is NOT started while paused; React teardown via dep-array cleanup handles freeze.
    useEffect(() => {
        if (!activeSession || totalTimeLeft === null) return;
        if (isPaused) return; // freeze when paused

        const timer = setInterval(() => {
            setTotalTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [activeSession, totalTimeLeft !== null, isPaused]);

    // triggerCompletion — called from timer expiry and all-questions-done paths
    function triggerCompletion(msg) {
        if (isContestEndedRef.current) return; // prevent double-fire
        isContestEndedRef.current = true;
        cleanupProctoring();
        clearCodeStorage(STORAGE_PREFIX);
        // Store team name so Leaderboard can show user-specific stats
        if (activeSession?.team) {
            localStorage.setItem("currentTeam", activeSession.team);
        }
        // Tokens deferred to button click so ProtectedDSARoute doesn't kick in
        setCompletionMessage(msg);
        setShowCompletionOverlay(true);
        setRedirectCountdown(5);
    }

    // Handle contest end — fires from both interval ticks and re-sync updates
    useEffect(() => {
        if (totalTimeLeft === 0 && !contestStopped) {
            triggerCompletion("Contest Over! Your final DSA score has been recorded.");
        }
    }, [totalTimeLeft]);

    // Auto-redirect countdown when admin stops the contest
    useEffect(() => {
        if (!contestStopped || showCompletionOverlay) return;
        if (activeSessionRef.current?.team) localStorage.setItem("currentTeam", activeSessionRef.current.team);
        if (redirectCountdown <= 0) {
            cleanupProctoring();
            clearCodeStorage(STORAGE_PREFIX);
            localStorage.removeItem("dsaToken");
            localStorage.removeItem("dsaCurrentIndex");
            localStorage.removeItem("dsaAccessCode");
            window.location.href = "/leaderboard";
            return;
        }
        const t = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [contestStopped, redirectCountdown, showCompletionOverlay]);

    // Shared time re-sync helper — called from visibility change AND after resume
    async function handleDSATimeReSync() {
        if (isContestEndedRef.current) return;
        try {
            const jwt = localStorage.getItem('dsaToken');
            const res = await axios.post(`${BACKEND_URL}/dsa/time-check`, {}, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            const { totalTimeLeft: serverTotal, contestEnded, isPaused: serverPaused } = res.data;

            // Sync pause state from server
            if (serverPaused !== undefined) {
                setIsPaused(serverPaused);
                isPausedRef.current = serverPaused;
            }

            if (contestEnded || serverTotal <= 0) {
                setTotalTimeLeft(0);
                return;
            }

            setTotalTimeLeft(serverTotal);
        } catch (e) {
            console.error("Failed to re-sync DSA timer", e);
        }
    }

    // Visibility re-sync — re-fetch server time when tab wakes up
    useEffect(() => {
        if (!activeSession?.userId) return;

        const handleVisibilityChange = async () => {
            if (document.visibilityState !== 'visible') return;
            if (isSyncingRef.current) return;
            if (isContestEndedRef.current) return; // don't sync after contest ended
            isSyncingRef.current = true;

            try {
                await handleDSATimeReSync();
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
            if (isContestEndedRef.current) return; // ignore late results after completion

            setIsRunning(false);
            isWaitingForResponse.current = false;

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

            // Handle FAILED / ERROR from dispatcher (non-DSA path)
            if (data.status === 'FAILED' || data.status === 'ERROR') {
                const { label, message } = formatErrorForDisplay(data);
                setOutput(message);
                setStatusMessage(label);
                return;
            }

            const passedCount = data.passedCount ?? 0;
            const totalTestCases = data.totalTestCases || 3;

            // Build per-TC result string
            const tcResults = Array.from({ length: totalTestCases }, (_, i) =>
                `TC${i + 1}: ${i < passedCount ? "✅" : "❌"}`
            ).join("  |  ");

            if (data.status === "ACCEPTED" || data.status === "PARTIAL") {
                // passedCount=0 means no TCs passed — don't process score, just show output
                if (passedCount === 0) {
                    const errDetail = data.stderr || data.stdout || "No test cases passed.";
                    setOutput(`${tcResults}\n\n${errDetail}`);
                    setStatusMessage("Wrong Answer");
                    return;
                }

                // Score data is computed server-side (dispatcher calls submit-result internally)
                // and arrives pre-attached to the socket payload — no separate API call needed.
                const scoreAwarded = data.scoreAwarded ?? 0;
                const newTotalScore = data.totalScore ?? 0;
                const noImprovement = data.message === "No improvement";

                setTotalScore(newTotalScore);

                const allPassed = passedCount === totalTestCases;
                const newStatus = allPassed ? 'ACCEPTED' : 'PARTIAL';

                // Update local question status and score_awarded
                setQuestions(prev => {
                    const newQ = [...prev];
                    newQ[currentIndex] = {
                        ...newQ[currentIndex],
                        status: newStatus,
                        score_awarded: scoreAwarded,
                        passed_count: passedCount,
                    };
                    return newQ;
                });

                const statusLabel = allPassed ? "Accepted ✅" : "Partial Score 🟡";
                const basePoints = currentQuestion.base_points;
                const outputMsg = [
                    tcResults,
                    ``,
                    `Score: ${scoreAwarded} / ${basePoints} pts`,
                    allPassed
                        ? `All test cases passed!`
                        : `${passedCount}/${totalTestCases} test cases passed. You can re-submit for a better score.`,
                    noImprovement ? `(No improvement over previous attempt)` : "",
                ].filter(Boolean).join("\n");

                setOutput(outputMsg);
                setStatusMessage(statusLabel);

                // Auto-navigate to next unsolved question only if fully accepted
                if (allPassed) {
                    setTimeout(() => {
                        setQuestions(currentQuestions => {
                            let nextUnsolvedIndex = -1;
                            for (let i = 0; i < currentQuestions.length; i++) {
                                if (currentQuestions[i].status !== 'ACCEPTED') {
                                    nextUnsolvedIndex = i;
                                    break;
                                }
                            }
                            if (nextUnsolvedIndex !== -1 && !isPausedRef.current) {
                                setCurrentIndex(nextUnsolvedIndex);
                                localStorage.setItem("dsaCurrentIndex", nextUnsolvedIndex);
                                setOutput("");
                                setStatusMessage("");
                                setRightTab("input");
                            } else if (nextUnsolvedIndex === -1) {
                                triggerCompletion("Congratulations! You have solved all DSA questions!");
                            }
                            return currentQuestions;
                        });
                    }, 2000);
                }
            }

            else {
                // WRONG_ANSWER from non-DSA path (shouldn't happen for DSA, but safe fallback)
                const errorDetail = data.stderr || data.stdout || "Incorrect Answer. Try again!";
                setOutput(`${tcResults}\n\n${errorDetail}`);
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
        if (isPausedRef.current) return; // block navigation while paused
        if (questions[idx]?.status === 'ACCEPTED') {
            return; // Block access
        }
        setCurrentIndex(idx);
        localStorage.setItem("dsaCurrentIndex", idx);
        setOutput("");
        setStatusMessage("");
        setRightTab("input");
    };

    const handleResetCode = () => {
        if (!currentQuestion || !editorRef.current) return;
        // setValue triggers onChange → which updates codes state + saves to localStorage
        editorRef.current.setValue(BOILERPLATE[language] || "");
    };

    // Execution Handlers
    async function handleRun() {
        if (!currentQuestion) return;
        if (isPausedRef.current) return; // block while paused
        lastAction.current = "run";
        setIsRunning(true);
        setRightTab("result");
        setOutput("Running Custom Input...");
        setStatusMessage("Running...");
        isWaitingForResponse.current = true;

        const code = codes[currentQuestion.id]?.[language] ?? getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language);
        const langId = LANGUAGE_IDS[language];

        try {
            const jwt = localStorage.getItem('dsaToken');
            await axios.post(`${BACKEND_URL}/submit`, {
                // user_id NOT sent — server injects from JWT
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
        if (isPausedRef.current) return; // block while paused
        lastAction.current = "submit";
        setIsRunning(true);
        setRightTab("result");
        setOutput("Submitting code to judge...");
        setStatusMessage("Judging...");
        isWaitingForResponse.current = true;

        const code = codes[currentQuestion.id]?.[language] ?? getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language);
        const langId = LANGUAGE_IDS[language];

        try {
            const jwt = localStorage.getItem('dsaToken');
            await axios.post(`${BACKEND_URL}/submit`, {
                // user_id NOT sent — server injects from JWT
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

    /* ---------------- EDITOR SYNC (question / language switch only) ---------------- */
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
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#0c0202] font-sans text-[#eff1f6] lg:h-screen lg:overflow-hidden">

            {/* COMPLETION OVERLAY */}
            {showCompletionOverlay && (
                <DSACompletionOverlay
                    completionMessage={completionMessage}
                    countdown={redirectCountdown}
                    setCountdown={setRedirectCountdown}
                    onRedirect={() => {
                        localStorage.removeItem("dsaToken");
                        localStorage.removeItem("dsaCurrentIndex");
                        navigate("/leaderboard");
                    }}
                />
            )}

            {/* PROCTORING WARNING OVERLAY */}
            {showWarning && !contestStopped && !showCompletionOverlay && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="bg-[#1a0606] border border-[#f43f5e]/30 rounded-2xl p-10 max-w-md w-full shadow-[0_0_60px_rgba(244,63,94,0.15)] text-center">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-widest">Warning</h2>
                        <p className="text-gray-300 mb-4 leading-relaxed">{warningMessage}</p>
                        <p className="text-sm text-[#f43f5e]/70 mb-8 font-bold">Violations recorded: {violationCount}</p>
                        <button
                            onClick={warningAction}
                            className="px-8 py-3 bg-[#f43f5e] hover:bg-rose-500 text-white font-bold rounded-xl uppercase tracking-wide transition shadow-[0_0_20px_rgba(244,63,94,0.3)] w-full"
                        >
                            {warningButtonText}
                        </button>
                    </div>
                </div>
            )}

            {/* --- CONTEST STOPPED OVERLAY --- */}
            {contestStopped && !showCompletionOverlay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="text-center">
                        <div className="text-6xl mb-6">🛑</div>
                        <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">
                            Contest Stopped
                        </h1>
                        <p className="text-gray-400 text-lg mb-4">
                            The DSA Challenge has been stopped by the admin.<br />
                            Your progress has been saved.
                        </p>
                        <p className="text-[#f43f5e]/70 text-sm mb-8">
                            Redirecting in <span className="font-black text-[#f43f5e]">{redirectCountdown}</span>s...
                        </p>
                        <button
                            onClick={() => { cleanupProctoring(); clearCodeStorage(STORAGE_PREFIX); localStorage.removeItem("dsaToken"); localStorage.removeItem("dsaCurrentIndex"); navigate("/leaderboard"); }}
                            className="px-8 py-3 bg-[#f43f5e] hover:bg-rose-500 text-white font-bold rounded-xl uppercase tracking-wide transition shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                        >
                            Check Leaderboard ({redirectCountdown})
                        </button>
                    </div>
                </div>
            )}

            {/* PAUSE BANNER — shown when admin has paused the round */}
            {isPaused && !showCompletionOverlay && !contestStopped && (
                <div className="fixed top-0 inset-x-0 z-[9998] bg-yellow-400 text-black text-center font-black py-2 uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-lg">
                    <span>⏸</span>
                    <span>Contest Paused by Admin — Please Wait...</span>
                    <span>⏸</span>
                </div>
            )}

            {/* HEADER */}
            <nav className="relative z-40 flex min-h-[70px] flex-wrap items-center justify-between gap-4 border-b border-[#f43f5e]/20 bg-[#1a0606] px-4 py-3 sm:px-6">
                {/* Left Side: Brand */}
                <div className="relative z-10 flex min-w-0 flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex flex-col">
                        <span className="text-[#f43f5e] font-black tracking-widest uppercase italic text-sm">DSA Challenge</span>
                        <span className="text-xs text-white/50 tracking-widest uppercase">Round 3</span>
                    </div>

                    <div className="h-8 w-px bg-white/10"></div>

                    {/* Question Navigator */}
                    <div className="flex max-w-full gap-2 overflow-x-auto rounded-lg border border-[#f43f5e]/10 bg-black/40 p-1.5">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => handleQuestionSelect(idx)}
                                disabled={q.status === 'ACCEPTED' || isPaused}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-2
                                    ${currentIndex === idx ? "bg-[#f43f5e] text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]" :
                                        q.status === 'ACCEPTED' ? "bg-green-500/5 text-green-500/50 cursor-not-allowed border border-green-500/10" :
                                            q.status === 'PARTIAL' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20" :
                                                isPaused ? "text-white/25 cursor-not-allowed" : "text-white/40 hover:text-white hover:bg-white/5"}
                                `}
                            >
                                <span>Q{idx + 1}</span>
                                {q.status === 'ACCEPTED' && <FiCheckCircle className={currentIndex === idx ? "text-white" : "text-green-500/50"} />}
                                {q.status === 'PARTIAL' && (
                                    <span className="text-[10px] font-normal normal-case">
                                        {q.score_awarded ?? 0}/{q.base_points}pts
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Score, Timer & Actions */}
                <div className="relative z-10 flex w-full flex-wrap items-center gap-4 lg:w-auto lg:gap-6">
                    <div className="flex flex-col items-center rounded-xl border border-white/5 bg-black/40 px-4 py-2 sm:px-6">
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

                    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
                        <button
                            onClick={handleRun}
                            disabled={isRunning || isPaused}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isPaused ? "Contest paused" : "Run Code"}
                        >
                            <FiPlay className={isRunning ? "animate-spin" : "text-green-500"} /> Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning || isPaused}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#f43f5e] to-[#e11d48] hover:from-[#fb923c] hover:to-[#f43f5e] text-white font-black uppercase tracking-wide transition shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isPaused ? "Contest paused" : ""}
                        >
                            {isRunning ? "Testing..." : "Submit"} <FiUpload />
                        </button>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT SPLIT */}
            <div className="flex flex-1 flex-col overflow-y-auto bg-[#0c0202] lg:flex-row lg:overflow-hidden">

                {/* LEFT PANEL: PROBLEM DESCRIPTION */}
                <div
                    style={{ width: isCompactLayout ? "100%" : `${leftPanelWidth}%` }}
                    className="relative flex min-h-[36vh] shrink-0 flex-col border-b border-[#f43f5e]/10 bg-[#1a0606] lg:min-h-0 lg:border-b-0 lg:border-r"
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

                        <div
                            className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:shadow-inner text-slate-300"
                            style={{ userSelect: 'none' }}
                            onCopy={(e) => e.preventDefault()}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
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

                {/* HORIZONTAL RESIZE HANDLE */}
                <div
                    onMouseDown={startHorizontalResize}
                    className={`${isCompactLayout ? "hidden" : "flex"} z-10 w-2 cursor-col-resize items-center justify-center transition-colors duration-200 group hover:bg-rose-500/30`}
                >
                    <div className="w-[1px] h-8 bg-white/20 group-hover:bg-[#f43f5e]" />
                </div>

                {/* RIGHT PANEL: EDITOR & CONSOLE */}
                <div
                    id="right-panel-container"
                    style={{ width: isCompactLayout ? "100%" : `${100 - leftPanelWidth}%` }}
                    className="flex min-h-[72vh] min-w-0 shrink-0 flex-col gap-2 bg-[#0d0605] lg:min-h-0 lg:gap-0"
                >
                    {/* TOP: EDITOR SECTION */}
                    <div
                        style={{ height: isCompactLayout ? "52vh" : `${editorHeight}%` }}
                        className="flex shrink-0 flex-col border-b border-[#f43f5e]/10"
                    >
                        <div className="h-10 bg-[#140a0a] flex items-center justify-between px-4 shrink-0 border-b border-[#f43f5e]/10">
                            <div className="flex items-center gap-2">
                                <FiCode className="text-xs text-[#f43f5e]" />
                                <select
                                    value={language}
                                    onChange={(e) => { setLanguage(e.target.value); saveLastLanguage(e.target.value); }}
                                    disabled={isPaused}
                                    className="bg-transparent text-[11px] font-bold text-gray-300 outline-none cursor-pointer hover:text-white transition uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <option value="python" className="bg-[#140a0a]">Python</option>
                                    <option value="c" className="bg-[#140a0a]">C</option>
                                    <option value="cpp" className="bg-[#140a0a]">C++</option>
                                    <option value="java" className="bg-[#140a0a]">Java</option>
                                    <option value="go" className="bg-[#140a0a]">Go</option>
                                </select>
                            </div>
                            <button
                                onClick={handleResetCode}
                                disabled={isRunning || isPaused}
                                title={isPaused ? "Contest paused" : "Reset to default boilerplate"}
                                className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#f43f5e]/20 text-white/40 hover:text-[#f43f5e] hover:border-[#f43f5e]/50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-bold uppercase tracking-wider"
                            >
                                <FiRotateCcw className="text-xs" /> Reset
                            </button>
                        </div>

                        <div className="flex-1 relative bg-[#1e1e1e]">
                            <Editor
                                height="100%"
                                language={language === "cpp" ? "cpp" : language}
                                theme="vs-dark"
                                defaultValue={getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language)}
                                onMount={(editor) => { editorRef.current = editor; }}
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
                                    readOnly: isPaused, // freeze editor during admin pause
                                }}
                            />
                        </div>
                    </div>

                    {/* VERTICAL RESIZE HANDLE */}
                    <div
                        onMouseDown={startVerticalResize}
                        className={`${isCompactLayout ? "hidden" : "flex"} z-10 h-2 shrink-0 cursor-row-resize items-center justify-center transition-colors duration-200 group hover:bg-rose-500/30`}
                    >
                        <div className="h-[1px] w-8 bg-white/20 group-hover:bg-[#f43f5e]" />
                    </div>

                    {/* BOTTOM: CONSOLE SECTION */}
                    <div
                        style={{ height: isCompactLayout ? "20rem" : `${100 - editorHeight}%` }}
                        className="flex shrink-0 flex-col bg-[#140a0a]"
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
                        ${statusMessage.includes("Accepted") ? "bg-green-500/10 text-green-400 border-green-500/20" :
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