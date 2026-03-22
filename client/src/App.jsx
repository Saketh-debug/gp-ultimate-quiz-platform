import { useState } from 'react';
import Login from "./pages/Login";
import Contest from "./pages/Contest";
import { useShaderBackground } from "./components/ui/animated-shader-hero";

function App() {
    const [session, setSession] = useState(null);
    const canvasRef = useShaderBackground();

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Fixed shader canvas background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 h-full w-full touch-none object-contain z-0"
        style={{ background: "black" }}
      />

      {/* Content on top of shader */}
      <div className="relative z-10 min-h-screen">
        {!session ? (
          <Login onJoin={setSession} showBackground={false} />
        ) : (
          <Contest session={session} />
        )}
      </div>
    </div>
  );
}

export default App;
