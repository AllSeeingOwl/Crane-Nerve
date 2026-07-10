import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { LevelId, LEVELS } from "@/types/types";
import GameUI from "./GameUI";
import WindowDistraction from "./WindowDistraction";
import DoctorsOffice3D from "./DoctorsOffice3D";
import { Level1Olfactory } from "../levels/Level1Olfactory";
import { Level2Optic } from "../levels/Level2Optic";
import { Level3EyeMovement } from "../levels/Level3EyeMovement";
import { Level4Trigeminal } from "../levels/Level4Trigeminal";
import { Level5FacialNerve } from "../levels/Level5FacialNerve";
import { Level6Tuning } from "../levels/Level6Tuning";
import { Level7GagReflex } from "../levels/Level7GagReflex";
import { Level8Accessory } from "../levels/Level8Accessory";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { cameraState } from "@/lib/cameraState";
import { Level9Hypoglossal } from "../levels/Level9Hypoglossal";
import { Level10Crisis } from "../levels/Level10Crisis";
import { Level11NightShift } from "../levels/Level11NightShift";
import { Level12TheDebrief } from "../levels/Level12TheDebrief";

interface Props {
  levelId: LevelId;
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
  onQuit: () => void;
}

interface LevelProps {
  stress: number;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

export default function GameEngine({
  levelId,
  stress,
  onStressChange,
  onWin,
  onLose,
  onQuit,
}: Props) {
  const level = LEVELS.find((l) => l.id === levelId)!;
  const levelProps: LevelProps = { stress, onStressChange, onWin, onLose };

  useAmbientAudio(true);

  // Feed mouse position into the shared camera state so the R3F rig can read it
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      cameraState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      cameraState.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden pointer-events-auto">
      {/* ── 3D Doctor's Office — full-screen background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          shadows
          camera={{ position: [0, 1.9, 6.2], fov: 62, near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "hsl(210,18%,11%)" }}
        >
          <Suspense fallback={null}>
            <DoctorsOffice3D />
          </Suspense>
        </Canvas>
      </div>

      {/* ── Level UI — overlays the 3D scene ── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {levelId === 1 && <Level1Olfactory {...levelProps} />}
        {levelId === 2 && <Level2Optic {...levelProps} />}
        {levelId === 3 && <Level3EyeMovement {...levelProps} />}
        {levelId === 4 && <Level4Trigeminal {...levelProps} />}
        {levelId === 5 && <Level5FacialNerve {...levelProps} />}
        {levelId === 6 && <Level6Tuning {...levelProps} />}
        {levelId === 7 && <Level7GagReflex {...levelProps} />}
        {levelId === 8 && <Level8Accessory {...levelProps} />}
        {levelId === 9 && <Level9Hypoglossal {...levelProps} />}
        {levelId === 10 && <Level10Crisis {...levelProps} />}
        {levelId === 11 && <Level11NightShift {...levelProps} />}
        {levelId === 12 && <Level12TheDebrief {...levelProps} />}
      </div>

      {/* ── Window of Distraction — floats bottom-right ── */}
      <WindowDistraction />

      {/* ── HUD — always topmost ── */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <GameUI level={level} stress={stress} onQuit={onQuit} />
      </div>
    </div>
  );
}
