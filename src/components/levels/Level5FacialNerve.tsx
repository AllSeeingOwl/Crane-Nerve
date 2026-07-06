import React, { useEffect, useRef, useState } from "react";

export function Level5FacialNerve({
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
  const [progress, setProgress] = useState(0);

  // Mouse position
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Cursor position with lag and shake
  const cursorRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const [cursorPos, setCursorPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Facial prompts and targets
  const prompts = [
    { label: "Raise Eyebrows", target: "Forehead", x: 0.5, y: 0.25 },
    { label: "Squeeze Eyes Shut", target: "Eyes", x: 0.5, y: 0.35 },
    { label: "Smile", target: "Mouth", x: 0.5, y: 0.65 },
    { label: "Puff Cheeks", target: "Cheeks", x: 0.5, y: 0.55 },
  ];

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Update mouse ref
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Game loop for lag and shake
  const frameRef = useRef<number>(null);

  useEffect(() => {
    let time = 0;
    const loop = () => {
      time += 0.05;

      const dx = mouseRef.current.x - cursorRef.current.x;
      const dy = mouseRef.current.y - cursorRef.current.y;

      // Base lag
      let nextX = cursorRef.current.x + dx * 0.05;
      let nextY = cursorRef.current.y + dy * 0.05;

      // Add shake based on stress (higher stress = more shake)
      const shakeAmount = 2 + (stress / 100) * 15;
      nextX += Math.sin(time * 5) * shakeAmount;
      nextY += Math.cos(time * 6.3) * shakeAmount;

      cursorRef.current.x = nextX;
      cursorRef.current.y = nextY;

      setCursorPos({ x: cursorRef.current.x, y: cursorRef.current.y });

      // Ambient stress increase (taking too long)
      if (Math.random() < 0.01) {
        onStressChange(0.2);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [stress, onStressChange]);

  const handleInteract = () => {
    if (currentPromptIndex >= prompts.length) return;

    const targetPrompt = prompts[currentPromptIndex];
    const targetX = targetPrompt.x * window.innerWidth;
    const targetY = targetPrompt.y * window.innerHeight;

    const dist = Math.hypot(
      cursorRef.current.x - targetX,
      cursorRef.current.y - targetY,
    );

    if (dist < 80) {
      // Hit
      setFeedback("Good! Patient executed: " + targetPrompt.label);
      const nextIndex = currentPromptIndex + 1;
      setCurrentPromptIndex(nextIndex);
      setProgress((nextIndex / prompts.length) * 100);

      if (nextIndex >= prompts.length) {
        setTimeout(() => onWin(), 1000);
      }
    } else {
      // Miss
      setFeedback("Wrong facial area!");
      onStressChange(10);
    }
  };

  useEffect(() => {
    if (stress >= 100) {
      onLose("Patient couldn't follow the facial nerve commands!");
    }
  }, [stress, onLose]);

  return (
    <div
      className="absolute inset-0 pointer-events-auto select-none"
      onClick={(e) => {
        if (e.button === 0) handleInteract();
      }}
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 text-center text-white bg-black/50 p-4 rounded z-20 pointer-events-none">
        <h2 className="text-xl font-bold mb-2">Level 5: Facial Nerve</h2>
        <p className="text-sm mb-2">
          Click the correct facial area to prompt the patient.
        </p>
        <p className="text-sm font-bold text-yellow-300 mb-2">
          Watch out, your hand is shaking!
        </p>

        {/* Custom Progress Bar */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {feedback && (
          <p className="text-sm text-blue-300 font-semibold">{feedback}</p>
        )}

        {currentPromptIndex < prompts.length && (
          <p className="text-lg mt-2 text-green-300 font-bold animate-pulse">
            Prompt: "{prompts[currentPromptIndex].label}"
          </p>
        )}
      </div>

      {/* Target Regions */}
      {prompts.map((prompt, i) => {
        const isActive = i === currentPromptIndex;
        // Show all nodes but highlight active
        return (
          <div
            key={i}
            className={`absolute w-24 h-24 -ml-12 -mt-12 rounded-full border-2 transition-all ${
              i < currentPromptIndex
                ? "bg-green-500/10 border-green-500/50"
                : isActive
                  ? "bg-white/10 border-white/50 border-dashed animate-[spin_4s_linear_infinite]"
                  : "bg-white/5 border-white/20"
            } pointer-events-none flex items-center justify-center`}
            style={{ left: `${prompt.x * 100}%`, top: `${prompt.y * 100}%` }}
          >
            <span className="text-white/30 text-xs font-bold uppercase tracking-wider">
              {prompt.target}
            </span>
          </div>
        );
      })}

      {/* Shaky Cursor */}
      <div
        className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-yellow-300 bg-yellow-300/30 backdrop-blur-sm pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(253,224,71,0.5)]"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
        }}
      >
        <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
      </div>
    </div>
  );
}
