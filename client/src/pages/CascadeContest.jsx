import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FiPlay, FiUpload, FiZap, FiCheckCircle, FiSkipForward, FiRotateCcw, FiArrowRight
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    LANGUAGE_IDS, getCodeOrBoilerplate, saveCode, clearCodeStorage,
    saveLastLanguage, getLastLanguage
} from "../utils/codeStorage";

// Configuration
const BACKEND_URL = import.meta.env.VITE_API_URL;
const SUBMISSION_URL = import.meta.env.VITE_SUBMISSION_URL;
const socket = io(SUBMISSION_URL);
const backendSocket = io(BACKEND_URL);

const STORAGE_PREFIX = "cascade";

export default function CascadeContest({ session }) {
    const navigate = useNavigate();

    // Use prop if available (e.g. testing wrapper), else force fetch from server
    const [activeSession, setActiveSession] = useState(session || null);

    // Context & State
    const [questions, setQuestions] = useState(session?.questions || []);
    const [currentIndex, setCurrentIndex] = useState(0); // The index we are currently looking at (could be review)
    const [highestForwardIndex, setHighestForwardIndex] = useState(session?.highestForwardIndex || 0); // The frontier
    const [isReviewMode, setIsReviewMode] = useState(false); // True if user clicked "Go Back"

    const currentQuestion = questions[currentIndex];

    // Stats
    const [currentStreak, setCurrentStreak] = useState(session?.currentStreak || 0);
    const [maxStreak, setMaxStreak] = useState(session?.maxStreak || 0);
    const [cascadeScore, setCascadeScore] = useState(session?.cascadeScore || 0);

    // Code & Editor
    const [language, setLanguage] = useState(getLastLanguage());
    const [codes, setCodes] = useState({});
    const [customInput, setCustomInput] = useState("");

    // Execution Execution
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [rightTab, setRightTab] = useState("result");
    const isWaitingForResponse = useRef(false);
    const lastAction = useRef(null); // 'run' or 'submit'

    const [totalTimeLeft, setTotalTimeLeft] = useState(null); // null = loading, seeded from backend
    const [showGoBackModal, setShowGoBackModal] = useState(false);
    const [contestStopped, setContestStopped] = useState(false);
    const isSyncingRef = useRef(false); // Guard for visibility re-sync
    const contestStoppedRef = useRef(false); // Ref to avoid stale closure in effects

    // Listen for admin stop event from backend socket
    useEffect(() => {
        const handleRoundStopped = (data) => {
            if (data.roundName === "cascade") {
                setContestStopped(true);
                contestStoppedRef.current = true;
            }
        };
        backendSocket.on("round_stopped", handleRoundStopped);
        return () => backendSocket.off("round_stopped", handleRoundStopped);
    }, []);

    // Init & Resume Handling — only if no session was provided
    useEffect(() => {
        const initSession = async () => {
            const token = localStorage.getItem("cascadeToken");
            if (!token) {
                navigate("/cascade");
                return;
            }

            try {
                const res = await fetch(`${BACKEND_URL}/cascade/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();

                if (res.ok) {
                    setActiveSession(data);
                } else {
                    alert(data.error || "Session expired");
                    navigate("/cascade");
                }
            } catch (err) {
                navigate("/cascade");
            }
        };

        if (!session) {
            initSession();
        }
    }, []); // Only run once on mount

    // Update state when activeSession arrives
    useEffect(() => {
        if (activeSession) {
            setQuestions(activeSession.questions || []);
            setHighestForwardIndex(activeSession.highestForwardIndex || 0);
            // Restore review mode state if persisted
            if (activeSession.isReviewMode) {
                setIsReviewMode(true);
                setCurrentIndex(activeSession.currentViewingIndex ?? 0);
            } else {
                setCurrentIndex(activeSession.highestForwardIndex || 0);
            }
            setCurrentStreak(activeSession.currentStreak || 0);
            setMaxStreak(activeSession.maxStreak || 0);
            setCascadeScore(activeSession.cascadeScore || 0);

            // Seed totalTimeLeft from server
            if (activeSession.totalTimeLeft != null) {
                setTotalTimeLeft(activeSession.totalTimeLeft);
            }
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

    // Handle contest end — guarded against admin stop to prevent double messaging
    useEffect(() => {
        if (totalTimeLeft === 0 && !contestStoppedRef.current) {
            alert(`Contest Over! Your Cascade Score: ${cascadeScore} pts (+ streak bonus on leaderboard)`);
            clearCodeStorage(STORAGE_PREFIX);
            localStorage.removeItem("cascadeToken");
            navigate("/rounds");
        }
    }, [totalTimeLeft]);

    // Visibility re-sync — re-fetch server time when tab wakes up
    useEffect(() => {
        if (!activeSession?.userId) return;

        const handleVisibilityChange = async () => {
            if (document.visibilityState !== 'visible') return;
            if (isSyncingRef.current) return;
            if (contestStoppedRef.current) return;
            isSyncingRef.current = true;

            try {
                const res = await axios.post(`${BACKEND_URL}/cascade/time-check`, {
                    userId: activeSession.userId
                });
                const { totalTimeLeft: serverTotal, contestEnded } = res.data;

                if (contestEnded || serverTotal <= 0) {
                    setTotalTimeLeft(0);
                    return;
                }

                setTotalTimeLeft(serverTotal);
            } catch (e) {
                console.error("Failed to re-sync timer", e);
            } finally {
                isSyncingRef.current = false;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [activeSession?.userId]);


    // Socket Listener
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

            // SUBMIT Logic

            // Handle FAILED / ERROR from dispatcher (e.g. missing test cases, judge error)
            if (data.status === 'FAILED' || data.status === 'ERROR') {
                const errorDetail = data.error || data.stderr || data.stdout || "Submission failed. Contact admin.";
                setOutput(errorDetail);
                setStatusMessage("Error");
                return;
            }

            if (data.status === "ACCEPTED") {
                setStatusMessage("Accepted");
                setOutput("Correct Answer! Syncing with mainframe...");

                // Call backend to register points & update streak
                try {
                    const res = await axios.post(`${BACKEND_URL}/cascade/submit-result`, {
                        userId: activeSession.userId,
                        questionId: currentQuestion.id
                    });

                    const scoreData = res.data;
                    setCurrentStreak(scoreData.currentStreak);
                    setMaxStreak(scoreData.maxStreak);
                    if (scoreData.cascadeScore != null) {
                        setCascadeScore(scoreData.cascadeScore);
                    }

                    // Update local question status
                    setQuestions(prev => {
                        const newQ = [...prev];
                        newQ[currentIndex].status = 'ACCEPTED';
                        return newQ;
                    });

                    // Note: backend 'submit-result' auto-advances the highest forward index if eligible.
                    // We must honor that or advance locally
                    setHighestForwardIndex(scoreData.highestForwardIndex);

                    // Check if ALL questions are now solved (compute synchronously to avoid stale closure)
                    const updatedQuestions = [...questions];
                    updatedQuestions[currentIndex].status = 'ACCEPTED';
                    const allSolved = updatedQuestions.every(q => q.status === 'ACCEPTED');

                    if (allSolved) {
                        const finalScore = scoreData.cascadeScore ?? cascadeScore;
                        setTimeout(() => {
                            alert(`All questions solved! Your Cascade Score: ${finalScore} pts`);
                            clearCodeStorage(STORAGE_PREFIX);
                            localStorage.removeItem("cascadeToken");
                            navigate("/rounds");
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            handleAdvance("Next question");
                        }, 1500);
                    }

                } catch (err) {
                    console.error("Failed to sync score", err);
                    setOutput("Score sync failed. Contact admin.");
                }
            }
            else {
                const errorDetail = data.stderr || data.stdout || "Incorrect Answer. System streak preserved. Try again!";
                setOutput(errorDetail);
                setStatusMessage("Wrong Answer");
                // WRONG ANSWER DOES NOT BREAK STREAK IN CASCADE. They just sit here and retry.
            }
        };

        socket.on("submission_result", handleSubmissionResult);
        return () => socket.off("submission_result", handleSubmissionResult);
    }, [activeSession?.userId, currentQuestion, currentIndex]);


    // Moving Forward (Next question after solved)
    const handleAdvance = (msg) => {
        if (isReviewMode) {
            // In review mode, solved a previous question -> stay in review mode, just update status
            return;
        }

        // Forward Mode: move to next unvisited question (which is newly highestForwardIndex usually)
        if (currentIndex < questions.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setHighestForwardIndex(Math.max(highestForwardIndex, nextIdx));
            resetEditorState();
            // Persist viewing index for reload resilience
            if (activeSession?.userId) {
                axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                    userId: activeSession.userId,
                    currentViewingIndex: nextIdx
                }).catch(() => { });
            }
        } else {
            alert("All forward questions completed! Feel free to review skipped questions.");
        }
    };


    // Action: SKIP
    const handleSkip = async () => {
        if (!window.confirm("WARNING: Skipping will BREAK your current streak. Your max streak will be saved. Continue?")) return;

        try {
            const res = await axios.post(`${BACKEND_URL}/cascade/skip`, {
                userId: activeSession.userId,
                questionId: currentQuestion.id
            });

            // Streak broken
            setCurrentStreak(0);

            setQuestions(prev => {
                const newQ = [...prev];
                newQ[currentIndex].status = 'SKIPPED';
                return newQ;
            });

            // Advance
            if (currentIndex < questions.length - 1) {
                const nextIdx = currentIndex + 1;
                setCurrentIndex(nextIdx);
                setHighestForwardIndex(res.data.highestForwardIndex);
                resetEditorState();
                // Persist viewing index for reload resilience
                axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                    userId: activeSession.userId,
                    currentViewingIndex: nextIdx
                }).catch(() => { });
            } else {
                alert("No more questions to skip to.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Action: GO BACK
    const handleGoBack = async () => {
        setShowGoBackModal(false);
        try {
            await axios.post(`${BACKEND_URL}/cascade/go-back`, { userId: activeSession.userId });

            // Streak broken
            setCurrentStreak(0);
            setIsReviewMode(true);

            // Update local eligibility
            setQuestions(prev => {
                const newQ = [...prev];
                for (let i = 0; i < highestForwardIndex; i++) {
                    newQ[i].is_streak_eligible = false;
                }
                return newQ;
            });

            // Auto-select first available skipped question
            const firstSkipped = questions.findIndex((q, i) => i < highestForwardIndex && q.status !== 'ACCEPTED');
            if (firstSkipped !== -1) {
                setCurrentIndex(firstSkipped);
                resetEditorState();
                // Persist the initial review index
                axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                    userId: activeSession.userId,
                    currentViewingIndex: firstSkipped
                }).catch(() => { });
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Action: RETURN TO FORWARD PROGRESSION
    const handleReturnForward = async () => {
        try {
            await axios.post(`${BACKEND_URL}/cascade/return-forward`, { userId: activeSession.userId });
            alert("Returned to forward progression. A new streak has started!");
            setIsReviewMode(false);
            setCurrentIndex(highestForwardIndex);
            resetEditorState();
            // Persist return to forward
            axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                userId: activeSession.userId,
                currentViewingIndex: highestForwardIndex
            }).catch(() => { });
        } catch (e) {
            console.error(e);
        }
    };


    const resetEditorState = () => {
        setOutput("");
        setStatusMessage("");
        setRightTab("result");
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
        setOutput("Submitting...");
        setStatusMessage("Judging...");
        isWaitingForResponse.current = true;

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

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    if (!currentQuestion) return <div className="text-white min-h-screen bg-[#1a0b08] flex justify-center items-center">Loading Data Link...</div>;

    // Derived variables for UI
    const multiplier = currentStreak === 0 ? "1.0x" : currentStreak >= 7 ? "2.5x" : currentStreak >= 3 ? "1.5x" : "1.0x";

    // Filter questions for the sidebar if in review mode
    const reviewQuestions = questions.map((q, i) => ({ ...q, ogIndex: i }))
        .filter(q => q.ogIndex < highestForwardIndex && q.status !== 'ACCEPTED');

    return (
        <div className="h-screen flex flex-col bg-[#110806] text-[#eff1f6] font-sans overflow-hidden">

            {/* --- CONTEST STOPPED OVERLAY --- */}
            {contestStopped && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="text-center">
                        <div className="text-6xl mb-6">🛑</div>
                        <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">
                            Contest Stopped
                        </h1>
                        <p className="text-gray-400 text-lg mb-8">
                            The Coding Cascade has been stopped by the admin.<br />
                            Your progress has been saved.<br />
                            <span className="text-[#f4a460] font-bold">Your Score: {cascadeScore} pts (+ streak bonus on leaderboard)</span>
                        </p>
                        <button
                            onClick={() => { clearCodeStorage(STORAGE_PREFIX); localStorage.removeItem("cascadeToken"); navigate("/rounds"); }}
                            className="px-8 py-3 bg-[#ff4d20] hover:bg-[#ff623d] text-white font-bold rounded-xl uppercase tracking-wide transition shadow-[0_0_20px_rgba(255,77,32,0.3)]"
                        >
                            Return to Rounds
                        </button>
                    </div>
                </div>
            )}

            {/* --- GO BACK MODAL --- */}
            {showGoBackModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1f0e0a] border border-[#ff4d20]/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,77,32,0.1)]">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <FiRotateCcw className="text-[#ff4d20]" /> Confirm Override
                        </h2>
                        <p className="text-gray-300 mb-6 font-light leading-relaxed">
                            Going back to review skipped questions will immediately <strong className="text-[#ff4d20]">BREAK</strong> your current streak of <strong className="text-white">{currentStreak}</strong>.
                            Your maximum streak of <span className="text-yellow-500 font-bold">{maxStreak}</span> is safely logged.
                            <br /><br />
                            You will only see unsolved questions. Are you sure you want to proceed?
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowGoBackModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition">Cancel</button>
                            <button onClick={handleGoBack} className="flex-1 py-3 bg-[#ff4d20] hover:bg-[#ff623d] rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-[0_0_15px_rgba(255,77,32,0.4)]">
                                Break Streak & Review <FiRotateCcw />
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* HEADER */}
            <nav className="h-[70px] bg-[#1a0b08] border-b border-[#ff4d20]/20 flex items-center justify-between px-6 shrink-0 z-40 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d20]/5 to-transparent pointer-events-none" />

                {/* Left Side: Brand & Question Number */}
                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-[#ff4d20] font-black tracking-widest uppercase italic text-sm">Coding Cascade</span>
                        <span className="text-xs text-white/50 tracking-widest uppercase">Sector 2</span>
                    </div>

                    <div className="h-8 w-px bg-white/10"></div>

                    <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg flex items-center gap-3">
                        <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Node</span>
                        <span className="text-white font-bold">{currentIndex + 1} / 15</span>
                        {isReviewMode && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest border border-yellow-500/30">Review</span>}
                    </div>
                </div>

                {/* Center: Streak Counters */}
                <div className="flex items-center gap-8 relative z-10 bg-black/40 px-8 py-2 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full flex items-center justify-center border transition-all duration-300
                            ${currentStreak > 0 ? "border-[#ff4d20] bg-[#ff4d20]/10 shadow-[0_0_15px_rgba(255,77,32,0.3)] animate-pulse" : "border-white/10 bg-white/5"}
                        `}>
                            <FiZap className={`text-xl ${currentStreak > 0 ? "text-[#ff4d20] fill-[#ff4d20]/20" : "text-white/30"}`} />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-black ${currentStreak > 0 ? "text-white" : "text-white/30"}`}>{currentStreak}</span>
                                <span className="text-xs text-[#ff4d20] font-bold">({multiplier})</span>
                            </div>
                            <div className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Current Streak</div>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-white/10"></div>

                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full flex items-center justify-center border border-yellow-500/30 bg-yellow-500/10 text-yellow-500">
                            <span className="material-symbols-outlined text-xl">emoji_events</span>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">{maxStreak}</div>
                            <div className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Max Logged</div>
                        </div>
                    </div>
                </div>

                {/* Right: Timer & Actions */}
                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex flex-col items-center min-w-[80px]">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none mb-1">Uplink Closes</span>
                        <span className={`font-mono text-2xl font-black leading-none ${totalTimeLeft !== null && totalTimeLeft < 300 ? "text-red-500 animate-pulse" : "text-[#ff4d20]"}`}>
                            {totalTimeLeft !== null ? formatTime(totalTimeLeft) : "--:--"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center justify-center gap-2 size-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
                            title="Run Code"
                        >
                            <FiPlay className={isRunning ? "animate-spin" : "text-green-500"} />
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#ff4d20] to-[#e63e15] hover:from-[#ff623d] hover:to-[#ff4d20] text-white font-black uppercase tracking-wide transition shadow-[0_0_20px_rgba(255,77,32,0.3)]"
                        >
                            {isRunning ? "Transmitting..." : "Submit Node"} <FiUpload />
                        </button>
                    </div>
                </div>
            </nav>

            {/* SECONDARY NAV (Navigation specific to Cascade) */}
            <div className="h-10 bg-[#140a08] border-b border-[#ff4d20]/10 flex items-center justify-between px-6 shrink-0 relative z-30">
                <div className="flex gap-4">
                    {!isReviewMode && highestForwardIndex > 0 && (
                        <button
                            onClick={() => setShowGoBackModal(true)}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ff4d20]/80 hover:text-[#ff4d20] transition bg-[#ff4d20]/5 hover:bg-[#ff4d20]/10 px-3 py-1.5 rounded"
                        >
                            <FiRotateCcw /> Review Previous Nodes
                        </button>
                    )}
                    {isReviewMode && (
                        <button
                            onClick={handleReturnForward}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-500 hover:text-green-400 transition bg-green-500/10 px-3 py-1.5 rounded animate-pulse"
                        >
                            Return to Forward Node <FiArrowRight />
                        </button>
                    )}
                </div>

                {!isReviewMode && currentIndex === highestForwardIndex && (
                    <button
                        onClick={handleSkip}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition group"
                    >
                        Skip Node <FiSkipForward className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden bg-[#0d0605]">

                {/* IF REVIEW MODE: Show left sidebar list */}
                {isReviewMode && (
                    <div className="w-64 border-r border-[#ff4d20]/10 bg-[#140a08] flex flex-col shrink-0">
                        <div className="p-4 border-b border-[#ff4d20]/10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Skipped Nodes</h3>
                            <p className="text-[10px] text-white/30 mt-1">Select to resolve. Base points only.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {reviewQuestions.length === 0 ? (
                                <div className="p-4 text-center text-xs text-white/20 italic">No unresolved nodes found.</div>
                            ) : (
                                reviewQuestions.map((q) => (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setCurrentIndex(q.ogIndex);
                                            resetEditorState();
                                            // Persist viewing index for reload resilience
                                            axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                                                userId: activeSession.userId,
                                                currentViewingIndex: q.ogIndex
                                            }).catch(() => { });
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm flex justify-between items-center transition-colors border
                                            ${currentIndex === q.ogIndex
                                                ? "bg-[#ff4d20]/10 border-[#ff4d20]/30 text-white"
                                                : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"}`}
                                    >
                                        <span className="font-mono">N-{q.ogIndex + 1}</span>
                                        <span className="truncate ml-3 flex-1">{q.title}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* LEFT: DESCRIPTION */}
                <div className={`${isReviewMode ? "w-1/3" : "w-1/2"} p-6 overflow-y-auto border-r border-[#ff4d20]/10 relative`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <span className="text-8xl font-black font-mono">N{currentIndex + 1}</span>
                    </div>

                    <div className="mb-6 flex gap-3">
                        <span className="px-3 py-1 rounded bg-[#ff4d20]/10 text-[#ff4d20] border border-[#ff4d20]/20 text-xs font-bold tracking-widest uppercase">
                            {currentQuestion.base_points} Base Pts
                        </span>
                        {!currentQuestion.is_streak_eligible && (
                            <span className="px-3 py-1 rounded bg-white/5 text-white/50 border border-white/10 text-xs font-bold tracking-widest uppercase">
                                Non-Streak
                            </span>
                        )}
                        {currentQuestion.status === 'ACCEPTED' && (
                            <span className="px-3 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold tracking-widest uppercase flex items-center gap-1">
                                <FiCheckCircle /> Resolved
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold mb-4">{currentQuestion.title}</h1>

                    <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentQuestion.description}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* RIGHT: EDITOR */}
                <div className={`${isReviewMode ? "w-2/3" : "w-1/2"} flex flex-col`}>
                    <div className="h-10 border-b border-[#ff4d20]/10 flex items-center justify-between px-4 bg-[#140a08]">
                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Compiler Matrix</span>
                        <select
                            value={language}
                            onChange={(e) => { setLanguage(e.target.value); saveLastLanguage(e.target.value); }}
                            className="bg-black/50 text-xs text-[#ff4d20] font-bold tracking-wider px-3 py-1 rounded border border-[#ff4d20]/20 focus:outline-none uppercase"
                        >
                            <option value="python">Python</option>
                            <option value="c">C</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="go">Go</option>
                        </select>
                    </div>

                    <div className="flex-1 bg-[#1e1e1e]">
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

                    {/* CONSOLE */}
                    <div className="h-[250px] bg-[#0d0605] border-t border-[#ff4d20]/20 flex flex-col shrink-0">
                        <div className="h-10 bg-[#140a08] border-b border-[#ff4d20]/10 flex items-center px-4 justify-between">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setRightTab("input")}
                                    className={`text-xs font-bold uppercase tracking-widest transition h-full border-b-2 flex items-center
                                        ${rightTab === "input" ? "border-[#ff4d20] text-[#ff4d20]" : "border-transparent text-white/30 hover:text-white"}`}
                                >
                                    Custom Input
                                </button>
                                <button
                                    onClick={() => setRightTab("result")}
                                    className={`text-xs font-bold uppercase tracking-widest transition h-full border-b-2 flex items-center
                                        ${rightTab === "result" ? "border-[#ff4d20] text-[#ff4d20]" : "border-transparent text-white/30 hover:text-white"}`}
                                >
                                    Telemetry
                                </button>
                            </div>

                            {statusMessage && (
                                <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded 
                                    ${statusMessage.includes("Accepted") ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                        statusMessage.includes("Running") ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                            "bg-[#ff4d20]/20 text-[#ff4d20] border border-[#ff4d20]/30"}`}>
                                    {statusMessage}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            {rightTab === "input" ? (
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Enter test parameters..."
                                    className="w-full h-full bg-[#0d0605] p-4 text-sm font-mono text-white/70 focus:outline-none resize-none placeholder:text-white/20"
                                />
                            ) : (
                                <div className="absolute inset-0 p-4 font-mono text-sm overflow-auto text-white/70 bg-[#0d0605]">
                                    {isRunning ? (
                                        <div className="flex items-center gap-3 text-[#ff4d20]/50 italic animate-pulse">
                                            <FiPlay className="animate-spin" /> Transmitting sequence...
                                        </div>
                                    ) : (
                                        <pre className={`whitespace-pre-wrap ${statusMessage.includes("Wrong") || statusMessage.includes("Error") ? "text-[#ff4d20]" : statusMessage.includes("Accepted") ? "text-green-400" : ""}`}>
                                            {output || <span className="opacity-30 italic text-white/30">System idle. Awaiting code execution.</span>}
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
