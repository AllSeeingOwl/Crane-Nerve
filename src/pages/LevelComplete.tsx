import { useState, useEffect } from "react";

import { LevelId, LEVELS, DEADPAN_DIALOGUE } from "@/types/types";


interface Props {
  levelId: LevelId;
  stress: number;
  score: number;
  onNext: () => void;
  onLevelSelect: () => void;
}

export default function LevelComplete({ levelId, stress, score, onNext, onLevelSelect }: Props) {
  const [quote, setQuote] = useState("");
  const level = LEVELS.find(l => l.id === levelId)!;
  const stressLeft = 100 - stress;
  const grade = stressLeft > 80 ? "A" : stressLeft > 60 ? "B" : stressLeft > 40 ? "C" : "D";

  useEffect(() => {
    const pool = DEADPAN_DIALOGUE.success;
    setQuote(pool[Math.floor(Math.random() * pool.length)]);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background relative">
      {/* Subtle EKG */}
      <div className="absolute top-1/4 left-0 right-0 h-12 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1000 50" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points="0,25 100,25 120,25 130,5 140,45 150,25 170,25 300,25 320,25 330,5 340,45 350,25 370,25 600,25 620,25 630,5 640,45 650,25 670,25 900,25 920,25 930,5 940,45 950,25 970,25 1000,25"
            fill="none" stroke="hsl(180,60%,50%)" strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg text-center px-8">
        <div className="text-xs text-primary/60 tracking-[0.4em] uppercase">
          EXAMINATION COMPLETE
        </div>

        <h1 className="text-5xl font-bold text-primary"
          style={{ textShadow: "0 0 30px hsl(180,60%,50%)" }}>
          ADEQUATE
        </h1>

        <div className="text-sm text-muted-foreground tracking-wider uppercase">
          {level.nerve} — {level.title}
        </div>

        {/* Stats */}
        <div className="border border-border p-6 w-full">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{grade}</div>
              <div className="text-xs text-muted-foreground mt-1 tracking-widest">GRADE</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{Math.round(stressLeft)}%</div>
              <div className="text-xs text-muted-foreground mt-1 tracking-widest">SANITY</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{Math.max(0, 1000 - Math.floor(stress * 10))}</div>
              <div className="text-xs text-muted-foreground mt-1 tracking-widest">POINTS</div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="text-xs text-primary/40 uppercase tracking-widest mb-2">Patient Remarks:</div>
            <p className="text-sm text-muted-foreground italic">"{quote}"</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onNext}
            className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-background transition-all text-sm tracking-widest uppercase"
          >
            NEXT →
          </button>
          <button
            onClick={onLevelSelect}
            className="px-8 py-3 border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-sm tracking-widest uppercase"
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}
