import { useState, useEffect, useRef, useCallback } from "react";
import { resumeAudio, playThroatHit, playBite, playMouthWarning, playStress } from "../audio/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

const DIALOGUE_BITE = [
  "Ah. You appear to have been bitten.",
  "The mouth. It does that occasionally.",
  "Most doctors retain all ten fingers. Statistically.",
  "Fascinating. The jaw has a mind of its own.",
];

const DIALOGUE_NEAR = [
  "Deeper, please. If you must.",
  "I assure you I will try not to swallow.",
  "I'd close my eyes but that seems counterproductive.",
];

export default function Level7GagReflex({ onStressChange, onWin, onLose }: Props) {
  // Position of the tongue depressor (0-1 in both axes)
  const [depressor, setDepressor] = useState({ x: 0.5, y: 0.1 });
  const [mouthOpen, setMouthOpen] = useState(1); // 0 closed, 1 open
  const [touches, setTouches] = useState(0); // successful back-of-throat touches
  const [won, setWon] = useState(false);
  const [dialogue, setDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [mouthClosing, setMouthClosing] = useState(false);
  const [depressorAngle, setDepressorAngle] = useState(0);
  const [flashHit, setFlashHit] = useState(false);
  const [biteWarning, setBiteWarning] = useState(false);
  const [instructions, setInstructions] = useState("Navigate the tongue depressor to the back of the throat. W/A/S/D to move, mouse to angle.");
  const wonRef = useRef(false);
  const depRef = useRef(depressor);
  depRef.current = depressor;
  const mouthRef = useRef(mouthOpen);
  mouthRef.current = mouthOpen;
  const closingRef = useRef(false);
  closingRef.current = mouthClosing;

  const showMsg = useCallback((msg: string) => {
    setDialogue(msg); setShowDialogue(true);
    setTimeout(() => setShowDialogue(false), 2200);
  }, []);

  // Resume audio on first WASD press
  useEffect(() => {
    const onFirst = () => { resumeAudio(); window.removeEventListener("keydown", onFirst); };
    window.addEventListener("keydown", onFirst);
    return () => window.removeEventListener("keydown", onFirst);
  }, []);

  // WASD movement
  useEffect(() => {
    const pressed: Record<string, boolean> = {};
    const down = (e: KeyboardEvent) => {
      pressed[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => {
      pressed[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const tick = setInterval(() => {
      if (wonRef.current) return;
      const spd = 0.018;
      setDepressor(prev => {
        let x = prev.x;
        let y = prev.y;
        if (pressed["a"]) x = Math.max(0.1, x - spd);
        if (pressed["d"]) x = Math.min(0.9, x + spd);
        if (pressed["w"]) y = Math.min(0.9, y + spd);
        if (pressed["s"]) y = Math.max(0.05, y - spd);
        return { x, y };
      });
    }, 16);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      clearInterval(tick);
    };
  }, []);

  // Mouse angle control
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const angle = Math.atan2(e.clientX - cx, -(e.clientY - cy)) * (180 / Math.PI);
      setDepressorAngle(angle * 0.3);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Random mouth snap events
  useEffect(() => {
    const scheduleSnap = () => {
      const delay = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        if (wonRef.current) return;
        setMouthClosing(true);
        showMsg(DIALOGUE_NEAR[Math.floor(Math.random() * DIALOGUE_NEAR.length)]);
        playMouthWarning();
        // Close mouth quickly
        let open = 1;
        const close = setInterval(() => {
          open -= 0.15;
          setMouthOpen(Math.max(0, open));
          if (open <= 0) {
            clearInterval(close);
            // Check if depressor is inside when mouth closes
            const d = depRef.current;
            if (d.y > 0.3 && d.x > 0.2 && d.x < 0.8) {
              // BITE
              playBite();
              onStressChange(30);
              setBiteWarning(true);
              setTimeout(() => setBiteWarning(false), 800);
              showMsg(DIALOGUE_BITE[Math.floor(Math.random() * DIALOGUE_BITE.length)]);
              setDepressor({ x: 0.5, y: 0.05 });
            }
            // Re-open after a pause
            setTimeout(() => {
              let o = 0;
              const open2 = setInterval(() => {
                o += 0.1;
                setMouthOpen(Math.min(1, o));
                if (o >= 1) {
                  clearInterval(open2);
                  setMouthClosing(false);
                  scheduleSnap();
                }
              }, 60);
            }, 800);
          }
        }, 60);
      }, delay);
    };
    const t = scheduleSnap();
    return () => clearTimeout(t);
  }, [onStressChange, showMsg]);

  // Check if depressor reaches back of throat
  useEffect(() => {
    if (wonRef.current) return;
    const { x, y } = depressor;
    const atBack = y > 0.72 && x > 0.25 && x < 0.75;
    if (atBack && mouthOpen > 0.5) {
      playThroatHit();
      setFlashHit(true);
      setTimeout(() => setFlashHit(false), 300);
      onStressChange(-3);
      setTouches(prev => {
        const next = prev + 1;
        if (next >= 3 && !wonRef.current) {
          wonRef.current = true;
          setWon(true);
          showMsg("Adequate. I feel thoroughly examined.");
          setTimeout(onWin, 1800);
        }
        return next;
      });
      // bounce back
      setDepressor(d => ({ ...d, y: Math.max(0.05, d.y - 0.25) }));
    }
  }, [depressor, mouthOpen, onWin, onStressChange, showMsg]);

  // Mouth dimensions and scene layout
  const mouthW = 280;
  const mouthH = 200;
  const cx = 185;
  const cy = 240;
  const openH = mouthH * mouthOpen;

  // Map depressor 0-1 to SVG coords
  const depX = 90 + depressor.x * mouthW;
  const depY = cy - openH * 0.5 + depressor.y * openH;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none"
      style={{ background: biteWarning ? "radial-gradient(ellipse 90% 90% at 50% 50%, rgba(80,0,0,0.82) 0%, rgba(50,0,0,0.22) 100%)" : "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)", transition: "background 0.4s" }}>

      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-xs text-primary/70 tracking-widest uppercase px-4 py-2 border border-primary/20 bg-background/40">
          W/A/S/D — move &nbsp;|&nbsp; Mouse — angle
        </div>
      </div>

      {/* Touch counter */}
      <div className="absolute top-20 right-8 z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">Throat Touches</div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-6 h-6 border-2" style={{ borderColor: i < touches ? "hsl(180,60%,55%)" : "hsl(0,0%,22%)", background: i < touches ? "hsl(180,60%,15%)" : "transparent" }} />
          ))}
        </div>
      </div>

      {/* Mouth cross-section scene */}
      <div className="relative">
        <svg viewBox="0 80 370 360" width="370" height="340">
          {/* Outer face / chin area */}
          <ellipse cx="185" cy="100" rx="120" ry="35" fill="hsl(35,55%,60%)" stroke="hsl(35,45%,48%)" strokeWidth="2" />
          {/* Outer jaw */}
          <rect x="80" y="100" width="210" height="20" rx="4" fill="hsl(35,50%,58%)" stroke="hsl(35,42%,47%)" strokeWidth="1.5" />

          {/* Upper gum/teeth */}
          <rect x="100" y="125" width="170" height="18" rx="2" fill="hsl(200,15%,85%)" stroke="hsl(200,10%,70%)" strokeWidth="1" />
          {/* Upper teeth */}
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={104 + i * 20} y="127" width="17" height="16" rx="2"
              fill="white" stroke="hsl(200,10%,75%)" strokeWidth="0.5" />
          ))}

          {/* Mouth cavity */}
          <rect
            x={cx - mouthW / 2 + 15} y={cy - openH / 2 - 10}
            width={mouthW - 30} height={openH + 20}
            rx="8"
            fill="hsl(10,40%,25%)"
            stroke="hsl(10,30%,18%)" strokeWidth="2"
          />

          {/* Tongue */}
          <ellipse
            cx={cx} cy={cy + openH * 0.25}
            rx={mouthW * 0.38} ry={openH * 0.22}
            fill="hsl(350,55%,50%)" stroke="hsl(350,45%,40%)" strokeWidth="1.5"
          />

          {/* Throat target zone */}
          <ellipse
            cx={cx} cy={cy + openH * 0.3}
            rx={40} ry={25}
            fill={flashHit ? "rgba(100,255,200,0.5)" : "rgba(100,255,200,0.1)"}
            stroke={flashHit ? "hsl(180,60%,55%)" : "rgba(100,255,200,0.3)"}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text x={cx} y={cy + openH * 0.3 + 4} textAnchor="middle" fill="rgba(100,255,200,0.4)" fontSize="9" fontFamily="monospace">
            TARGET
          </text>

          {/* Uvula */}
          <ellipse cx={cx} cy={cy - openH * 0.3} rx="12" ry="18" fill="hsl(350,50%,55%)" stroke="hsl(350,40%,43%)" strokeWidth="1" />

          {/* Lower teeth (animated closing) */}
          <g transform={`translate(0, ${openH * (1 - mouthOpen) * 0.5})`}>
            <rect x="100" y={cy + openH / 2 + 2} width="170" height="18" rx="2" fill="hsl(200,15%,85%)" stroke="hsl(200,10%,70%)" strokeWidth="1" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x={104 + i * 20} y={cy + openH / 2 + 4} width="17" height="14" rx="2"
                fill="white" stroke="hsl(200,10%,75%)" strokeWidth="0.5" />
            ))}
          </g>

          {/* Tongue depressor */}
          <g transform={`translate(${depX}, ${depY}) rotate(${depressorAngle})`}>
            {/* Handle */}
            <rect x="-3" y="-80" width="6" height="90" rx="2" fill="hsl(35,70%,75%)" stroke="hsl(35,55%,60%)" strokeWidth="1" />
            {/* Flat end */}
            <rect x="-10" y="-80" width="20" height="12" rx="3" fill="hsl(35,70%,80%)" stroke="hsl(35,55%,65%)" strokeWidth="1" />
            {/* Grip lines */}
            {[-20, -30, -40].map(y => (
              <line key={y} x1="-3" y1={y} x2="3" y2={y} stroke="hsl(35,40%,60%)" strokeWidth="1" />
            ))}
          </g>

          {/* Danger zone flash on bite */}
          {biteWarning && (
            <rect x="90" y={cy - openH / 2 - 10} width={mouthW - 10} height={openH + 20}
              rx="8" fill="rgba(255,0,0,0.3)" stroke="hsl(0,70%,55%)" strokeWidth="3" />
          )}
        </svg>
      </div>

      {/* Mouth open indicator */}
      <div className="absolute bottom-16 left-8 z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">Mouth Open</div>
        <div className="w-3 h-24 bg-secondary overflow-hidden flex flex-col-reverse">
          <div className="w-full transition-all" style={{ height: `${mouthOpen * 100}%`, background: mouthOpen > 0.5 ? "hsl(180,60%,50%)" : "hsl(0,70%,55%)" }} />
        </div>
      </div>

      {/* Warning flash */}
      {biteWarning && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-4xl font-bold text-destructive tracking-widest" style={{ textShadow: "0 0 30px hsl(0,70%,50%)" }}>
            BITE!
          </div>
        </div>
      )}

      {/* Win */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="text-4xl font-bold text-primary" style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}>
            GAG REFLEX CONFIRMED
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
