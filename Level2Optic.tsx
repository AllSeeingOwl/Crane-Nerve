import { useState, useEffect, useRef, useCallback } from "react";
import { resumeAudio, playStress, playDialogue } from "../audio/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

// Snellen chart rows
const CHART_ROWS = [
  { letters: "E", size: 48, row: 0 },
  { letters: "FP", size: 36, row: 1 },
  { letters: "TOZ", size: 28, row: 2 },
  { letters: "LPED", size: 22, row: 3 },
  { letters: "PECFD", size: 17, row: 4 },
  { letters: "EDFCZP", size: 13, row: 5 },
];

const DIALOGUE = [
  "I believe my eye went that way.",
  "It usually does this. No cause for alarm.",
  "Could you perhaps be a bit more decisive?",
  "My eye appears to have its own agenda.",
  "Fascinating. I can see everything except where you want me to look.",
];

export default function Level2Optic({ onStressChange, onWin }: Props) {
  // Pupil position: 0,0 = centered. Range -1 to 1
  const [gazeX, setGazeX] = useState(0);
  const [gazeY, setGazeY] = useState(0);
  const [velX, setVelX] = useState(0);
  const [velY, setVelY] = useState(0);
  const [rowsRead, setRowsRead] = useState(0);
  const [holdTime, setHoldTime] = useState(0); // frames gaze has been on chart
  const [won, setWon] = useState(false);
  const [dialogue, setDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [flashRow, setFlashRow] = useState<number | null>(null);
  const [instructions, setInstructions] = useState("Arrow Keys: guide gaze to chart | Hold steady to read each row");

  const wonRef = useRef(false);
  const gazeRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  // Use plain refs so interval callbacks never nest setState calls
  const holdCountRef = useRef(0);
  const rowCountRef  = useRef(0);
  gazeRef.current = { x: gazeX, y: gazeY };
  velRef.current = { x: velX, y: velY };

  const showMsg = useCallback((msg: string) => {
    setDialogue(msg); setShowDialogue(true);
    playDialogue();
    setTimeout(() => setShowDialogue(false), 2400);
  }, []);

  // Key-driven velocity (overshoot physics)
  useEffect(() => {
    const pressed: Record<string, boolean> = {};
    const down = (e: KeyboardEvent) => {
      resumeAudio();
      pressed[e.key] = true;
    };
    const up = (e: KeyboardEvent) => { pressed[e.key] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const tick = setInterval(() => {
      if (wonRef.current) return;
      const ACCEL = 0.012;
      const DAMP = 0.88;
      const MAX_VEL = 0.06;

      setVelX(prev => {
        let v = prev;
        if (pressed["ArrowLeft"])  v -= ACCEL;
        if (pressed["ArrowRight"]) v += ACCEL;
        v *= DAMP;
        return Math.max(-MAX_VEL, Math.min(MAX_VEL, v));
      });
      setVelY(prev => {
        let v = prev;
        if (pressed["ArrowUp"])   v -= ACCEL;   // intentionally normal
        if (pressed["ArrowDown"]) v += ACCEL;
        v *= DAMP;
        return Math.max(-MAX_VEL, Math.min(MAX_VEL, v));
      });

      setGazeX(prev => Math.max(-1, Math.min(1, prev + velRef.current.x)));
      setGazeY(prev => Math.max(-1, Math.min(1, prev + velRef.current.y)));
    }, 16);

    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); clearInterval(tick); };
  }, []);

  // Random drift events — eye wanders on its own
  useEffect(() => {
    const t = setInterval(() => {
      if (wonRef.current) return;
      if (Math.random() < 0.4) {
        const dx = (Math.random() - 0.5) * 0.08;
        const dy = (Math.random() - 0.5) * 0.05;
        setVelX(v => v + dx);
        setVelY(v => v + dy);
      }
    }, 800);
    return () => clearInterval(t);
  }, []);

  // Hold-to-read mechanic — refs avoid nesting setState inside setState updaters
  useEffect(() => {
    const t = setInterval(() => {
      if (wonRef.current) return;
      const { x, y } = gazeRef.current;
      const onChart = Math.abs(x - 0.45) < 0.25 && Math.abs(y) < 0.4;

      if (onChart) {
        holdCountRef.current += 1;
        setHoldTime(holdCountRef.current);

        if (holdCountRef.current >= 90) {
          holdCountRef.current = 0;
          setHoldTime(0);
          const nextRow = rowCountRef.current + 1;
          rowCountRef.current = nextRow;
          setRowsRead(nextRow);
          setFlashRow(nextRow - 1);
          setTimeout(() => setFlashRow(null), 500);
          onStressChange(-4);
          if (nextRow >= CHART_ROWS.length) {
            wonRef.current = true;
            setWon(true);
            setTimeout(onWin, 1800);
          } else {
            showMsg(DIALOGUE[Math.floor(Math.random() * DIALOGUE.length)]);
          }
        }
      } else {
        if (holdCountRef.current > 10) {
          onStressChange(1);
          playStress();
        }
        holdCountRef.current = 0;
        setHoldTime(0);
      }
    }, 16);
    return () => clearInterval(t);
  }, [onStressChange, onWin, showMsg]);

  // Random dialogue
  useEffect(() => {
    const t = setInterval(() => {
      if (!showDialogue && Math.random() < 0.25 && !wonRef.current) {
        showMsg(DIALOGUE[Math.floor(Math.random() * DIALOGUE.length)]);
      }
    }, 7000);
    return () => clearInterval(t);
  }, [showDialogue, showMsg]);

  // SVG eye dimensions
  const eyeW = 160;
  const eyeH = 80;
  const pupilRange = 40; // max px deviation from center
  const pupilX = 185 + gazeX * pupilRange;
  const pupilY = 200 + gazeY * pupilRange * 0.6;
  const holdPct = Math.min(100, (holdTime / 90) * 100);

  return (
    <div className="w-full h-full flex items-center justify-center relative select-none"
      style={{ background: "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)" }}>

      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-xs text-primary/70 tracking-widest uppercase px-4 py-2 border border-primary/20 bg-background/40">
          {instructions}
        </div>
        <div className="text-xs text-muted-foreground/40 mt-1 tracking-wider">Arrow keys — gaze | Control is… aspirational</div>
      </div>

      {/* Rows read counter */}
      <div className="absolute top-20 right-8 z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">Rows Read</div>
        <div className="flex gap-2">
          {CHART_ROWS.map((_, i) => (
            <div key={i} className="w-5 h-5 border-2 transition-all"
              style={{ borderColor: i < rowsRead ? "hsl(180,60%,55%)" : "hsl(0,0%,22%)", background: i < rowsRead ? "hsl(180,60%,15%)" : "transparent" }} />
          ))}
        </div>
      </div>

      {/* Main scene */}
      <div className="flex items-center gap-16">

        {/* Eye close-up */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">PATIENT GAZE</div>
          <svg viewBox="100 150 170 100" width="280" height="170">
            {/* Sclera */}
            <ellipse cx="185" cy="200" rx={eyeW / 2} ry={eyeH / 2}
              fill="white" stroke="hsl(35,30%,60%)" strokeWidth="2" />
            {/* Iris */}
            <circle cx={pupilX} cy={pupilY} r="26"
              fill="hsl(200,50%,35%)" stroke="hsl(200,40%,28%)" strokeWidth="1.5" />
            {/* Iris detail */}
            <circle cx={pupilX} cy={pupilY} r="26"
              fill="none" stroke="hsl(200,40%,45%)" strokeWidth="0.5" strokeDasharray="3 4" />
            {/* Pupil */}
            <circle cx={pupilX} cy={pupilY} r="13"
              fill="black" />
            {/* Gloss */}
            <circle cx={pupilX - 6} cy={pupilY - 6} r="5"
              fill="rgba(255,255,255,0.35)" />
            {/* Eyelids */}
            <path d={`M ${185 - eyeW / 2} 200 Q 185 ${200 - eyeH * 0.8} ${185 + eyeW / 2} 200`}
              fill="hsl(35,55%,62%)" stroke="hsl(35,45%,50%)" strokeWidth="2" />
            <path d={`M ${185 - eyeW / 2} 200 Q 185 ${200 + eyeH * 0.7} ${185 + eyeW / 2} 200`}
              fill="hsl(35,55%,62%)" stroke="hsl(35,45%,50%)" strokeWidth="2" />
            {/* Target reticle overlay */}
            <circle cx="185" cy="200" r="8"
              fill="none" stroke="rgba(100,255,200,0.4)" strokeWidth="1" strokeDasharray="2 3" />
          </svg>
          {/* Hold meter */}
          <div className="w-48 text-center">
            <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">Focus Hold</div>
            <div className="w-full h-2 bg-secondary overflow-hidden">
              <div className="h-full transition-none"
                style={{ width: `${holdPct}%`, background: holdPct > 60 ? "hsl(180,60%,50%)" : "hsl(45,90%,55%)" }} />
            </div>
          </div>
        </div>

        {/* Snellen chart */}
        <div className="flex flex-col items-center"
          style={{ background: "white", padding: "24px 20px", border: "3px solid hsl(210,10%,80%)", minWidth: 200 }}>
          <div className="text-xs text-muted-foreground/60 tracking-widest uppercase mb-3" style={{ color: "hsl(210,10%,50%)" }}>EYE CHART</div>
          {CHART_ROWS.map((row, i) => (
            <div key={i} className="text-center font-bold tracking-widest transition-all"
              style={{
                fontFamily: "monospace",
                fontSize: row.size,
                lineHeight: 1.1,
                color: i < rowsRead
                  ? flashRow === i ? "hsl(180,60%,45%)" : "hsl(180,50%,35%)"
                  : i === rowsRead
                    ? "black"
                    : "hsl(0,0%,70%)",
                textDecoration: i < rowsRead ? "line-through" : "none",
              }}>
              {row.letters}
            </div>
          ))}
        </div>
      </div>

      {/* Gaze crosshair indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-32 relative border border-border/30">
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10"
          style={{ background: "radial-gradient(circle at 70% 50%, hsl(180,60%,50%) 0%, transparent 60%)" }} />
        <div className="absolute text-xs text-muted-foreground/30" style={{ left: "70%", top: "50%", transform: "translate(-50%,-50%)" }}>
          CHART
        </div>
        <div className="absolute w-3 h-3 border-2 border-primary"
          style={{
            left: `${(gazeX + 1) / 2 * 100}%`,
            top: `${(gazeY + 1) / 2 * 100}%`,
            transform: "translate(-50%,-50%)",
            transition: "none",
          }} />
        <div className="absolute bottom-full left-0 right-0 text-center text-xs text-muted-foreground/30 tracking-widest mb-1">GAZE MAP</div>
      </div>

      {/* Win */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="text-4xl font-bold text-primary" style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}>
            VISION CONFIRMED
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
