import React, { useEffect, useRef, useState } from "react";
import { fastSin, fastCos } from "@/lib/mathLUT";

export function Level10Crisis({
  onStressChange,
  onWin,
  onLose,
}: {
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  const timeRemainingRef = useRef(30);
  const timeRemainingElementRef = useRef<globalThis.HTMLParagraphElement>(null);

  // --- Task 1: Mouse Tracking (Trace the circle) ---
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const mouseHealthRef = useRef(100);
  const targetRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseHealthBarRef = useRef<HTMLDivElement>(null);
  const mouseHealthContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- Task 2: Arrow Keys (Keep gaze centered) ---
  const gazeRef = useRef({ x: 0, y: 0 }); // -1 to 1
  const gazeHealthRef = useRef(100);
  const gazeDotRef = useRef<HTMLDivElement>(null);
  const gazeHealthBarRef = useRef<HTMLDivElement>(null);
  const gazeHealthContainerRef = useRef<HTMLDivElement>(null);

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
  const facePromptRef = useRef(1);
  const facePromptElementRef = useRef<HTMLDivElement>(null);
  const faceHealthRef = useRef(100);
  const currentFaceKeyRef = useRef(1);
  const faceHealthBarRef = useRef<HTMLDivElement>(null);
  const faceHealthContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        if (parseInt(e.key) === currentFaceKeyRef.current) {
          faceHealthRef.current = 100;
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
    let faceTimer = 0;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      elapsedRef.current += dt;

      // Update timer display
      // ⚡ BOLT: Mutate DOM directly instead of using setState in requestAnimationFrame
      const newTimeRemaining = Math.max(0, 30 - Math.floor(elapsedRef.current));
      if (newTimeRemaining !== timeRemainingRef.current) {
        timeRemainingRef.current = newTimeRemaining;
        if (timeRemainingElementRef.current) {
          timeRemainingElementRef.current.textContent = `${newTimeRemaining}s`;
        }
      }

      if (elapsedRef.current >= 30) {
        onWin();
        return;
      }

      // --- Task 1 Logic ---
      // Move target in a circle
      const tX = window.innerWidth * 0.2 + fastCos(time / 1000) * 100;
      const tY = window.innerHeight * 0.5 + fastSin(time / 1000) * 100;

      if (targetRef.current) {
        targetRef.current.style.left = `${tX - window.innerWidth * 0.2 + 128 - 24}px`;
        targetRef.current.style.top = `${tY - window.innerHeight * 0.5 + 128 - 24}px`;
      }

      if (cursorRef.current) {
        cursorRef.current.style.left = `${mouseRef.current.x - window.innerWidth * 0.2 + 128 - 8}px`;
        cursorRef.current.style.top = `${mouseRef.current.y - window.innerHeight * 0.5 + 128 - 8}px`;
      }

      const dx = mouseRef.current.x - tX;
      const dy = mouseRef.current.y - tY;
      const distSq = dx * dx + dy * dy;
      if (distSq < 6400) {
        mouseHealthRef.current = Math.min(
          100,
          mouseHealthRef.current + 20 * dt,
        );
      } else {
        mouseHealthRef.current -= 15 * dt;
      }

      if (mouseHealthBarRef.current) {
        mouseHealthBarRef.current.style.width = `${mouseHealthRef.current}%`;
        mouseHealthBarRef.current.className = `h-full ${mouseHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`;
      }
      if (mouseHealthContainerRef.current) {
        mouseHealthContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(mouseHealthRef.current).toString(),
        );
      }

      // --- Task 2 Logic ---
      // Gaze drifts away randomly
      gazeRef.current.x += (Math.random() - 0.5) * 0.5 * dt;
      gazeRef.current.y += (Math.random() - 0.5) * 0.5 * dt;
      gazeRef.current.x = Math.max(-1, Math.min(1, gazeRef.current.x));
      gazeRef.current.y = Math.max(-1, Math.min(1, gazeRef.current.y));

      if (gazeDotRef.current) {
        gazeDotRef.current.style.transform = `translate(${gazeRef.current.x * 64}px, ${gazeRef.current.y * 64}px)`;
      }

      const gazeDistSq =
        gazeRef.current.x * gazeRef.current.x +
        gazeRef.current.y * gazeRef.current.y;
      if (gazeDistSq > 0.25) {
        gazeHealthRef.current -= 20 * dt;
      } else {
        gazeHealthRef.current = Math.min(100, gazeHealthRef.current + 10 * dt);
      }

      if (gazeHealthBarRef.current) {
        gazeHealthBarRef.current.style.width = `${gazeHealthRef.current}%`;
        gazeHealthBarRef.current.className = `h-full ${gazeHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`;
      }
      if (gazeHealthContainerRef.current) {
        gazeHealthContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(gazeHealthRef.current).toString(),
        );
      }

      // --- Task 3 Logic ---
      faceTimer += dt;
      if (faceTimer > 3) {
        // New prompt every 3 seconds
        faceTimer = 0;
        const newKey = Math.floor(Math.random() * 4) + 1;
        currentFaceKeyRef.current = newKey;
        // ⚡ BOLT: Mutate DOM directly instead of using setState in requestAnimationFrame
        if (facePromptRef.current !== newKey) {
          facePromptRef.current = newKey;
          if (facePromptElementRef.current) {
            facePromptElementRef.current.textContent = `PRESS ${newKey}`;
          }
        }
      }
      faceHealthRef.current -= 10 * dt;

      if (faceHealthBarRef.current) {
        faceHealthBarRef.current.style.width = `${faceHealthRef.current}%`;
        faceHealthBarRef.current.className = `h-full ${faceHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`;
      }
      if (faceHealthContainerRef.current) {
        faceHealthContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(faceHealthRef.current).toString(),
        );
      }

      // Stress calculation based on healths
      if (
        mouseHealthRef.current < 30 ||
        gazeHealthRef.current < 30 ||
        faceHealthRef.current < 30
      ) {
        onStressChange(20 * dt);
      }
      if (
        mouseHealthRef.current <= 0 ||
        gazeHealthRef.current <= 0 ||
        faceHealthRef.current <= 0
      ) {
        onStressChange(50 * dt);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onWin, onStressChange]);

  return (
    <div className="absolute inset-0 pointer-events-auto bg-black/40">
      {/* Timer */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center text-white bg-red-600/80 p-4 rounded-xl z-20 shadow-lg shadow-red-500/50">
        <h1 className="text-3xl font-black animate-pulse">CRISIS MODE</h1>
        <p ref={timeRemainingElementRef} className="text-2xl font-mono">
          {timeRemainingRef.current}s
        </p>
      </div>

      {/* Task 1: Mouse */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black/50 rounded-xl border border-white/20 flex items-center justify-center pointer-events-none">
        <h3 className="absolute top-2 text-white/50 font-bold text-sm">
          MOUSE
        </h3>

        {/* Target */}
        <div
          ref={targetRef}
          className="absolute w-12 h-12 border-2 border-yellow-400 rounded-full bg-yellow-400/20"
        />

        {/* Cursor representation for local widget */}
        <div
          ref={cursorRef}
          className="absolute w-4 h-4 bg-white rounded-full"
        />

        {/* Health Bar */}
        <div
          ref={mouseHealthContainerRef}
          className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(mouseHealthRef.current)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Mouse task health"
        >
          <div
            ref={mouseHealthBarRef}
            className="h-full bg-green-500"
            style={{ width: "100%" }}
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
            ref={gazeDotRef}
            className="absolute w-6 h-6 bg-blue-500 rounded-full"
          />
        </div>

        {/* Health Bar */}
        <div
          ref={gazeHealthContainerRef}
          className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(gazeHealthRef.current)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Gaze task health"
        >
          <div
            ref={gazeHealthBarRef}
            className="h-full bg-green-500"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Task 3: Face (Number Keys) */}
      <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black/50 rounded-xl border border-white/20 flex flex-col items-center justify-center pointer-events-none">
        <h3 className="absolute top-2 text-white/50 font-bold text-sm">
          KEYS 1-4
        </h3>

        <div
          ref={facePromptElementRef}
          className="text-5xl font-black text-white/80 animate-bounce"
        >
          PRESS {facePromptRef.current}
        </div>

        {/* Health Bar */}
        <div
          ref={faceHealthContainerRef}
          className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(faceHealthRef.current)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Face task health"
        >
          <div
            ref={faceHealthBarRef}
            className="h-full bg-green-500"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
