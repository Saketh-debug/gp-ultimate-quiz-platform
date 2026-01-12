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
    // Register this device for the user
    socket.emit("register", { userId: session.userId });

    socket.on("force_logout", () => {
      alert("This token was used on another device. You have been logged out.");
      window.location.reload();
    });

    return () => {
      socket.off("force_logout");
    };
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

    if (data.success) {
      setMessage(`Accepted in ${data.timeTaken}s, +${data.score} points`);
    } else {
      setMessage(data.message || "Submission failed");
    }
  }

  return (
  <div style={{ height: "100vh" }}>
    <h3>{session.team}</h3>
    <p>{session.college}</p>
    <p>Ends at: {new Date(session.endTime).toLocaleTimeString()}</p>

    <div style={{ display: "flex", height: "calc(100vh - 120px)" }}>
      {/* Question List */}
      <div style={{ width: "220px", borderRight: "1px solid #ccc", padding: "8px" }}>
        <h4>Questions</h4>
        <ul>
          {session.questions.map((q) => (
            <li key={q.id}>
              <button onClick={() => openQuestion(q)}>{q.title}</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Question View */}
      <div style={{ flex: 1, padding: "10px" }}>
        {currentQuestion ? (
          <>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
            </select>
            <h4>{currentQuestion.title}</h4>
            <p>{currentQuestion.description}</p>

            <Editor
  height="70vh"
  width="100%"
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
    fontSize: 16,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
            }}
            />

            <br />
            <button onClick={submit}>Submit</button>

            {message && <p>{message}</p>}
          </>
        ) : (
          <p>Select a question</p>
        )}
      </div>
    </div>
  </div>
);
}