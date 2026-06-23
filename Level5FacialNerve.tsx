import { useState, useEffect, useCallback, useRef } from "react";
import { resumeAudio, playMuscleOn, playExpressionMatch, playTimerTick, playTimerExpire, playWinFanfare } from "@/lib/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

interface MuscleGroup {
  id: number;
  key: string;
  label: string;
  description: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 1, key: "1", label: "Frontalis", description: "Forehead raise", cx: 185, cy: 100, rx: 70, ry: 28 },
  { id: 2, key: "2", label: "Corrugator", description: "Brow furrow", cx: 155, cy: 140, rx: 28, ry: 18 },
  { id: 3, key: "3", label: "Corrugator R", description: "Brow furrow R", cx: 215, cy: 140, rx: 28, ry: 18 },
  { id: 4, key: "4", label: "Orbicularis L", description: "Eye squeeze L", cx: 145, cy: 170, rx: 30, ry: 18 },
  { id: 5, key: "5", label: "Orbicularis R", description: "Eye squeeze R", cx: 225, cy: 170, rx: 30, ry: 18 },
  { id: 6, key: "6", label: "Zygomaticus", description: "Cheek raise", cx: 185, cy: 220, rx: 65, ry: 22 },
  { id: 7, key: "7", label: "Orbicularis Ori", description: "Lip purse", cx: 185, cy: 265, rx: 38, ry: 20 },
  { id: 8, key: "8", label: "Mentalis", description: "Chin dimple", cx: 185, cy: 300, rx: 30, ry: 18 },
];

interface Expression {
  name: string;
  description: string;
  requiredMuscles: number[];
  forbiddenMuscles: number[];
}

const EXPRESSIONS: Expression[] = [
  { name: "SMILE", description: "Raise cheeks, relax forehead", requiredMuscles: [6], forbiddenMuscles: [2, 3, 7] },
  { name: "FROWN", description: "Furrow brows, purse lips", requiredMuscles: [2, 3, 7], forbiddenMuscles: [6] },
  { name: "SURPRISE", description: "Raise forehead and brows wide", requiredMuscles: [1, 4, 5], forbiddenMuscles: [6, 7] },
  { name: "WINCE", description: "Squeeze eyes, tighten chin", requiredMuscles: [4, 5, 8], forbiddenMuscles: [1] },
];

export default function Level5FacialNerve({ onStressChange, onWin }: Props) {
  const [active, setActive] = useState<Set<number>>(new Set());
  const [expressionIdx, setExpressionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [matchScore, setMatchScore] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [won, setWon] = useState(false);
  const [flashMatch, setFlashMatch] = useState(false);
  const wonRef = useRef(false);

  const expression = EXPRESSIONS[expressionIdx];

  // Calculate match score
  useEffect(() => {
    const required = expression.requiredMuscles;
    const forbidden = expression.forbiddenMuscles;
    let score = 0;
    let total = required.length + forbidden.length;
    for (const r of required) if (active.has(r)) score++;
    for (const f of forbidden) if (!active.has(f)) score++;
    setMatchScore(Math.round((score / total) * 100));
  }, [active, expressionIdx, expression]);

  // Key handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      resumeAudio();
      const num = parseInt(e.key);
      if (num >= 1 && num <= 8) {
        playMuscleOn();
        setActive(prev => {
          const next = new Set(prev);
          if (next.has(num)) next.delete(num);
          else next.add(num);
          return next;
        });
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (won) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playTimerExpire();
          onStressChange(20);
          setActive(new Set());
          setTimeLeft(12);
          return 12;
        }
        if (prev <= 4) playTimerTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [won, onStressChange]);

  // Check win condition on match
  const checkMatch = useCallback(() => {
    if (won || wonRef.current) return;
    const required = expression.requiredMuscles;
    const forbidden = expression.forbiddenMuscles;
    const allRequired = required.every(r => active.has(r));
    const noForbidden = forbidden.every(f => !active.has(f));
    if (allRequired && noForbidden && matchScore >= 80) {
      playExpressionMatch();
      setFlashMatch(true);
      setTimeout(() => setFlashMatch(false), 500);
      const next = completed + 1;
      setCompleted(next);
      onStressChange(-5);
      if (next >= EXPRESSIONS.length) {
        wonRef.current = true;
        setWon(true);
        setTimeout(() => { playWinFanfare(); onWin(); }, 400);
      } else {
        setExpressionIdx(i => i + 1);
        setActive(new Set());
        setTimeLeft(12);
      }
    }
  }, [active, expression, matchScore, completed, won, onWin, onStressChange]);

  // Auto-check match when active changes
  useEffect(() => {
    if (matchScore >= 80) {
      const t = setTimeout(checkMatch, 600);
      return () => clearTimeout(t);
    }
  }, [matchScore, checkMatch]);

  return (
    <div className="w-full h-full flex items-center justify-center relative select-none"
      style={{ background: "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)" }}>

      {/* Target expression panel */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">Target Expression</div>
        <div className="text-3xl font-bold text-primary tracking-widest" style={{ textShadow: "0 0 20px hsl(180,60%,40%)" }}>
          {expression.name}
        </div>
        <div className="text-xs text-muted-foreground/60 mt-1">{expression.description}</div>
      </div>

      {/* Progress + Timer */}
      <div className="absolute top-20 right-8 z-20 text-right">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">Expression {completed + 1} / {EXPRESSIONS.length}</div>
        <div className={`text-2xl font-bold ${timeLeft <= 4 ? "text-destructive" : "text-foreground"}`}>
          {timeLeft}s
        </div>
      </div>

      {/* Match meter */}
      <div className="absolute top-20 left-8 z-20">
        <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-1">Match</div>
        <div className="w-32 h-2 bg-secondary overflow-hidden">
          <div className="h-full transition-all duration-200"
            style={{ width: `${matchScore}%`, background: matchScore >= 80 ? "hsl(180,60%,50%)" : matchScore >= 50 ? "hsl(45,90%,55%)" : "hsl(0,70%,55%)" }}
          />
        </div>
        <div className="text-xs mt-1" style={{ color: matchScore >= 80 ? "hsl(180,60%,55%)" : "hsl(45,90%,55%)" }}>{matchScore}%</div>
      </div>

      {/* Main layout: face + key grid */}
      <div className="flex items-center gap-12">
        {/* Face SVG */}
        <div className="relative" style={{ filter: flashMatch ? "drop-shadow(0 0 20px hsl(180,60%,50%))" : "none", transition: "filter 0.3s" }}>
          <svg viewBox="0 0 370 380" width="320" height="330">
            {/* Head base */}
            <ellipse cx="185" cy="200" rx="100" ry="120" fill="hsl(35,55%,62%)" stroke="hsl(35,45%,50%)" strokeWidth="2" />
            {/* Hair */}
            <ellipse cx="185" cy="90" rx="97" ry="45" fill="hsl(25,40%,28%)" />
            {/* Ears */}
            <ellipse cx="85" cy="195" rx="15" ry="22" fill="hsl(35,50%,58%)" stroke="hsl(35,40%,48%)" strokeWidth="1" />
            <ellipse cx="285" cy="195" rx="15" ry="22" fill="hsl(35,50%,58%)" stroke="hsl(35,40%,48%)" strokeWidth="1" />

            {/* Muscle group overlays */}
            {MUSCLE_GROUPS.map(mg => {
              const isActive = active.has(mg.id);
              const isRequired = expression.requiredMuscles.includes(mg.id);
              const isForbidden = expression.forbiddenMuscles.includes(mg.id);
              return (
                <g key={mg.id}>
                  <ellipse
                    cx={mg.cx} cy={mg.cy} rx={mg.rx} ry={mg.ry}
                    fill={isActive ? "rgba(100,255,200,0.35)" : "rgba(255,255,255,0.05)"}
                    stroke={isActive ? "hsl(180,60%,55%)" : isForbidden ? "hsl(0,60%,50%)" : isRequired ? "hsl(180,40%,40%)" : "rgba(255,255,255,0.1)"}
                    strokeWidth="1.5"
                    strokeDasharray={isActive ? "" : "3 3"}
                  />
                  <text x={mg.cx} y={mg.cy + 4} textAnchor="middle" fill={isActive ? "hsl(180,70%,70%)" : "rgba(255,255,255,0.3)"} fontSize="10" fontFamily="monospace">
                    [{mg.key}]
                  </text>
                </g>
              );
            })}

            {/* Facial features on top */}
            {/* Eyebrows */}
            <path d={`M 125 ${active.has(1) ? 147 : 152} Q 155 ${active.has(1) ? 140 : 145} 175 ${active.has(1) ? 147 : 152}`}
              fill="none" stroke="hsl(25,40%,28%)" strokeWidth="4" strokeLinecap="round"
              style={{ transition: "d 0.2s" }} />
            <path d={`M 195 ${active.has(1) ? 147 : 152} Q 215 ${active.has(1) ? 140 : 145} 245 ${active.has(1) ? 147 : 152}`}
              fill="none" stroke="hsl(25,40%,28%)" strokeWidth="4" strokeLinecap="round" />
            {/* Eyes */}
            <ellipse cx="155" cy="175" rx="20" ry={active.has(4) ? 8 : 14} fill="white" style={{ transition: "ry 0.15s" }} />
            <ellipse cx="215" cy="175" rx="20" ry={active.has(5) ? 8 : 14} fill="white" style={{ transition: "ry 0.15s" }} />
            <circle cx="155" cy="175" r="8" fill="hsl(200,35%,30%)" />
            <circle cx="215" cy="175" r="8" fill="hsl(200,35%,30%)" />
            <circle cx="155" cy="175" r="4" fill="black" />
            <circle cx="215" cy="175" r="4" fill="black" />
            {/* Nose */}
            <path d="M 178 185 Q 185 210 177 222 Q 185 226 193 222 Q 185 210 192 185" fill="hsl(35,40%,55%)" />
            {/* Mouth */}
            <path d={active.has(6)
              ? "M 150 255 Q 185 278 220 255"
              : active.has(2) && active.has(3)
                ? "M 152 265 Q 185 250 218 265"
                : "M 155 262 Q 185 265 215 262"}
              fill="none" stroke="hsl(10,30%,35%)" strokeWidth="3.5" strokeLinecap="round"
              style={{ transition: "d 0.2s" }} />
            {/* Lips outer */}
            <ellipse cx="185" cy="262" rx={active.has(7) ? 25 : 36} ry={active.has(7) ? 8 : 5} fill="hsl(10,35%,48%)"
              style={{ transition: "all 0.15s" }} />
          </svg>
        </div>

        {/* Key grid */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground/50 tracking-widest uppercase mb-2 text-center">Muscle Keys</div>
          <div className="grid grid-cols-2 gap-2">
            {MUSCLE_GROUPS.map(mg => {
              const isActive = active.has(mg.id);
              const isRequired = expression.requiredMuscles.includes(mg.id);
              const isForbidden = expression.forbiddenMuscles.includes(mg.id);
              return (
                <div key={mg.id} className="flex items-center gap-2">
                  <div style={{
                    width: 32, height: 32, border: `2px solid ${isActive ? "hsl(180,60%,55%)" : isRequired ? "hsl(180,40%,30%)" : isForbidden ? "hsl(0,50%,35%)" : "hsl(0,0%,22%)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isActive ? "hsl(180,60%,12%)" : "transparent",
                    color: isActive ? "hsl(180,60%,65%)" : "hsl(0,0%,35%)",
                    fontSize: 14, fontWeight: "bold", transition: "all 0.1s",
                  }}>{mg.key}</div>
                  <div>
                    <div className={`text-xs font-bold ${isActive ? "text-primary" : "text-muted-foreground/50"}`}>{mg.label}</div>
                    <div className="text-xs text-muted-foreground/30" style={{ fontSize: 9 }}>{mg.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Required/forbidden legend */}
          <div className="mt-4 flex flex-col gap-1">
            <div className="text-xs text-muted-foreground/40 tracking-widest uppercase mb-1">Legend</div>
            <div className="flex items-center gap-2 text-xs">
              <div style={{ width: 12, height: 12, border: "2px solid hsl(180,40%,30%)" }} />
              <span className="text-muted-foreground/50">Required</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div style={{ width: 12, height: 12, border: "2px solid hsl(0,50%,35%)" }} />
              <span className="text-muted-foreground/50">Forbidden</span>
            </div>
          </div>
        </div>
      </div>

      {/* Win effect */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="text-4xl font-bold text-primary" style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}>
            EXPRESSION COMPLETE
          </div>
        </div>
      )}
    </div>
  );
}
