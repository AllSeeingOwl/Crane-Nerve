import { useState, useEffect, useRef, useCallback } from "react";
import { resumeAudio, playGrip, playDrop, playVialSuccess, playStress, playDialogue } from "@/lib/gameAudio";

interface Props {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

type FingerState = { q: boolean; w: boolean; e: boolean; r: boolean };

const DIALOGUE = [
  "Is that a vial or a wand?",
  "Do carry on. My nose is right here.",
  "Quite a grip you have there.",
  "I'm not going anywhere.",
  "Take your time. I have nowhere to be. I am a patient.",
];

export default function Level1Olfactory({ onStressChange, onWin, onLose }: Props) {
  const [fingers, setFingers] = useState<FingerState>({ q: false, w: false, e: false, r: false });
  const [gripping, setGripping] = useState(false);
  const [armX, setArmX] = useState(0); // -1 to 1
  const [vialX, setVialX] = useState(0);
  const [dropped, setDropped] = useState(false);
  const [won, setWon] = useState(false);
  const [dialogue, setDialogue] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [phase, setPhase] = useState<"grip" | "move" | "done">("grip");
  const [instructions, setInstructions] = useState("Hold Q+W+E+R together to grip the vial");
  const armRef = useRef(armX);
  const grippingRef = useRef(false);
  const wonRef = useRef(false);
  armRef.current = armX;
  grippingRef.current = gripping;
  wonRef.current = won;

  const showDialogueMsg = useCallback((msg: string) => {
    setDialogue(msg);
    setShowDialogue(true);
    playDialogue();
    setTimeout(() => setShowDialogue(false), 2500);
  }, []);

  // Key handlers
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      resumeAudio();
      if (won || dropped) return;
      if (e.key === "q" || e.key === "Q") setFingers(f => ({ ...f, q: true }));
      if (e.key === "w" || e.key === "W") setFingers(f => ({ ...f, w: true }));
      if (e.key === "e" || e.key === "E") setFingers(f => ({ ...f, e: true }));
      if (e.key === "r" || e.key === "R") setFingers(f => ({ ...f, r: true }));
      if ((e.key === "a" || e.key === "A") && grippingRef.current && phase === "move") {
        setArmX(x => Math.max(-1, x - 0.15));
      }
      if ((e.key === "d" || e.key === "D") && grippingRef.current && phase === "move") {
        setArmX(x => Math.min(1, x + 0.15));
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "Q") setFingers(f => ({ ...f, q: false }));
      if (e.key === "w" || e.key === "W") setFingers(f => ({ ...f, w: false }));
      if (e.key === "e" || e.key === "E") setFingers(f => ({ ...f, e: false }));
      if (e.key === "r" || e.key === "R") setFingers(f => ({ ...f, r: false }));
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [won, dropped, phase]);

  // Check gripping
  useEffect(() => {
    const allPressed = fingers.q && fingers.w && fingers.e && fingers.r;
    if (allPressed && !gripping && phase === "grip") {
      setGripping(true);
      grippingRef.current = true;
      setPhase("move");
      setInstructions("Gripped! Now use A/D to bring the vial to the nose →");
      playGrip();
      showDialogueMsg("Excellent. You've successfully grabbed a vial.");
    } else if (!allPressed && gripping && phase === "move") {
      // dropped the vial mid-move
      setDropped(true);
      setGripping(false);
      playDrop();
      onStressChange(35);
      playStress();
      showDialogueMsg("Oh. It seems you've released my appointment.");
      setTimeout(() => {
        setDropped(false);
        setGripping(false);
        setArmX(0);
        setVialX(0);
        setPhase("grip");
        setInstructions("Hold Q+W+E+R together to grip the vial");
      }, 2000);
    }
  }, [fingers, gripping, phase]);

  // Update vial position based on arm when gripping
  useEffect(() => {
    if (gripping) setVialX(armX);
  }, [armX, gripping]);

  // Check win condition (arm reaches right side ~0.75)
  useEffect(() => {
    if (armX >= 0.75 && gripping && phase === "move" && !won) {
      setWon(true);
      wonRef.current = true;
      setPhase("done");
      playVialSuccess();
      showDialogueMsg("Adequate. I can almost smell it from here.");
      setTimeout(() => onWin(), 1800);
    }
  }, [armX, gripping, phase, won]);

  // Periodic stress without proper grip
  useEffect(() => {
    if (won || dropped) return;
    const t = setInterval(() => {
      if (!grippingRef.current && !wonRef.current) {
        onStressChange(2);
        playStress();
      }
    }, 3000);
    return () => clearInterval(t);
  }, [won, dropped]);

  // Random dialogue
  useEffect(() => {
    const t = setInterval(() => {
      if (!showDialogue && Math.random() < 0.3) {
        showDialogueMsg(DIALOGUE[Math.floor(Math.random() * DIALOGUE.length)]);
      }
    }, 8000);
    return () => clearInterval(t);
  }, [showDialogue]);

  const armPx = 280 + armX * 250;
  const vialPx = gripping ? armPx + 10 : 285;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none"
      style={{ background: "radial-gradient(ellipse 78% 82% at 50% 52%, rgba(5,8,14,0.80) 0%, rgba(5,8,14,0.05) 100%)" }}>

      {/* Doctor's office walls */}
      <div className="absolute inset-0" style={{
        backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.03) 59px, rgba(255,255,255,0.03) 60px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Instructions */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-xs text-primary/70 tracking-widest uppercase px-4 py-2 border border-primary/20 bg-background/40">
          {instructions}
        </div>
      </div>

      {/* Scene */}
      <div className="relative w-full max-w-3xl" style={{ height: 380 }}>

        {/* Exam table */}
        <div className="absolute" style={{ bottom: 60, left: "5%", right: "5%", height: 20, background: "hsl(210,10%,22%)", border: "1px solid hsl(210,10%,30%)" }} />

        {/* Patient head */}
        <div className="absolute flex flex-col items-center" style={{ right: 60, bottom: 80 }}>
          {/* Head */}
          <div className="relative" style={{ width: 70, height: 80, background: "hsl(35,60%,65%)", border: "2px solid hsl(35,50%,50%)", borderRadius: "6px 6px 4px 4px" }}>
            {/* Eyes */}
            <div className="absolute top-5 left-3 w-3 h-2 bg-black rounded-sm opacity-70" />
            <div className="absolute top-5 right-3 w-3 h-2 bg-black rounded-sm opacity-70" />
            {/* Nose */}
            <div className="absolute" style={{ top: 38, left: "50%", transform: "translateX(-50%)", width: 8, height: 12, background: "hsl(35,45%,58%)", borderRadius: 2 }} />
            {/* Mouth */}
            <div className="absolute" style={{ bottom: 12, left: "20%", right: "20%", height: 3, background: "hsl(10,30%,40%)", borderRadius: 2 }} />
          </div>
          {/* Neck */}
          <div style={{ width: 24, height: 20, background: "hsl(35,55%,60%)", borderLeft: "2px solid hsl(35,45%,50%)", borderRight: "2px solid hsl(35,45%,50%)" }} />
          {/* Body */}
          <div style={{ width: 60, height: 50, background: "hsl(200,30%,70%)", border: "2px solid hsl(200,25%,60%)", borderRadius: 4 }} />
          {/* Label */}
          <div className="mt-2 text-xs text-muted-foreground/50 tracking-widest">PATIENT</div>
        </div>

        {/* Tray with vial */}
        <div className="absolute" style={{ left: 200, bottom: 80 }}>
          <div style={{ width: 80, height: 10, background: "hsl(210,10%,30%)", border: "1px solid hsl(210,10%,40%)" }} />
          {/* Vial on tray */}
          {!gripping && (
            <div className="absolute" style={{
              left: 30, bottom: 10, width: 16, height: 50,
              background: "linear-gradient(180deg, rgba(180,240,255,0.6) 0%, rgba(100,200,240,0.4) 100%)",
              border: "2px solid rgba(150,220,255,0.8)",
              borderRadius: "3px 3px 2px 2px",
              boxShadow: "0 0 8px rgba(100,200,255,0.3)",
            }}>
              <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, background: "rgba(150,220,255,0.9)", borderRadius: "50% 50% 0 0" }} />
            </div>
          )}
        </div>

        {/* Doctor arm + hand */}
        <div className="absolute flex items-end" style={{
          left: armPx,
          bottom: 100,
          transition: "left 0.12s ease",
        }}>
          {/* Arm */}
          <div style={{
            width: 30, height: 120, background: "hsl(220,30%,45%)",
            border: "2px solid hsl(220,25%,55%)", borderRadius: 4,
            position: "relative",
          }}>
            {/* White coat */}
            <div style={{
              position: "absolute", top: -2, left: -2, right: -2, height: "60%",
              background: "hsl(200,20%,85%)", border: "1px solid hsl(200,15%,70%)", borderRadius: 4,
            }} />
          </div>

          {/* Hand + fingers */}
          <div className="ml-0 relative" style={{ marginLeft: -2 }}>
            {/* Palm */}
            <div style={{
              width: 32, height: 28, background: "hsl(30,55%,70%)",
              border: "2px solid hsl(30,50%,60%)", borderRadius: "3px 3px 0 0",
              marginBottom: 0,
            }} />
            {/* Fingers - Q W E R */}
            <div className="flex gap-0.5" style={{ marginTop: 1 }}>
              {[
                { key: "Q", state: fingers.q },
                { key: "W", state: fingers.w },
                { key: "E", state: fingers.e },
                { key: "R", state: fingers.r },
              ].map(({ key, state }) => (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <div style={{
                    width: 7, height: state ? 18 : 24,
                    background: state ? "hsl(180,50%,55%)" : "hsl(30,50%,68%)",
                    border: `1px solid ${state ? "hsl(180,60%,40%)" : "hsl(30,45%,55%)"}`,
                    borderRadius: 3,
                    transition: "height 0.1s ease, background 0.1s ease",
                  }} />
                  <span style={{ fontSize: 8, color: state ? "hsl(180,60%,60%)" : "hsl(0,0%,40%)" }}>{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vial when gripping */}
          {gripping && (
            <div style={{
              width: 12, height: 40, marginLeft: 2, marginBottom: 4,
              background: "linear-gradient(180deg, rgba(180,240,255,0.7) 0%, rgba(100,200,240,0.5) 100%)",
              border: "2px solid rgba(150,220,255,0.9)",
              borderRadius: "3px 3px 2px 2px",
              boxShadow: "0 0 12px rgba(100,200,255,0.5)",
            }}>
              <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, background: "rgba(150,220,255,0.9)", borderRadius: "50% 50% 0 0" }} />
            </div>
          )}
        </div>

        {/* Dropped vial animation */}
        {dropped && (
          <div className="absolute" style={{ left: vialPx, bottom: 60, animation: "fall 0.5s ease-in" }}>
            <div style={{
              width: 12, height: 40,
              background: "linear-gradient(180deg, rgba(180,240,255,0.4) 0%, rgba(100,200,240,0.2) 100%)",
              border: "2px solid rgba(150,220,255,0.5)",
              borderRadius: 2, transform: "rotate(45deg)",
            }} />
          </div>
        )}

        {/* Win effect */}
        {won && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-primary" style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}>
              OLFACTION CONFIRMED
            </div>
          </div>
        )}
      </div>

      {/* Finger key indicators */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-3">
        {[
          { key: "Q", active: fingers.q },
          { key: "W", active: fingers.w },
          { key: "E", active: fingers.e },
          { key: "R", active: fingers.r },
        ].map(({ key, active }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div className="text-xs" style={{ color: active ? "hsl(180,60%,55%)" : "hsl(0,0%,30%)" }}>
              {active ? "●" : "○"}
            </div>
            <div style={{
              width: 36, height: 36, border: `2px solid ${active ? "hsl(180,60%,55%)" : "hsl(0,0%,25%)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: active ? "hsl(180,60%,55%)" : "hsl(0,0%,30%)",
              fontSize: 14, fontWeight: "bold",
              background: active ? "hsl(180,60%,10%)" : "transparent",
              transition: "all 0.1s",
            }}>{key}</div>
          </div>
        ))}
        <div style={{ width: 1, background: "hsl(0,0%,20%)", margin: "0 8px" }} />
        {[
          { key: "A", label: "←" },
          { key: "D", label: "→" },
        ].map(({ key, label }) => (
          <div key={key} style={{
            width: 36, height: 36, border: `2px solid ${gripping ? "hsl(180,40%,40%)" : "hsl(0,0%,18%)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: gripping ? "hsl(180,40%,50%)" : "hsl(0,0%,25%)",
            fontSize: 14, fontWeight: "bold",
          }}>{label}{key}</div>
        ))}
      </div>

      {/* Dialogue bubble */}
      {showDialogue && (
        <div className="absolute top-32 right-24 z-30 max-w-xs"
          style={{
            background: "hsl(210,18%,14%)", border: "1px solid hsl(210,15%,25%)",
            padding: "10px 14px", borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}>
          <p className="text-xs text-muted-foreground italic">"{dialogue}"</p>
          <div className="absolute -left-2 top-3 w-0 h-0"
            style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "8px solid hsl(210,15%,25%)" }} />
        </div>
      )}

      <style>{`@keyframes fall { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(60px) rotate(60deg); } }`}</style>
    </div>
  );
}
