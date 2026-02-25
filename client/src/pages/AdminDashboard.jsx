
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const [rounds, setRounds] = useState({});
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        if (!token) navigate("/admin/login");
        fetchStatus();
    }, []);

    async function fetchStatus() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/status/rapidfire`);
            const data = await res.json();
            setRounds(prev => ({ ...prev, rapidfire: data }));
        } catch (err) {
            console.error("Failed to fetch rapidfire status");
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/status/cascade`);
            const data = await res.json();
            setRounds(prev => ({ ...prev, cascade: data }));
        } catch (err) {
            console.error("Failed to fetch cascade status");
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/status/dsa`);
            const data = await res.json();
            setRounds(prev => ({ ...prev, dsa: data }));
        } catch (err) {
            console.error("Failed to fetch DSA status");
        }
    }

    async function startRound(roundName) {
        if (!confirm(`Start ${roundName}? users can join for 30mins.`)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/start-round`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ roundName, token }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchStatus();
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Error starting round");
        }
    }

    async function stopRound(roundName) {
        if (!confirm(`Stop ${roundName}?`)) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/stop-round`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roundName, token })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
            } else {
                alert(data.error || "Failed to stop round");
            }
            fetchStatus();
        } catch (err) {
            alert("Error stopping round");
        }
    }

    async function resetRound(roundName) {
        if (!confirm(`RESET ${roundName}? This will reset start time.`)) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/admin/reset-round`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roundName, token })
            });
            fetchStatus();
        } catch (err) { }
    }

    return (
        <div className="min-h-screen bg-[#111] text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-orange-500">Admin Dashboard</h1>
                <button
                    onClick={() => { localStorage.removeItem("adminToken"); navigate("/admin/login"); }}
                    className="text-xs text-gray-500 hover:text-white uppercase font-bold"
                >
                    Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* RAPID FIRE CARD */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">Rapid Fire</h2>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${rounds.rapidfire?.is_active
                            ? (new Date() - new Date(rounds.rapidfire.start_time) > 30 * 60 * 1000 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400")
                            : "bg-red-500/20 text-red-400"
                            }`}>
                            {rounds.rapidfire?.is_active
                                ? (new Date() - new Date(rounds.rapidfire.start_time) > 30 * 60 * 1000 ? "Entry Closed" : "Active")
                                : "Inactive"}
                        </span>
                    </div>

                    <div className="space-y-4 text-sm text-gray-400 mb-6">
                        <p>Start Time: {rounds.rapidfire?.start_time ? new Date(rounds.rapidfire.start_time).toLocaleString() : "Not Started"}</p>
                        <p>Grace Period: 30 mins</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => startRound("rapidfire")}
                            disabled={rounds.rapidfire?.is_active}
                            className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded transition text-xs uppercase"
                        >
                            {rounds.rapidfire?.is_active ? "In Progress" : "Start"}
                        </button>

                        {rounds.rapidfire?.is_active && (
                            <button
                                onClick={() => stopRound("rapidfire")}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition text-xs uppercase"
                            >
                                Stop
                            </button>
                        )}

                        <button
                            onClick={() => resetRound("rapidfire")}
                            className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded transition text-xs uppercase"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* CODING CASCADE CARD */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">Coding Cascade</h2>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${rounds.cascade?.is_active
                            ? (new Date() - new Date(rounds.cascade.start_time) > 30 * 60 * 1000 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400")
                            : "bg-red-500/20 text-red-400"
                            }`}>
                            {rounds.cascade?.is_active
                                ? (new Date() - new Date(rounds.cascade.start_time) > 30 * 60 * 1000 ? "Entry Closed" : "Active")
                                : "Inactive"}
                        </span>
                    </div>

                    <div className="space-y-4 text-sm text-gray-400 mb-6">
                        <p>Start Time: {rounds.cascade?.start_time ? new Date(rounds.cascade.start_time).toLocaleString() : "Not Started"}</p>
                        <p>Grace Period: 30 mins</p>
                        <p>Contest Duration: 60 mins per user</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => startRound("cascade")}
                            disabled={rounds.cascade?.is_active}
                            className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded transition text-xs uppercase"
                        >
                            {rounds.cascade?.is_active ? "In Progress" : "Start"}
                        </button>

                        {rounds.cascade?.is_active && (
                            <button
                                onClick={() => stopRound("cascade")}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition text-xs uppercase"
                            >
                                Stop
                            </button>
                        )}

                        <button
                            onClick={() => resetRound("cascade")}
                            className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded transition text-xs uppercase"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Streak Bonus Button */}
                    <button
                        onClick={async () => {
                            if (!confirm("Apply streak bonus (max_streak × 20) to all finished users? This is idempotent — already-applied users are skipped.")) return;
                            try {
                                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/apply-streak-bonus`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ token })
                                });
                                const data = await res.json();
                                if (res.ok) {
                                    alert(data.message);
                                } else {
                                    alert(data.error || "Failed to apply streak bonus");
                                }
                            } catch (err) {
                                alert("Error applying streak bonus");
                            }
                        }}
                        className="w-full mt-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded transition text-xs uppercase"
                    >
                        ⚡ Apply Streak Bonus
                    </button>
                </div>

                {/* DSA CARD */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">DSA Challenge</h2>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${rounds.dsa?.is_active
                            ? (new Date() - new Date(rounds.dsa.start_time) > 30 * 60 * 1000 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400")
                            : "bg-red-500/20 text-red-400"
                            }`}>
                            {rounds.dsa?.is_active
                                ? (new Date() - new Date(rounds.dsa.start_time) > 30 * 60 * 1000 ? "Entry Closed" : "Active")
                                : "Inactive"}
                        </span>
                    </div>

                    <div className="space-y-4 text-sm text-gray-400 mb-6">
                        <p>Start Time: {rounds.dsa?.start_time ? new Date(rounds.dsa.start_time).toLocaleString() : "Not Started"}</p>
                        <p>Grace Period: 30 mins</p>
                        <p>Contest Duration: 120 mins per user</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => startRound("dsa")}
                            disabled={rounds.dsa?.is_active}
                            className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded transition text-xs uppercase"
                        >
                            {rounds.dsa?.is_active ? "In Progress" : "Start"}
                        </button>

                        {rounds.dsa?.is_active && (
                            <button
                                onClick={() => stopRound("dsa")}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition text-xs uppercase"
                            >
                                Stop
                            </button>
                        )}

                        <button
                            onClick={() => resetRound("dsa")}
                            className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded transition text-xs uppercase"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
