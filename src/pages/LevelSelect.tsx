import { LevelId, LEVELS } from "@/types/types";

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
  return (
    <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-primary text-sm tracking-widest uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span aria-hidden="true">← </span>BACK
        </button>
        <h1 className="text-primary text-lg tracking-widest uppercase">
          SELECT EXAMINATION
        </h1>
        <div className="text-muted-foreground text-sm">
          SCORE: <span className="text-primary">{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-8 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
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
          <span className="text-xs text-primary">
            {completedLevels.size}/{LEVELS.length}
          </span>
        </div>
      </div>

      {/* Level grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
          {LEVELS.map((level) => {
            const isComplete = completedLevels.has(level.id);
            const isAvailable = level.implemented;

            return (
              <button
                key={level.id}
                disabled={!isAvailable}
                onClick={() => isAvailable && onSelectLevel(level.id)}
                className={`
                  relative p-4 border text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  ${
                    isAvailable
                      ? isComplete
                        ? "border-primary/60 bg-primary/10 hover:bg-primary/20 cursor-pointer"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50 cursor-pointer"
                      : "border-border/30 bg-secondary/20 cursor-not-allowed opacity-40"
                  }
                `}
              >
                {/* Level number */}
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-muted-foreground tracking-widest uppercase">
                    {level.nerve}
                  </span>
                  {isComplete && (
                    <span className="text-xs text-primary">
                      <span aria-hidden="true">✓ </span>DONE
                    </span>
                  )}
                  {!isAvailable && (
                    <span className="text-xs text-muted-foreground/50">
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`text-base font-bold mb-1 ${isAvailable ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {level.title.toUpperCase()}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {level.description}
                </p>

                {/* Controls hint */}
                {isAvailable && (
                  <div className="text-xs text-primary/60 font-mono border-t border-border/50 pt-2 mt-auto">
                    {level.controls}
                  </div>
                )}

                {/* Decorative corner */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/30" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/30" />
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
