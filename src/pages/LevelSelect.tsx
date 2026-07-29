import { useEffect, useRef, useState } from "react";
import { LevelId, LEVELS } from "@/types/types";

const LEVEL_COLORS = [
  {
    name: "red",
    bg: "bg-red-500/10",
    border: "border-red-500/50",
    hoverBg: "hover:bg-red-500/20",
    hoverBorder: "hover:border-red-500/50",
    text: "text-red-600 dark:text-red-400",
    hoverText: "group-hover:text-red-600 dark:group-hover:text-red-400",
    decoration: "border-red-500/30",
    hoverDecoration: "group-hover:border-red-500/30",
  },
  {
    name: "orange",
    bg: "bg-orange-500/10",
    border: "border-orange-500/50",
    hoverBg: "hover:bg-orange-500/20",
    hoverBorder: "hover:border-orange-500/50",
    text: "text-orange-600 dark:text-orange-400",
    hoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
    decoration: "border-orange-500/30",
    hoverDecoration: "group-hover:border-orange-500/30",
  },
  {
    name: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/50",
    hoverBg: "hover:bg-amber-500/20",
    hoverBorder: "hover:border-amber-500/50",
    text: "text-amber-600 dark:text-amber-400",
    hoverText: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    decoration: "border-amber-500/30",
    hoverDecoration: "group-hover:border-amber-500/30",
  },
  {
    name: "green",
    bg: "bg-green-500/10",
    border: "border-green-500/50",
    hoverBg: "hover:bg-green-500/20",
    hoverBorder: "hover:border-green-500/50",
    text: "text-green-600 dark:text-green-400",
    hoverText: "group-hover:text-green-600 dark:group-hover:text-green-400",
    decoration: "border-green-500/30",
    hoverDecoration: "group-hover:border-green-500/30",
  },
  {
    name: "emerald",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/50",
    hoverBg: "hover:bg-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    text: "text-emerald-600 dark:text-emerald-400",
    hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    decoration: "border-emerald-500/30",
    hoverDecoration: "group-hover:border-emerald-500/30",
  },
  {
    name: "teal",
    bg: "bg-teal-500/10",
    border: "border-teal-500/50",
    hoverBg: "hover:bg-teal-500/20",
    hoverBorder: "hover:border-teal-500/50",
    text: "text-teal-600 dark:text-teal-400",
    hoverText: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
    decoration: "border-teal-500/30",
    hoverDecoration: "group-hover:border-teal-500/30",
  },
  {
    name: "cyan",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/50",
    hoverBg: "hover:bg-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/50",
    text: "text-cyan-600 dark:text-cyan-400",
    hoverText: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
    decoration: "border-cyan-500/30",
    hoverDecoration: "group-hover:border-cyan-500/30",
  },
  {
    name: "blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/50",
    hoverBg: "hover:bg-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
    text: "text-blue-600 dark:text-blue-400",
    hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    decoration: "border-blue-500/30",
    hoverDecoration: "group-hover:border-blue-500/30",
  },
  {
    name: "indigo",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/50",
    hoverBg: "hover:bg-indigo-500/20",
    hoverBorder: "hover:border-indigo-500/50",
    text: "text-indigo-600 dark:text-indigo-400",
    hoverText: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    decoration: "border-indigo-500/30",
    hoverDecoration: "group-hover:border-indigo-500/30",
  },
  {
    name: "violet",
    bg: "bg-violet-500/10",
    border: "border-violet-500/50",
    hoverBg: "hover:bg-violet-500/20",
    hoverBorder: "hover:border-violet-500/50",
    text: "text-violet-600 dark:text-violet-400",
    hoverText: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
    decoration: "border-violet-500/30",
    hoverDecoration: "group-hover:border-violet-500/30",
  },
  {
    name: "fuchsia",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/50",
    hoverBg: "hover:bg-fuchsia-500/20",
    hoverBorder: "hover:border-fuchsia-500/50",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    hoverText: "group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400",
    decoration: "border-fuchsia-500/30",
    hoverDecoration: "group-hover:border-fuchsia-500/30",
  },
  {
    name: "pink",
    bg: "bg-pink-500/10",
    border: "border-pink-500/50",
    hoverBg: "hover:bg-pink-500/20",
    hoverBorder: "hover:border-pink-500/50",
    text: "text-pink-600 dark:text-pink-400",
    hoverText: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
    decoration: "border-pink-500/30",
    hoverDecoration: "group-hover:border-pink-500/30",
  },
];

interface Props {
  completedLevels: Set<LevelId>;
  score: number;
  onSelectLevel: (id: LevelId) => void;
  onBack: () => void;
}

export default function LevelSelect({
  completedLevels,
  score,
  onSelectLevel,
  onBack,
}: Props) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const buttonRefs = useRef<(globalThis.HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack();
        return;
      }

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();

        let newIndex = focusedIndex;

        if (focusedIndex === -1) {
          // If focus is nowhere or on 'Back' button, start at first level
          newIndex = 0;
        } else {
          // Navigation in a 3-column grid
          if (e.key === "ArrowRight") {
            newIndex = Math.min(focusedIndex + 1, LEVELS.length - 1);
          } else if (e.key === "ArrowLeft") {
            newIndex = Math.max(focusedIndex - 1, 0);
          } else if (e.key === "ArrowDown") {
            newIndex = Math.min(focusedIndex + 3, LEVELS.length - 1);
          } else if (e.key === "ArrowUp") {
            newIndex = Math.max(focusedIndex - 3, 0);
          }
        }

        setFocusedIndex(newIndex);
        buttonRefs.current[newIndex]?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, focusedIndex]);

  useEffect(() => {
    // Auto-focus the next available uncompleted level on mount
    const timer = setTimeout(() => {
      let targetIndex = LEVELS.findIndex(
        (l) => l.implemented && !completedLevels.has(l.id),
      );
      if (targetIndex === -1) targetIndex = 0;
      setFocusedIndex(targetIndex);
      buttonRefs.current[targetIndex]?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [completedLevels]);

  return (
    <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border">
        <button
          onClick={onBack}
          aria-label="Return to main menu"
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary text-sm tracking-widest uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span>
            <span aria-hidden="true">← </span>BACK
          </span>
          <kbd
            className="text-[10px] bg-muted-foreground/10 px-1.5 py-0.5 rounded opacity-50 group-hover:opacity-100 transition-opacity font-sans"
            aria-hidden="true"
          >
            ESC
          </kbd>
        </button>
        <h1 className="text-primary text-lg tracking-widest uppercase">
          SELECT EXAMINATION
        </h1>
        <div className="text-muted-foreground text-sm flex gap-4 items-center">
          <div
            className="hidden sm:flex items-center gap-1 opacity-50"
            aria-hidden="true"
          >
            <kbd className="text-[10px] bg-muted-foreground/10 px-1 py-0.5 rounded font-sans">
              ↑
            </kbd>
            <kbd className="text-[10px] bg-muted-foreground/10 px-1 py-0.5 rounded font-sans">
              ↓
            </kbd>
            <kbd className="text-[10px] bg-muted-foreground/10 px-1 py-0.5 rounded font-sans">
              ←
            </kbd>
            <kbd className="text-[10px] bg-muted-foreground/10 px-1 py-0.5 rounded font-sans">
              →
            </kbd>
            <span className="text-[10px] ml-1 uppercase tracking-widest">
              TO NAVIGATE
            </span>
          </div>
          <div>
            SCORE:{" "}
            <span className="text-primary">{score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-8 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <span
            className="text-xs text-muted-foreground uppercase tracking-widest"
            aria-hidden="true"
          >
            Progress
          </span>
          <div
            className="flex-1 h-1 bg-secondary rounded-none overflow-hidden"
            role="progressbar"
            aria-valuenow={completedLevels.size}
            aria-valuemin={0}
            aria-valuemax={LEVELS.length}
            aria-label="Level progress"
          >
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${(completedLevels.size / LEVELS.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs text-primary" aria-hidden="true">
            {completedLevels.size}/{LEVELS.length}
          </span>
        </div>
      </div>

      {/* Level grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
          {LEVELS.map((level, index) => {
            const isComplete = completedLevels.has(level.id);
            const isAvailable = level.implemented;
            const colors = LEVEL_COLORS[index % LEVEL_COLORS.length];

            return (
              <button
                key={level.id}
                ref={(el) => (buttonRefs.current[index] = el)}
                onFocus={() => setFocusedIndex(index)}
                aria-disabled={!isAvailable}
                onClick={() => isAvailable && onSelectLevel(level.id)}
                aria-label={
                  isAvailable
                    ? isComplete
                      ? `Replay Level ${level.nerve}: ${level.title}`
                      : `Play Level ${level.nerve}: ${level.title}`
                    : `Level ${level.nerve}: ${level.title} - Locked`
                }
                aria-describedby={
                  isAvailable
                    ? `desc-${level.id} controls-${level.id}`
                    : `desc-${level.id}`
                }
                className={`
                  relative p-4 border text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background group
                  ${
                    isAvailable
                      ? isComplete
                        ? `${colors.border} ${colors.bg} ${colors.hoverBg} cursor-pointer`
                        : `border-border ${colors.hoverBorder} ${colors.hoverBg} bg-card cursor-pointer`
                      : "border-border/40 bg-muted/30 cursor-not-allowed"
                  }
                `}
              >
                {/* Level number */}
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`text-xs tracking-widest uppercase font-semibold ${isAvailable ? (isComplete ? colors.text : "text-muted-foreground transition-colors " + colors.hoverText) : "text-muted-foreground/60"}`}
                  >
                    {level.nerve}
                  </span>
                  {isComplete && (
                    <span className={`text-xs font-semibold ${colors.text}`}>
                      <span aria-hidden="true">✓ </span>DONE
                    </span>
                  )}
                  {!isAvailable && (
                    <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`text-base font-bold mb-1 ${isAvailable ? "text-foreground" : "text-muted-foreground/70"}`}
                >
                  {level.title.toUpperCase()}
                </h3>

                {/* Description */}
                <p
                  id={`desc-${level.id}`}
                  className={`text-xs mb-3 leading-relaxed ${isAvailable ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                >
                  {level.description}
                </p>

                {/* Controls hint */}
                {isAvailable && (
                  <div
                    id={`controls-${level.id}`}
                    className={`text-xs font-mono border-t border-border/50 pt-2 mt-auto opacity-70 group-hover:opacity-100 transition-all ${isComplete ? colors.text : "text-muted-foreground " + colors.hoverText}`}
                  >
                    {level.controls}
                  </div>
                )}

                {/* Decorative corner */}
                <div
                  className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 transition-colors ${isAvailable ? (isComplete ? colors.decoration : "border-transparent " + colors.hoverDecoration) : "border-transparent"}`}
                />
                <div
                  className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 transition-colors ${isAvailable ? (isComplete ? colors.decoration : "border-transparent " + colors.hoverDecoration) : "border-transparent"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-8 py-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground/50 text-center tracking-wider">
          The Medical Board is watching. They are not impressed.
        </p>
      </div>
    </div>
  );
}
