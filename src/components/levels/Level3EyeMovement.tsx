import React, { useEffect, useRef, useState } from "react";

export function Level3EyeMovement({
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  // Penlight position with lag
  const penlightRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const [penlightPos, setPenlightPos] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [progress, setProgress] = useState(0);

  // H-pattern nodes to trace
  const nodes = [
    { x: 0.3, y: 0.3 },
    { x: 0.3, y: 0.7 },
    { x: 0.3, y: 0.5 },
    { x: 0.7, y: 0.5 },
    { x: 0.7, y: 0.3 },
    { x: 0.7, y: 0.7 },
  ];
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  // Update mouse ref
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Game loop
  const frameRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const currentNodeIndexRef = useRef(0);

  useEffect(() => {
    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Physics lag
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      const dx = targetX - penlightRef.current.x;
      const dy = targetY - penlightRef.current.y;

      penlightRef.current.x += dx * 0.05; // Lag factor
      penlightRef.current.y += dy * 0.05;

      setPenlightPos({ x: penlightRef.current.x, y: penlightRef.current.y });

      // Check distance to current node
      if (currentNodeIndexRef.current < nodes.length) {
        const targetNode = nodes[currentNodeIndexRef.current];
        const targetNodeX = targetNode.x * window.innerWidth;
        const targetNodeY = targetNode.y * window.innerHeight;

        const dist = Math.hypot(
          penlightRef.current.x - targetNodeX,
          penlightRef.current.y - targetNodeY,
        );

        if (dist < 50) {
          currentNodeIndexRef.current += 1;
          setCurrentNodeIndex(currentNodeIndexRef.current);
          setProgress((currentNodeIndexRef.current / nodes.length) * 100);

          if (currentNodeIndexRef.current >= nodes.length) {
            onWin();
          }
        }
      }

      // Small stress increase over time if moving too fast or just ambiently
      // to give a sense of urgency
      if (Math.random() < 0.02) {
        onStressChange(0.5);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onWin, onStressChange]);

  useEffect(() => {
    if (stress >= 100) {
      onLose("Patient got too stressed during the eye exam!");
    }
  }, [stress, onLose]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-auto">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 text-center text-white bg-black/50 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Level 3: Eye Movement</h2>
        <p className="text-sm mb-2">Trace the H-pattern with the penlight.</p>
        {/* Custom Progress Bar */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const isActive = i === currentNodeIndex;
        const isDone = i < currentNodeIndex;
        return (
          <div
            key={i}
            className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 transition-colors ${
              isDone
                ? "bg-green-500 border-green-500"
                : isActive
                  ? "bg-yellow-400 border-yellow-200 animate-pulse"
                  : "border-white/50"
            }`}
            style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
          />
        );
      })}

      {/* Penlight */}
      <div
        className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-yellow-200/50 mix-blend-screen blur-md pointer-events-none"
        style={{
          left: penlightPos.x,
          top: penlightPos.y,
          boxShadow: "0 0 40px 20px rgba(254, 240, 138, 0.5)",
        }}
      />
      <div
        className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-white pointer-events-none"
        style={{
          left: penlightPos.x,
          top: penlightPos.y,
          boxShadow: "0 0 10px 5px white",
        }}
      />
    </div>
  );
}
