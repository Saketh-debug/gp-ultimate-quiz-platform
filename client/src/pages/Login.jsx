import { useState } from "react";
import IntroSection from "../components/IntroSection";
import HeroSection from "../components/HeroSection";

export default function Login() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = "/contest";
      } else {
        alert(data.error);
      }
    } catch {
      alert("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#120403] text-white font-['Space_Grotesk'] overflow-x-hidden">
      <IntroSection />
      <HeroSection
        onJoin={{
          token,
          setToken,
          handleJoin,
          loading,
        }}
      />
    </div>
  );
}
