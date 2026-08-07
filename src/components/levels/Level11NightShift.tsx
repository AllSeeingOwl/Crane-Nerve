import React, { useEffect, useRef, useState } from "react";
import { fastSin, fastCos } from "@/lib/mathLUT";

export function Level11NightShift({
  onStressChange,
  onWin,
  onLose,
}: {
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  const timeRemainingRef = useRef(120);
  const timeRemainingElementRef = useRef<globalThis.HTMLParagraphElement>(null);
  const [mistakes, setMistakes] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Visual effects state
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // --- Task 1: Mouse Tracking (Trace the circle) ---
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const mouseTaskHealthRef = useRef(100);
  const mouseHealthBarRef = useRef<HTMLDivElement>(null);
  const mouseHealthContainerRef = useRef<HTMLDivElement>(null);
  const targetPosRef = useRef({ x: 0, y: 0 });
  const targetElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- Task 2: Arrow Keys (Keep gaze centered) ---
  const gazeRef = useRef({ x: 0, y: 0 }); // -1 to 1
  const gazeTaskHealthRef = useRef(100);
  const gazeHealthBarRef = useRef<HTMLDivElement>(null);
  const gazeHealthContainerRef = useRef<HTMLDivElement>(null);
  const gazeElementRef = useRef<HTMLDivElement>(null);

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
  const faceTaskHealthRef = useRef(100);
  const faceHealthBarRef = useRef<HTMLDivElement>(null);
  const faceHealthContainerRef = useRef<HTMLDivElement>(null);
  const currentFaceKeyRef = useRef(1);

  // Track mistakes without causing loops
  const handleMistake = () => {
    setMistakes((prev) => {
      const newMistakes = prev + 1;
      if (newMistakes === 1) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
        return newMistakes;
      }
      return newMistakes; // Let the useEffect handle the game over
    });
  };

  const hasMistakenRef = useRef(false);
  const mistakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerMistake = () => {
    if (hasMistakenRef.current) return; // Prevent multiple mistakes at once
    hasMistakenRef.current = true;
    handleMistake();

    // Reset the healths so they don't instantly lose again

    // Cooldown before they can make another mistake
    mistakeTimeoutRef.current = setTimeout(() => {
      hasMistakenRef.current = false;
    }, 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        if (parseInt(e.key) === currentFaceKeyRef.current) {
          faceTaskHealthRef.current = 100;
          if (faceHealthBarRef.current) {
            faceHealthBarRef.current.style.width = `100%`;
            faceHealthBarRef.current.className = `h-full bg-green-500`;
          }
        } else {
          registerMistake();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Game loop
  const frameRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const elapsedRef = useRef(0);

  useEffect(() => {
    let faceTimer = 0;

    let vfxTimer = 0;
    const currentVfxState = { blur: 0, shake: 0, darken: 0 };

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      elapsedRef.current += dt;

      // Update timer display
      // ⚡ BOLT: Mutate DOM directly instead of using setState in requestAnimationFrame
      const newTimeRemaining = Math.max(
        0,
        120 - Math.floor(elapsedRef.current),
      );
      if (newTimeRemaining !== timeRemainingRef.current) {
        timeRemainingRef.current = newTimeRemaining;
        if (timeRemainingElementRef.current) {
          timeRemainingElementRef.current.textContent = `${newTimeRemaining}s`;
        }
      }

      if (elapsedRef.current >= 120) {
        onWin();
        return;
      }

      // --- VFX Logic (Night Shift effects) ---
      vfxTimer += dt;
      // Randomly change effects every 3-7 seconds
      if (Math.random() < dt / 5) {
        // Microsleep (darken)
        if (Math.random() < 0.3) {
          currentVfxState.darken = 0.8 + Math.random() * 0.2; // 80-100% black
          setTimeout(
            () => {
              currentVfxState.darken = 0;
            },
            500 + Math.random() * 1500,
          ); // 0.5 to 2 seconds of microsleep
        }

        // Blurry vision
        currentVfxState.blur = Math.random() < 0.5 ? Math.random() * 8 : 0;

        // Shakes (caffeine jitters)
        currentVfxState.shake = Math.random() < 0.4 ? Math.random() * 15 : 0;
      }

      // Decay effects slightly over time unless it's a microsleep
      if (currentVfxState.darken === 0) {
        currentVfxState.blur = Math.max(0, currentVfxState.blur - dt);
        currentVfxState.shake = Math.max(0, currentVfxState.shake - dt * 5);
      }

      if (containerRef.current) {
        containerRef.current.style.filter = `blur(${currentVfxState.blur}px)`;
        containerRef.current.style.transform = `translate(${(Math.random() - 0.5) * currentVfxState.shake}px, ${(Math.random() - 0.5) * currentVfxState.shake}px)`;
      }
      if (overlayRef.current) {
        overlayRef.current.style.backgroundColor = `rgba(0,0,0,${currentVfxState.darken})`;
      }

      // --- Task 1 Logic ---
      // Move target in a figure-8 or chaotic pattern (harder than Level 10)
      const tX =
        window.innerWidth * 0.2 +
        fastCos(time / 800) * 120 +
        fastSin(time / 400) * 40;
      const tY =
        window.innerHeight * 0.5 +
        fastSin(time / 600) * 120 +
        fastCos(time / 300) * 40;

      // ⚡ BOLT: Mutate DOM directly instead of using setState in requestAnimationFrame
      targetPosRef.current.x = tX;
      targetPosRef.current.y = tY;
      if (targetElementRef.current) {
        targetElementRef.current.style.left = `${tX - window.innerWidth * 0.2 + 128 - 24}px`;
        targetElementRef.current.style.top = `${tY - window.innerHeight * 0.5 + 128 - 24}px`;
      }

      const dx = mouseRef.current.x - tX;
      const dy = mouseRef.current.y - tY;
      const distSq = dx * dx + dy * dy;
      if (distSq < 10000) {
        mouseTaskHealthRef.current = Math.min(
          100,
          mouseTaskHealthRef.current + 20 * dt,
        );
      } else {
        mouseTaskHealthRef.current -= 15 * dt;
      }
      if (mouseHealthBarRef.current) {
        mouseHealthBarRef.current.style.width = `${mouseTaskHealthRef.current}%`;
        mouseHealthBarRef.current.className = `h-full ${mouseTaskHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`;
      }
      if (mouseHealthContainerRef.current) {
        mouseHealthContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(mouseTaskHealthRef.current).toString(),
        );
      }

      // --- Task 2 Logic ---
      // Gaze drifts away randomly (faster drift)
      gazeRef.current.x += (Math.random() - 0.5) * 1.5 * dt;
      gazeRef.current.y += (Math.random() - 0.5) * 1.5 * dt;
      gazeRef.current.x = Math.max(-1, Math.min(1, gazeRef.current.x));
      gazeRef.current.y = Math.max(-1, Math.min(1, gazeRef.current.y));

      // ⚡ BOLT: Mutate DOM directly instead of using setState in requestAnimationFrame
      if (gazeElementRef.current) {
        gazeElementRef.current.style.transform = `translate(${gazeRef.current.x * 64}px, ${gazeRef.current.y * 64}px)`;
      }

      const gazeDistSq =
        gazeRef.current.x * gazeRef.current.x +
        gazeRef.current.y * gazeRef.current.y;
      if (gazeDistSq > 0.36) {
        gazeTaskHealthRef.current -= 25 * dt;
      } else {
        gazeTaskHealthRef.current = Math.min(
          100,
          gazeTaskHealthRef.current + 15 * dt,
        );
      }
      if (gazeHealthBarRef.current) {
        gazeHealthBarRef.current.style.width = `${gazeTaskHealthRef.current}%`;
        gazeHealthBarRef.current.className = `h-full ${gazeTaskHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`;
      }
      if (gazeHealthContainerRef.current) {
        gazeHealthContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(gazeTaskHealthRef.current).toString(),
        );
      }

      // --- Task 3 Logic ---
      faceTimer += dt;
      if (faceTimer > 2.5) {
        // Faster prompt (2.5s instead of 3s)
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
      faceTaskHealthRef.current -= 15 * dt;
      if (faceHealthBarRef.current) {
        faceHealthBarRef.current.style.width = `${faceTaskHealthRef.current}%`;
        faceHealthBarRef.current.className = `h-full ${faceTaskHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`;
      }
      if (faceHealthContainerRef.current) {
        faceHealthContainerRef.current.setAttribute(
          "aria-valuenow",
          Math.round(faceTaskHealthRef.current).toString(),
        );
      }

      // Check healths for mistake
      if (
        mouseTaskHealthRef.current <= 0 ||
        gazeTaskHealthRef.current <= 0 ||
        faceTaskHealthRef.current <= 0
      ) {
        registerMistake();
        // Reset healths to prevent immediate double mistake
        if (mouseTaskHealthRef.current <= 0) mouseTaskHealthRef.current = 100;
        if (gazeTaskHealthRef.current <= 0) gazeTaskHealthRef.current = 100;
        if (faceTaskHealthRef.current <= 0) faceTaskHealthRef.current = 100;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (mistakeTimeoutRef.current) clearTimeout(mistakeTimeoutRef.current);
    };
  }, [onWin]);

  useEffect(() => {
    if (mistakes >= 2) {
      onLose("You fell asleep on the job. The patient is very disappointed.");
    }
  }, [mistakes, onLose]);

  return (
    <div className="absolute inset-0 pointer-events-auto bg-black/40 overflow-hidden">
      {/* Microsleep Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-50 pointer-events-none transition-colors duration-100"
      />

      {showWarning && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none bg-red-900/30"
          role="alert"
          aria-live="assertive"
        >
          <h1
            className="text-9xl font-black text-red-600 uppercase animate-bounce"
            style={{ textShadow: "0 0 40px red" }}
          >
            WARNING! WAKE UP!
          </h1>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full relative">
        {/* Timer */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center text-white bg-blue-900/80 p-4 rounded-xl z-20 shadow-lg shadow-blue-500/50">
          <h1 className="text-3xl font-black opacity-80">
            NIGHT SHIFT: 36 HOURS IN
          </h1>
          <p ref={timeRemainingElementRef} className="text-2xl font-mono">
            {timeRemainingRef.current}s
          </p>
          <p className="text-red-400 font-bold" aria-live="polite">
            {mistakes} / 2 Mistakes
          </p>
        </div>

        {/* Task 1: Mouse */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black/50 rounded-xl border border-white/20 flex items-center justify-center pointer-events-none">
          <h3 className="absolute top-2 text-white/50 font-bold text-sm">
            MOUSE
          </h3>

          {/* Target */}
          <div
            ref={targetElementRef}
            className="absolute w-12 h-12 border-2 border-yellow-400 rounded-full bg-yellow-400/20"
            style={{
              left: targetPosRef.current.x - window.innerWidth * 0.2 + 128 - 24,
              top: targetPosRef.current.y - window.innerHeight * 0.5 + 128 - 24,
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
          <div
            ref={mouseHealthContainerRef}
            className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(mouseTaskHealthRef.current)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Mouse task health"
          >
            <div
              ref={mouseHealthBarRef}
              className={`h-full ${mouseTaskHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
              style={{ width: `${mouseTaskHealthRef.current}%` }}
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
              ref={gazeElementRef}
              className="absolute w-6 h-6 bg-blue-500 rounded-full"
              style={{
                transform: `translate(${gazeRef.current.x * 64}px, ${gazeRef.current.y * 64}px)`,
              }}
            />
          </div>

          {/* Health Bar */}
          <div
            ref={gazeHealthContainerRef}
            className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(gazeTaskHealthRef.current)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Gaze task health"
          >
            <div
              ref={gazeHealthBarRef}
              className={`h-full ${gazeTaskHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
              style={{ width: `${gazeTaskHealthRef.current}%` }}
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
            aria-live="polite"
          >
            PRESS {facePromptRef.current}
          </div>

          {/* Health Bar */}
          <div
            ref={faceHealthContainerRef}
            className="absolute bottom-2 w-11/12 h-2 bg-gray-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(faceTaskHealthRef.current)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Face task health"
          >
            <div
              ref={faceHealthBarRef}
              className={`h-full ${faceTaskHealthRef.current > 30 ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
              style={{ width: `${faceTaskHealthRef.current}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
