import { useState, useEffect, useRef } from "react";

import { LevelId, LEVELS, DEADPAN_DIALOGUE } from "@/types/types";

interface Props {
  levelId: LevelId;
  onRetry: () => void;
  onLevelSelect: () => void;
}

export default function GameOver({ levelId, onRetry, onLevelSelect }: Props) {
  const [quote, setQuote] = useState("");
  const level = LEVELS.find((l) => l.id === levelId)!;

  const [focusedButton, setFocusedButton] = useState<"retry" | "quit">("retry");
  const retryBtnRef = useRef<globalThis.HTMLButtonElement | null>(null);
  const quitBtnRef = useRef<globalThis.HTMLButtonElement | null>(null);

  useEffect(() => {
    const pool = DEADPAN_DIALOGUE.stress;
    setQuote(pool[Math.floor(Math.random() * pool.length)]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onLevelSelect();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextFocus = focusedButton === "retry" ? "quit" : "retry";
        setFocusedButton(nextFocus);
        if (nextFocus === "retry") {
          retryBtnRef.current?.focus();
        } else {
          quitBtnRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onLevelSelect, focusedButton]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background relative">
      {/* Flatline EKG */}
      <div className="absolute top-1/3 left-0 right-0 h-16 opacity-20 pointer-events-none">
        <svg
          viewBox="0 0 1000 60"
          className="w-full h-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="30"
            x2="300"
            y2="30"
            stroke="hsl(0,70%,50%)"
            strokeWidth="2"
          />
          <polyline
            points="300,30 320,30 330,5 340,55 350,30 370,30"
            fill="none"
            stroke="hsl(0,70%,50%)"
            strokeWidth="2"
          />
          <line
            x1="370"
            y1="30"
            x2="1000"
            y2="30"
            stroke="hsl(0,70%,50%)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg text-center px-8">
        <div className="text-xs text-destructive/60 tracking-[0.4em] uppercase">
          PATIENT STATUS: UNWELL
        </div>

        <h1
          className="text-6xl font-bold text-destructive"
          style={{ textShadow: "0 0 30px hsl(0,70%,50%)" }}
        >
          CRITICAL
          <br />
          FAILURE
        </h1>

        <div className="text-sm text-muted-foreground tracking-wider uppercase">
          {level.nerve} — {level.title}
        </div>

        <div className="border border-border p-4 text-sm text-muted-foreground italic leading-relaxed">
          <div className="text-xs text-primary/40 uppercase tracking-widest mb-2">
            Patient Remarks:
          </div>
          "{quote}"
        </div>

        <div className="text-xs text-muted-foreground/40 tracking-wider">
          The patient has requested a different doctor.
          <br />
          This is the fifth time this week.
        </div>

        <div className="flex gap-4 mt-4">
          <button
            ref={retryBtnRef}
            onFocus={() => setFocusedButton("retry")}
            onClick={onRetry}
            className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-background transition-all text-sm tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            RETRY
          </button>
          <button
            ref={quitBtnRef}
            onFocus={() => setFocusedButton("quit")}
            onClick={onLevelSelect}
            className="group relative px-8 py-3 border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-sm tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            QUIT
            <kbd
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] bg-muted-foreground/10 px-1.5 py-0.5 rounded opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap font-sans"
              aria-hidden="true"
            >
              ESC
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
