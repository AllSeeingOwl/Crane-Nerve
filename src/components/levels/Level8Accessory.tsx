import React, { useEffect, useRef, useState } from "react";

const TESTS = [
  {
    id: "shoulder_left",
    name: "Left Shoulder Shrug",
    dir: { x: 0, y: -1 },
    patientText: "Shrugging left shoulder up...",
  },
  {
    id: "shoulder_right",
    name: "Right Shoulder Shrug",
    dir: { x: 0, y: -1 },
    patientText: "Shrugging right shoulder up...",
  },
  {
    id: "head_left",
    name: "Turn Head Left",
    dir: { x: -1, y: 0 },
    patientText: "Turning head to the left...",
  },
  {
    id: "head_right",
    name: "Turn Head Right",
    dir: { x: 1, y: 0 },
    patientText: "Turning head to the right...",
  },
];

export function Level8Accessory({
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
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const [resistanceScore, setResistanceScore] = useState(0);
  const [timeHeld, setTimeHeld] = useState(0);

  const test = TESTS[currentTestIndex];

  // Interaction state
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const startPosRef = useRef({ x: 0, y: 0 });
  const [dragVector, setDragVector] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentTestIndex >= TESTS.length) {
      onWin();
    }
  }, [currentTestIndex, onWin]);

  useEffect(() => {
    if (stress >= 100) {
      onLose("Patient got too stressed from the resistance tests!");
    }
  }, [stress, onLose]);

  // Handle mouse events globally for drag
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      startPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
      setDragVector({ x: 0, y: 0 });
      setResistanceScore(0);
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const frameRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!testActive) return;

    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (mouseRef.current.isDown) {
        const dx = mouseRef.current.x - startPosRef.current.x;
        const dy = mouseRef.current.y - startPosRef.current.y;

        setDragVector({ x: dx, y: dy });

        if (test) {
          // Calculate the projected resistance against the patient's movement.
          // The patient is trying to move in `test.dir`.
          // The player should drag in the opposite direction (-test.dir).
          // We'll calculate a scalar "force" value.

          const expectedDir = { x: -test.dir.x, y: -test.dir.y };

          // Dot product to see how well they are pulling in the opposite direction
          const dot = dx * expectedDir.x + dy * expectedDir.y;

          // "Optimal" drag distance is around 100-150 pixels.
          // Score maps to a 0-100% scale.
          let score = 0;
          if (dot > 0) {
            score = Math.min(100, (dot / 150) * 100);
          } else {
            score = 0; // Pulling the wrong way or not pulling
          }

          setResistanceScore(score);

          // Green zone is between 40% and 80%
          if (score >= 40 && score <= 80) {
            setTimeHeld((prev) => {
              const next = prev + dt;
              if (next >= 2000) {
                // Hold for 2 seconds
                // Test complete!
                setTestActive(false);
                setTimeout(() => {
                  setCurrentTestIndex((idx) => idx + 1);
                  setTimeHeld(0);
                  setResistanceScore(0);
                }, 1000);
              }
              return next;
            });
          } else {
            // Too weak or too strong
            onStressChange(0.1);
            // Decay time held if not in green zone
            setTimeHeld((prev) => Math.max(0, prev - dt * 0.5));
          }
        }
      } else {
        // Patient overpowers because player let go
        onStressChange(0.2);
        setTimeHeld((prev) => Math.max(0, prev - dt));
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [testActive, test, onStressChange]);

  const startTest = () => {
    setTestActive(true);
    setTimeHeld(0);
    setResistanceScore(0);
    lastTimeRef.current = performance.now();
  };

  if (!test) return null; // Safety for when all tests are done

  // Calculate visual properties for the resistance meter
  // Meter goes 0-100. Green zone is 40-80.
  const meterHeight = 200;
  const cursorY = Math.max(
    0,
    Math.min(meterHeight, (resistanceScore / 100) * meterHeight),
  );

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden bg-zinc-900 flex flex-col items-center justify-center select-none">
      {/* Instructions Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[32rem] text-center text-white bg-black/50 p-4 rounded z-20 pointer-events-none">
        <h2 className="text-xl font-bold mb-2">Level 8: Accessory Nerve</h2>
        <p className="text-sm mb-2">
          Test the sternocleidomastoid and trapezius muscles. When the patient
          moves, click and drag your mouse in the{" "}
          <strong>opposite direction</strong> to apply resistance. Keep the
          resistance in the green zone!
        </p>
        <div className="text-sm font-bold text-blue-300 mt-2">
          Tests Completed: {currentTestIndex} / {TESTS.length}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex gap-16 items-center">
        {/* Patient / Interaction Area */}
        <div className="relative w-64 h-64 bg-slate-800 rounded-xl border border-slate-600 flex flex-col items-center justify-center p-4">
          <div className="text-center text-white font-bold mb-4">
            {test.name}
          </div>

          {!testActive && timeHeld === 0 ? (
            <button
              onClick={startTest}
              aria-label="Start patient movement"
              className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded cursor-pointer pointer-events-auto"
            >
              Start Movement
            </button>
          ) : (
            <div className="text-center">
              <p className="text-blue-300 text-sm mb-4">{test.patientText}</p>

              {/* Visual indicator of patient movement direction */}
              <div
                className="w-12 h-12 border-4 border-red-500 rounded-full mx-auto relative animate-pulse"
                style={{
                  transform: `translate(${test.dir.x * 20}px, ${test.dir.y * 20}px)`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold">
                  PATIENT
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-8">
                Click and drag against the movement!
              </p>
            </div>
          )}

          {/* Test Complete Overlay */}
          {!testActive && timeHeld >= 2000 && (
            <div className="absolute inset-0 bg-green-900/80 flex items-center justify-center rounded-xl">
              <span className="text-green-300 font-bold text-xl">
                Test Passed!
              </span>
            </div>
          )}
        </div>

        {/* Resistance Meter */}
        <div
          className="relative w-16 bg-slate-800 rounded-full border border-slate-600 flex flex-col items-center py-4"
          style={{ height: meterHeight + 32 }}
        >
          <div
            className="text-xs text-slate-400 mb-2 font-bold"
            id="force-label"
          >
            FORCE
          </div>
          <div
            className="relative w-8 bg-slate-900 rounded-full flex-grow overflow-hidden border border-slate-700"
            role="progressbar"
            aria-labelledby="force-label"
            aria-valuenow={Math.round(resistanceScore)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Zones */}
            <div className="absolute bottom-[0%] w-full h-[40%] bg-red-900/50" />{" "}
            {/* Too weak */}
            <div className="absolute bottom-[40%] w-full h-[40%] bg-green-500/50" />{" "}
            {/* Green Zone (40-80) */}
            <div className="absolute bottom-[80%] w-full h-[20%] bg-red-900/50" />{" "}
            {/* Too strong */}
            {/* Force Cursor */}
            <div
              className="absolute w-full h-2 bg-white shadow-[0_0_10px_white] transition-all duration-75"
              style={{ bottom: cursorY }}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar for holding in the green zone */}
      {testActive && (
        <div
          className="mt-8 w-64 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600"
          role="progressbar"
          aria-valuenow={Math.round(timeHeld)}
          aria-valuemin={0}
          aria-valuemax={2000}
          aria-label="Resistance hold time"
        >
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${(timeHeld / 2000) * 100}%` }}
          />
        </div>
      )}

      {/* Visual drag line */}
      {mouseRef.current.isDown && testActive && (
        <svg
          className="absolute inset-0 pointer-events-none z-50 w-full h-full"
          aria-hidden="true"
        >
          <line
            x1={startPosRef.current.x}
            y1={startPosRef.current.y}
            x2={startPosRef.current.x + dragVector.x}
            y2={startPosRef.current.y + dragVector.y}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="4"
            strokeDasharray="5,5"
          />
          <circle
            cx={startPosRef.current.x + dragVector.x}
            cy={startPosRef.current.y + dragVector.y}
            r="6"
            fill="white"
          />
        </svg>
      )}
    </div>
  );
}
