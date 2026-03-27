import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ROUND_CONFIG = {
    rapidfire: { label: "Rapid Fire", color: "orange" },
    cascade: { label: "Coding Cascade", color: "blue" },
    dsa: { label: "DSA Challenge", color: "purple" },
};

export default function AdminSampleInputs() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = localStorage.getItem("adminToken");

    const [activeRound, setActiveRound] = useState(searchParams.get("round") || "rapidfire");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Track edits: { questionId: "new sample input text" }
    const [edits, setEdits] = useState({});
    // Track saving state per question: { questionId: "saving" | "success" | "error" }
    const [saveStatus, setSaveStatus] = useState({});

    const [globalSaving, setGlobalSaving] = useState(false);
    const [globalError, setGlobalError] = useState("");
    const [globalSuccess, setGlobalSuccess] = useState("");

    useEffect(() => {
        if (!token) navigate("/admin/login");
    }, [token, navigate]);

    const fetchQuestions = useCallback(async (round) => {
        setLoading(true);
        setGlobalError("");
        setEdits({});
        setSaveStatus({});
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/questions/${round}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok) {
                setQuestions(data);
                // Initialize edits with current sample_input
                const initialEdits = {};
                data.forEach(q => {
                    initialEdits[q.id] = q.sample_input || "";
                });
                setEdits(initialEdits);
            } else {
                setGlobalError(data.error || "Failed to load questions");
            }
        } catch {
            setGlobalError("Network error loading questions");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchQuestions(activeRound);
    }, [activeRound, fetchQuestions]);

    function showGlobalSuccess(msg) {
        setGlobalSuccess(msg);
        setTimeout(() => setGlobalSuccess(""), 3000);
    }

    const handleSaveSingle = async (id, inputValue) => {
        setSaveStatus(prev => ({ ...prev, [id]: "saving" }));
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/questions/${id}/sample-input`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ sample_input: inputValue }),
                }
            );

            if (res.ok) {
                setSaveStatus(prev => ({ ...prev, [id]: "success" }));
                setTimeout(() => setSaveStatus(prev => ({ ...prev, [id]: null })), 2000);
            } else {
                setSaveStatus(prev => ({ ...prev, [id]: "error" }));
            }
        } catch {
            setSaveStatus(prev => ({ ...prev, [id]: "error" }));
        }
    };

    const handleSaveAll = async () => {
        setGlobalSaving(true);
        setGlobalError("");
        let successCount = 0;
        let errorCount = 0;

        for (const q of questions) {
            const currentVal = edits[q.id] !== undefined ? edits[q.id] : (q.sample_input || "");
            setSaveStatus(prev => ({ ...prev, [q.id]: "saving" }));
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/questions/${q.id}/sample-input`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ sample_input: currentVal }),
                    }
                );
                if (res.ok) {
                    setSaveStatus(prev => ({ ...prev, [q.id]: "success" }));
                    successCount++;
                } else {
                    setSaveStatus(prev => ({ ...prev, [q.id]: "error" }));
                    errorCount++;
                }
            } catch {
                setSaveStatus(prev => ({ ...prev, [q.id]: "error" }));
                errorCount++;
            }
        }

        setGlobalSaving(false);
        if (errorCount > 0) {
            setGlobalError(`Saved ${successCount} successfully, but ${errorCount} failed.`);
        } else {
            showGlobalSuccess(`Successfully saved all ${successCount} questions.`);
        }

        // clear local success states after 2s
        setTimeout(() => {
            setSaveStatus({});
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#111] text-white font-sans">
            {/* Header */}
            <header className="flex justify-between items-center px-8 py-5 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="text-gray-500 hover:text-white text-sm transition"
                    >
                        ← Dashboard
                    </button>
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-orange-500">
                        Sample Input Editor
                    </h1>
                </div>
                <button
                    onClick={() => { localStorage.removeItem("adminToken"); navigate("/admin/login"); }}
                    className="text-xs text-gray-500 hover:text-white uppercase font-bold"
                >
                    Logout
                </button>
            </header>

            <div className="px-8 py-6 max-w-6xl mx-auto">
                {/* Round Tabs */}
                <div className="flex gap-2 mb-8">
                    {Object.entries(ROUND_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setActiveRound(key)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold uppercase transition border ${activeRound === key
                                ? "bg-orange-600 border-orange-500 text-white"
                                : "bg-[#1a1a1a] border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                }`}
                        >
                            {cfg.label}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="text-sm font-semibold text-gray-300">
                        {questions.length} questions
                    </div>
                    <button
                        onClick={handleSaveAll}
                        disabled={globalSaving || loading || questions.length === 0}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition"
                    >
                        {globalSaving ? "Saving All..." : "Save All"}
                    </button>
                </div>

                {globalError && (
                    <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-red-300 text-sm">
                        {globalError}
                    </div>
                )}
                {globalSuccess && (
                    <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 rounded-lg text-green-300 text-sm">
                        ✓ {globalSuccess}
                    </div>
                )}

                {loading ? (
                    <div className="text-center text-gray-500 py-16">Loading questions…</div>
                ) : (
                    <div className="space-y-4">
                        {questions.map(q => (
                            <div key={q.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start">
                                <div className="w-full md:w-1/3 shrink-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {activeRound !== "rapidfire" && (
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                #{q.sequence_order}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">
                                            ID: {q.id}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-white text-sm leading-snug">
                                        {q.title}
                                    </h3>
                                </div>
                                <div className="flex-1 w-full">
                                    <textarea
                                        value={edits[q.id] !== undefined ? edits[q.id] : (q.sample_input || "")}
                                        onChange={(e) => setEdits(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        placeholder="Enter sample input here..."
                                        rows={4}
                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 resize-y font-mono"
                                    />
                                </div>
                                <div className="w-full md:w-32 shrink-0 flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => handleSaveSingle(q.id, edits[q.id])}
                                        disabled={saveStatus[q.id] === "saving"}
                                        className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white text-xs font-bold rounded-lg transition"
                                    >
                                        {saveStatus[q.id] === "saving" ? "Saving..." : "Save"}
                                    </button>
                                    {saveStatus[q.id] === "success" && (
                                        <span className="text-xs text-green-400 font-bold">✓ Saved</span>
                                    )}
                                    {saveStatus[q.id] === "error" && (
                                        <span className="text-xs text-red-500 font-bold">✗ Error</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {questions.length === 0 && (
                            <div className="text-center text-gray-600 py-10">
                                No questions found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
