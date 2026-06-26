import { useState, useEffect, useRef, useCallback } from "react";
import {
  resumeAudio,
  playStress,
  playDialogue,
  playThroatHit,
} from "@/lib/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

type SkullPos = "mastoid-left" | "forehead" | "mastoid-right";

const POSITIONS: { id: SkullPos; label: string; svgX: number; svgY: number }[] =
  [
    { id: "mastoid-left", label: "Mastoid L", svgX: 105, svgY: 230 },
    { id: "forehead", label: "Forehead", svgX: 185, svgY: 115 },
    { id: "mastoid-right", label: "Mastoid R", svgX: 265, svgY: 230 },
  ];

const DIALOGUE = [
  "I can hear something. Whether it is what you intended is unclear.",
  "That resonated directly into my skull. Interesting.",
  "Are you planning to use that, or simply admire it?",
  "I believe this is the Weber test. Or the Rinne. I've lost track.",
  "The ringing is quite musical. You have taste.",
];

// Strike a synthesized tone (the tuning fork sound)
function strikeTuningFork(power: number) {
  try {
    const ctx = new AudioContext();
    const baseFreq = 512; // A5 — standard tuning fork
    const gainVal = Math.min(0.4, power * 0.006);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = baseFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 3.6);

    // overtone
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = baseFreq * 2;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(gainVal * 0.3, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 2.1);

    setTimeout(() => void ctx.close(), 4000);
  } catch {
    /* no audio */
  }
}

export default function Level6Tuning({ onStressChange, onWin }: Props) {
  const [charging, setCharging] = useState(false);
  const [power, setPower] = useState(0); // 0–100
  const [vibration, setVibration] = useState(0); // 0–100, decays
  const [forkX, setForkX] = useState(185);
  const [forkY, setForkY] = useState(320);
  const [tested, setTested] = useState<Set<SkullPos>>(new Set());
  const [holdAt, setHoldAt] = useState<SkullPos | null>(null);
  const [holdFrames, setHoldFrames] = useState(0);
  const [won, setWon] = useState(false);
  const [dialogue, setDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [flashPos, setFlashPos] = useState<SkullPos | null>(null);
  const [vibWave, setVibWave] = useState(0); // oscillates for animation

  const wonRef = useRef(false);
  // Plain refs so interval never nests setState calls inside setState updaters
  const holdFramesRef = useRef(0);
  const testedRef = useRef(new Set<SkullPos>());
  const vibRef = useRef(0);
  vibRef.current = vibration;
  const forkRef = useRef({ x: 185, y: 320 });
  forkRef.current = { x: forkX, y: forkY };

  const showMsg = useCallback((msg: string) => {
    setDialogue(msg);
    setShowDialogue(true);
    playDialogue();
    setTimeout(() => setShowDialogue(false), 2400);
  }, []);

  // Charge bar while SPACE held
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      resumeAudio();
      if (e.code === "Space") {
        e.preventDefault();
        setCharging(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setCharging(false);
        setPower((p) => {
          const pct = p;
          if (pct < 15) {
            // too soft
            onStressChange(5);
            playStress();
            showMsg(
              "I'm afraid the fork remains silent. A firmer wrist, perhaps.",
            );
          } else if (pct > 80) {
            // too hard
            onStressChange(20);
            playStress();
            showMsg(
              "That was rather vigorous. My ears are still ringing. From a different reason.",
            );
          } else {
            // good strike
            strikeTuningFork(pct);
            playThroatHit(); // thud click
            setVibration(100);
          }
          return 0;
        });
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onStressChange, showMsg]);

  // Charge meter while holding
  useEffect(() => {
    if (!charging) return;
    const t = setInterval(() => {
      setPower((p) => Math.min(100, p + 2.5));
    }, 50);
    return () => clearInterval(t);
  }, [charging]);

  // Arrow key fork movement
  useEffect(() => {
    const pressed: Record<string, boolean> = {};
    const down = (e: KeyboardEvent) => {
      pressed[e.key] = true;
    };
    const up = (e: KeyboardEvent) => {
      pressed[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const tick = setInterval(() => {
      if (wonRef.current) return;
      const SPEED = 4;
      setForkX((x) => {
        if (pressed["ArrowLeft"]) return Math.max(80, x - SPEED);
        if (pressed["ArrowRight"]) return Math.min(290, x + SPEED);
        return x;
      });
      setForkY((y) => {
        if (pressed["ArrowUp"]) return Math.max(100, y - SPEED);
        if (pressed["ArrowDown"]) return Math.min(340, y + SPEED);
        return y;
      });
    }, 16);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      clearInterval(tick);
    };
  }, []);

  // Vibration decay + wave animation
  useEffect(() => {
    const t = setInterval(() => {
      setVibration((v) => Math.max(0, v - 0.4));
      setVibWave((w) => (w + 0.25) % (Math.PI * 2));
    }, 16);
    return () => clearInterval(t);
  }, []);

  // Check if fork is near a skull position and vibrating
  useEffect(() => {
    const t = setInterval(() => {
      if (wonRef.current) return;
      if (vibRef.current < 10) {
        setHoldAt(null);
        setHoldFrames(0);
        return;
      }

      const { x, y } = forkRef.current;
      let nearest: SkullPos | null = null;
      for (const pos of POSITIONS) {
        if (Math.hypot(x - pos.svgX, y - pos.svgY) < 36) {
          nearest = pos.id;
          break;
        }
      }

      setHoldAt(nearest);
      if (nearest && !testedRef.current.has(nearest)) {
        holdFramesRef.current += 1;
        setHoldFrames(holdFramesRef.current);
        if (holdFramesRef.current >= 90) {
          holdFramesRef.current = 0;
          setHoldFrames(0);
          const newTested = new Set([...testedRef.current, nearest]);
          testedRef.current = newTested;
          setTested(newTested);
          setFlashPos(nearest);
          setTimeout(() => setFlashPos(null), 500);
          onStressChange(-5);
          if (newTested.size >= POSITIONS.length && !wonRef.current) {
            wonRef.current = true;
            setWon(true);
            setTimeout(onWin, 1800);
          } else {
            showMsg(DIALOGUE[Math.floor(Math.random() * DIALOGUE.length)]);
          }
        }
      } else {
        holdFramesRef.current = 0;
        setHoldFrames(0);
      }
    }, 16);
    return () => clearInterval(t);
  }, [onStressChange, onWin, showMsg]);

  const holdPct = Math.min(100, (holdFrames / 90) * 100);
  // Fork visual vibration offset
  const shakeAmt = (vibration / 100) * 3;
  const shakeX = Math.sin(vibWave * 18) * shakeAmt;

  return (
    <div
      className="w-full h-full flex items-center justify-center relative select-none"
      style={{
        background:
          "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)",
      }}
    >
      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-xs text-primary/70 tracking-widest uppercase px-4 py-2 border border-primary/20 bg-background/40">
          SPACE — charge &amp; strike | Arrow Keys — position fork
        </div>
        <div className="text-xs text-muted-foreground/40 mt-1">
          Optimal strike: 15–80% charge. Hold at each skull position while
          vibrating.
        </div>
      </div>

      {/* Tested positions */}
      <div className="absolute top-20 right-8 z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-2">
          Positions Tested
        </div>
        {POSITIONS.map((p) => (
          <div key={p.id} className="flex items-center gap-2 text-xs mb-1">
            <div
              className="w-3 h-3 border-2 transition-all"
              style={{
                borderColor: tested.has(p.id)
                  ? "hsl(180,60%,55%)"
                  : "hsl(0,0%,22%)",
                background: tested.has(p.id)
                  ? "hsl(180,60%,15%)"
                  : "transparent",
              }}
            />
            <span
              className={
                tested.has(p.id)
                  ? "text-primary line-through"
                  : "text-muted-foreground/50"
              }
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main scene: head + fork */}
      <div className="flex items-center gap-10">
        {/* Head SVG */}
        <div>
          <svg viewBox="80 80 210 280" width="300" height="360">
            {/* Head */}
            <ellipse
              cx="185"
              cy="210"
              rx="95"
              ry="115"
              fill="hsl(35,55%,62%)"
              stroke="hsl(35,45%,50%)"
              strokeWidth="2"
            />
            {/* Hair */}
            <ellipse cx="185" cy="105" rx="92" ry="42" fill="hsl(25,40%,30%)" />
            {/* Ears */}
            <ellipse
              cx="90"
              cy="210"
              rx="16"
              ry="22"
              fill="hsl(35,50%,58%)"
              stroke="hsl(35,40%,48%)"
              strokeWidth="1.5"
            />
            <ellipse
              cx="280"
              cy="210"
              rx="16"
              ry="22"
              fill="hsl(35,50%,58%)"
              stroke="hsl(35,40%,48%)"
              strokeWidth="1.5"
            />
            {/* Eyes */}
            <ellipse cx="155" cy="190" rx="18" ry="12" fill="white" />
            <ellipse cx="215" cy="190" rx="18" ry="12" fill="white" />
            <circle cx="155" cy="190" r="7" fill="hsl(200,30%,35%)" />
            <circle cx="215" cy="190" r="7" fill="hsl(200,30%,35%)" />
            <circle cx="155" cy="190" r="4" fill="black" />
            <circle cx="215" cy="190" r="4" fill="black" />
            {/* Nose */}
            <path
              d="M 178 210 Q 185 235 177 248 Q 185 252 193 248 Q 185 235 192 210"
              fill="hsl(35,40%,55%)"
            />
            {/* Mouth - slight grimace */}
            <path
              d="M 160 275 Q 185 270 210 275"
              fill="none"
              stroke="hsl(10,30%,40%)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Target skull positions */}
            {POSITIONS.map((pos) => {
              const isTested = tested.has(pos.id);
              const isActive = holdAt === pos.id;
              return (
                <g key={pos.id}>
                  <circle
                    cx={pos.svgX}
                    cy={pos.svgY}
                    r="24"
                    fill={
                      flashPos === pos.id
                        ? "rgba(100,255,200,0.5)"
                        : isTested
                          ? "rgba(100,255,200,0.15)"
                          : isActive
                            ? "rgba(100,255,200,0.2)"
                            : "rgba(255,255,255,0.06)"
                    }
                    stroke={
                      isTested
                        ? "hsl(180,60%,50%)"
                        : isActive
                          ? "hsl(180,60%,55%)"
                          : "rgba(255,255,255,0.2)"
                    }
                    strokeWidth="1.5"
                    strokeDasharray={isTested ? "" : "4 3"}
                  />
                  <text
                    x={pos.svgX}
                    y={pos.svgY + 4}
                    textAnchor="middle"
                    fill={
                      isTested ? "hsl(180,60%,60%)" : "rgba(255,255,255,0.3)"
                    }
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {pos.label}
                  </text>
                  {/* Vibration rings when fork is near */}
                  {isActive &&
                    vibration > 10 &&
                    [1, 2, 3].map((ring) => (
                      <circle
                        key={ring}
                        cx={pos.svgX}
                        cy={pos.svgY}
                        r={24 + ring * 12 + Math.sin(vibWave + ring) * 4}
                        fill="none"
                        stroke={`rgba(100,255,200,${0.3 / ring})`}
                        strokeWidth="1"
                      />
                    ))}
                </g>
              );
            })}

            {/* Tuning fork (moveable) */}
            <g transform={`translate(${forkX + shakeX}, ${forkY})`}>
              {/* Handle */}
              <rect
                x="-3"
                y="0"
                width="6"
                height="50"
                rx="2"
                fill="hsl(210,30%,55%)"
                stroke="hsl(210,25%,45%)"
                strokeWidth="1"
              />
              {/* Tines */}
              <rect
                x="-10"
                y="-40"
                width="5"
                height="46"
                rx="2"
                fill="hsl(210,30%,65%)"
                stroke="hsl(210,25%,50%)"
                strokeWidth="1"
              />
              <rect
                x="5"
                y="-40"
                width="5"
                height="46"
                rx="2"
                fill="hsl(210,30%,65%)"
                stroke="hsl(210,25%,50%)"
                strokeWidth="1"
              />
              {/* Tine tips (spread when vibrating) */}
              <circle
                cx={-7 + (vibration / 100) * -4}
                cy="-42"
                r="3"
                fill="hsl(210,40%,70%)"
              />
              <circle
                cx={7 + (vibration / 100) * 4}
                cy="-42"
                r="3"
                fill="hsl(210,40%,70%)"
              />
              {/* Vibration glow */}
              {vibration > 0 && (
                <ellipse
                  cx="0"
                  cy="-38"
                  rx={8 + vibration / 20}
                  ry="6"
                  fill="none"
                  stroke={`rgba(100,200,255,${vibration / 200})`}
                  strokeWidth="2"
                />
              )}
            </g>
          </svg>
        </div>

        {/* Controls panel */}
        <div className="flex flex-col gap-4 w-44">
          {/* Charge meter */}
          <div>
            <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">
              Strike Power
            </div>
            <div className="w-full h-28 bg-secondary overflow-hidden flex flex-col-reverse border border-border/30">
              <div
                className="w-full transition-none"
                style={{
                  height: `${power}%`,
                  background:
                    power > 80
                      ? "hsl(0,70%,55%)"
                      : power > 15
                        ? "hsl(120,60%,45%)"
                        : "hsl(45,80%,55%)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground/30 mt-1">
              <span>SOFT</span>
              <span
                className={
                  power > 80
                    ? "text-destructive"
                    : power > 15
                      ? "text-primary"
                      : "text-yellow-500/60"
                }
              >
                {power > 80 ? "TOO HARD" : power > 15 ? "GOOD" : "TOO SOFT"}
              </span>
              <span>HARD</span>
            </div>
            <div className="text-xs text-muted-foreground/40 mt-2 text-center tracking-widest">
              {charging ? "▼ HOLD SPACE ▼" : "[ SPACE ]"}
            </div>
          </div>

          {/* Vibration meter */}
          <div>
            <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">
              Vibration
            </div>
            <div className="w-full h-3 bg-secondary overflow-hidden">
              <div
                className="h-full transition-none"
                style={{
                  width: `${vibration}%`,
                  background:
                    vibration > 30 ? "hsl(200,80%,55%)" : "hsl(0,50%,45%)",
                }}
              />
            </div>
            <div
              className="text-xs mt-1"
              style={{
                color: vibration > 30 ? "hsl(200,70%,60%)" : "hsl(0,50%,55%)",
              }}
            >
              {vibration > 60
                ? "VIBRATING"
                : vibration > 20
                  ? "FADING"
                  : "SILENT"}
            </div>
          </div>

          {/* Hold meter */}
          {holdAt && !tested.has(holdAt) && (
            <div>
              <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">
                Hold
              </div>
              <div className="w-full h-2 bg-secondary overflow-hidden">
                <div
                  className="h-full transition-none"
                  style={{
                    width: `${holdPct}%`,
                    background: "hsl(180,60%,50%)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Win */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div
            className="text-4xl font-bold text-primary"
            style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}
          >
            HEARING CONFIRMED
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
