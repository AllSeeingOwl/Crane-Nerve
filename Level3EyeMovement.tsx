import { useState, useEffect, useRef, useCallback } from "react";
import { resumeAudio, playStress, playDialogue, playSoftTouch } from "@/lib/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

// H-pattern: 9 positions to hit in order
// coords relative to SVG center (0,0)
const H_POSITIONS = [
  { id: "left",        x: -110, y:    0, label: "LEFT"       },
  { id: "upper-left",  x: -110, y:  -70, label: "UP-LEFT"    },
  { id: "lower-left",  x: -110, y:   70, label: "DOWN-LEFT"  },
  { id: "center",      x:    0, y:    0, label: "CENTER"     },
  { id: "right",       x:  110, y:    0, label: "RIGHT"      },
  { id: "upper-right", x:  110, y:  -70, label: "UP-RIGHT"   },
  { id: "lower-right", x:  110, y:   70, label: "DOWN-RIGHT" },
  { id: "center2",     x:    0, y:    0, label: "CENTER"     },
  { id: "up",          x:    0, y:  -70, label: "UPWARD"     },
];

const DIALOGUE = [
  "My eye does not appear to agree with your light.",
  "I'm following the light. The light is not following your intentions.",
  "Is that a penlight or a laser pointer? I can never tell.",
  "I believe that's the third time you've been to that corner.",
  "Fascinating. My eye appears to have strong opinions.",
];

const SVG_CX = 185;
const SVG_CY = 210;

export default function Level3EyeMovement({ onStressChange, onWin }: Props) {
  const [mousePos, setMousePos] = useState({ x: SVG_CX, y: SVG_CY });
  const [lightX, setLightX] = useState(SVG_CX);
  const [lightY, setLightY] = useState(SVG_CY);
  const [eyeX, setEyeX] = useState(SVG_CX);
  const [eyeY, setEyeY] = useState(SVG_CY);
  const [step, setStep] = useState(0);
  const [holdFrames, setHoldFrames] = useState(0);
  const [won, setWon] = useState(false);
  const [dialogue, setDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [flashStep, setFlashStep] = useState<number | null>(null);
  const [twitchOffset, setTwitchOffset] = useState({ x: 0, y: 0 });

  const wonRef = useRef(false);
  const lightRef = useRef({ x: SVG_CX, y: SVG_CY });
  const eyeRef = useRef({ x: SVG_CX, y: SVG_CY });
  const containerRef = useRef<HTMLDivElement>(null);
  lightRef.current = { x: lightX, y: lightY };
  eyeRef.current = { x: eyeX, y: eyeY };

  const showMsg = useCallback((msg: string) => {
    setDialogue(msg); setShowDialogue(true);
    playDialogue();
    setTimeout(() => setShowDialogue(false), 2400);
  }, []);

  // Track mouse relative to container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      resumeAudio();
      const rect = el.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, []);

  // Light has spring-overshoot physics chasing mouse
  useEffect(() => {
    let vx = 0, vy = 0;
    const tick = setInterval(() => {
      if (wonRef.current) return;
      const SPRING = 0.06;
      const DAMP = 0.72;

      // Target is the mouse position mapped into SVG space
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Map container px to SVG space (SVG viewBox is 0 0 370 420)
      const svgScaleX = 370 / rect.width;
      const svgScaleY = 420 / rect.height;
      // mousePos is relative to container
      // But we stored it in container px space; convert to SVG
      const targetX = mousePos.x * svgScaleX;
      const targetY = mousePos.y * svgScaleY;

      const lx = lightRef.current.x;
      const ly = lightRef.current.y;
      const ax = (targetX - lx) * SPRING;
      const ay = (targetY - ly) * SPRING;
      vx = vx * DAMP + ax;
      vy = vy * DAMP + ay;
      setLightX(x => x + vx);
      setLightY(y => y + vy);
    }, 16);
    return () => clearInterval(tick);
  }, [mousePos]);

  // Eye follows light with 500ms lag (ring buffer approach: just lerp toward light)
  useEffect(() => {
    const tick = setInterval(() => {
      if (wonRef.current) return;
      const lx = lightRef.current.x;
      const ly = lightRef.current.y;
      const ex = eyeRef.current.x;
      const ey = eyeRef.current.y;
      const LERP = 0.04;
      const TWITCH_DECAY = 0.8;
      setEyeX(x => x + (lx - x) * LERP);
      setEyeY(y => y + (ly - y) * LERP);
      setTwitchOffset(t => ({ x: t.x * TWITCH_DECAY, y: t.y * TWITCH_DECAY }));
    }, 16);
    return () => clearInterval(tick);
  }, []);

  // Random eye twitch
  useEffect(() => {
    const t = setInterval(() => {
      if (wonRef.current) return;
      if (Math.random() < 0.25) {
        setTwitchOffset({ x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 20 });
        onStressChange(3);
        playStress();
      }
    }, 3500);
    return () => clearInterval(t);
  }, [onStressChange]);

  // Check if light is near target, accumulate hold time
  useEffect(() => {
    const tick = setInterval(() => {
      if (wonRef.current || step >= H_POSITIONS.length) return;
      const target = H_POSITIONS[step];
      const tx = SVG_CX + target.x;
      const ty = SVG_CY + target.y;
      const lx = lightRef.current.x;
      const ly = lightRef.current.y;
      const dist = Math.hypot(lx - tx, ly - ty);

      if (dist < 28) {
        setHoldFrames(h => {
          const next = h + 1;
          if (next >= 60) {
            // Step complete
            playSoftTouch();
            setFlashStep(step);
            setTimeout(() => setFlashStep(null), 400);
            onStressChange(-3);
            const nextStep = step + 1;
            setStep(nextStep);
            if (nextStep >= H_POSITIONS.length) {
              wonRef.current = true;
              setWon(true);
              setTimeout(onWin, 1800);
            } else {
              showMsg(DIALOGUE[Math.floor(Math.random() * DIALOGUE.length)]);
            }
            return 0;
          }
          return next;
        });
      } else {
        setHoldFrames(0);
      }
    }, 16);
    return () => clearInterval(tick);
  }, [step, onStressChange, onWin, showMsg]);

  const holdPct = Math.min(100, (holdFrames / 60) * 100);
  const currentTarget = H_POSITIONS[step];
  const targetSvgX = currentTarget ? SVG_CX + currentTarget.x : SVG_CX;
  const targetSvgY = currentTarget ? SVG_CY + currentTarget.y : SVG_CY;

  // Clamp eye to sclera bounds
  const sclRx = 95, sclRy = 55;
  const rawEyeX = eyeX + twitchOffset.x;
  const rawEyeY = eyeY + twitchOffset.y;
  const eyeDx = rawEyeX - SVG_CX;
  const eyeDy = rawEyeY - SVG_CY;
  const mag = Math.hypot(eyeDx / sclRx, eyeDy / sclRy);
  const clampedEyeX = mag > 0.65 ? SVG_CX + (eyeDx / mag) * sclRx * 0.65 : rawEyeX;
  const clampedEyeY = mag > 0.65 ? SVG_CY + (eyeDy / mag) * sclRy * 0.65 : rawEyeY;

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative select-none cursor-none"
      style={{ background: "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)" }}
    >
      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-xs text-primary/70 tracking-widest uppercase px-4 py-2 border border-primary/20 bg-background/40">
          Move penlight to each target zone — hold briefly
        </div>
        <div className="text-xs text-muted-foreground/40 mt-1">The light overshoots. The eye has its own plans.</div>
      </div>

      {/* Progress */}
      <div className="absolute top-20 right-8 z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-2">H-Pattern</div>
        <div className="flex flex-col gap-1">
          {H_POSITIONS.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className={`w-2.5 h-2.5 border ${i < step ? "bg-primary border-primary" : i === step ? "border-primary animate-pulse" : "border-border"}`} />
              <span className={i < step ? "text-primary" : i === step ? "text-primary" : "text-muted-foreground/30"}
                style={{ textDecoration: i < step ? "line-through" : "none", fontSize: 10 }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Eye SVG */}
      <div>
        <svg viewBox="80 150 210 120" width="420" height="240">
          {/* Sclera */}
          <ellipse cx={SVG_CX} cy={SVG_CY} rx={sclRx} ry={sclRy}
            fill="white" stroke="hsl(35,30%,65%)" strokeWidth="2" />

          {/* H-pattern target zones */}
          {H_POSITIONS.map((p, i) => {
            const tx = SVG_CX + p.x;
            const ty = SVG_CY + p.y;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <g key={p.id}>
                <circle cx={tx} cy={ty} r={isActive ? 22 : 12}
                  fill={isDone ? "rgba(100,255,200,0.12)" : isActive ? (flashStep === i ? "rgba(100,255,200,0.5)" : "rgba(100,255,200,0.15)") : "rgba(255,255,255,0.03)"}
                  stroke={isDone ? "hsl(180,50%,45%)" : isActive ? "hsl(180,60%,55%)" : "rgba(255,255,255,0.1)"}
                  strokeWidth={isActive ? "2" : "1"}
                  strokeDasharray={isActive ? "" : "3 3"} />
                {isActive && (
                  <text x={tx} y={ty + 4} textAnchor="middle"
                    fill="rgba(100,255,200,0.7)" fontSize="8" fontFamily="monospace">
                    {p.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Iris */}
          <circle cx={clampedEyeX} cy={clampedEyeY} r="30"
            fill="hsl(200,50%,35%)" stroke="hsl(200,40%,28%)" strokeWidth="1.5" />
          <circle cx={clampedEyeX} cy={clampedEyeY} r="30"
            fill="none" stroke="hsl(200,40%,50%)" strokeWidth="0.5" strokeDasharray="4 5" />
          {/* Pupil */}
          <circle cx={clampedEyeX} cy={clampedEyeY} r="15" fill="black" />
          <circle cx={clampedEyeX - 6} cy={clampedEyeY - 6} r="5" fill="rgba(255,255,255,0.3)" />

          {/* Eyelids */}
          <path d={`M ${SVG_CX - sclRx} ${SVG_CY} Q ${SVG_CX} ${SVG_CY - sclRy * 1.4} ${SVG_CX + sclRx} ${SVG_CY}`}
            fill="hsl(35,55%,62%)" stroke="hsl(35,45%,50%)" strokeWidth="2" />
          <path d={`M ${SVG_CX - sclRx} ${SVG_CY} Q ${SVG_CX} ${SVG_CY + sclRy * 1.3} ${SVG_CX + sclRx} ${SVG_CY}`}
            fill="hsl(35,55%,62%)" stroke="hsl(35,45%,50%)" strokeWidth="2" />
          {/* Eyelashes */}
          {[-60, -30, 0, 30, 60].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const bx = SVG_CX + Math.cos(rad) * sclRx;
            const by = SVG_CY - Math.sin(rad) * sclRy * 1.4;
            return <line key={angle} x1={bx} y1={by} x2={bx + Math.cos(rad - Math.PI / 2) * 8} y2={by - 8}
              stroke="hsl(25,40%,25%)" strokeWidth="1.5" strokeLinecap="round" />;
          })}

          {/* Penlight */}
          <circle cx={lightX} cy={lightY} r="6"
            fill="hsl(45,100%,70%)" stroke="hsl(45,90%,50%)" strokeWidth="1.5" />
          <circle cx={lightX} cy={lightY} r="14"
            fill="none" stroke="rgba(255,220,80,0.4)" strokeWidth="1" />
          <circle cx={lightX} cy={lightY} r="22"
            fill="none" stroke="rgba(255,220,80,0.15)" strokeWidth="1" />
        </svg>
      </div>

      {/* Hold meter */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-56">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1 text-center">
          {currentTarget ? `Hold at: ${currentTarget.label}` : "COMPLETE"}
        </div>
        <div className="w-full h-2 bg-secondary overflow-hidden">
          <div className="h-full transition-none"
            style={{ width: `${holdPct}%`, background: holdPct > 60 ? "hsl(180,60%,50%)" : "hsl(45,90%,55%)" }} />
        </div>
      </div>

      {/* Win */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="text-4xl font-bold text-primary" style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}>
            EYE MOVEMENT CONFIRMED
          </div>
        </div>
      )}

      {/* Dialogue */}
      {showDialogue && (
        <div className="absolute top-40 right-8 z-30 max-w-xs"
          style={{ background: "hsl(210,18%,14%)", border: "1px solid hsl(210,15%,25%)", padding: "10px 14px", borderRadius: 4 }}>
          <p className="text-xs text-muted-foreground italic">"{dialogue}"</p>
        </div>
      )}
    </div>
  );
}
