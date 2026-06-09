import { useState, useCallback } from "react";
import { GameScreen, LevelId, GameState } from "./game/types";
import MainMenu from "./game/MainMenu";
import LevelSelect from "./game/LevelSelect";
import GameEngine from "./game/GameEngine";
import GameOver from "./game/GameOver";
import LevelComplete from "./game/LevelComplete";

const INITIAL_STATE: GameState = {
  screen: "menu",
  currentLevel: 1,
  stress: 0,
  completedLevels: new Set(),
  score: 0,
};

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const goToMenu = useCallback(() => {
    setState(s => ({ ...s, screen: "menu", stress: 0 }));
  }, []);

  const goToLevelSelect = useCallback(() => {
    setState(s => ({ ...s, screen: "level-select", stress: 0 }));
  }, []);

  const startLevel = useCallback((id: LevelId) => {
    setState(s => ({ ...s, screen: "playing", currentLevel: id, stress: 0 }));
  }, []);

  const onWin = useCallback(() => {
    setState(s => ({
      ...s,
      screen: "level-complete",
      completedLevels: new Set([...s.completedLevels, s.currentLevel]),
      score: s.score + Math.max(0, 1000 - Math.floor(s.stress * 10)),
    }));
  }, []);

  const onLose = useCallback((reason: string) => {
    setState(s => ({ ...s, screen: "game-over" }));
  }, []);

  const onStressChange = useCallback((delta: number) => {
    setState(s => {
      const newStress = Math.min(100, Math.max(0, s.stress + delta));
      if (newStress >= 100) {
        return { ...s, stress: 100, screen: "game-over" };
      }
      return { ...s, stress: newStress };
    });
  }, []);

  const nextLevel = useCallback(() => {
    setState(s => {
      const next = (s.currentLevel + 1) as LevelId;
      if (next > 12) return { ...s, screen: "level-select" };
      return { ...s, screen: "playing", currentLevel: next, stress: 0 };
    });
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-background relative">
      <div className="scanline" />
      {state.screen === "menu" && (
        <MainMenu onPlay={goToLevelSelect} />
      )}
      {state.screen === "level-select" && (
        <LevelSelect
          completedLevels={state.completedLevels}
          score={state.score}
          onSelectLevel={startLevel}
          onBack={goToMenu}
        />
      )}
      {state.screen === "playing" && (
        <GameEngine
          levelId={state.currentLevel}
          stress={state.stress}
          onStressChange={onStressChange}
          onWin={onWin}
          onLose={onLose}
          onQuit={goToLevelSelect}
        />
      )}
      {state.screen === "level-complete" && (
        <LevelComplete
          levelId={state.currentLevel}
          stress={state.stress}
          score={state.score}
          onNext={nextLevel}
          onLevelSelect={goToLevelSelect}
        />
      )}
      {state.screen === "game-over" && (
        <GameOver
          levelId={state.currentLevel}
          onRetry={() => startLevel(state.currentLevel)}
          onLevelSelect={goToLevelSelect}
        />
      )}
    </div>
  );
}
