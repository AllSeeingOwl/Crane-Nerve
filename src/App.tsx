import { useState } from "react";
import MainMenu from "./pages/MainMenu";
import LevelSelect from "./pages/LevelSelect";
import GameEngine from "./components/game/GameEngine";
import LevelComplete from "./pages/LevelComplete";
import GameOver from "./pages/GameOver";
import { GameScreen, LevelId } from "./types/types";

export default function App() {
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [currentLevel, setCurrentLevel] = useState<LevelId>(1);
  const [score, setScore] = useState<number>(0);
  const [stress, setStress] = useState<number>(0);
  const [completedLevels, setCompletedLevels] = useState<Set<LevelId>>(new Set());

  const handlePlay = () => setScreen("level-select");
  const handleSelectLevel = (id: LevelId) => {
    setCurrentLevel(id);
    setStress(0);
    setScreen("playing");
  };
  const handleLevelWin = () => {
    setCompletedLevels((prev) => new Set(prev).add(currentLevel));
    setScore((prev) => prev + (100 - stress) * 10);
    setScreen("level-complete");
  };
  const handleLevelLose = (reason: string) => setScreen("game-over");
  const handleQuit = () => setScreen("level-select");

  return (
    <>
      {screen === "menu" && <MainMenu onPlay={handlePlay} />}
      {screen === "level-select" && (
        <LevelSelect
          completedLevels={completedLevels}
          score={score}
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen("menu")}
        />
      )}
      {screen === "playing" && (
        <GameEngine
          levelId={currentLevel}
          stress={stress}
          onStressChange={(delta) => setStress((s) => Math.max(0, Math.min(100, s + delta)))}
          onWin={handleLevelWin}
          onLose={handleLevelLose}
          onQuit={handleQuit}
        />
      )}
      {screen === "level-complete" && (
        <LevelComplete
          levelId={currentLevel}
          stress={stress}
          score={score}
          onNext={() => setScreen("level-select")}
          onLevelSelect={() => setScreen("level-select")}
        />
      )}
      {screen === "game-over" && (
        <GameOver
          levelId={currentLevel}
          onRetry={() => {
            setStress(0);
            setScreen("playing");
          }}
          onLevelSelect={() => setScreen("level-select")}
        />
      )}
    </>
  );
}
