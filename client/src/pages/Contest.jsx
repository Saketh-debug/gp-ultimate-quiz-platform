import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:3000");

export default function Contest({ session }) {
  const [language, setLanguage] = useState("python");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [codes, setCodes] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.emit("register", { userId: session.userId });

    socket.on("force_logout", () => {
      alert("This token was used on another device.");
      window.location.reload();
    });

    return () => socket.off("force_logout");
  }, [session.userId]);

  async function openQuestion(q) {
    setCurrentQuestion(q);
    setMessage("");

    await fetch("http://localhost:3000/question/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.userId,
        questionId: q.id,
      }),
    });
  }

  async function submit() {
    if (!currentQuestion) return;

    const code = codes[currentQuestion.id] || "";

    const res = await fetch("http://localhost:3000/question/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.userId,
        questionId: currentQuestion.id,
        code,
        language,
      }),
    });

    const data = await res.json();
    setMessage(
      data.success
        ? `Accepted in ${data.timeTaken}s, +${data.score} points`
        : data.message || "Submission failed"
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#191022] text-white font-display">
      {/* TOP BAR */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-[#362348] bg-[#1a1122]">
        <div>
          <h2 className="font-bold">{session.team}</h2>
          <p className="text-xs text-[#ad92c9]">{session.college}</p>
        </div>

        <div className="text-primary font-mono font-bold">
          Ends at {new Date(session.endTime).toLocaleTimeString()}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-[#362348] bg-[#110a18] p-4">
          <h3 className="text-xs font-bold uppercase text-[#ad92c9] mb-3">
            Questions
          </h3>

          <div className="space-y-2">
            {session.questions.map((q) => (
              <button
                key={q.id}
                onClick={() => openQuestion(q)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition
                  ${
                    currentQuestion?.id === q.id
                      ? "bg-primary text-white shadow shadow-primary/30"
                      : "bg-[#1a1122] text-[#ad92c9] hover:bg-[#362348]"
                  }`}
              >
                {q.title}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col">
          {currentQuestion ? (
            <>
              {/* QUESTION HEADER */}
              <div className="p-6 border-b border-[#362348]">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">
                    {currentQuestion.title}
                  </h1>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#1a1122] border border-[#362348] px-3 py-1 rounded text-sm"
                  >
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>

                <p className="mt-4 text-[#ad92c9]">
                  {currentQuestion.description}
                </p>
              </div>

              {/* EDITOR */}
              <div className="flex-1 bg-[#0a060e]">
                <Editor
                  height="100%"
                  language={language === "cpp" ? "cpp" : language}
                  theme="vs-dark"
                  value={codes[currentQuestion.id] || ""}
                  onChange={(value) =>
                    setCodes((prev) => ({
                      ...prev,
                      [currentQuestion.id]: value || "",
                    }))
                  }
                  options={{
                    fontSize: 15,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>

              {/* FOOTER */}
              <footer className="p-4 border-t border-[#362348] bg-[#1a1122] flex items-center gap-4">
                <button
                  onClick={submit}
                  className="bg-primary px-6 py-2 rounded-xl font-bold shadow-lg shadow-primary/40 hover:opacity-90"
                >
                  Submit
                </button>

                {message && (
                  <span className="text-sm text-emerald-400 font-medium">
                    {message}
                  </span>
                )}
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-[#ad92c9]">
              Select a question to begin
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
