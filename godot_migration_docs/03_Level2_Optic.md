# Reference: Level2Optic.tsx

This file contains the original React/TypeScript logic that needs to be ported to Godot GDScript.

## Original Code

```typescript
import React, { useEffect, useRef, useState } from "react";

// Letters that can look similar when blurred
const CHART_LETTERS = ["C", "G", "O", "Q", "D", "P", "F", "E", "B", "R"];

export function Level2Optic({
  onStressChange,
  onWin,
  onLose,
}: {
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  const [lettersToType] = useState(() => {
    // Generate a random sequence of 10 letters from the pool
    return Array.from(
      { length: 10 },
      () => CHART_LETTERS[Math.floor(Math.random() * CHART_LETTERS.length)],
    );
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Ref for focus level to use in the game loop
  const focusRef = useRef(5);
  const focusBarContainerRef = useRef<HTMLDivElement>(null);
  const focusBarFillRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle keyboard typing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        focusRef.current = Math.max(0, focusRef.current - 0.5);
        return;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        focusRef.current = Math.min(10, focusRef.current + 0.5);
        return;
      }

      // Ignore modifier keys or long keys
      if (e.key.length > 1) return;

      const typedLetter = e.key.toUpperCase();
      const targetLetter = lettersToType[currentIndex];

      if (typedLetter === targetLetter) {
        setCorrectCount((prev) => prev + 1);
      } else {
        // Typing wrong letter increases stress
        onStressChange(10);
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= lettersToType.length) {
        // Game over logic
        // Need 9 out of 10 correct
        const finalCorrectCount =
          correctCount + (typedLetter === targetLetter ? 1 : 0);
        if (finalCorrectCount >= 9) {
          onWin();
        } else {
          onLose(
            `Patient only identified ${finalCorrectCount}/10 letters correctly. Need at least 9.`,
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    lettersToType,
    correctCount,
    onStressChange,
    onWin,
    onLose,
  ]);

  useEffect(() => {
    // Handle mouse wheel to adjust focus
    const handleWheel = (e: globalThis.WheelEvent) => {
      // e.deltaY is positive when scrolling down, negative when scrolling up
      focusRef.current = Math.max(
        0,
        Math.min(10, focusRef.current + e.deltaY * 0.01),
      );
      // ⚡ BOLT: DOM mutation moved to requestAnimationFrame loop
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const frameRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    // Game loop to constantly drift the chart out of focus
    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Drift the focus away from 0 (perfect clarity) towards 10 (max blur)
      // Drift speed: ~0.5 units per second
      if (focusRef.current < 10) {
        focusRef.current = Math.min(10, focusRef.current + dt * 0.0005);
      }

      // ⚡ BOLT: Mutate DOM directly instead of using setState in requestAnimationFrame
      if (focusBarContainerRef.current) {
        focusBarContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(10 - focusRef.current).toString(),
        );
      }
      if (focusBarFillRef.current) {
        focusBarFillRef.current.style.height = `${(1 - focusRef.current / 10) * 100}%`;
      }
      if (chartContainerRef.current) {
        chartContainerRef.current.style.filter = `blur(${focusRef.current * 1.5}px)`;
      }

      // If heavily out of focus, slowly increase stress
      if (focusRef.current > 7) {
        onStressChange(0.05); // Rapid stress increase when blind
      } else if (focusRef.current > 4) {
        onStressChange(0.01); // Slow stress increase when slightly blurred
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onStressChange]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-white/10 backdrop-blur-sm">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 text-center text-white bg-black/70 p-4 rounded z-20">
        <h2 className="text-xl font-bold mb-2">Level 2: Optic Nerve</h2>
        <p className="text-sm mb-2">
          Read the Snellen chart! Type the{" "}
          <span className="text-yellow-400 font-bold">highlighted</span> letter.
        </p>
        <p className="text-sm font-bold text-blue-300 mb-2 flex items-center justify-center gap-1">
          Scroll Mouse Wheel or use{" "}
          <kbd className="text-[10px] bg-blue-900/50 px-1 py-0.5 rounded font-sans mx-0.5">
            ↑
          </kbd>
          <kbd className="text-[10px] bg-blue-900/50 px-1 py-0.5 rounded font-sans mx-0.5">
            ↓
          </kbd>{" "}
          to adjust focus!
        </p>
        <div
          className="flex justify-between text-sm mt-4 border-t border-gray-600 pt-2"
          aria-live="polite"
        >
          <span className="text-green-400">Correct: {correctCount} / 10</span>
          <span className="text-gray-300">
            Remaining: {lettersToType.length - currentIndex}
          </span>
        </div>
      </div>

      {/* Focus Indicator */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-black/50 p-4 rounded-xl">
        <span className="text-white text-xs font-bold uppercase tracking-widest -rotate-90 mb-8 w-24 text-center">
          Focus
        </span>
        <div
          ref={focusBarContainerRef}
          className="w-4 h-64 bg-gray-800 rounded-full relative overflow-hidden border border-gray-600"
          role="progressbar"
          aria-valuenow={Math.round(10 - focusRef.current)}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-label="Focus level indicator"
        >
          <div
            ref={focusBarFillRef}
            className="absolute bottom-0 w-full bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 transition-all duration-75"
            style={{ height: `${(1 - focusRef.current / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Snellen Chart Container */}
      <div className="bg-white p-12 rounded-xl shadow-2xl flex flex-col items-center gap-6 min-w-[600px] border-8 border-gray-200">
        <h1 className="text-4xl font-serif font-bold text-gray-800 border-b-4 border-gray-800 pb-4 w-full text-center">
          SNELLEN CHART
        </h1>

        {/* Render the letters in a sequence with decreasing size, similar to a real chart, but laid out for this specific game mechanic */}
        <div
          ref={chartContainerRef}
          className="flex flex-wrap justify-center gap-x-8 gap-y-12 max-w-[500px]"
          style={{
            filter: `blur(${focusRef.current * 1.5}px)`,
            transition: "filter 0.1s linear",
          }}
        >
          {lettersToType.map((letter, index) => {
            const isCurrent = index === currentIndex;
            const isPast = index < currentIndex;

            // Decrease size slightly as we go on, making it harder
            const fontSize = Math.max(2, 6 - index * 0.4);

            return (
              <span
                key={index}
                className={`font-serif font-bold transition-colors ${
                  isCurrent
                    ? "text-yellow-500 scale-125"
                    : isPast
                      ? "text-gray-300"
                      : "text-black"
                }`}
                style={{
                  fontSize: `${fontSize}rem`,
                  lineHeight: 1,
                  textShadow: isCurrent
                    ? "0 0 10px rgba(234, 179, 8, 0.5)"
                    : "none",
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        {/* Focus lines */}
        <div className="w-full h-1 bg-red-500/50 mt-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-red-500 text-xs font-bold">
            20/20
          </div>
        </div>
      </div>
    </div>
  );
}

```
