import React, { useEffect, useRef, useState } from "react";

export function Level10Crisis({
  stress,
  onStressChange,
  onWin,
  onLose,
}: {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  const [timeRemaining, setTimeRemaining] = useState(30);

  // --- Task 1: Mouse Tracking (Trace the circle) ---
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [mouseTaskHealth, setMouseTaskHealth] = useState(100);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- Task 2: Arrow Keys (Keep gaze centered) ---
  const gazeRef = useRef({ x: 0, y: 0 }); // -1 to 1
  const [gazeTaskHealth, setGazeTaskHealth] = useState(100);
  const [gazePos, setGazePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        gazeRef.current.x = Math.max(-1, gazeRef.current.x - 0.2);
      if (e.key === "ArrowRight")
        gazeRef.current.x = Math.min(1, gazeRef.current.x + 0.2);
      if (e.key === "ArrowUp")
        gazeRef.current.y = Math.max(-1, gazeRef.current.y - 0.2);
      if (e.key === "ArrowDown")
        gazeRef.current.y = Math.min(1, gazeRef.current.y + 0.2);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Task 3: Number Keys (Facial expressions) ---
  const [facePrompt, setFacePrompt] = useState(1);
  const [faceTaskHealth, setFaceTaskHealth] = useState(100);
  const currentFaceKeyRef = useRef(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        if (parseInt(e.key) === currentFaceKeyRef.current) {
          setFaceTaskHealth(100);
        } else {
          onStressChange(5); // Penalty for wrong key
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStressChange]);

  // Game loop
  const frameRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const elapsedRef = useRef(0);

  useEffect(() => {
    let mouseHealth = 100;
    let gazeHealth = 100;
    let faceHealth = 100;
    let faceTimer = 0;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      elapsedRef.current += dt;

      // Update timer display
      setTimeRemaining(Math.max(0, 30 - Math.floor(elapsedRef.current)));
      if (elapsedRef.current >= 30) {
        onWin();
        return;
      }

      // --- Task 1 Logic ---
      // Move target in a circle
      const tX = window.innerWidth * 0.2 + Math.cos(time / 1000) * 100;
      const tY = window.innerHeight * 0.5 + Math.sin(time / 1000) * 100;
      setTargetPos({ x: tX, y: tY });

      const dist = Math.sqrt(
        (mouseRef.current.x - tX) ** 2 + (mouseRef.current.y - tY) ** 2,
      );
      if (dist < 80) {
        mouseHealth = Math.min(100, mouseHealth + 20 * dt);
      } else {
        mouseHealth -= 15 * dt;
      }
      setMouseTaskHealth(mouseHealth);

      // --- Task 2 Logic ---
      // Gaze drifts away randomly
      gazeRef.current.x += (Math.random() - 0.5) * 0.5 * dt;
      gazeRef.current.y += (Math.random() - 0.5) * 0.5 * dt;
      gazeRef.current.x = Math.max(-1, Math.min(1, gazeRef.current.x));
      gazeRef.current.y = Math.max(-1, Math.min(1, gazeRef.current.y));
      setGazePos({ x: gazeRef.current.x, y: gazeRef.current.y });

      const gazeDist = Math.sqrt(
        gazeRef.current.x * gazeRef.current.x +
          gazeRef.current.y * gazeRef.current.y,
      );
      if (gazeDist > 0.5) {
        gazeHealth -= 20 * dt;
      } else {
        gazeHealth = Math.min(100, gazeHealth + 10 * dt);
      }
      setGazeTaskHealth(gazeHealth);

      // --- Task 3 Logic ---
      faceTimer += dt;
      if (faceTimer > 3) {
        // New prompt every 3 seconds
        faceTimer = 0;
        const newKey = Math.floor(Math.random() * 4) + 1;
        currentFaceKeyRef.current = newKey;
        setFacePrompt(newKey);
      }
      faceHealth -= 10 * dt;
      setFaceTaskHealth(faceHealth);

      // Stress calculation based on healths
      if (mouseHealth < 30 || gazeHealth < 30 || faceHealth < 30) {
        onStressChange(20 * dt);
      }
      if (mouseHealth <= 0 || gazeHealth <= 0 || faceHealth <= 0) {
        onStressChange(50 * dt);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onWin, onStressChange]);

  useEffect(() => {
    if (stress >= 100) {
      onLose("Total systemic failure! The crisis was too much.");
    }
  }, [stress, onLose]);

  return (
    <div className="absolute inset-0 pointer-events-auto bg-black/40">
      {/* Timer */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center text-white bg-red-600/80 p-4 rounded-xl z-20 shadow-lg shadow-red-500/50">
        <h1 className="text-3xl font-black animate-pulse">CRISIS MODE</h1>
        <p className="text-2xl font-mono">{timeRemaining}s</p>
      </div>

      {/* Task 1: Mouse */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black/50 rounded-xl border border-white/20 flex items-center justify-center pointer-events-none">
        <h3 className="absolute top-2 text-white/50 font-bold text-sm">
          MOUSE
        </h3>

        {/* Target */}
        <div
          className="absolute w-12 h-12 border-2 border-yellow-400 rounded-full bg-yellow-400/20"
          style={{
            left: targetPos.x - window.innerWidth * 0.2 + 128 - 24,
            top: targetPos.y - window.innerHeight * 0.5 + 128 - 24,
          }}
        />

        {/* Cursor representation for local widget */}
        <div
          className="absolute w-4 h-4 bg-white rounded-full"
          style={{
            left: mouseRef.current.x - window.innerWidth * 0.2 + 128 - 8,
            top: mouseRef.current.y - window.innerHeight * 0.5 + 128 - 8,
          }}
        />

        {/* Health Bar */}
        <div className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${mouseTaskHealth > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
            style={{ width: `${mouseTaskHealth}%` }}
          />
        </div>
      </div>

      {/* Task 2: Gaze (Arrow Keys) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black/50 rounded-xl border border-white/20 flex flex-col items-center justify-center pointer-events-none">
        <h3 className="absolute top-2 text-white/50 font-bold text-sm">
          ARROWS
        </h3>

        <div className="relative w-32 h-32 border-4 border-white/30 rounded-full flex items-center justify-center bg-white/5">
          <div className="w-8 h-8 border-2 border-green-500 rounded-full" />
          <div
            className="absolute w-6 h-6 bg-blue-500 rounded-full"
            style={{
              transform: `translate(${gazePos.x * 64}px, ${gazePos.y * 64}px)`,
            }}
          />
        </div>

        {/* Health Bar */}
        <div className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${gazeTaskHealth > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
            style={{ width: `${gazeTaskHealth}%` }}
          />
        </div>
      </div>

      {/* Task 3: Face (Number Keys) */}
      <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black/50 rounded-xl border border-white/20 flex flex-col items-center justify-center pointer-events-none">
        <h3 className="absolute top-2 text-white/50 font-bold text-sm">
          KEYS 1-4
        </h3>

        <div className="text-5xl font-black text-white/80 animate-bounce">
          PRESS {facePrompt}
        </div>

        {/* Health Bar */}
        <div className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${faceTaskHealth > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
            style={{ width: `${faceTaskHealth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
