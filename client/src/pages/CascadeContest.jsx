import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
    const [leftPanelWidth, setLeftPanelWidth] = useState(46); // percentage of the main work area
    const [editorHeight, setEditorHeight] = useState(68); // percentage of the right panel
    const isResizingHorizontal = useRef(false);
    const isResizingVertical = useRef(false);

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

    // Resizable panels
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizingHorizontal.current) {
                const workArea = document.getElementById("cascade-work-area");
                if (workArea) {
                    const rect = workArea.getBoundingClientRect();
                    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
                    if (newWidth > 26 && newWidth < 74) {
                        setLeftPanelWidth(newWidth);
                    }
                }
            }

            if (isResizingVertical.current) {
                const container = document.getElementById("cascade-right-panel");
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
                    if (newHeight > 35 && newHeight < 82) {
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
                const stderr = data.stderr || '';
                const errorDetail = stderr || data.stdout || "Incorrect Answer. System streak preserved. Try again!";
                setOutput(errorDetail);

                // Distinguish TLE vs compile error vs plain wrong answer
                const lowerStderr = stderr.toLowerCase();
                const statusLabel =
                    lowerStderr.includes('time limit') ? 'Time Limit Exceeded' :
                        lowerStderr.includes('compile') || lowerStderr.includes('error:') || lowerStderr.includes('error on line') ? 'Compile Error' :
                            data.status === 'FAILED' ? 'Judge Error' :
                                'Wrong Answer';
                setStatusMessage(statusLabel);
                // WRONG ANSWER / TLE DOES NOT BREAK STREAK IN CASCADE. They can retry.
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
        <div className="h-screen flex flex-col bg-[#0d0605] text-[#eff1f6] font-sans overflow-hidden">

            {/* Contest Stopped Overlay */}
            {contestStopped && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="text-center max-w-lg mx-auto px-6">
                        <div className="text-5xl mb-4">🛑</div>
                        <h1 className="text-3xl font-bold text-white mb-3">Contest Stopped</h1>
                        <p className="text-white/60 mb-2">The Coding Cascade has been stopped by the admin.</p>
                        <p className="text-white/60 mb-6">Your progress has been saved.</p>
                        <div className="text-[#ff4d20] font-bold text-lg mb-6">
                            Score: {cascadeScore} pts (+ streak bonus)
                        </div>
                        <button
                            onClick={() => { clearCodeStorage(STORAGE_PREFIX); localStorage.removeItem("cascadeToken"); navigate("/rounds"); }}
                            className="px-6 py-2.5 bg-[#ff4d20] hover:bg-[#ff623d] text-white font-semibold rounded-lg transition-colors"
                        >
                            Return to Rounds
                        </button>
                    </div>
                </div>
            )}

            {/* Go Back Modal */}
            {showGoBackModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1a0b08] border border-[#ff4d20]/30 rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <FiRotateCcw className="text-[#ff4d20] text-xl" />
                            <h2 className="text-lg font-semibold text-white">Confirm Review Mode</h2>
                        </div>
                        <p className="text-white/70 mb-4 leading-relaxed">
                            Going back will <span className="text-[#ff4d20] font-medium">break your current streak</span> of <span className="text-white font-medium">{currentStreak}</span>.
                        </p>
                        <p className="text-white/70 mb-6 leading-relaxed">
                            Your max streak of <span className="text-yellow-500 font-medium">{maxStreak}</span> is safely logged.
                            You'll see only unsolved questions from previous nodes.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowGoBackModal(false)}
                                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGoBack}
                                className="flex-1 py-2.5 bg-[#ff4d20] hover:bg-[#ff623d] rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <FiRotateCcw size={16} />
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <header className="h-14 bg-[#1a0b08] border-b border-[#ff4d20]/20 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[#ff4d20] font-bold text-sm tracking-wide">CASCADE</span>
                        <span className="text-white/20">|</span>
                        <span className="text-white/50 text-xs">Problem {currentIndex + 1}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Streak Display */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${currentStreak > 0
                                    ? 'bg-[#ff4d20]/10 border border-[#ff4d20]/30'
                                    : 'bg-white/5 border border-white/10'
                                }`}>
                                <FiZap className={`text-sm ${currentStreak > 0 ? 'text-[#ff4d20]' : 'text-white/30'}`} />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <span className={`font-bold ${currentStreak > 0 ? 'text-white' : 'text-white/40'}`}>{currentStreak}</span>
                                    <span className="text-[10px] text-[#ff4d20] font-medium">{multiplier}</span>
                                </div>
                                <div className="text-[9px] text-white/40 uppercase tracking-wide">Streak</div>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#ffb347]/10 border border-[#ffb347]/30">
                                <span className="material-symbols-outlined text-sm text-[#ffb347]">scoreboard</span>
                            </div>
                            <div>
                                <div className="font-bold text-white">{cascadeScore}</div>
                                <div className="text-[9px] text-white/40 uppercase tracking-wide">Score</div>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-yellow-500/10 border border-yellow-500/30">
                                <span className="material-symbols-outlined text-sm text-yellow-500">emoji_events</span>
                            </div>
                            <div>
                                <div className="font-bold text-white">{maxStreak}</div>
                                <div className="text-[9px] text-white/40 uppercase tracking-wide">Best</div>
                            </div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                        <div className="text-right">
                            <div className="text-[9px] text-white/40 uppercase tracking-wide">Time Remaining</div>
                            <div className={`font-mono font-bold ${totalTimeLeft !== null && totalTimeLeft < 300 ? 'text-red-500' : 'text-[#ff4d20]'}`}>
                                {totalTimeLeft !== null ? formatTime(totalTimeLeft) : '--:--'}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiPlay className={`text-sm ${isRunning ? 'animate-spin text-[#ff4d20]' : 'text-green-500'}`} />
                            Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#ff4d20] hover:bg-[#ff623d] rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiUpload size={16} />
                            Submit
                        </button>
                    </div>
                </div>
            </header>

            {/* Problem Navigation Bar */}
            <div className="h-10 bg-[#140a08] border-b border-[#ff4d20]/10 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    {!isReviewMode && highestForwardIndex > 0 && (
                        <button
                            onClick={() => setShowGoBackModal(true)}
                            className="flex items-center gap-1.5 text-xs text-[#ff4d20] hover:text-[#ff623d] font-medium transition-colors"
                        >
                            <FiRotateCcw size={14} />
                            Review Previous
                        </button>
                    )}
                    {isReviewMode && (
                        <button
                            onClick={handleReturnForward}
                            className="flex items-center gap-1.5 text-xs text-green-500 hover:text-green-400 font-medium transition-colors"
                        >
                            Return to Current
                            <FiArrowRight size={14} />
                        </button>
                    )}
                </div>
                {!isReviewMode && currentIndex === highestForwardIndex && (
                    <button
                        onClick={handleSkip}
                        className="flex items-center gap-1.5 rounded-full border border-[#ffb347]/30 bg-[#ffb347]/12 px-3 py-1.5 text-xs font-semibold text-[#ffd28c] transition-colors hover:bg-[#ffb347]/20 hover:text-white"
                    >
                        Skip Problem
                        <FiSkipForward size={14} />
                    </button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Review Mode Sidebar */}
                {isReviewMode && (
                    <div className="w-56 bg-[#140a08] border-r border-[#ff4d20]/10 flex flex-col shrink-0">
                        <div className="p-3 border-b border-[#ff4d20]/10">
                            <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">Previous Problems</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {reviewQuestions.length === 0 ? (
                                <div className="p-4 text-center text-xs text-white/30">No problems to review</div>
                            ) : (
                                reviewQuestions.map((q) => (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setCurrentIndex(q.ogIndex);
                                            resetEditorState();
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${currentIndex === q.ogIndex
                                                ? 'bg-[#ff4d20]/10 text-white border border-[#ff4d20]/20'
                                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <div className="font-mono text-[10px] text-white/40 mb-0.5">#{q.ogIndex + 1}</div>
                                        <div className="truncate">{q.title}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div id="cascade-work-area" className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Problem Statement */}
                    <div
                        className="flex flex-col border-r border-[#ff4d20]/10 min-w-0"
                        style={{ width: `${leftPanelWidth}%` }}
                    >
                        <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="p-5 space-y-5">
                            {/* Problem Header */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="px-2.5 py-1 bg-[#ff4d20]/10 border border-[#ff4d20]/20 rounded text-[#ff4d20] text-xs font-semibold">
                                        {currentQuestion.base_points} pts
                                    </span>
                                    {currentQuestion.time_limit && (
                                        <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-xs font-semibold flex items-center gap-1">
                                            <FiZap size={12} />
                                            {currentQuestion.time_limit}s
                                        </span>
                                    )}
                                    {currentQuestion.status === 'ACCEPTED' && (
                                        <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-500 text-xs font-semibold flex items-center gap-1">
                                            <FiCheckCircle size={12} />
                                            Solved
                                        </span>
                                    )}
                                    {!currentQuestion.is_streak_eligible && (
                                        <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/40 text-xs font-medium">
                                            No Streak
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-xl font-bold text-white">{currentQuestion.title}</h1>
                            </div>

                            {/* Problem Description */}
                            <div className="bg-[#140a08]/50 rounded-lg border border-white/5">
                                <div className="px-4 py-2.5 border-b border-white/5">
                                    <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">Description</div>
                                </div>
                                <div className="p-4">
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:text-white/80 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-[#ff4d20] prose-code:text-white/90 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                            {currentQuestion.description}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* Example */}
                            {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                                <div className="bg-[#140a08]/50 rounded-lg border border-white/5">
                                    <div className="px-4 py-2.5 border-b border-white/5">
                                        <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">Example</div>
                                    </div>
                                    <div className="p-4">
                                        {currentQuestion.examples.slice(0, 1).map((example, idx) => (
                                            <div key={idx} className="grid grid-cols-2 gap-3">
                                                <div className="bg-black/40 rounded border border-white/5">
                                                    <div className="px-3 py-1.5 border-b border-white/5">
                                                        <div className="text-[10px] uppercase tracking-wide text-white/40 font-semibold">Input</div>
                                                    </div>
                                                    <pre className="p-3 text-xs font-mono text-white/80 whitespace-pre-wrap break-all">{example.input}</pre>
                                                </div>
                                                <div className="bg-black/40 rounded border border-white/5">
                                                    <div className="px-3 py-1.5 border-b border-white/5">
                                                        <div className="text-[10px] uppercase tracking-wide text-white/40 font-semibold">Output</div>
                                                    </div>
                                                    <pre className="p-3 text-xs font-mono text-[#ff4d20] whitespace-pre-wrap break-all">{example.output}</pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {currentQuestion.notes && (
                                <div className="bg-[#140a08]/50 rounded-lg border border-white/5">
                                    <div className="px-4 py-2.5 border-b border-white/5">
                                        <div className="text-xs font-semibold text-white/50 uppercase tracking-wide">Notes</div>
                                    </div>
                                    <div className="p-4">
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:text-white/70 prose-p:leading-relaxed">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                {currentQuestion.notes}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>

                    <div
                        onMouseDown={startHorizontalResize}
                        className="w-1.5 shrink-0 cursor-col-resize bg-[#ff4d20]/8 transition-colors hover:bg-[#ff4d20]/25"
                        aria-label="Resize panels"
                    />

                    {/* Right Panel - Code Editor */}
                    <div
                        id="cascade-right-panel"
                        className="flex min-w-0 flex-col"
                        style={{ width: `${100 - leftPanelWidth}%` }}
                    >
                        {/* Editor Toolbar */}
                        <div className="h-11 bg-[#140a08] border-b border-[#ff4d20]/10 flex items-center justify-between px-4 shrink-0">
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wide">Code Editor</div>
                            <select
                                value={language}
                                onChange={(e) => { setLanguage(e.target.value); saveLastLanguage(e.target.value); }}
                                className="bg-black/40 text-xs text-white/80 font-medium px-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-[#ff4d20]/30 uppercase"
                            >
                                <option value="python">Python</option>
                                <option value="c">C</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="go">Go</option>
                            </select>
                        </div>

                        {/* Monaco Editor */}
                        <div className="bg-[#1e1e1e] min-h-0" style={{ height: `${editorHeight}%` }}>
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
                                    padding: { top: 16, bottom: 16 },
                                    lineHeight: 1.6,
                                    wordWrap: 'on',
                                    renderWhitespace: 'none',
                                    cursorBlinking: 'smooth',
                                    smoothScrolling: true,
                                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                    fontLigatures: true,
                                }}
                            />
                        </div>

                        <div
                            onMouseDown={startVerticalResize}
                            className="h-1.5 shrink-0 cursor-row-resize bg-[#ff4d20]/8 transition-colors hover:bg-[#ff4d20]/25"
                            aria-label="Resize editor and output"
                        />

                        {/* Console Panel */}
                        <div className="bg-[#0d0605] border-t border-[#ff4d20]/20 flex min-h-0 flex-1 flex-col">
                            {/* Tabs */}
                            <div className="h-10 bg-[#140a08] border-b border-[#ff4d20]/10 flex items-center justify-between px-4">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setRightTab("input")}
                                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${rightTab === "input"
                                                ? 'bg-[#ff4d20]/10 text-[#ff4d20] border border-[#ff4d20]/20'
                                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        Custom Input
                                    </button>
                                    <button
                                        onClick={() => setRightTab("result")}
                                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${rightTab === "result"
                                                ? 'bg-[#ff4d20]/10 text-[#ff4d20] border border-[#ff4d20]/20'
                                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        Output
                                    </button>
                                </div>
                                {statusMessage && (
                                    <span className={`text-[10px] uppercase font-bold tracking-wide px-2.5 py-1 rounded ${statusMessage.includes("Accepted") ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            statusMessage.includes("Running") ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                'bg-[#ff4d20]/10 text-[#ff4d20] border border-[#ff4d20]/20'
                                        }`}>
                                        {statusMessage}
                                    </span>
                                )}
                            </div>

                            {/* Panel Content */}
                            <div className="flex-1 overflow-hidden min-h-0">
                                {rightTab === "input" ? (
                                    <textarea
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="Enter test input here..."
                                        className="w-full h-full bg-[#0d0605] p-4 text-sm font-mono text-white/80 focus:outline-none resize-none placeholder:text-white/20 leading-relaxed"
                                    />
                                ) : (
                                    <div className="w-full h-full p-4 font-mono text-sm overflow-auto text-white/80 bg-[#0d0605]">
                                        {isRunning ? (
                                            <div className="flex items-center gap-2 text-[#ff4d20]/70">
                                                <FiPlay className="animate-spin" />
                                                <span>Running...</span>
                                            </div>
                                        ) : (
                                            <pre className={`whitespace-pre-wrap leading-relaxed ${statusMessage.includes("Wrong") || statusMessage.includes("Error") || statusMessage.includes("Limit")
                                                    ? 'text-[#ff4d20]'
                                                    : statusMessage.includes("Accepted")
                                                        ? 'text-green-400'
                                                        : ''
                                                }`}>
                                                {output || <span className="text-white/30">No output yet. Run or submit your code to see results.</span>}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
