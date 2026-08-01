/* global SVGSVGElement, SVGLineElement, SVGCircleElement */
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
  onStressChange,
  onWin,
  onLose,
}: {
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const resistanceScoreRef = useRef(0);
  const timeHeldRef = useRef(0);

  const test = TESTS[currentTestIndex];

  // Interaction state
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const startPosRef = useRef({ x: 0, y: 0 });
  const dragVectorRef = useRef({ x: 0, y: 0 });
  const forceCursorRef = useRef<HTMLDivElement>(null);
  const progressbarRef = useRef<HTMLDivElement>(null);
  const holdProgressBarContainerRef = useRef<HTMLDivElement>(null);
  const holdProgressBarFillRef = useRef<HTMLDivElement>(null);
  const dragLineGroupRef = useRef<SVGSVGElement>(null);
  const dragLineRef = useRef<SVGLineElement>(null);
  const dragCircleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (currentTestIndex >= TESTS.length) {
      onWin();
    }
  }, [currentTestIndex, onWin]);

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
      dragVectorRef.current = { x: 0, y: 0 };
      resistanceScoreRef.current = 0;
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

        dragVectorRef.current = { x: dx, y: dy };

        if (test) {
          const expectedDir = { x: -test.dir.x, y: -test.dir.y };
          const dot = dx * expectedDir.x + dy * expectedDir.y;

          let score = 0;
          if (dot > 0) {
            score = Math.min(100, (dot / 150) * 100);
          } else {
            score = 0;
          }

          resistanceScoreRef.current = score;

          if (score >= 40 && score <= 80) {
            timeHeldRef.current += dt;
            if (timeHeldRef.current >= 2000) {
              setTestActive(false);
              setTimeout(() => {
                setCurrentTestIndex((idx) => idx + 1);
                timeHeldRef.current = 0;
                resistanceScoreRef.current = 0;
              }, 1000);
            }
          } else {
            onStressChange(0.1);
            timeHeldRef.current = Math.max(0, timeHeldRef.current - dt * 0.5);
          }
        }
      } else {
        onStressChange(0.2);
        timeHeldRef.current = Math.max(0, timeHeldRef.current - dt);
      }

      // Update DOM
      const meterHeight = 200;
      if (forceCursorRef.current) {
        const cursorY = Math.max(
          0,
          Math.min(
            meterHeight,
            (resistanceScoreRef.current / 100) * meterHeight,
          ),
        );
        forceCursorRef.current.style.bottom = `${cursorY}px`;
      }
      if (progressbarRef.current) {
        progressbarRef.current.setAttribute(
          "aria-valuenow",
          Math.round(resistanceScoreRef.current).toString(),
        );
      }
      if (holdProgressBarContainerRef.current) {
        holdProgressBarContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(timeHeldRef.current).toString(),
        );
      }
      if (holdProgressBarFillRef.current) {
        holdProgressBarFillRef.current.style.width = `${(timeHeldRef.current / 2000) * 100}%`;
      }

      if (dragLineGroupRef.current) {
        if (mouseRef.current.isDown) {
          dragLineGroupRef.current.style.display = "block";
          if (dragLineRef.current) {
            dragLineRef.current.setAttribute(
              "x1",
              startPosRef.current.x.toString(),
            );
            dragLineRef.current.setAttribute(
              "y1",
              startPosRef.current.y.toString(),
            );
            dragLineRef.current.setAttribute(
              "x2",
              (startPosRef.current.x + dragVectorRef.current.x).toString(),
            );
            dragLineRef.current.setAttribute(
              "y2",
              (startPosRef.current.y + dragVectorRef.current.y).toString(),
            );
          }
          if (dragCircleRef.current) {
            dragCircleRef.current.setAttribute(
              "cx",
              (startPosRef.current.x + dragVectorRef.current.x).toString(),
            );
            dragCircleRef.current.setAttribute(
              "cy",
              (startPosRef.current.y + dragVectorRef.current.y).toString(),
            );
          }
        } else {
          dragLineGroupRef.current.style.display = "none";
        }
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
    timeHeldRef.current = 0;
    resistanceScoreRef.current = 0;
    lastTimeRef.current = performance.now();
  };

  if (!test) return null; // Safety for when all tests are done

  // Calculate visual properties for the resistance meter
  // Meter goes 0-100. Green zone is 40-80.
  const meterHeight = 200;

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

          {!testActive && timeHeldRef.current === 0 ? (
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
          {!testActive && timeHeldRef.current >= 2000 && (
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
            ref={progressbarRef}
            className="relative w-8 bg-slate-900 rounded-full flex-grow overflow-hidden border border-slate-700"
            role="progressbar"
            aria-labelledby="force-label"
            aria-valuenow={Math.round(resistanceScoreRef.current)}
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
              ref={forceCursorRef}
              className="absolute w-full h-2 bg-white shadow-[0_0_10px_white] transition-all duration-75"
              style={{
                bottom: Math.max(
                  0,
                  Math.min(
                    meterHeight,
                    (resistanceScoreRef.current / 100) * meterHeight,
                  ),
                ),
              }}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar for holding in the green zone */}
      {testActive && (
        <div
          ref={holdProgressBarContainerRef}
          className="mt-8 w-64 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600"
          role="progressbar"
          aria-valuenow={Math.round(timeHeldRef.current)}
          aria-valuemin={0}
          aria-valuemax={2000}
          aria-label="Resistance hold time"
        >
          <div
            ref={holdProgressBarFillRef}
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${(timeHeldRef.current / 2000) * 100}%` }}
          />
        </div>
      )}

      {/* Visual drag line */}
      {testActive && (
        <svg
          ref={dragLineGroupRef}
          className="absolute inset-0 pointer-events-none z-50 w-full h-full"
          aria-hidden="true"
          style={{ display: mouseRef.current.isDown ? "block" : "none" }}
        >
          <line
            ref={dragLineRef}
            x1={startPosRef.current.x}
            y1={startPosRef.current.y}
            x2={startPosRef.current.x + dragVectorRef.current.x}
            y2={startPosRef.current.y + dragVectorRef.current.y}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="4"
            strokeDasharray="5,5"
          />
          <circle
            ref={dragCircleRef}
            cx={startPosRef.current.x + dragVectorRef.current.x}
            cy={startPosRef.current.y + dragVectorRef.current.y}
            r="6"
            fill="white"
          />
        </svg>
      )}
    </div>
  );
}
