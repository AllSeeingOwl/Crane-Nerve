# Reference: GameEngine.tsx

This file contains the original React/TypeScript logic that needs to be ported to Godot GDScript.

## Original Code

```typescript
import { Suspense, useEffect, useMemo, useRef, useCallback } from "react";
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
  stressRef: React.RefObject<number>;
  onStressChange: (delta: number) => void;
  onWin: () => void;
  onLose: (reason: string) => void;
}

const LEVEL_LOSE_REASONS: Record<number, string> = {
  1: "Patient got too stressed from the smells!",
  2: "Patient got too stressed from struggling to see!",
  3: "Patient got too stressed during the eye exam!",
  4: "Patient couldn't tolerate the facial exam!",
  5: "Patient couldn't follow the facial nerve commands!",
  6: "Patient became overwhelmed by the hearing exam!",
  7: "Patient got too stressed from the gag reflex test!",
  8: "Patient got too stressed from the resistance tests!",
  9: "Patient got too stressed from the tongue examination!",
  10: "Total systemic failure! The crisis was too much.",
};

export default function GameEngine({
  levelId,
  stress,
  onStressChange,
  onWin,
  onLose,
  onQuit,
}: Props) {
  const level = LEVELS[levelId - 1];

  const stressRef = useRef(stress);
  useEffect(() => {
    stressRef.current = stress;
  }, [stress]);

  useEffect(() => {
    if (stress >= 100 && levelId <= 10) {
      onLose(LEVEL_LOSE_REASONS[levelId] || "Patient got too stressed!");
    }
  }, [stress, levelId, onLose]);

  // ⚡ BOLT OPTIMIZATION:
  // App.tsx passes inline functions that change reference on every render.
  // Because stress changes at 60fps, these callbacks recreate constantly,
  // forcing all child levels to tear down their requestAnimationFrame
  // useEffects 60 times a second!
  // We use the "latest ref" pattern to provide stable callbacks.
  const onStressChangeRef = useRef(onStressChange);
  const onWinRef = useRef(onWin);
  const onLoseRef = useRef(onLose);

  useEffect(() => {
    onStressChangeRef.current = onStressChange;
    onWinRef.current = onWin;
    onLoseRef.current = onLose;
  }, [onStressChange, onWin, onLose]);

  const stableOnStressChange = useCallback((delta: number) => {
    onStressChangeRef.current(delta);
  }, []);

  const stableOnWin = useCallback(() => {
    onWinRef.current();
  }, []);

  const stableOnLose = useCallback((reason: string) => {
    onLoseRef.current(reason);
  }, []);

  const levelProps: LevelProps = useMemo(
    () => ({
      stressRef,
      onStressChange: stableOnStressChange,
      onWin: stableOnWin,
      onLose: stableOnLose,
    }),
    [stableOnStressChange, stableOnWin, stableOnLose],
  );

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

  // ⚡ BOLT OPTIMIZATION:
  // Memoize heavy sibling components that don't depend on the high-frequency `stress` state.
  // This prevents React from diffing the huge R3F canvas tree 60 times a second.
  const backgroundCanvas = useMemo(
    () => (
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
    ),
    [],
  );

  const windowDistraction = useMemo(() => <WindowDistraction />, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden pointer-events-auto">
      {/* ── 3D Doctor's Office — full-screen background ── */}
      {backgroundCanvas}

      {/* ── Level UI — overlays the 3D scene ── */}
      {useMemo(
        () => (
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
        ),
        [levelId, levelProps],
      )}

      {/* ── Window of Distraction — floats bottom-right ── */}
      {windowDistraction}

      {/* ── HUD — always topmost ── */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <GameUI level={level} stress={stress} onQuit={onQuit} />
      </div>
    </div>
  );
}

```
