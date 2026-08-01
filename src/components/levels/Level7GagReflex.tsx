import React, { useEffect, useRef, useState } from "react";

export function Level7GagReflex({
  onStressChange,
  onWin,
  onLose,
}: {
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}) {
  const [successfulGags, setSuccessfulGags] = useState(0);

  // Mouse tracking
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
  });
  const lastMousePos = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Game state
  const stateRef = useRef({
    inThroat: false,
    timeInThroat: 0,
    cooldown: 0,
    successfulGags: 0,
  });

  // Throat position
  const throatRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2 - 50,
    vx: Math.random() * 1 - 0.5,
    vy: Math.random() * 1 - 0.5,
    radius: 60,
  });

  const throatElementRef = useRef<HTMLDivElement>(null);
  const depressorElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (successfulGags >= 3) {
      onWin();
    }
  }, [successfulGags, onWin]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
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

      const mouse = mouseRef.current;
      const lastPos = lastMousePos.current;

      // Calculate mouse velocity
      if (dt > 0) {
        mouse.vx = (mouse.x - lastPos.x) / dt;
        mouse.vy = (mouse.y - lastPos.y) / dt;
      }
      lastPos.x = mouse.x;
      lastPos.y = mouse.y;

      const throat = throatRef.current;
      const state = stateRef.current;

      // Update throat position (wandering)
      throat.x += throat.vx * dt * 0.1;
      throat.y += throat.vy * dt * 0.1;

      // Bounce off boundaries around center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2 - 50;
      const range = 50;

      if (throat.x < centerX - range) {
        throat.x = centerX - range;
        throat.vx *= -1;
      } else if (throat.x > centerX + range) {
        throat.x = centerX + range;
        throat.vx *= -1;
      }
      if (throat.y < centerY - range) {
        throat.y = centerY - range;
        throat.vy *= -1;
      } else if (throat.y > centerY + range) {
        throat.y = centerY + range;
        throat.vy *= -1;
      }

      if (throatElementRef.current) {
        throatElementRef.current.style.left = `${throat.x - 60}px`;
        throatElementRef.current.style.top = `${throat.y - 60}px`;
      }
      if (depressorElementRef.current) {
        depressorElementRef.current.style.left = `${mouse.x}px`;
        depressorElementRef.current.style.top = `${mouse.y}px`;
      }

      if (state.cooldown > 0) {
        state.cooldown -= dt;
      }

      const dx = throat.x - mouse.x;
      const dy = throat.y - mouse.y;
      const distToThroatSq = dx * dx + dy * dy;
      const isInsideThroat = distToThroatSq < throat.radius * throat.radius;

      // Determine if hitting wrong areas (teeth/tongue)
      // Simplification: if outside throat but within "mouth" radius
      const mouthRadius = 150;
      const isInsideMouth = distToThroatSq < mouthRadius * mouthRadius;

      if (isInsideMouth && !isInsideThroat) {
        // Hitting wrong areas
        onStressChange(0.05); // constant stress for touching teeth/tongue
      }

      if (isInsideThroat) {
        if (!state.inThroat) {
          state.inThroat = true;
          state.timeInThroat = 0;

          // Check velocity
          const speedSq = mouse.vx * mouse.vx + mouse.vy * mouse.vy;
          if (speedSq > 1.0) {
            onStressChange(10); // Poked too hard!
          }
        } else {
          state.timeInThroat += dt;
          if (state.timeInThroat > 1500) {
            // 1.5 seconds max
            onStressChange(0.2); // holding too long adds continuous stress
          }
        }
      } else {
        if (state.inThroat) {
          // Exited throat
          state.inThroat = false;
          if (state.timeInThroat > 200 && state.cooldown <= 0) {
            // Triggered gag successfully
            state.successfulGags += 1;
            setSuccessfulGags(state.successfulGags);
            state.cooldown = 1000; // 1s cooldown
          }
        }
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onStressChange]);

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden bg-zinc-900">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[32rem] text-center text-white bg-black/50 p-4 rounded z-20 pointer-events-none">
        <h2 className="text-xl font-bold mb-2">Level 7: Gag Reflex</h2>
        <p className="text-sm mb-2">
          Carefully move the tongue depressor to the back of the throat to
          trigger the gag reflex. Don't poke too hard, don't hold it there too
          long, and avoid the surrounding mouth areas!
        </p>
        <div className="text-sm font-bold text-green-300">
          Reflex Triggered: {successfulGags} / 3
        </div>
      </div>

      {/* Mouth Area */}
      <div
        className="absolute rounded-full border-4 border-red-900/50 bg-red-950 flex items-center justify-center pointer-events-none"
        style={{
          width: 300,
          height: 300,
          left: window.innerWidth / 2 - 150,
          top: window.innerHeight / 2 - 200,
        }}
      >
        <div className="absolute top-0 w-full h-1/4 bg-white/10 rounded-t-full border-b border-white/20 flex items-center justify-center">
          <span className="text-xs text-white/30">Teeth / Palate</span>
        </div>
        <div className="absolute bottom-0 w-full h-1/3 bg-red-800/20 rounded-b-full border-t border-red-500/20 flex items-center justify-center">
          <span className="text-xs text-white/30">Tongue</span>
        </div>
      </div>

      {/* Throat Target */}
      <div
        ref={throatElementRef}
        className="absolute rounded-full bg-black/40 flex items-center justify-center pointer-events-none transition-transform"
        style={{
          width: 120,
          height: 120,
          left: window.innerWidth / 2 - 60, // initial position
          top: window.innerHeight / 2 - 110, // initial position (y - 50 - 60)
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
        }}
      >
        <div className="w-8 h-16 bg-red-900/80 rounded-full animate-pulse absolute -top-4" />{" "}
        {/* Uvula */}
        <span className="text-xs text-white/50 mt-8">Throat</span>
      </div>

      {/* Tongue Depressor */}
      <div
        ref={depressorElementRef}
        className="absolute pointer-events-none z-50 w-6 h-40 -ml-3"
        style={{
          left: window.innerWidth / 2, // initial position
          top: window.innerHeight / 2, // initial position
          transition: "none",
          transformOrigin: "top center",
          transform: "rotate(-10deg)",
        }}
      >
        <div className="w-full h-full bg-amber-200/90 rounded-full shadow-lg border-2 border-amber-300/50" />
      </div>
    </div>
  );
}
