import { useState } from "react";
import Login from "./pages/Login";
import Contest from "./pages/Contest";

function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return <Login onJoin={setSession} />;
  }

  return <Contest session={session} />;
}

export default App;
