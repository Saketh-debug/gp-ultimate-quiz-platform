
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL;

// Round badge label colours
const ROUND_COLORS = {
    rapidfire: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    cascade: "text-amber-400  bg-amber-500/10  border-amber-500/30",
    dsa: "text-rose-400   bg-rose-500/10   border-rose-500/30",
};

// ─── Audio helpers ────────────────────────────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function unlockAudio() {
    // Resume suspended AudioContext on first user gesture (browser autoplay policy)
    try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
    } catch (_) { }
}

function playBeep() {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } catch (_) { }
}
// ─────────────────────────────────────────────────────────────────────────────

function formatLogTime(isoStr) {
    try {
        const d = new Date(isoStr);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        return `${hh}:${mm}:${ss}`;
    } catch (_) {
        return "--:--:--";
    }
}

export default function AdminDashboard() {
    const [rounds, setRounds] = useState({});
    const [disqLogs, setDisqLogs] = useState([]); // newest first
    const [newEventId, setNewEventId] = useState(null); // flash highlight
    const socketRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");

    // ── On mount: auth guard + fetch round status + seed disq log + connect socket ──
    useEffect(() => {
        if (!token) { navigate("/admin/login"); return; }
        fetchStatus();
        fetchDisqLog();

        // Unlock audio on any first interaction
        document.addEventListener("click", unlockAudio, { once: true });

        // Connect Socket.IO with admin JWT for authentication
        const socket = io(BACKEND_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on("disqualification_event", (row) => {
            playBeep();
            setDisqLogs(prev => [row, ...prev]);
            setNewEventId(row.id);
            setTimeout(() => setNewEventId(null), 3000); // clear flash after 3s
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            document.removeEventListener("click", unlockAudio);
        };
    }, []);

    async function fetchStatus() {
        const authHeader = { Authorization: `Bearer ${token}` };
        try {
            const res = await fetch(`${BACKEND_URL}/admin/status/rapidfire`, { headers: authHeader });
            const data = await res.json();
            setRounds(prev => ({ ...prev, rapidfire: data }));
        } catch (err) { console.error("Failed to fetch rapidfire status"); }
        try {
            const res = await fetch(`${BACKEND_URL}/admin/status/cascade`, { headers: authHeader });
            const data = await res.json();
            setRounds(prev => ({ ...prev, cascade: data }));
        } catch (err) { console.error("Failed to fetch cascade status"); }
        try {
            const res = await fetch(`${BACKEND_URL}/admin/status/dsa`, { headers: authHeader });
            const data = await res.json();
            setRounds(prev => ({ ...prev, dsa: data }));
        } catch (err) { console.error("Failed to fetch DSA status"); }
    }

    async function fetchDisqLog() {
        try {
            const res = await fetch(`${BACKEND_URL}/admin/disqualify-log`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setDisqLogs(data); // already ordered newest-first from server
            }
        } catch (err) {
            console.error("Failed to fetch disqualification log");
        }
    }

    async function startRound(roundName) {
        if (!confirm(`Start ${roundName}? users can join for 30mins.`)) return;
        try {
            const res = await fetch(`${BACKEND_URL}/admin/start-round`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ roundName }),
            });
            const data = await res.json();
            if (res.ok) { alert(data.message); fetchStatus(); }
            else { alert(data.error); }
        } catch (err) { alert("Error starting round"); }
    }

    async function stopRound(roundName) {
        if (!confirm(`Stop ${roundName}?`)) return;
        try {
            const res = await fetch(`${BACKEND_URL}/admin/stop-round`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ roundName }),
            });
            const data = await res.json();
            if (res.ok) { alert(data.message); }
            else { alert(data.error || "Failed to stop round"); }
            fetchStatus();
        } catch (err) { alert("Error stopping round"); }
    }

    async function resetRound(roundName) {
        if (!confirm(`RESET ${roundName}? This will reset start time.`)) return;
        try {
            await fetch(`${BACKEND_URL}/admin/reset-round`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ roundName }),
            });
            fetchStatus();
        } catch (err) { }
    }

    return (
        <div className="min-h-screen bg-[#111] text-white p-8 font-sans" onClick={unlockAudio}>
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-orange-500">Admin Dashboard</h1>
                <button
                    onClick={() => { localStorage.removeItem("adminToken"); navigate("/admin/login"); }}
                    className="text-xs text-gray-500 hover:text-white uppercase font-bold"
                >
                    Logout
                </button>
            </header>

            {/* ── ROUND CARDS ── */}
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
                    <button
                        onClick={() => navigate("/admin/questions?round=rapidfire")}
                        className="w-full mb-3 py-2 bg-[#111] border border-white/10 hover:border-orange-500/50 text-gray-300 hover:text-orange-400 font-bold rounded transition text-xs uppercase"
                    >
                        📋 Manage Questions
                    </button>
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
                    <button
                        onClick={() => navigate("/admin/questions?round=cascade")}
                        className="w-full mb-3 py-2 bg-[#111] border border-white/10 hover:border-orange-500/50 text-gray-300 hover:text-orange-400 font-bold rounded transition text-xs uppercase"
                    >
                        📋 Manage Questions
                    </button>
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
                                const res = await fetch(`${BACKEND_URL}/admin/apply-streak-bonus`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({}),
                                });
                                const data = await res.json();
                                if (res.ok) { alert(data.message); }
                                else { alert(data.error || "Failed to apply streak bonus"); }
                            } catch (err) { alert("Error applying streak bonus"); }
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
                    <button
                        onClick={() => navigate("/admin/questions?round=dsa")}
                        className="w-full mb-3 py-2 bg-[#111] border border-white/10 hover:border-orange-500/50 text-gray-300 hover:text-orange-400 font-bold rounded transition text-xs uppercase"
                    >
                        📋 Manage Questions
                    </button>
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

            {/* ── DISQUALIFICATION LOG ── */}
            <div className="mt-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold uppercase tracking-widest text-red-400">🚨 Disqualification Log</span>
                        {disqLogs.length > 0 && (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase border border-red-500/30">
                                {disqLogs.length} event{disqLogs.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={fetchDisqLog}
                        className="text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-widest transition"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* Terminal-style log panel */}
                <div className="bg-[#0a0a0a] border border-white/8 rounded-xl overflow-hidden shadow-inner">
                    {/* Panel header bar */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border-b border-white/5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                        <span className="ml-2 text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                            disqualification_log — live feed
                        </span>
                    </div>

                    {/* Scrollable log body */}
                    <div className="h-64 overflow-y-auto p-4 space-y-1 font-mono text-sm scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                        {disqLogs.length === 0 ? (
                            <div className="flex items-center gap-2 text-gray-600 text-xs pt-2">
                                <span className="text-green-500/60">●</span>
                                <span>No disqualifications recorded. Monitoring active…</span>
                            </div>
                        ) : (
                            disqLogs.map((log) => {
                                const isNew = log.id === newEventId;
                                const roundColor = ROUND_COLORS[log.round] || "text-gray-400 bg-white/5 border-white/10";
                                return (
                                    <div
                                        key={log.id}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-700
                                            ${isNew
                                                ? "bg-red-500/15 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                                                : "bg-white/2 border-white/5 hover:bg-white/4"
                                            }`}
                                    >
                                        {/* Timestamp */}
                                        <span className="text-gray-600 text-[11px] shrink-0 w-[58px]">
                                            [{formatLogTime(log.logged_at)}]
                                        </span>

                                        {/* Red dot indicator */}
                                        <span className={`text-[8px] shrink-0 ${isNew ? "text-red-400 animate-pulse" : "text-red-500/50"}`}>●</span>

                                        {/* Team name */}
                                        <span className="font-bold text-white truncate flex-1">
                                            {log.team_name}
                                        </span>

                                        {/* Round badge */}
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border shrink-0 ${roundColor}`}>
                                            {log.round}
                                        </span>

                                        {/* Violation count */}
                                        <span className="text-red-400/80 text-[11px] font-bold shrink-0 tabular-nums">
                                            {log.violations}v
                                        </span>

                                        {/* New badge */}
                                        {isNew && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-500 text-white animate-pulse shrink-0">
                                                NEW
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Legend */}
                <p className="mt-2 text-[10px] text-gray-600 font-mono">
                    Format: [HH:MM:SS] · team name · round · violation count · events persist across server restarts
                </p>
            </div>
        </div>
    );
}
