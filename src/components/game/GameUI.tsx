import { useEffect } from "react";
import { LevelInfo } from "@/types/types";

interface Props {
  level: LevelInfo;
  stress: number;
  onQuit: () => void;
}

export default function GameUI({ level, stress, onQuit }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onQuit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onQuit]);

  const stressColor =
    stress < 40
      ? "hsl(180,60%,50%)"
      : stress < 70
        ? "hsl(45,90%,55%)"
        : "hsl(0,70%,55%)";

  return (
    <>
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,14,20,0.95) 0%, transparent 100%)",
        }}
      >
        {/* Level info */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-primary/60 tracking-widest uppercase">
              {level.nerve}
            </div>
            <div className="text-sm font-bold text-foreground tracking-wider uppercase">
              {level.title}
            </div>
          </div>
        </div>

        {/* Stress meter */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="text-xs tracking-widest uppercase"
            style={{ color: stressColor }}
          >
            PATIENT STRESS
          </div>
          <div className="flex items-center gap-2">
            {/* EKG Icon */}
            <svg viewBox="0 0 40 20" width="40" height="20" aria-hidden="true">
              <polyline
                points="0,10 8,10 12,10 14,3 16,17 18,10 22,10 26,10 28,5 30,15 32,10 40,10"
                fill="none"
                stroke={stressColor}
                strokeWidth="1.5"
              />
            </svg>
            {/* Bar */}
            <div
              className="w-40 h-3 bg-secondary/80 border border-border overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(stress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Patient stress"
            >
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${stress}%`, backgroundColor: stressColor }}
              />
            </div>
            <span
              className="text-xs w-8 text-right"
              style={{ color: stressColor }}
            >
              {Math.round(stress)}%
            </span>
          </div>
        </div>

        {/* Quit */}
        <button
          onClick={onQuit}
          className="group flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive tracking-widest uppercase transition-colors pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            className="text-[10px] bg-muted-foreground/10 px-1.5 py-0.5 rounded opacity-50 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          >
            ESC
          </span>
          <span>
            QUIT <span aria-hidden="true">→</span>
          </span>
        </button>
      </div>

      {/* Bottom controls bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 px-6 py-3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,14,20,0.95) 0%, transparent 100%)",
        }}
      >
        <div className="text-xs text-muted-foreground/50 text-center tracking-widest">
          {level.controls}
        </div>
      </div>
    </>
  );
}
