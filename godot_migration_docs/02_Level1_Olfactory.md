# Reference: Level1Olfactory.tsx

This file contains the original React/TypeScript logic that needs to be ported to Godot GDScript.

## Original Code

```typescript
import React, { useEffect, useRef, useState } from "react";

const VIALS = [
  { id: "coffee", name: "Coffee", color: "bg-amber-700", type: "good" },
  { id: "mint", name: "Mint", color: "bg-emerald-500", type: "good" },
  {
    id: "surstromming",
    name: "Surströmming",
    color: "bg-yellow-600",
    type: "bad",
  },
];

// ⚡ BOLT OPTIMIZATION: Precompute VIALS map for O(1) lookups instead of Array.find()
const VIALS_MAP = VIALS.reduce(
  (acc, vial) => {
    acc[vial.id] = vial;
    return acc;
  },
  {} as Record<string, (typeof VIALS)[0]>,
);

export function Level1Olfactory({
  onStressChange,
  onWin,
  onLose,
}: {
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  const [selectedVial, setSelectedVial] = useState<string | null>(null);
  const [identifiedVials, setIdentifiedVials] = useState<string[]>([]);

  // Mouse position
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Nose (target) position
  const noseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2 - 100,
    vx: Math.random() * 2 - 1,
    vy: Math.random() * 2 - 1,
  });

  const noseElementRef = useRef<HTMLDivElement>(null);
  const progressBarContainerRef = useRef<HTMLDivElement>(null);
  const progressBarFillRef = useRef<HTMLDivElement>(null);

  const selectedVialRef = useRef<string | null>(null);
  const progressRef = useRef(0);
  const identifiedRef = useRef<string[]>([]);

  useEffect(() => {
    selectedVialRef.current = selectedVial;
  }, [selectedVial]);

  useEffect(() => {
    identifiedRef.current = identifiedVials;
    if (identifiedVials.length >= 2) {
      onWin();
    }
  }, [identifiedVials, onWin]);

  // Update mouse ref
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const frameRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const nose = noseRef.current;
      const mouse = mouseRef.current;

      // Update nose position (wandering)
      nose.x += nose.vx * dt * 0.1;
      nose.y += nose.vy * dt * 0.1;

      // Bounce off walls
      const margin = 100;
      if (nose.x < margin) {
        nose.x = margin;
        nose.vx *= -1;
      } else if (nose.x > window.innerWidth - margin) {
        nose.x = window.innerWidth - margin;
        nose.vx *= -1;
      }

      if (nose.y < margin) {
        nose.y = margin;
        nose.vy *= -1;
      } else if (nose.y > window.innerHeight - margin) {
        nose.y = window.innerHeight - margin;
        nose.vy *= -1;
      }

      // Random direction changes
      if (Math.random() < 0.02) {
        nose.vx += (Math.random() - 0.5) * 2;
        nose.vy += (Math.random() - 0.5) * 2;

        // Limit speed
        const speedSq = nose.vx * nose.vx + nose.vy * nose.vy;
        if (speedSq > 4) {
          const invSpeed = 1 / Math.sqrt(speedSq);
          nose.vx = nose.vx * invSpeed * 2;
          nose.vy = nose.vy * invSpeed * 2;
        }
      }

      const activeVialId = selectedVialRef.current;
      const vialDef = activeVialId ? VIALS_MAP[activeVialId] : undefined;

      const dx = nose.x - mouse.x;
      const dy = nose.y - mouse.y;
      const distSq = dx * dx + dy * dy;

      if (activeVialId && !identifiedRef.current.includes(activeVialId)) {
        if (vialDef?.type === "bad") {
          // If it's a bad smell, patient evades
          if (distSq < 90000) {
            // ⚡ BOLT OPTIMIZATION: Avoid expensive Math.atan2, Math.cos, Math.sin calls
            // Normalize the vector directly instead of converting to polar coordinates and back
            if (distSq > 0) {
              const invDist = 1 / Math.sqrt(distSq);
              nose.vx += dx * invDist * 0.5;
              nose.vy += dy * invDist * 0.5;
            }

            // Rapid stress increase if smelling something bad
            if (distSq < 22500) {
              onStressChange(0.2);
            }
          }
        }

        if (distSq < 10000) {
          // Inside smelling range
          progressRef.current += dt * 0.05; // 2 seconds to smell

          // Slowly increase stress just by taking time
          onStressChange(0.02);

          if (progressRef.current >= 100) {
            setIdentifiedVials((prev) => [...prev, activeVialId]);
            setSelectedVial(null);
            progressRef.current = 0;
          }
        } else {
          // Decay progress if moved away
          if (progressRef.current > 0) {
            progressRef.current = Math.max(0, progressRef.current - dt * 0.1);
          }
        }
      } else {
        if (progressRef.current > 0) {
          progressRef.current = Math.max(0, progressRef.current - dt * 0.1);
        }
      }

      // ⚡ BOLT: Mutate DOM directly instead of using setState in requestAnimationFrame
      if (progressBarContainerRef.current) {
        if (progressRef.current > 0) {
          progressBarContainerRef.current.style.display = "block";
          progressBarContainerRef.current.setAttribute(
            "aria-valuenow",
            Math.round(progressRef.current).toString(),
          );
          if (progressBarFillRef.current) {
            progressBarFillRef.current.style.width = `${progressRef.current}%`;
          }
        } else {
          progressBarContainerRef.current.style.display = "none";
        }
      }

      if (noseElementRef.current) {
        noseElementRef.current.style.left = `${nose.x}px`;
        noseElementRef.current.style.top = `${nose.y}px`;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onStressChange]);

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 text-center text-white bg-black/50 p-4 rounded z-20 pointer-events-none">
        <h2 className="text-xl font-bold mb-2">Level 1: Olfactory Nerve</h2>
        <p className="text-sm mb-2">
          Select a vial and hold it near the patient's nose for them to identify
          the smell. Identify 2 smells to pass.
        </p>
        <div className="text-sm font-bold text-green-300" aria-live="polite">
          Identified: {identifiedVials.length} / 2
        </div>
      </div>

      {/* Target Nose */}
      <div
        ref={noseElementRef}
        className="absolute w-24 h-24 -ml-12 -mt-12 rounded-full border-2 border-dashed border-white/50 bg-white/10 flex items-center justify-center pointer-events-none transition-transform"
      >
        <span className="text-xs text-white/70">Nose Area</span>

        {/* Smell Progress Ring/Bar */}
        <div
          ref={progressBarContainerRef}
          className="absolute -bottom-6 w-16 h-2 bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Smell identification progress"
          style={{ display: "none" }}
        >
          <div
            ref={progressBarFillRef}
            className="h-full bg-blue-500"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Vial Selection Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 bg-black/60 p-4 rounded-xl z-20">
        {VIALS.map((vial) => {
          const isIdentified = identifiedVials.includes(vial.id);
          const isSelected = selectedVial === vial.id;

          return (
            <button
              key={vial.id}
              onClick={() =>
                !isIdentified && setSelectedVial(isSelected ? null : vial.id)
              }
              aria-disabled={isIdentified}
              aria-pressed={isSelected}
              aria-label={
                isIdentified
                  ? `${vial.name} identified`
                  : `Select ${vial.name} vial`
              }
              className={`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 w-20 h-24 flex flex-col items-center justify-end p-2 rounded border-2 transition-all ${
                isIdentified
                  ? "opacity-50 border-gray-600 grayscale cursor-not-allowed"
                  : isSelected
                    ? "border-yellow-400 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                    : "border-transparent hover:border-white/30"
              }`}
            >
              <div
                className={`w-8 h-12 rounded-t-lg rounded-b-md mb-2 ${vial.color} shadow-inner relative`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-gray-300 rounded-t-sm" />
              </div>
              <span className="text-xs text-white font-semibold text-center leading-tight">
                {isIdentified ? "Done" : vial.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cursor Override when holding a vial */}
      {selectedVial && (
        <div
          className="absolute pointer-events-none z-50 w-8 h-12 -ml-4 -mt-6"
          style={{
            left: mouseRef.current.x,
            top: mouseRef.current.y,
            transition: "none",
          }}
        >
          <div
            className={`w-full h-full rounded-t-lg rounded-b-md shadow-lg opacity-80 ${
              selectedVial ? VIALS_MAP[selectedVial]?.color : ""
            }`}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-gray-300 rounded-t-sm" />

            {/* Scent particles (simple css visualization) */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 opacity-50 animate-pulse">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-white"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v4m0 4v8M8 6v4m0 4v4m8-12v4m0 4v4"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```
