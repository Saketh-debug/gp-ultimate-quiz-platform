import { useState } from "react";

export default function Login({ onJoin }) {
  const [token, setToken] = useState("");

  async function handleJoin() {
    const res = await fetch("http://localhost:3000/auth/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (res.ok) onJoin(data);
    else alert(data.error);
  }

  return (
    <div>
      <h2>Join Contest</h2>
      <input
        placeholder="Enter Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
