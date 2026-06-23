import { useState, useEffect, useRef, useCallback } from "react";
import { resumeAudio, playSoftTouch, playSharpPoke, playMiss, playStress, playDialogue } from "@/lib/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

const ZONES = [
  { id: "forehead", label: "Forehead", x: 145, y: 70, w: 80, h: 35 },
  { id: "left-cheek", label: "L. Cheek", x: 90, y: 170, w: 60, h: 50 },
  { id: "right-cheek", label: "R. Cheek", x: 220, y: 170, w: 60, h: 50 },
  { id: "chin", label: "Chin", x: 140, y: 265, w: 90, h: 35 },
];

const DIALOGUE = [
  "That was the sharp one, wasn't it.",
  "A minor sensation. I am fine.",
  "I have a high pain threshold. Presumably.",
  "You seem to be enjoying this.",
];

export default function Level4Trigeminal({ onStressChange, onWin }: Props) {
  const [realMouse, setRealMouse] = useState({ x: 170, y: 170 });
  const [laggedMouse, setLaggedMouse] = useState({ x: 170, y: 170 });
  const [lagQueue, setLagQueue] = useState<{ x: number; y: number; t: number }[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [currentTool, setCurrentTool] = useState<"soft" | "sharp">("soft");
  const [showFlash, setShowFlash] = useState<{ zone: string; sharp: boolean } | null>(null);
  const [dialogue, setDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [won, setWon] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const laggedRef = useRef(laggedMouse);
  laggedRef.current = laggedMouse;

  const showMsg = useCallback((msg: string) => {
    setDialogue(msg); setShowDialogue(true);
    playDialogue();
    setTimeout(() => setShowDialogue(false), 2200);
  }, []);

  // Track real mouse in container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRealMouse({ x, y });
      setLagQueue(q => [...q, { x, y, t: Date.now() }]);
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, []);

  // Process lag queue: 600ms lag + acceleration
  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now();
      const LAG = 700;
      setLagQueue(q => {
        const ready = q.filter(p => now - p.t >= LAG);
        if (ready.length > 0) {
          const last = ready[ready.length - 1];
          const cur = laggedRef.current;
          // Add some acceleration wobble
          const dx = last.x - cur.x;
          const dy = last.y - cur.y;
          const wobble = 1.3;
          setLaggedMouse({
            x: cur.x + dx * wobble,
            y: cur.y + dy * wobble,
          });
        }
        return q.filter(p => now - p.t < LAG);
      });
    }, 50);
    return () => clearInterval(tick);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent, toolOverride?: "soft" | "sharp") => {
    resumeAudio();
    if (won) return;
    const tool = toolOverride ?? (e.button === 2 ? "sharp" : "soft");
    setCurrentTool(tool);

    // Check which zone lagged cursor is in
    const { x, y } = laggedRef.current;
    let hitZone: string | null = null;
    for (const zone of ZONES) {
      if (x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) {
        hitZone = zone.id;
        break;
      }
    }

    if (hitZone) {
      const isSharp = tool === "sharp";
      setShowFlash({ zone: hitZone, sharp: isSharp });
      setTimeout(() => setShowFlash(null), 400);
      if (isSharp) {
        playSharpPoke();
        playStress();
        onStressChange(18);
        showMsg(DIALOGUE[Math.floor(Math.random() * DIALOGUE.length)]);
      } else {
        playSoftTouch();
        setTouched(prev => {
          const next = new Set([...prev, hitZone!]);
          if (next.size >= ZONES.length && !won) {
            setWon(true);
            showMsg("Adequate. All zones have been... adequately touched.");
            setTimeout(onWin, 1800);
          }
          return next;
        });
        onStressChange(-2);
      }
    } else {
      // Missed face
      playMiss();
      onStressChange(8);
    }
  }, [won, onStressChange, onWin, showMsg]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleClick(e, "sharp");
  }, [handleClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center relative select-none cursor-none"
      style={{ background: "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)" }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-20">
        <div className="text-xs text-primary/70 tracking-widest uppercase px-4 py-2 border border-primary/20 bg-background/40">
          Left Click — soft cotton &nbsp;|&nbsp; Right Click — sharp pin
        </div>
        <div className="text-xs text-muted-foreground/50 mt-1">Touch all 4 zones with soft cotton only</div>
      </div>

      {/* Progress zones */}
      <div className="absolute top-24 right-8 flex flex-col gap-2 z-20">
        {ZONES.map(z => (
          <div key={z.id} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 border ${touched.has(z.id) ? "bg-primary border-primary" : "border-border"}`} />
            <span className={touched.has(z.id) ? "text-primary" : "text-muted-foreground/50"}>{z.label}</span>
          </div>
        ))}
      </div>

      {/* Patient face (SVG-style) */}
      <div className="relative" style={{ width: 370, height: 370 }}>
        <svg viewBox="0 0 370 370" width="370" height="370">
          {/* Head */}
          <ellipse cx="185" cy="180" rx="95" ry="115" fill="hsl(35,55%,62%)" stroke="hsl(35,45%,50%)" strokeWidth="2" />
          {/* Hair */}
          <ellipse cx="185" cy="75" rx="92" ry="40" fill="hsl(25,40%,30%)" />
          {/* Ears */}
          <ellipse cx="90" cy="175" rx="15" ry="22" fill="hsl(35,50%,58%)" stroke="hsl(35,40%,48%)" strokeWidth="1.5" />
          <ellipse cx="280" cy="175" rx="15" ry="22" fill="hsl(35,50%,58%)" stroke="hsl(35,40%,48%)" strokeWidth="1.5" />
          {/* Forehead zone */}
          <rect x="145" y="110" width="80" height="35" rx="4" fill={
            showFlash?.zone === "forehead"
              ? showFlash.sharp ? "rgba(255,80,80,0.5)" : "rgba(100,255,200,0.4)"
              : touched.has("forehead") ? "rgba(100,255,200,0.15)" : "rgba(255,255,255,0.04)"
          } stroke={touched.has("forehead") ? "hsl(180,60%,50%)" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" strokeDasharray={touched.has("forehead") ? "" : "4 4"} />
          {/* Eyes */}
          <ellipse cx="155" cy="155" rx="18" ry="13" fill="white" />
          <ellipse cx="215" cy="155" rx="18" ry="13" fill="white" />
          <circle cx="157" cy="156" r="9" fill="hsl(200,30%,35%)" />
          <circle cx="217" cy="156" r="9" fill="hsl(200,30%,35%)" />
          <circle cx="159" cy="153" r="4" fill="black" />
          <circle cx="219" cy="153" r="4" fill="black" />
          <circle cx="161" cy="151" r="1.5" fill="white" />
          <circle cx="221" cy="151" r="1.5" fill="white" />
          {/* Nose */}
          <path d="M 180 170 Q 185 200 175 215 Q 185 220 195 215 Q 185 200 190 170" fill="hsl(35,40%,55%)" stroke="hsl(35,35%,48%)" strokeWidth="1" />
          {/* Left cheek zone */}
          <rect x="90" y="195" width="60" height="50" rx="4" fill={
            showFlash?.zone === "left-cheek"
              ? showFlash.sharp ? "rgba(255,80,80,0.5)" : "rgba(100,255,200,0.4)"
              : touched.has("left-cheek") ? "rgba(100,255,200,0.15)" : "rgba(255,255,255,0.04)"
          } stroke={touched.has("left-cheek") ? "hsl(180,60%,50%)" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" strokeDasharray={touched.has("left-cheek") ? "" : "4 4"} />
          {/* Right cheek zone */}
          <rect x="220" y="195" width="60" height="50" rx="4" fill={
            showFlash?.zone === "right-cheek"
              ? showFlash.sharp ? "rgba(255,80,80,0.5)" : "rgba(100,255,200,0.4)"
              : touched.has("right-cheek") ? "rgba(100,255,200,0.15)" : "rgba(255,255,255,0.04)"
          } stroke={touched.has("right-cheek") ? "hsl(180,60%,50%)" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" strokeDasharray={touched.has("right-cheek") ? "" : "4 4"} />
          {/* Mouth */}
          <path d="M 155 255 Q 185 275 215 255" fill="none" stroke="hsl(10,30%,40%)" strokeWidth="3" strokeLinecap="round" />
          {/* Chin zone */}
          <rect x="145" y="270" width="80" height="30" rx="4" fill={
            showFlash?.zone === "chin"
              ? showFlash.sharp ? "rgba(255,80,80,0.5)" : "rgba(100,255,200,0.4)"
              : touched.has("chin") ? "rgba(100,255,200,0.15)" : "rgba(255,255,255,0.04)"
          } stroke={touched.has("chin") ? "hsl(180,60%,50%)" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" strokeDasharray={touched.has("chin") ? "" : "4 4"} />
          {/* Zone labels */}
          <text x="185" y="132" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">FOREHEAD</text>
          <text x="120" y="225" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">L. CHEEK</text>
          <text x="250" y="225" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">R. CHEEK</text>
          <text x="185" y="290" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">CHIN</text>
        </svg>
      </div>

      {/* Lagged cursor tool */}
      <div className="absolute pointer-events-none z-30"
        style={{
          left: laggedMouse.x - 10,
          top: laggedMouse.y - 10,
          width: 20, height: 20,
          border: `2px solid ${currentTool === "soft" ? "hsl(180,60%,55%)" : "hsl(0,70%,55%)"}`,
          borderRadius: currentTool === "soft" ? "50%" : 0,
          background: currentTool === "soft" ? "rgba(100,255,220,0.1)" : "rgba(255,100,100,0.1)",
          transform: "translate(-50%, -50%)",
          transition: "none",
        }}
      />
      {/* Real cursor ghost */}
      <div className="absolute pointer-events-none z-30 opacity-25"
        style={{
          left: realMouse.x, top: realMouse.y,
          width: 6, height: 6,
          background: "white",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Win effect */}
      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="text-4xl font-bold text-primary" style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}>
            SENSATION CONFIRMED
          </div>
        </div>
      )}

      {/* Dialogue */}
      {showDialogue && (
        <div className="absolute top-40 right-12 z-30 max-w-xs"
          style={{ background: "hsl(210,18%,14%)", border: "1px solid hsl(210,15%,25%)", padding: "10px 14px", borderRadius: 4 }}>
          <p className="text-xs text-muted-foreground italic">"{dialogue}"</p>
        </div>
      )}

      {/* Tool indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-6">
        <div className={`flex items-center gap-2 text-xs ${currentTool === "soft" ? "text-primary" : "text-muted-foreground/40"}`}>
          <div className="w-4 h-4 rounded-full border-2 border-current" />
          LEFT CLICK — SOFT
        </div>
        <div className={`flex items-center gap-2 text-xs ${currentTool === "sharp" ? "text-destructive" : "text-muted-foreground/40"}`}>
          <div className="w-4 h-4 border-2 border-current" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
          RIGHT CLICK — SHARP
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/30 tracking-widest">
        NOTE: The lagged cursor is the real one. The ghost is just for reference.
      </div>
    </div>
  );
}
