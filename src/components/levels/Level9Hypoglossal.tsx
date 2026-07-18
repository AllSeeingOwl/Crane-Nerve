import React, { useEffect, useRef, useState } from "react";

const NUM_SEGMENTS = 10;
const SEGMENT_LENGTH = 15;
const TONGUE_BASE_X = 0.5; // relative to screen width
const TONGUE_BASE_Y = 0.8; // relative to screen height

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function Level9Hypoglossal({
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
  const containerRef = useRef<HTMLDivElement>(null);

  const targets = [
    { x: 0.2, y: 0.5, label: "Left Cheek" },
    { x: 0.8, y: 0.5, label: "Right Cheek" },
    { x: 0.5, y: 0.3, label: "Roof of Mouth" },
    { x: 0.3, y: 0.7, label: "Bottom Left" },
    { x: 0.7, y: 0.7, label: "Bottom Right" },
  ];

  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);

  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const isDraggingRef = useRef(false);

  const segmentsRef = useRef<Point[]>([]);
  if (segmentsRef.current.length === 0) {
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      segmentsRef.current.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.8 - i * SEGMENT_LENGTH,
        vx: 0,
        vy: 0,
      });
    }
  }

  const pathRef1 = useRef<globalThis.SVGPathElement>(null);
  const pathRef2 = useRef<globalThis.SVGPathElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseDown = (e: MouseEvent) => {
      const tip = segmentsRef.current[NUM_SEGMENTS - 1];
      const distSq = (e.clientX - tip.x) ** 2 + (e.clientY - tip.y) ** 2;
      if (distSq < 2500) {
        isDraggingRef.current = true;
        setIsDragging(true);
      }
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const frameRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const currentTargetIndexRef = useRef(0);
  const holdTimeRef = useRef(0);

  useEffect(() => {
    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1); // cap dt
      lastTimeRef.current = time;

      const segments = segmentsRef.current;

      // Base is fixed
      segments[0].x = window.innerWidth * TONGUE_BASE_X;
      segments[0].y = window.innerHeight * TONGUE_BASE_Y;

      // Update positions
      for (let i = 1; i < NUM_SEGMENTS; i++) {
        if (i === NUM_SEGMENTS - 1 && isDraggingRef.current) {
          // Tip dragged by mouse
          const dx = mouseRef.current.x - segments[i].x;
          const dy = mouseRef.current.y - segments[i].y;
          segments[i].vx += dx * 10 * dt;
          segments[i].vy += dy * 10 * dt;
        }

        // Gravity and damping
        segments[i].vy += 980 * dt; // Gravity
        segments[i].vx *= 0.85; // Damping
        segments[i].vy *= 0.85; // Damping

        segments[i].x += segments[i].vx * dt;
        segments[i].y += segments[i].vy * dt;
      }

      // Constraints (spring-like links)
      for (let iter = 0; iter < 5; iter++) {
        for (let i = 0; i < NUM_SEGMENTS - 1; i++) {
          const dx = segments[i + 1].x - segments[i].x;
          const dy = segments[i + 1].y - segments[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const diff = dist - SEGMENT_LENGTH;

          if (dist > 0) {
            const percent = diff / dist / 2;
            const offsetX = dx * percent;
            const offsetY = dy * percent;

            if (i > 0) {
              segments[i].x += offsetX;
              segments[i].y += offsetY;
            }
            segments[i + 1].x -= offsetX;
            segments[i + 1].y -= offsetY;
          }
        }
      }

      // Check target hit
      const tip = segments[NUM_SEGMENTS - 1];
      if (tipRef.current) {
        tipRef.current.style.left = `${tip.x}px`;
        tipRef.current.style.top = `${tip.y}px`;
      }

      let snapStress = 0;
      if (tip.vx * tip.vx + tip.vy * tip.vy > 1000000) {
        snapStress = dt * 10;
        onStressChange(snapStress);
      } else if (Math.random() < 0.01) {
        onStressChange(0.1);
      }

      if (currentTargetIndexRef.current < targets.length) {
        const target = targets[currentTargetIndexRef.current];
        const targetX = target.x * window.innerWidth;
        const targetY = target.y * window.innerHeight;

        const distToTargetSq = (tip.x - targetX) ** 2 + (tip.y - targetY) ** 2;

        if (distToTargetSq < 3600) {
          holdTimeRef.current += dt;
          if (holdTimeRef.current > 1.0) {
            // Hold for 1 second
            currentTargetIndexRef.current += 1;
            setCurrentTargetIndex(currentTargetIndexRef.current);
            setProgress((currentTargetIndexRef.current / targets.length) * 100);
            holdTimeRef.current = 0;

            if (currentTargetIndexRef.current >= targets.length) {
              onWin();
            }
          }
        } else {
          holdTimeRef.current = 0;
        }
      }

      // Build SVG path
      let path = `M ${segments[0].x} ${segments[0].y}`;
      for (let i = 1; i < NUM_SEGMENTS; i++) {
        // Simple lines for now, could use bezier curves for smoother look
        path += ` L ${segments[i].x} ${segments[i].y}`;
      }
      if (pathRef1.current) pathRef1.current.setAttribute("d", path);
      if (pathRef2.current) pathRef2.current.setAttribute("d", path);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onWin, onStressChange]);

  useEffect(() => {
    if (stress >= 100) {
      onLose("Patient got too stressed from the tongue examination!");
    }
  }, [stress, onLose]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto overflow-hidden"
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 text-center text-white bg-black/50 p-4 rounded z-20 pointer-events-none">
        <h2 className="text-xl font-bold mb-2">Level 9: Hypoglossal</h2>
        <p className="text-sm mb-2">Drag the tongue to the target locations.</p>

        {/* Progress Bar */}
        <div
          className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Level progress"
        >
          <div
            className="h-full bg-pink-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {currentTargetIndex < targets.length && (
          <p className="text-lg mt-2 text-pink-300 font-bold animate-pulse">
            Target: {targets[currentTargetIndex].label}
          </p>
        )}
      </div>

      {/* SVG for Tongue */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-lg z-10"
        aria-hidden="true"
      >
        <path
          ref={pathRef1}
          fill="none"
          stroke="#f472b6" // pink-400
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.9 }}
        />
        <path
          ref={pathRef2}
          fill="none"
          stroke="#be185d" // pink-700
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.5 }}
        />
      </svg>

      {/* Targets */}
      {targets.map((target, i) => {
        const isActive = i === currentTargetIndex;
        return (
          <div
            key={i}
            className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-4 transition-all ${
              i < currentTargetIndex
                ? "bg-green-500/20 border-green-500 opacity-50"
                : isActive
                  ? "bg-white/20 border-white border-dashed animate-[spin_4s_linear_infinite] opacity-100 z-0"
                  : "bg-white/5 border-white/20 opacity-0"
            } pointer-events-none flex items-center justify-center`}
            style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}
          >
            {isActive && (
              <div
                className="absolute w-full h-full bg-green-400/30 rounded-full scale-0 transition-transform duration-100 ease-out"
                style={{ transform: `scale(${holdTimeRef.current})` }}
              />
            )}
          </div>
        );
      })}

      {/* Tip Grabber / Indicator */}
      <div
        ref={tipRef}
        className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center z-30 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={() => {
          isDraggingRef.current = true;
          setIsDragging(true);
        }}
      >
        <div
          className={`w-8 h-8 rounded-full border-2 border-white/50 bg-white/10 ${isDragging ? "scale-90 bg-white/30" : "scale-100"} transition-transform`}
        />
      </div>
    </div>
  );
}
