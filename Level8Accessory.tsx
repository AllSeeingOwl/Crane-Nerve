import { useState, useEffect, useRef, useCallback } from "react";
import { resumeAudio, playStress, playDialogue, playBite } from "@/lib/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

const DIALOGUE_RESIST = [
  "Mmf. You appear to be winning.",
  "I am stronger than I look. Evidently not strong enough.",
  "I've been doing shoulder day. You'll never know.",
  "Resistance is futile. Apparently.",
];

const DIALOGUE_SUCCESS = [
  "Very well. You've established that I cannot shrug.",
  "I accept this defeat with quiet dignity.",
  "Adequate. I will remember this.",
];

const DIALOGUE_FAIL = [
  "Ah. A successful shrug. I win this round.",
  "Up. My shoulder goes up. You failed.",
  "That was embarrassing. For you, specifically.",
];

export default function Level8Accessory({ onStressChange, onWin }: Props) {
  // Shoulder Y: 0 = resting, 1 = fully shrugged up
  const [leftY, setLeftY] = useState(0);
  const [rightY, setRightY] = useState(0);
  const [leftVel, setLeftVel] = useState(0);
  const [rightVel, setRightVel] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [resistSuccesses, setResistSuccesses] = useState(0);
  const [won, setWon] = useState(false);
  const [dialogue, setDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [handPressure, setHandPressure] = useState(0); // 0-1 visual
  const [phase, setPhase] = useState<"idle" | "shrugging" | "holding">("idle");
  const [flashRed, setFlashRed] = useState(false);

  const wonRef     = useRef(false);
  const resistRef  = useRef(0);  // tracks resist successes without nesting setState
  const pressingRef = useRef(false);
  const leftRef = useRef(0);
  const rightRef = useRef(0);
  pressingRef.current = pressing;
  leftRef.current = leftY;
  rightRef.current = rightY;

  const showMsg = useCallback((msg: string) => {
    setDialogue(msg); setShowDialogue(true);
    playDialogue();
    setTimeout(() => setShowDialogue(false), 2400);
  }, []);

  // Mouse/click to apply resistance
  useEffect(() => {
    const down = (e: MouseEvent) => {
      resumeAudio();
      if (e.button === 0) setPressing(true);
    };
    const up = (e: MouseEvent) => {
      if (e.button === 0) setPressing(false);
    };
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousedown", down); window.removeEventListener("mouseup", up); };
  }, []);

  // Hand pressure animation
  useEffect(() => {
    const t = setInterval(() => {
      setHandPressure(p => {
        const target = pressing ? 1 : 0;
        return p + (target - p) * 0.15;
      });
    }, 16);
    return () => clearInterval(t);
  }, [pressing]);

  // Shrug physics loop
  useEffect(() => {
    const tick = setInterval(() => {
      if (wonRef.current) return;

      setLeftY(y => {
        const vel = leftVel;
        const resistance = pressingRef.current ? -0.015 : 0;
        const newY = Math.max(0, Math.min(1, y + vel + resistance));
        return newY;
      });
      setRightY(y => {
        const vel = rightVel;
        const resistance = pressingRef.current ? -0.015 : 0;
        const newY = Math.max(0, Math.min(1, y + vel + resistance));
        return newY;
      });
    }, 16);
    return () => clearInterval(tick);
  }, [leftVel, rightVel]);

  // Check win/fail conditions
  useEffect(() => {
    if (wonRef.current) return;
    const bothShrugged = leftY > 0.75 && rightY > 0.75;
    const bothResisted = leftY < 0.15 && rightY < 0.15;

    if (phase === "shrugging") {
      if (bothShrugged) {
        // Patient won this round — stress penalty
        setFlashRed(true);
        setTimeout(() => setFlashRed(false), 600);
        playBite();
        onStressChange(25);
        playStress();
        showMsg(DIALOGUE_FAIL[Math.floor(Math.random() * DIALOGUE_FAIL.length)]);
        setLeftVel(0); setRightVel(0);
        setLeftY(0); setRightY(0);
        setPhase("idle");
      } else if (bothResisted) {
        // Doctor won this round
        // Avoid nested setState: read/write counter directly via a ref
        resistRef.current += 1;
        const next = resistRef.current;
        setResistSuccesses(next);
        onStressChange(-6);
        showMsg(next >= 4 ? DIALOGUE_SUCCESS[Math.floor(Math.random() * DIALOGUE_SUCCESS.length)] : DIALOGUE_RESIST[Math.floor(Math.random() * DIALOGUE_RESIST.length)]);
        if (next >= 5 && !wonRef.current) {
          wonRef.current = true;
          setWon(true);
          setTimeout(onWin, 1800);
        }
        setLeftVel(0); setRightVel(0);
        setLeftY(0); setRightY(0);
        setPhase("holding");
        setTimeout(() => setPhase("idle"), 1200);
      }
    }
  }, [leftY, rightY, phase, onStressChange, onWin, showMsg]);

  // Schedule shrug events
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        if (wonRef.current) return;
        // Determine shrug strength
        const strength = 0.008 + Math.random() * 0.012;
        setLeftVel(strength * (0.8 + Math.random() * 0.4));
        setRightVel(strength * (0.8 + Math.random() * 0.4));
        setPhase("shrugging");
        const t = scheduleNext();
        return t;
      }, delay);
    };
    const t = scheduleNext();
    return () => clearTimeout(t);
  }, []);

  // Random background dialogue
  useEffect(() => {
    const t = setInterval(() => {
      if (!showDialogue && !wonRef.current && Math.random() < 0.2) {
        showMsg(DIALOGUE_RESIST[Math.floor(Math.random() * DIALOGUE_RESIST.length)]);
      }
    }, 9000);
    return () => clearInterval(t);
  }, [showDialogue, showMsg]);

  const leftPx = leftY * 55;   // how many px the shoulder has risen
  const rightPx = rightY * 55;
  const handPressureScale = 1 + handPressure * 0.12;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative select-none"
      style={{ background: flashRed ? "radial-gradient(ellipse 90% 90% at 50% 50%, rgba(80,0,0,0.82) 0%, rgba(50,0,0,0.22) 100%)" : "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)", transition: "background 0.4s" }}
    >
      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-xs text-primary/70 tracking-widest uppercase px-4 py-2 border border-primary/20 bg-background/40">
          Hold LEFT MOUSE BUTTON to resist the patient's shrugs
        </div>
        <div className="text-xs text-muted-foreground/40 mt-1">Don't let either shoulder rise above threshold. 5 successful resistances required.</div>
      </div>

      {/* Success counter */}
      <div className="absolute top-20 right-8 z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-2">Resistances</div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-6 h-6 border-2 transition-all"
              style={{ borderColor: i < resistSuccesses ? "hsl(180,60%,55%)" : "hsl(0,0%,22%)", background: i < resistSuccesses ? "hsl(180,60%,15%)" : "transparent" }} />
          ))}
        </div>
        <div className="text-xs text-muted-foreground/30 mt-2 tracking-wider uppercase">
          {phase === "shrugging" ? (pressing ? "RESISTING..." : "HOLD MOUSE!") : phase === "holding" ? "HELD ✓" : "WAITING..."}
        </div>
      </div>

      {/* Main scene: patient upper body */}
      <div className="relative">
        <svg viewBox="50 60 280 280" width="380" height="340">
          {/* Torso */}
          <rect x="120" y="210" width="130" height="110" rx="8"
            fill="hsl(200,30%,68%)" stroke="hsl(200,25%,58%)" strokeWidth="2" />

          {/* Neck */}
          <rect x="165" y="175" width="40" height="40" rx="4"
            fill="hsl(35,55%,60%)" stroke="hsl(35,45%,50%)" strokeWidth="1.5" />

          {/* Head */}
          <ellipse cx="185" cy="145" rx="55" ry="65"
            fill="hsl(35,55%,62%)" stroke="hsl(35,45%,50%)" strokeWidth="2" />
          {/* Hair */}
          <ellipse cx="185" cy="95" rx="52" ry="28" fill="hsl(25,40%,30%)" />
          {/* Eyes */}
          <ellipse cx="168" cy="140" rx="12" ry="9" fill="white" />
          <ellipse cx="202" cy="140" rx="12" ry="9" fill="white" />
          <circle cx="168" cy="140" r="6" fill="hsl(200,30%,35%)" />
          <circle cx="202" cy="140" r="6" fill="hsl(200,30%,35%)" />
          <circle cx="168" cy="140" r="3" fill="black" />
          <circle cx="202" cy="140" r="3" fill="black" />
          {/* Gritted teeth expression */}
          <path d="M 165 165 Q 185 172 205 165" fill="none" stroke="hsl(10,30%,45%)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 168 165 Q 185 169 202 165" fill="hsl(200,15%,90%)" stroke="none" />

          {/* Left shoulder (rises upward = decreasing Y) */}
          <g transform={`translate(0, ${-leftPx})`}>
            <ellipse cx="100" cy="240" rx="48" ry="35"
              fill="hsl(200,30%,68%)" stroke="hsl(200,25%,58%)" strokeWidth="2" />
            <text x="100" y="244" textAnchor="middle"
              fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">SHOULDER L</text>
            {/* Danger ring when near top */}
            {leftY > 0.5 && (
              <ellipse cx="100" cy="240" rx="52" ry="39"
                fill="none" stroke={`rgba(255,80,80,${(leftY - 0.5) * 2 * 0.6})`} strokeWidth="2" />
            )}
          </g>

          {/* Right shoulder */}
          <g transform={`translate(0, ${-rightPx})`}>
            <ellipse cx="270" cy="240" rx="48" ry="35"
              fill="hsl(200,30%,68%)" stroke="hsl(200,25%,58%)" strokeWidth="2" />
            <text x="270" y="244" textAnchor="middle"
              fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">SHOULDER R</text>
            {rightY > 0.5 && (
              <ellipse cx="270" cy="240" rx="52" ry="39"
                fill="none" stroke={`rgba(255,80,80,${(rightY - 0.5) * 2 * 0.6})`} strokeWidth="2" />
            )}
          </g>

          {/* Doctor's hands (press down) */}
          <g style={{ transform: `scale(${handPressureScale})`, transformOrigin: "100px 210px" }}>
            <ellipse cx="100" cy={210 - leftPx * 0.3} rx="28" ry="16"
              fill={pressing ? "hsl(220,35%,55%)" : "hsl(220,30%,50%)"}
              stroke="hsl(220,25%,45%)" strokeWidth="2" />
            {/* Hand fingers indicator */}
            <text x="100" y={214 - leftPx * 0.3} textAnchor="middle"
              fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">
              {pressing ? "PUSH" : "HAND"}
            </text>
          </g>
          <g style={{ transform: `scale(${handPressureScale})`, transformOrigin: "270px 210px" }}>
            <ellipse cx="270" cy={210 - rightPx * 0.3} rx="28" ry="16"
              fill={pressing ? "hsl(220,35%,55%)" : "hsl(220,30%,50%)"}
              stroke="hsl(220,25%,45%)" strokeWidth="2" />
            <text x="270" y={214 - rightPx * 0.3} textAnchor="middle"
              fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">
              {pressing ? "PUSH" : "HAND"}
            </text>
          </g>

          {/* Threshold line */}
          <line x1="60" y1="188" x2="140" y2="188"
            stroke="rgba(255,80,80,0.4)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="230" y1="188" x2="310" y2="188"
            stroke="rgba(255,80,80,0.4)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="185" y="193" textAnchor="middle"
            fill="rgba(255,80,80,0.4)" fontSize="8" fontFamily="monospace">← LIMIT →</text>
        </svg>
      </div>

      {/* Shrug meters */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-8">
        {[["L", leftY], ["R", rightY]].map(([side, val]) => (
          <div key={side as string} className="flex flex-col items-center gap-1">
            <div className="text-xs text-muted-foreground/40 tracking-widest">{side}</div>
            <div className="w-3 h-24 bg-secondary overflow-hidden flex flex-col-reverse">
              <div className="w-full transition-none"
                style={{
                  height: `${(val as number) * 100}%`,
                  background: (val as number) > 0.6 ? "hsl(0,70%,55%)" : (val as number) > 0.3 ? "hsl(45,90%,55%)" : "hsl(180,60%,50%)",
                }} />
            </div>
          </div>
        ))}
      </div>

      {/* Press indicator */}
      <div className="absolute bottom-16 right-8">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">Mouse Button</div>
        <div className={`w-16 h-10 border-2 flex items-center justify-center text-xs font-bold transition-all
          ${pressing ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground/30"}`}>
          {pressing ? "HOLD" : "RELEASE"}
        </div>
      </div>

      {/* Win */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="text-4xl font-bold text-primary" style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}>
            SHOULDER RESISTED
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
