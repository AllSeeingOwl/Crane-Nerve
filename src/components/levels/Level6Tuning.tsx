import React, { useEffect, useRef, useState } from "react";

export function Level6Tuning({
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

  // Fork position with lag
  const forkRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const forkElementRef = useRef<HTMLDivElement>(null);

  // Tuning fork sequence
  const sequence = [
    {
      label: "Weber Test: Center of Forehead",
      target: "Forehead",
      x: 0.5,
      y: 0.2,
    },
    {
      label: "Rinne Test (Left): Left Mastoid",
      target: "Left Bone",
      x: 0.35,
      y: 0.45,
    },
    {
      label: "Rinne Test (Left): Left Ear",
      target: "Left Ear",
      x: 0.3,
      y: 0.5,
    },
    {
      label: "Rinne Test (Right): Right Mastoid",
      target: "Right Bone",
      x: 0.65,
      y: 0.45,
    },
    {
      label: "Rinne Test (Right): Right Ear",
      target: "Right Ear",
      x: 0.7,
      y: 0.5,
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isStriking, setIsStriking] = useState(false);

  // Hold requirement: ~2 seconds at 60fps (~120 frames)
  const HOLD_DURATION_FRAMES = 120;
  const holdFramesRef = useRef(0);

  const holdProgressContainerRef = useRef<HTMLDivElement>(null);
  const holdProgressFillRef = useRef<HTMLDivElement>(null);

  // Update mouse ref
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Game loop for lag and holding logic
  const frameRef = useRef<number>(null);

  useEffect(() => {
    const loop = () => {
      const dx = mouseRef.current.x - forkRef.current.x;
      const dy = mouseRef.current.y - forkRef.current.y;

      // Base lag for tuning fork
      forkRef.current.x += dx * 0.08;
      forkRef.current.y += dy * 0.08;

      // ⚡ BOLT: Mutate DOM directly instead of using setState in requestAnimationFrame
      if (forkElementRef.current) {
        forkElementRef.current.style.left = `${forkRef.current.x}px`;
        forkElementRef.current.style.top = `${forkRef.current.y}px`;
      }

      let currentHoldProgress = 0;

      // Steady hand logic: Check if we are currently holding the fork in the target area
      if (isStriking && currentStepIndex < sequence.length) {
        const targetStep = sequence[currentStepIndex];
        const targetX = targetStep.x * window.innerWidth;
        const targetY = targetStep.y * window.innerHeight;

        const dx = forkRef.current.x - targetX;
        const dy = forkRef.current.y - targetY;
        const distSq = dx * dx + dy * dy;

        if (distSq < 6400) {
          // In zone
          holdFramesRef.current += 1;
          currentHoldProgress = Math.min(
            (holdFramesRef.current / HOLD_DURATION_FRAMES) * 100,
            100,
          );

          if (holdFramesRef.current >= HOLD_DURATION_FRAMES) {
            // Completed this step
            setIsStriking(false);
            holdFramesRef.current = 0;
            currentHoldProgress = 0;

            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setProgress((nextIndex / sequence.length) * 100);
            setFeedback("Test step completed!");

            if (nextIndex >= sequence.length) {
              setTimeout(() => onWin(), 1000);
            }
          }
        } else {
          // Slipped out of zone
          if (holdFramesRef.current > 0) {
            setFeedback("You moved the fork! Start holding again.");
            holdFramesRef.current = 0;
            onStressChange(5); // Stress penalty for slipping
          }
        }
      }

      if (holdProgressContainerRef.current) {
        holdProgressContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(currentHoldProgress).toString(),
        );
      }
      if (holdProgressFillRef.current) {
        holdProgressFillRef.current.style.width = `${currentHoldProgress}%`;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isStriking, currentStepIndex, onStressChange, onWin]);

  const handleInteract = () => {
    if (currentStepIndex >= sequence.length || isStriking) return;

    const targetStep = sequence[currentStepIndex];
    const targetX = targetStep.x * window.innerWidth;
    const targetY = targetStep.y * window.innerHeight;

    const dx = forkRef.current.x - targetX;
    const dy = forkRef.current.y - targetY;
    const distSq = dx * dx + dy * dy;

    if (distSq < 6400) {
      // Hit target to strike
      setIsStriking(true);
      holdFramesRef.current = 0;
      if (holdProgressContainerRef.current) {
        holdProgressContainerRef.current.setAttribute("aria-valuenow", "0");
      }
      if (holdProgressFillRef.current) {
        holdProgressFillRef.current.style.width = "0%";
      }
      setFeedback("Tuning fork struck! Hold steady...");
    } else {
      // Miss
      setFeedback("You missed the target area.");
      onStressChange(10);
    }
  };

  useEffect(() => {
    if (stress >= 100) {
      onLose("Patient became overwhelmed by the hearing exam!");
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
        <h2 className="text-xl font-bold mb-2">
          Level 6: Vestibulocochlear Nerve
        </h2>
        <p className="text-sm mb-2">
          Move the tuning fork to the target, click to strike, and hold steady!
        </p>

        {/* Sequence Progress Bar */}
        <div
          className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Level progress"
        >
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {feedback && (
          <p className="text-sm text-blue-300 font-semibold" aria-live="polite">
            {feedback}
          </p>
        )}

        {currentStepIndex < sequence.length && (
          <div className="mt-2">
            <p className="text-lg text-green-300 font-bold animate-pulse">
              Next: {sequence[currentStepIndex].label}
            </p>
            {/* Hold Progress Bar */}
            {isStriking && (
              <div
                ref={holdProgressContainerRef}
                className="w-full h-4 bg-gray-700 rounded mt-2 overflow-hidden relative"
                role="progressbar"
                aria-valuenow={0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Hold progress"
              >
                <div
                  ref={holdProgressFillRef}
                  className="h-full bg-yellow-400 transition-all duration-75 ease-linear"
                  style={{ width: `0%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-black font-bold">
                  HOLDING...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Target Regions */}
      {sequence.map((step, i) => {
        const isActive = i === currentStepIndex;
        if (!isActive && i >= currentStepIndex) return null; // Hide future steps until reached

        return (
          <div
            key={i}
            className={`absolute w-24 h-24 -ml-12 -mt-12 rounded-full border-2 transition-all ${
              i < currentStepIndex
                ? "bg-green-500/10 border-green-500/50"
                : isActive
                  ? isStriking
                    ? "bg-yellow-400/20 border-yellow-400 border-dashed animate-pulse"
                    : "bg-white/10 border-white/50 border-dashed"
                  : "hidden"
            } pointer-events-none flex items-center justify-center`}
            style={{ left: `${step.x * 100}%`, top: `${step.y * 100}%` }}
          >
            {isActive && (
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider text-center px-2">
                {step.target}
              </span>
            )}
          </div>
        );
      })}

      {/* Tuning Fork Cursor */}
      <div
        ref={forkElementRef}
        className="absolute -ml-3 -mt-12 pointer-events-none flex flex-col items-center"
      >
        {/* Prongs */}
        <div
          className={`flex gap-2 ${isStriking ? "animate-[bounce_0.05s_infinite]" : ""}`}
        >
          <div className="w-1.5 h-12 bg-gray-300 rounded-t-sm shadow-[0_0_10px_rgba(209,213,219,0.5)]" />
          <div className="w-1.5 h-12 bg-gray-300 rounded-t-sm shadow-[0_0_10px_rgba(209,213,219,0.5)]" />
        </div>
        {/* Base connecting prongs */}
        <div
          className={`w-6 h-2 bg-gray-300 rounded-b-md ${isStriking ? "animate-[bounce_0.05s_infinite]" : ""}`}
        />
        {/* Handle */}
        <div className="w-2 h-10 bg-gray-400 rounded-b-sm shadow-[0_0_5px_rgba(156,163,175,0.5)]" />

        {/* Resonance effect when striking */}
        {isStriking && (
          <div className="absolute top-0 w-20 h-20 -ml-10 -mt-4 border-2 border-yellow-300 rounded-full animate-ping opacity-50" />
        )}
      </div>
    </div>
  );
}
