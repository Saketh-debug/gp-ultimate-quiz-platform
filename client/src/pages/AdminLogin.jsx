import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      localStorage.setItem("adminToken", data.token);
      navigate("/admin/dashboard");

    } catch (err) {
      alert("Server error",err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0805] text-white">
      <div className="bg-black/40 p-8 rounded-xl border border-white/10 w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Admin Login
        </h2>

        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter Admin Token"
          className="w-full p-3 bg-black/50 border border-white/10 rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded font-bold"
        >
          Login
        </button>
      </div>
    </div>
  );
}
