import { useState } from "react";

const BACKEND_URL = "http://localhost:3000";

export default function AdminDashboard() {
  const [status, setStatus] = useState("Not Started");

  async function startContest() {
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(
        `${BACKEND_URL}/admin/start-contest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setStatus("Contest Started");

    } catch (err) {
      alert("Server error",err);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0805] text-white p-10">
      <h1 className="text-4xl font-black mb-10">
        Admin Control Panel
      </h1>

      <div className="bg-black/40 p-8 rounded-xl border border-white/10 max-w-xl">
        <p className="mb-6">
          Contest Status:
          <span className="ml-2 text-orange-400 font-bold">
            {status}
          </span>
        </p>

        <button
          onClick={startContest}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded font-bold"
        >
          Start Contest
        </button>
      </div>
    </div>
  );
}
