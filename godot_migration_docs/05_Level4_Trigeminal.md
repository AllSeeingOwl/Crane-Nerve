# Reference: Level4Trigeminal.tsx

This file contains the original React/TypeScript logic that needs to be ported to Godot GDScript.

## Original Code

```typescript
import React, { useEffect, useRef, useState } from "react";

export function Level4Trigeminal({
  onStressChange,
  onWin,
  onLose,
}: {
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
  // Tool position with EXTREME lag
  const toolRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const toolVisualRef = useRef<HTMLDivElement>(null);

  // Facial regions to test
  const regions = [
    { x: 0.35, y: 0.3, type: "sharp", label: "V1 (Ophthalmic) Left" },
    { x: 0.65, y: 0.3, type: "soft", label: "V1 (Ophthalmic) Right" },
    { x: 0.35, y: 0.5, type: "soft", label: "V2 (Maxillary) Left" },
    { x: 0.65, y: 0.5, type: "sharp", label: "V2 (Maxillary) Right" },
    { x: 0.4, y: 0.7, type: "sharp", label: "V3 (Mandibular) Left" },
    { x: 0.6, y: 0.7, type: "soft", label: "V3 (Mandibular) Right" },
  ];

  const [currentRegionIndex, setCurrentRegionIndex] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Update mouse ref
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Game loop for extreme lag
  const frameRef = useRef<number>(null);

  useEffect(() => {
    const loop = () => {
      const dx = mouseRef.current.x - toolRef.current.x;
      const dy = mouseRef.current.y - toolRef.current.y;

      // Extreme lag factor for the clumsy tool
      toolRef.current.x += dx * 0.02;
      toolRef.current.y += dy * 0.02;

      if (toolVisualRef.current) {
        toolVisualRef.current.style.left = `${toolRef.current.x}px`;
        toolVisualRef.current.style.top = `${toolRef.current.y}px`;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleInteract = (isSharp: boolean) => {
    if (currentRegionIndex >= regions.length) return;

    const targetRegion = regions[currentRegionIndex];
    const targetX = targetRegion.x * window.innerWidth;
    const targetY = targetRegion.y * window.innerHeight;

    const dx = toolRef.current.x - targetX;
    const dy = toolRef.current.y - targetY;
    const distSq = dx * dx + dy * dy;

    if (distSq < 3600) {
      // Hit the region! Check if correct tool type was used
      const correctTool =
        (targetRegion.type === "sharp" && isSharp) ||
        (targetRegion.type === "soft" && !isSharp);

      if (correctTool) {
        setFeedback("Correct! Patient felt " + targetRegion.type);
        const nextIndex = currentRegionIndex + 1;
        setCurrentRegionIndex(nextIndex);
        setProgress((nextIndex / regions.length) * 100);

        if (nextIndex >= regions.length) {
          setTimeout(() => onWin(), 1000);
        }
      } else {
        setFeedback("Wrong tool! Patient confused.");
        onStressChange(15);
      }
    } else {
      setFeedback("Missed the target area!");
      onStressChange(5);
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-auto select-none"
      onContextMenu={(e) => {
        e.preventDefault(); // Prevent context menu
        handleInteract(false); // Soft touch
      }}
      onClick={(e) => {
        if (e.button === 0) handleInteract(true); // Sharp touch
      }}
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 text-center text-white bg-black/50 p-4 rounded z-20 pointer-events-none">
        <h2 className="text-xl font-bold mb-2">Level 4: Trigeminal Nerve</h2>
        <p className="text-sm mb-2">
          Test facial sensation. The tool is very heavy/laggy.
        </p>
        <p className="text-sm font-bold text-yellow-300 mb-2">
          Left Click = Sharp pin
          <br />
          Right Click = Soft cotton
        </p>
        {/* Custom Progress Bar */}
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
        {currentRegionIndex < regions.length && (
          <p className="text-sm mt-2 text-green-300" aria-live="polite">
            Target: {regions[currentRegionIndex].label} (
            {regions[currentRegionIndex].type})
          </p>
        )}
      </div>

      {/* Target Regions */}
      {regions.map((region, i) => {
        const isActive = i === currentRegionIndex;
        const isDone = i < currentRegionIndex;
        if (!isActive && !isDone) return null; // Only show current and past

        return (
          <div
            key={i}
            className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-2 transition-all ${
              isDone
                ? "bg-green-500/20 border-green-500"
                : "bg-red-500/20 border-red-500 animate-pulse"
            } pointer-events-none`}
            style={{ left: `${region.x * 100}%`, top: `${region.y * 100}%` }}
          >
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-black drop-shadow-md">
                {region.type}
              </div>
            )}
          </div>
        );
      })}

      {/* Heavy Tool cursor representation */}
      <div
        ref={toolVisualRef}
        className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm pointer-events-none flex items-center justify-center"
        style={{
          left: `${window.innerWidth / 2}px`,
          top: `${window.innerHeight / 2}px`,
          transition: "transform 0.1s",
        }}
      >
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  );
}

```
