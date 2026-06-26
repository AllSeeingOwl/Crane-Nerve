import { useState, useEffect, useRef, useCallback } from "react";
import {
  resumeAudio,
  playTongueHit,
  playTongueRelease,
  playWinFanfare,
} from "@/lib/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

const SEQUENCE = [
  "left",
  "center",
  "right",
  "left",
  "center",
  "right",
] as const;
type Dir = (typeof SEQUENCE)[number];

const DIALOGUE = [
  "I am moving my tongue. This is quite strange.",
  "The tongue is a remarkable muscle. Allegedly.",
  "Please don't make eye contact while doing this.",
  "I have 21 remaining tongue movements. Please hurry.",
];

export default function Level9Hypoglossal({ onStressChange, onWin }: Props) {
  // Tongue physics: position, velocity
  const [tongueX, setTongueX] = useState(0); // -1 (left) to 1 (right)
  const [tongueVelX, setTongueVelX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTongue, setDragStartTongue] = useState(0);
  const [step, setStep] = useState(0); // index into SEQUENCE
  const [won, setWon] = useState(false);
  const [dialogue, setDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [flashDir, setFlashDir] = useState<Dir | null>(null);
  const tongueRef = useRef(tongueX);
  const velRef = useRef(tongueVelX);
  const draggingRef = useRef(isDragging);
  tongueRef.current = tongueX;
  velRef.current = tongueVelX;
  draggingRef.current = isDragging;
  const wonRef = useRef(false);

  const showMsg = useCallback((msg: string) => {
    setDialogue(msg);
    setShowDialogue(true);
    setTimeout(() => setShowDialogue(false), 2200);
  }, []);

  // Physics loop
  useEffect(() => {
    const tick = setInterval(() => {
      if (wonRef.current) return;
      if (!draggingRef.current) {
        // Spring back to center with damping (slimy physics)
        setTongueX((prev) => {
          const vel = velRef.current;
          const spring = -prev * 0.04; // pull toward center
          const damp = -vel * 0.12;
          const newVel = vel + spring + damp;
          velRef.current = newVel;
          setTongueVelX(newVel);
          return prev + newVel;
        });
      }
    }, 16);
    return () => clearInterval(tick);
  }, []);

  // Check position against sequence
  useEffect(() => {
    if (wonRef.current) return;
    const target = SEQUENCE[step];
    const x = tongueRef.current;
    const isLeft = x < -0.55;
    const isCenter = Math.abs(x) < 0.25;
    const isRight = x > 0.55;

    const atTarget =
      (target === "left" && isLeft) ||
      (target === "center" && isCenter) ||
      (target === "right" && isRight);

    if (atTarget) {
      playTongueHit();
      setFlashDir(target);
      setTimeout(() => setFlashDir(null), 350);
      onStressChange(-2);
      showMsg(DIALOGUE[Math.floor(Math.random() * DIALOGUE.length)]);
      const next = step + 1;
      setStep(next);
      if (next >= SEQUENCE.length && !wonRef.current) {
        wonRef.current = true;
        setWon(true);
        setTimeout(() => {
          playWinFanfare();
          onWin();
        }, 400);
      }
    }
  }, [tongueX, step, onWin, onStressChange, showMsg]);

  // Drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    resumeAudio();
    setIsDragging(true);
    draggingRef.current = true;
    setDragStartX(e.clientX);
    setDragStartTongue(tongueRef.current);
    setTongueVelX(0);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - dragStartX) / 180;
      const newX = Math.max(-1, Math.min(1, dragStartTongue + dx));
      setTongueX(newX);
      tongueRef.current = newX;
    },
    [isDragging, dragStartX, dragStartTongue],
  );

  const onMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    draggingRef.current = false;
    playTongueRelease();
    // Give it some velocity from drag
    setTongueVelX(velRef.current * 0.5);
  }, [isDragging]);

  // Map tongueX (-1 to 1) to SVG coords
  const svgW = 370;
  const centerX = svgW / 2;
  const range = 100;
  const depX = centerX + tongueX * range;

  const targetDir = SEQUENCE[step];

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative select-none"
      style={{
        background:
          "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-xs text-primary/70 tracking-widest uppercase px-4 py-2 border border-primary/20 bg-background/40">
          Click & Drag the tongue to move it
        </div>
      </div>

      {/* Sequence progress */}
      <div className="absolute top-20 right-8 z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-2">
          Sequence
        </div>
        <div className="flex flex-col gap-1">
          {SEQUENCE.map((dir, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div
                className={`w-3 h-3 border ${i < step ? "bg-primary border-primary" : i === step ? "border-primary animate-pulse" : "border-border"}`}
              />
              <span
                className={
                  i < step
                    ? "text-primary line-through"
                    : i === step
                      ? "text-primary"
                      : "text-muted-foreground/40"
                }
              >
                {dir.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scene */}
      <div className="relative">
        <svg
          viewBox="0 60 370 340"
          width="420"
          height="330"
          onMouseDown={onMouseDown}
        >
          {/* Face / chin area */}
          <ellipse
            cx="185"
            cy="100"
            rx="120"
            ry="40"
            fill="hsl(35,55%,62%)"
            stroke="hsl(35,45%,50%)"
            strokeWidth="2"
          />

          {/* Open mouth cavity */}
          <ellipse
            cx="185"
            cy="220"
            rx="130"
            ry="90"
            fill="hsl(10,40%,18%)"
            stroke="hsl(10,30%,14%)"
            strokeWidth="2"
          />

          {/* Upper teeth */}
          <rect
            x="90"
            y="148"
            width="190"
            height="20"
            rx="3"
            fill="hsl(200,15%,85%)"
            stroke="hsl(200,10%,70%)"
            strokeWidth="1"
          />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect
              key={i}
              x={93 + i * 20}
              y="150"
              width="17"
              height="16"
              rx="2"
              fill="white"
              stroke="hsl(200,10%,75%)"
              strokeWidth="0.5"
            />
          ))}

          {/* Lower teeth */}
          <rect
            x="90"
            y="278"
            width="190"
            height="20"
            rx="3"
            fill="hsl(200,15%,85%)"
            stroke="hsl(200,10%,70%)"
            strokeWidth="1"
          />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect
              key={i}
              x={93 + i * 20}
              y="280"
              width="17"
              height="14"
              rx="2"
              fill="white"
              stroke="hsl(200,10%,75%)"
              strokeWidth="0.5"
            />
          ))}

          {/* Gum lines */}
          <ellipse
            cx="185"
            cy="168"
            rx="110"
            ry="12"
            fill="hsl(350,40%,50%)"
            opacity="0.6"
          />
          <ellipse
            cx="185"
            cy="278"
            rx="110"
            ry="10"
            fill="hsl(350,40%,50%)"
            opacity="0.6"
          />

          {/* Direction indicators */}
          {/* Left target */}
          <g opacity={targetDir === "left" ? 1 : 0.15}>
            <rect
              x="95"
              y="200"
              width="50"
              height="30"
              rx="4"
              fill={
                flashDir === "left"
                  ? "rgba(100,255,200,0.4)"
                  : "rgba(100,255,200,0.08)"
              }
              stroke={
                flashDir === "left"
                  ? "hsl(180,60%,55%)"
                  : "rgba(100,255,200,0.3)"
              }
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x="120"
              y="220"
              textAnchor="middle"
              fill="rgba(100,255,200,0.5)"
              fontSize="9"
              fontFamily="monospace"
            >
              ← LEFT
            </text>
          </g>
          {/* Center target */}
          <g opacity={targetDir === "center" ? 1 : 0.15}>
            <rect
              x="160"
              y="200"
              width="50"
              height="30"
              rx="4"
              fill={
                flashDir === "center"
                  ? "rgba(100,255,200,0.4)"
                  : "rgba(100,255,200,0.08)"
              }
              stroke={
                flashDir === "center"
                  ? "hsl(180,60%,55%)"
                  : "rgba(100,255,200,0.3)"
              }
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x="185"
              y="220"
              textAnchor="middle"
              fill="rgba(100,255,200,0.5)"
              fontSize="9"
              fontFamily="monospace"
            >
              CENTER
            </text>
          </g>
          {/* Right target */}
          <g opacity={targetDir === "right" ? 1 : 0.15}>
            <rect
              x="225"
              y="200"
              width="50"
              height="30"
              rx="4"
              fill={
                flashDir === "right"
                  ? "rgba(100,255,200,0.4)"
                  : "rgba(100,255,200,0.08)"
              }
              stroke={
                flashDir === "right"
                  ? "hsl(180,60%,55%)"
                  : "rgba(100,255,200,0.3)"
              }
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x="250"
              y="220"
              textAnchor="middle"
              fill="rgba(100,255,200,0.5)"
              fontSize="9"
              fontFamily="monospace"
            >
              RIGHT →
            </text>
          </g>

          {/* Tongue body — physics-driven */}
          <g style={{ cursor: isDragging ? "grabbing" : "grab" }}>
            {/* Tongue base */}
            <ellipse
              cx={centerX}
              cy="270"
              rx="90"
              ry="25"
              fill="hsl(350,55%,48%)"
              stroke="hsl(350,45%,38%)"
              strokeWidth="2"
            />
            {/* Tongue main body - distorts based on position */}
            <path
              d={`M ${centerX - 70} 270 
                  Q ${centerX - 40} 240 ${depX - 30} 230 
                  Q ${depX} 215 ${depX + 30} 230 
                  Q ${centerX + 40} 240 ${centerX + 70} 270 Z`}
              fill="hsl(350,55%,52%)"
              stroke="hsl(350,45%,40%)"
              strokeWidth="2"
            />
            {/* Tongue tip */}
            <ellipse
              cx={depX}
              cy="222"
              rx="28"
              ry="20"
              fill="hsl(350,60%,55%)"
              stroke="hsl(350,50%,43%)"
              strokeWidth="2"
            />
            {/* Tongue texture */}
            <line
              x1={depX - 10}
              y1="215"
              x2={depX - 10}
              y2="228"
              stroke="hsl(350,45%,44%)"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1={depX}
              y1="212"
              x2={depX}
              y2="228"
              stroke="hsl(350,45%,44%)"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <line
              x1={depX + 10}
              y1="215"
              x2={depX + 10}
              y2="228"
              stroke="hsl(350,45%,44%)"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Gloss effect */}
            <ellipse
              cx={depX - 6}
              cy="218"
              rx="8"
              ry="5"
              fill="rgba(255,200,200,0.25)"
            />
          </g>

          {/* Uvula */}
          <path
            d="M 185 168 Q 180 190 185 200 Q 190 190 185 168"
            fill="hsl(350,50%,52%)"
            stroke="hsl(350,40%,42%)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="185"
            cy="200"
            rx="10"
            ry="14"
            fill="hsl(350,50%,52%)"
            stroke="hsl(350,40%,42%)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Position indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64">
        <div className="flex justify-between text-xs text-muted-foreground/40 mb-1">
          <span>LEFT</span>
          <span>CENTER</span>
          <span>RIGHT</span>
        </div>
        <div className="relative h-2 bg-secondary">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary bg-background transition-none"
            style={{ left: `calc(${((tongueX + 1) / 2) * 100}% - 8px)` }}
          />
        </div>
        <div className="text-xs text-muted-foreground/40 mt-2 text-center tracking-widest">
          NEXT:{" "}
          <span className="text-primary">{SEQUENCE[step]?.toUpperCase()}</span>
        </div>
      </div>

      {/* Win */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div
            className="text-4xl font-bold text-primary"
            style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}
          >
            TONGUE FUNCTION VERIFIED
          </div>
        </div>
      )}

      {/* Dialogue */}
      {showDialogue && (
        <div
          className="absolute top-40 right-8 z-30 max-w-xs"
          style={{
            background: "hsl(210,18%,14%)",
            border: "1px solid hsl(210,15%,25%)",
            padding: "10px 14px",
            borderRadius: 4,
          }}
        >
          <p className="text-xs text-muted-foreground italic">"{dialogue}"</p>
        </div>
      )}
    </div>
  );
}
