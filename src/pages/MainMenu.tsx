import { useState, useEffect } from "react";

interface Props {
  onPlay: () => void;
}

const WARNINGS = [
  "MAY CAUSE MILD ANXIETY",
  "NOT SUITABLE FOR ACTUAL SURGERY",
  "SIDE EFFECTS INCLUDE: HUMILIATION",
  "DO NOT ATTEMPT AT HOME OR IN HOSPITAL",
  "RESULTS MAY VARY. RESULTS WILL VARY.",
];

export default function MainMenu({ onPlay }: Props) {
  const [warningIdx, setWarningIdx] = useState(0);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPlay]);

  useEffect(() => {
    const t = setInterval(() => {
      setWarningIdx((i) => (i + 1) % WARNINGS.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden crt-flicker">
      {/* Ambient grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(hsl(180,60%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(180,60%,50%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center gap-2 mb-8">
        <div className="text-xs tracking-[0.4em] text-primary/60 uppercase mb-2">
          Nobody Medical LLC presents
        </div>
        <h1 className="sr-only">Cranial Nerve Crisis</h1>
        <div aria-hidden="true" className="flex flex-col items-center gap-2">
          <div
            className="text-7xl font-bold tracking-tight text-center leading-none"
            style={{
              color: "hsl(180,60%,50%)",
              textShadow:
                "0 0 40px hsl(180,60%,50%), 0 0 80px hsl(180,60%,30%)",
            }}
          >
            CRANIAL
          </div>
          <div
            className="text-7xl font-bold tracking-tight text-center leading-none mb-1"
            style={{
              color: "hsl(0,70%,60%)",
              textShadow: "0 0 40px hsl(0,70%,50%), 0 0 80px hsl(0,70%,30%)",
            }}
          >
            NERVE
          </div>
          <div
            className="text-7xl font-bold tracking-tight text-center leading-none"
            style={{
              color: "hsl(180,60%,50%)",
              textShadow:
                "0 0 40px hsl(180,60%,50%), 0 0 80px hsl(180,60%,30%)",
            }}
          >
            CRISIS
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="relative z-10 text-center mb-10">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          A Physics-Based Medical Incompetence Simulator
        </p>
        <p className="text-primary/40 text-xs mt-1 tracking-wider">
          Version 1.0.0 &nbsp;|&nbsp; Not Approved by Any Medical Board
        </p>
      </div>

      {/* Play button */}
      <button
        onClick={onPlay}
        aria-label="Proceed"
        className="relative z-10 px-16 py-4 border-2 border-primary text-primary text-xl tracking-widest uppercase hover:bg-primary hover:text-background transition-all duration-200 mb-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ fontFamily: "Courier New, monospace" }}
      >
        <span aria-hidden="true">{blink ? "[ PROCEED ]" : "  PROCEED  "}</span>
      </button>

      {/* Warning */}
      <div className="relative z-10 text-center" aria-hidden="true">
        <div className="text-xs text-destructive/70 tracking-[0.3em] uppercase transition-all duration-500">
          ⚠ WARNING: {WARNINGS[warningIdx]}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-8 text-xs text-muted-foreground/40 z-10">
        <span>© 2024 NOBODY MEDICAL LLC</span>
        <span>KEYBOARD REQUIRED · SANITY OPTIONAL</span>
        <span>ALL PATIENTS SIMULATED</span>
      </div>

      {/* Decorative EKG line */}
      <div className="absolute bottom-12 left-0 right-0 h-8 z-10 opacity-20">
        <svg
          viewBox="0 0 1000 50"
          className="w-full h-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            points="0,25 100,25 120,25 130,5 140,45 150,25 170,25 200,25 220,25 230,10 240,40 250,25 280,25 400,25 420,25 430,5 440,45 450,25 470,25 500,25 520,25 530,10 540,40 550,25 580,25 700,25 720,25 730,5 740,45 750,25 770,25 800,25 820,25 830,10 840,40 850,25 880,25 1000,25"
            fill="none"
            stroke="hsl(180,60%,50%)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
