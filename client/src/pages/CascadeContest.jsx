import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useIsCompactLayout from "../hooks/useIsCompactLayout";
import rehypeRaw from 'rehype-raw';
import {
    FiPlay, FiUpload, FiZap, FiCheckCircle, FiSkipForward, FiRotateCcw, FiArrowRight, FiCopy, FiCheck
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    LANGUAGE_IDS, BOILERPLATE, getCodeOrBoilerplate, saveCode, clearCodeStorage,
    saveLastLanguage, getLastLanguage
} from "../utils/codeStorage";
import { formatErrorForDisplay } from "../utils/errorFormatter";
import useContestProctoring from "../hooks/useContestProctoring";

// Configuration
const BACKEND_URL = import.meta.env.VITE_API_URL;
const SUBMISSION_URL = import.meta.env.VITE_SUBMISSION_URL;
const socket = io(SUBMISSION_URL); // LB has no auth

const STORAGE_PREFIX = "cascade";
const STREAK_MULTIPLIER = 20;

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
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[#1a1a1a] border border-[#3e3e3e] text-gray-400 hover:text-white hover:border-[#ff4d20]/50 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center gap-1.5 shadow-sm font-sans"
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
function CascadeCompletionOverlay({ completionMessage, countdown, setCountdown, onRedirect }) {
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
            <div className="bg-[#1f0e0a] border border-[#ff4d20]/30 rounded-2xl p-12 max-w-md w-full shadow-[0_0_80px_rgba(255,77,32,0.2)] text-center">
                <div className="text-7xl mb-6">🏆</div>
                <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-widest">Round Complete!</h2>
                <p className="text-gray-300 mb-8 leading-relaxed text-base">{completionMessage}</p>
                <p className="text-[#ff4d20]/70 text-sm mb-8">
                    Redirecting to leaderboard in <span className="font-black text-[#ff4d20]">{countdown}</span>s...
                </p>
                <button
                    onClick={onRedirect}
                    className="w-full px-8 py-4 bg-[#ff4d20] hover:bg-[#ff623d] text-white font-black rounded-xl uppercase tracking-widest transition shadow-[0_0_30px_rgba(255,77,32,0.4)] flex items-center justify-center gap-3 text-sm"
                >
                    <span>View Leaderboard ({countdown})</span>
                    <span>→</span>
                </button>
            </div>
        </div>
    );
}
export default function CascadeContest({ session }) {
    const navigate = useNavigate();
    const isCompactLayout = useIsCompactLayout();
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
    const cascadeScoreRef = useRef(0);    // stable ref for closures
    const activeSessionRef = useRef(null); // stable ref for closures

    // Keep refs in sync with state
    useEffect(() => { cascadeScoreRef.current = cascadeScore; }, [cascadeScore]);
    useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);

    // Code & Editor
    const [language, setLanguage] = useState(getLastLanguage());
    const [codes, setCodes] = useState({});
    const [customInput, setCustomInput] = useState("");

    // Execution Execution
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [rightTab, setRightTab] = useState("input");
    const isWaitingForResponse = useRef(false);
    const lastAction = useRef(null); // 'run' or 'submit'

    const [totalTimeLeft, setTotalTimeLeft] = useState(null); // null = loading, seeded from backend
    const [showGoBackModal, setShowGoBackModal] = useState(false);
    const [showSkipModal, setShowSkipModal] = useState(false);
    const [showReturnForwardModal, setShowReturnForwardModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false); // guard: prevent double-click on modal confirms
    const [contestStopped, setContestStopped] = useState(false);
    const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
    const [completionMessage, setCompletionMessage] = useState("");
    const isSyncingRef = useRef(false); // Guard for visibility re-sync
    const contestStoppedRef = useRef(false); // Ref to avoid stale closure in effects
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const isContestEndedRef = useRef(false); // Guard for completion
    const editorRef = useRef(null);
    const prevEditorKeyRef = useRef(null); // tracks "questionId__language" to detect real switches
    // Authenticated backend socket ref — created lazily in initSession with JWT
    const backendSocketRef = useRef(null);

    // Pause state
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(false); // stable ref for use inside callbacks/effects

    // Proctoring
    const { showWarning, warningMessage, warningButtonText, warningAction, violationCount, cleanupProctoring } = useContestProctoring("cascade", {
        contestEnded: totalTimeLeft === 0 || contestStopped,
        teamName: activeSession?.team,
        backendUrl: BACKEND_URL,
        onDisqualify: () => {
            cleanupProctoring();
            clearCodeStorage(STORAGE_PREFIX);
            localStorage.removeItem("cascadeToken");
            localStorage.removeItem("cascadeAccessCode");
            navigate("/cascade");
        }
    });

    // Listen for admin stop event and force_logout from backend socket
    useEffect(() => {
        // 401 interceptor — if ANY authenticated API call is rejected, go back to join
        const interceptor = axios.interceptors.response.use(
            res => res,
            err => {
                if (err.response?.status === 401 && !isContestEndedRef.current) navigate('/cascade');
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

    // Init & Resume Handling — only if no session was provided
    useEffect(() => {
        const initSession = async () => {
            const accessCode = localStorage.getItem("cascadeAccessCode");
            if (!accessCode) {
                navigate("/cascade");
                return;
            }

            try {
                const res = await fetch(`${BACKEND_URL}/cascade/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: accessCode }), // send raw access code
                });
                const data = await res.json();

                if (res.ok) {
                    // Update stored JWT (server issues fresh JWT on resume)
                    if (data.accessToken) localStorage.setItem('cascadeToken', data.accessToken);
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
                        navigate('/cascade');
                    });

                    // ── Pause / Resume listeners ──
                    bSocket.on('round_paused', ({ roundName }) => {
                        if (roundName === 'cascade') {
                            setIsPaused(true);
                            isPausedRef.current = true;
                        }
                    });

                    bSocket.on('round_resumed', ({ roundName }) => {
                        if (roundName === 'cascade') {
                            setIsPaused(false);
                            isPausedRef.current = false;
                            // Re-sync timer from server (end_time has been shifted forward)
                            handleTimeReSync();
                        }
                    });

                    // Listen for admin round_stopped broadcast
                    bSocket.on('round_stopped', (data) => {
                        if (data.roundName === 'cascade') {
                            setContestStopped(true);
                            contestStoppedRef.current = true;
                        }
                    });
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

            // Always sync pause state from server on join/resume
            // (covers the reload-during-pause case \u2014 socket won't replay past round_paused events)
            const seededPaused = activeSession.isPaused === true;
            setIsPaused(seededPaused);
            isPausedRef.current = seededPaused;
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
        if (activeSessionRef.current?.team) {
            localStorage.setItem("currentTeam", activeSessionRef.current.team);
        }
        // Tokens deferred to button click so ProtectedCascadeRoute doesn't kick in
        setCompletionMessage(msg);
        setShowCompletionOverlay(true);
        setRedirectCountdown(5);
    }

    // Handle contest end — guarded against admin stop to prevent double messaging
    useEffect(() => {
        if (totalTimeLeft === 0 && !contestStoppedRef.current) {
            triggerCompletion(`Contest Over! Your Cascade Score: ${cascadeScoreRef.current} pts (+ streak bonus on leaderboard)`);
        }
    }, [totalTimeLeft]);
    // Auto-redirect countdown when admin stops the contest
    useEffect(() => {
        if (!contestStopped || showCompletionOverlay) return;
        if (activeSessionRef.current?.team) localStorage.setItem("currentTeam", activeSessionRef.current.team);
        if (redirectCountdown <= 0) {
            cleanupProctoring();
            clearCodeStorage(STORAGE_PREFIX);
            localStorage.removeItem("cascadeToken");
            localStorage.removeItem("cascadeAccessCode");
            window.location.href = "/leaderboard";
            return;
        }
        const t = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [contestStopped, redirectCountdown, showCompletionOverlay]);
    // Shared time re-sync helper — called from visibility change AND after resume
    async function handleTimeReSync() {
        if (isContestEndedRef.current) return;
        try {
            const jwt = localStorage.getItem('cascadeToken');
            const res = await axios.post(`${BACKEND_URL}/cascade/time-check`, {}, {
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
            console.error("Failed to re-sync timer", e);
        }
    }

    // Visibility re-sync — re-fetch server time when tab wakes up
    useEffect(() => {
        if (!activeSession?.userId) return;

        const handleVisibilityChange = async () => {
            if (document.visibilityState !== 'visible') return;
            if (isSyncingRef.current) return;
            if (contestStoppedRef.current) return;
            if (isContestEndedRef.current) return; // don't sync after contest ended
            isSyncingRef.current = true;

            try {
                await handleTimeReSync();
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

            // SUBMIT Logic

            // Handle FAILED / ERROR from dispatcher (e.g. missing test cases, judge error)
            if (data.status === 'FAILED' || data.status === 'ERROR') {
                const { label, message } = formatErrorForDisplay(data);
                setOutput(message);
                setStatusMessage(label);
                return;
            }

            if (data.status === "ACCEPTED") {
                setStatusMessage("Accepted");
                setOutput("Correct Answer!");

                // Score data is computed server-side (dispatcher calls submit-result internally)
                // and arrives pre-attached to the socket payload — no separate API call needed.
                const scoreData = data;
                setCurrentStreak(scoreData.currentStreak ?? currentStreak);
                setMaxStreak(scoreData.maxStreak ?? maxStreak);
                if (scoreData.cascadeScore != null) {
                    setCascadeScore(scoreData.cascadeScore);
                }
                setHighestForwardIndex(scoreData.highestForwardIndex ?? highestForwardIndex);

                // Update local question status + check allSolved inside the updater
                // so we always see the fully-up-to-date questions array (Bug 7 + Bug 8 fix).
                setQuestions(prev => {
                    const newQ = [...prev];
                    newQ[currentIndex] = { ...newQ[currentIndex], status: 'ACCEPTED' };
                    const allSolved = newQ.every(q => q.status === 'ACCEPTED');
                    if (allSolved) {
                        const finalScore = scoreData.cascadeScore ?? cascadeScoreRef.current;
                        setTimeout(() => {
                            triggerCompletion(`All questions solved! Your Cascade Score: ${finalScore} pts`);
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            // Don't auto-advance if admin paused during the 1500ms delay
                            if (!isPausedRef.current) handleAdvance("Next question");
                        }, 1500);
                    }
                    return newQ;
                });
            }

            else {
                const stderr = data.stderr || '';
                const errorDetail = stderr || data.stdout || "Incorrect Answer. System streak preserved. Try again!";
                setOutput(errorDetail);

                // Use the shared error classifier for consistent status labels
                const { label } = formatErrorForDisplay(data);
                setStatusMessage(label);
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
                const jwt = localStorage.getItem('cascadeToken');
                axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                    currentViewingIndex: nextIdx
                }, {
                    headers: { Authorization: `Bearer ${jwt}` }
                }).catch(() => { });
            }
        } else {
            alert("All forward questions completed! Feel free to review skipped questions.");
        }
    };


    // Action: SKIP — opens confirmation modal; actual skip logic in confirmSkip
    const confirmSkip = async () => {
        setShowSkipModal(false);
        if (isPausedRef.current) return; // extra guard: modal may still be open when pause arrives
        setIsConfirming(true);
        try {
            const jwt = localStorage.getItem('cascadeToken');
            const res = await axios.post(`${BACKEND_URL}/cascade/skip`, {
                questionId: currentQuestion.id
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
            });

            // Streak broken
            setCurrentStreak(0);

            setQuestions(prev => {
                const newQ = [...prev];
                newQ[currentIndex].status = 'SKIPPED';
                return newQ;
            });

            // Advance (button is hidden on last question, so currentIndex < questions.length - 1 always holds here)
            if (currentIndex < questions.length - 1) {
                const nextIdx = currentIndex + 1;
                setCurrentIndex(nextIdx);
                setHighestForwardIndex(res.data.highestForwardIndex);
                resetEditorState();
                const jwt2 = localStorage.getItem('cascadeToken');
                axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                    currentViewingIndex: nextIdx
                }, {
                    headers: { Authorization: `Bearer ${jwt2}` }
                }).catch(() => { });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsConfirming(false);
        }
    };

    // Action: GO BACK
    const handleGoBack = async () => {
        setShowGoBackModal(false);
        if (isPausedRef.current) return; // extra guard: modal may still be open when pause arrives
        try {
            const jwt = localStorage.getItem('cascadeToken');
            await axios.post(`${BACKEND_URL}/cascade/go-back`, {}, {
                headers: { Authorization: `Bearer ${jwt}` }
            });

            // Streak broken
            setCurrentStreak(0);
            setIsReviewMode(true);

            // Update local eligibility
            setQuestions(prev => {
                const newQ = [...prev];
                for (let i = 0; i < highestForwardIndex; i++) {
                    newQ[i] = { ...newQ[i], is_streak_eligible: false };
                }
                return newQ;
            });

            // Auto-select first available skipped question
            const firstSkipped = questions.findIndex((q, i) => i < highestForwardIndex && q.status !== 'ACCEPTED');
            if (firstSkipped !== -1) {
                setCurrentIndex(firstSkipped);
                resetEditorState();
                // Persist the initial review index
                const jwt = localStorage.getItem('cascadeToken');
                axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                    currentViewingIndex: firstSkipped
                }, {
                    headers: { Authorization: `Bearer ${jwt}` }
                }).catch(() => { });
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Action: RETURN TO FORWARD PROGRESSION — opens confirmation modal; actual logic in confirmReturnForward
    const confirmReturnForward = async () => {
        setShowReturnForwardModal(false);
        if (isPausedRef.current) return; // extra guard: modal may still be open when pause arrives
        setIsConfirming(true);
        try {
            const jwt = localStorage.getItem('cascadeToken');
            await axios.post(`${BACKEND_URL}/cascade/return-forward`, {}, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            setIsReviewMode(false);
            setCurrentIndex(highestForwardIndex);
            resetEditorState();
            // Persist return to forward
            axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                currentViewingIndex: highestForwardIndex
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
            }).catch(() => { });
        } catch (e) {
            console.error(e);
        } finally {
            setIsConfirming(false);
        }
    };


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


    const resetEditorState = () => {
        setOutput("");
        setStatusMessage("");
        setRightTab("input");
    };

    const handleResetCode = () => {
        if (!currentQuestion || !editorRef.current) return;
        // setValue triggers onChange → which updates codes state + saves to localStorage
        editorRef.current.setValue(BOILERPLATE[language] || "");
    };


    async function handleRun() {
        if (!currentQuestion) return;
        if (isPausedRef.current) return; // block while paused
        lastAction.current = "run";
        setIsRunning(true);
        setRightTab("result");
        setOutput("Running...");
        setStatusMessage("Running...");
        isWaitingForResponse.current = true;

        const code = codes[currentQuestion.id]?.[language] || getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language);
        const langId = LANGUAGE_IDS[language];

        try {
            const jwt = localStorage.getItem('cascadeToken');
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
        setOutput("Submitting...");
        setStatusMessage("Judging...");
        isWaitingForResponse.current = true;

        const code = codes[currentQuestion.id]?.[language] || getCodeOrBoilerplate(STORAGE_PREFIX, currentQuestion.id, language);
        const langId = LANGUAGE_IDS[language];

        try {
            const jwt = localStorage.getItem('cascadeToken');
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
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#110806] font-sans text-[#eff1f6] lg:h-screen lg:overflow-hidden">
            {/* COMPLETION OVERLAY */}
            {showCompletionOverlay && (
                <CascadeCompletionOverlay
                    completionMessage={completionMessage}
                    countdown={redirectCountdown}
                    setCountdown={setRedirectCountdown}
                    onRedirect={() => {
                        localStorage.removeItem("cascadeToken");
                        localStorage.removeItem("cascadeAccessCode");
                        navigate("/leaderboard");
                    }}
                />
            )}

            {/* PROCTORING WARNING OVERLAY */}
            {showWarning && !contestStopped && !showCompletionOverlay && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="bg-[#1f0e0a] border border-[#ff4d20]/30 rounded-2xl p-10 max-w-md w-full shadow-[0_0_60px_rgba(255,77,32,0.15)] text-center">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-widest">Warning</h2>
                        <p className="text-gray-300 mb-4 leading-relaxed">{warningMessage}</p>
                        <p className="text-sm text-[#ff4d20]/70 mb-8 font-bold">Violations recorded: {violationCount}</p>
                        <button
                            onClick={warningAction}
                            className="px-8 py-3 bg-[#ff4d20] hover:bg-[#ff623d] text-white font-bold rounded-xl uppercase tracking-wide transition shadow-[0_0_20px_rgba(255,77,32,0.3)] w-full"
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
                        <p className="text-gray-400 text-lg mb-4">                            The Coding Cascade has been stopped by the admin.<br />
                            Your progress has been saved.<br />
                            <span className="text-[#f4a460] font-bold">Your Score: {cascadeScore} pts (+ streak bonus on leaderboard)</span>
                        </p>
                        <p className="text-[#ff4d20]/70 text-sm mb-8">
                            Redirecting in <span className="font-black text-[#ff4d20]">{redirectCountdown}</span>s...
                        </p>
                        <button
                            onClick={() => { cleanupProctoring(); clearCodeStorage(STORAGE_PREFIX); localStorage.removeItem("cascadeToken"); localStorage.removeItem("cascadeAccessCode"); navigate("/leaderboard"); }}
                            className="px-8 py-3 bg-[#ff4d20] hover:bg-[#ff623d] text-white font-bold rounded-xl uppercase tracking-wide transition shadow-[0_0_20px_rgba(255,77,32,0.3)]"
                        >
                            Check Leaderboard ({redirectCountdown})
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
                            <button onClick={handleGoBack} disabled={isPaused} className="flex-1 py-3 bg-[#ff4d20] hover:bg-[#ff623d] rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-[0_0_15px_rgba(255,77,32,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                                Break Streak & Review <FiRotateCcw />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SKIP NODE MODAL --- */}
            {showSkipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1f0e0a] border border-[#ff4d20]/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,77,32,0.1)]">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <FiSkipForward className="text-[#ff4d20]" /> Confirm Skip
                        </h2>
                        <p className="text-gray-300 mb-6 font-light leading-relaxed">
                            Skipping this node will immediately <strong className="text-[#ff4d20]">BREAK</strong> your current streak of <strong className="text-white">{currentStreak}</strong>.
                            Your maximum streak of <span className="text-yellow-500 font-bold">{maxStreak}</span> is safely logged.
                            <br /><br />
                            The skipped node can still be solved later in review mode (base points only, no streak).
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSkipModal(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSkip}
                                disabled={isConfirming || isPaused}
                                className="flex-1 py-3 bg-[#ff4d20] hover:bg-[#ff623d] rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-[0_0_15px_rgba(255,77,32,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Break Streak & Skip <FiSkipForward />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- RETURN TO FORWARD MODAL --- */}
            {showReturnForwardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1f0e0a] border border-green-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.08)]">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <FiArrowRight className="text-green-500" /> Return to Forward Progression
                        </h2>
                        <p className="text-gray-300 mb-6 font-light leading-relaxed">
                            You will exit review mode and resume at <strong className="text-white">Node {highestForwardIndex + 1}</strong>.
                            A <strong className="text-green-400">new streak</strong> will begin from here.
                            <br /><br />
                            Unsolved review nodes will still be available if you go back again, but forward streak eligibility is gone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowReturnForwardModal(false)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReturnForward}
                                disabled={isConfirming || isPaused}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm & Return <FiArrowRight />
                            </button>
                        </div>
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
            <nav className="relative z-40 flex min-h-[70px] flex-wrap items-center justify-between gap-4 border-b border-[#ff4d20]/20 bg-[#1a0b08] px-4 py-3 sm:px-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d20]/5 to-transparent pointer-events-none" />

                {/* Left Side: Brand & Question Number */}
                <div className="relative z-10 flex min-w-0 flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex flex-col">
                        <span className="text-[#ff4d20] font-black tracking-widest uppercase italic text-sm">Coding Cascade</span>
                        <span className="text-xs text-white/50 tracking-widest uppercase">Sector 2</span>
                    </div>

                    <div className="h-8 w-px bg-white/10"></div>

                    <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg flex items-center gap-3">
                        <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Node</span>
                        <span className="text-white font-bold">{currentIndex + 1} / {questions.length}</span>
                        {isReviewMode && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest border border-yellow-500/30">Review</span>}
                    </div>
                </div>

                {/* Center: Streak Counters */}
                <div className="relative z-10 flex w-full flex-wrap items-center gap-5 rounded-2xl border border-white/5 bg-black/40 px-4 py-3 shadow-inner lg:w-auto lg:px-8 lg:py-2">
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
                <div className="relative z-10 flex w-full flex-wrap items-center gap-4 lg:w-auto lg:gap-6">
                    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/40 px-4 py-2 shadow-inner sm:px-5">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em] leading-none mb-1">Current Score</span>
                            <span className="font-mono text-xl font-black text-white">{cascadeScore}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="flex flex-col items-start translate-y-0.5">
                            <span className="text-[10px] text-yellow-500/70 uppercase font-bold tracking-[0.2em] leading-none mb-1">Streak Bonus</span>
                            <span className="font-mono text-xl font-black text-yellow-500">+{maxStreak * STREAK_MULTIPLIER}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[80px]">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none mb-1">Uplink Closes</span>
                        <span className={`font-mono text-2xl font-black leading-none ${totalTimeLeft !== null && totalTimeLeft < 300 ? "text-red-500 animate-pulse" : "text-[#ff4d20]"}`}>
                            {totalTimeLeft !== null ? formatTime(totalTimeLeft) : "--:--"}
                        </span>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
                        <button
                            onClick={handleRun}
                            disabled={isRunning || isPaused}
                            className="flex items-center justify-center gap-2 size-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isPaused ? "Contest paused" : "Run Code"}
                        >
                            <FiPlay className={isRunning ? "animate-spin" : "text-green-500"} />
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning || isPaused}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#ff4d20] to-[#e63e15] hover:from-[#ff623d] hover:to-[#ff4d20] text-white font-black uppercase tracking-wide transition shadow-[0_0_20px_rgba(255,77,32,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isPaused ? "Contest paused" : ""}
                        >
                            {isRunning ? "Transmitting..." : "Submit Question"} <FiUpload />
                        </button>
                    </div>
                </div>
            </nav>

            {/* SECONDARY NAV (Navigation specific to Cascade) */}
            <div className="relative z-30 flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-[#ff4d20]/10 bg-[#140a08] px-4 py-3 sm:px-6">
                <div className="flex flex-wrap gap-3 sm:gap-4">
                    {!isReviewMode && highestForwardIndex > 0 && (
                        <button
                            onClick={() => setShowGoBackModal(true)}
                            disabled={isPaused}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ff4d20] hover:text-white transition bg-[#ff4d20]/10 hover:bg-[#ff4d20]/20 border border-[#ff4d20]/30 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(255,77,32,0.1)] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <FiRotateCcw /> Review Previous Questions
                        </button>
                    )}
                    {isReviewMode && (
                        <button
                            onClick={() => setShowReturnForwardModal(true)}
                            disabled={isPaused}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-500 hover:text-green-400 transition bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-lg animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.1)] disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none"
                        >
                            Return to Forward Question <FiArrowRight />
                        </button>
                    )}
                </div>

                {/* Bug 1 fix: also hide Skip on the very last question (nothing to skip to) */}
                {!isReviewMode && currentIndex === highestForwardIndex && currentIndex < questions.length - 1 && (
                    <button
                        onClick={() => setShowSkipModal(true)}
                        disabled={isPaused}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-[#ff4d20] transition bg-white/5 hover:bg-[#ff4d20]/10 border border-white/10 hover:border-[#ff4d20]/40 px-4 py-2 rounded-lg group shadow-[0_0_10px_rgba(255,255,255,0.02)] hover:shadow-[0_0_15px_rgba(255,77,32,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Skip Question <FiSkipForward className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex flex-1 flex-col overflow-y-auto bg-[#0d0605] lg:flex-row lg:overflow-hidden">

                {/* IF REVIEW MODE: Show left sidebar list */}
                {isReviewMode && (
                    <div className="flex w-full shrink-0 flex-col border-b border-[#ff4d20]/10 bg-[#140a08] lg:w-64 lg:border-b-0 lg:border-r">
                        <div className="p-4 border-b border-[#ff4d20]/10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Skipped Questions</h3>
                            <p className="text-[10px] text-white/30 mt-1">Select to resolve. Base points only.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {reviewQuestions.length === 0 ? (
                                <div className="p-4 text-center text-xs text-white/20 italic">No unresolved questions found.</div>
                            ) : (
                                reviewQuestions.map((q) => (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setCurrentIndex(q.ogIndex);
                                            resetEditorState();
                                            // Persist viewing index for reload resilience
                                            const jwt = localStorage.getItem('cascadeToken');
                                            axios.post(`${BACKEND_URL}/cascade/update-viewing-index`, {
                                                currentViewingIndex: q.ogIndex
                                            }, {
                                                headers: { Authorization: `Bearer ${jwt}` }
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
                <div className={`${isReviewMode ? "lg:w-1/3" : "lg:w-1/2"} relative overflow-y-auto border-b border-[#ff4d20]/10 p-4 sm:p-6 lg:border-b-0 lg:border-r`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <span className="text-8xl font-black font-mono">N{currentIndex + 1}</span>
                    </div>

                    <div className="mb-6 flex gap-3 flex-wrap">
                        <span className="px-3 py-1 rounded bg-[#ff4d20]/10 text-[#ff4d20] border border-[#ff4d20]/20 text-xs font-bold tracking-widest uppercase">
                            {currentQuestion.base_points} Base Pts
                        </span>
                        {currentQuestion.time_limit != null && (
                            <span className="px-3 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-bold tracking-widest uppercase flex items-center gap-1">
                                ⚡ TL: {currentQuestion.time_limit}s
                            </span>
                        )}
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

                    <div
                        className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10"
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

                {/* RIGHT: EDITOR */}
                <div className={`${isReviewMode ? "lg:w-2/3" : "lg:w-1/2"} flex min-h-[70vh] flex-col`}>
                    <div className="h-10 border-b border-[#ff4d20]/10 flex items-center justify-between px-4 bg-[#140a08]">
                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Compiler Matrix</span>
                        <div className="flex items-center gap-2">
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
                            <button
                                onClick={handleResetCode}
                                disabled={isRunning}
                                title="Reset to default boilerplate"
                                className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#ff4d20]/20 text-white/40 hover:text-[#ff4d20] hover:border-[#ff4d20]/50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-bold uppercase tracking-wider"
                            >
                                <FiRotateCcw className="text-xs" /> Reset
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#1e1e1e]">
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
                                    Output
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