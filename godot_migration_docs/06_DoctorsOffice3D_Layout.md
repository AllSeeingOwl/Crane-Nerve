# Reference: DoctorsOffice3D.tsx

This file contains the original React/TypeScript logic that needs to be ported to Godot GDScript.

## Original Code

```typescript
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import WindowVignette from "./WindowVignette";
import { cameraState } from "@/lib/cameraState";
import { fastSin, fastCos } from "@/lib/mathLUT";

/** Smooth parallax: camera drifts toward mouse position, always looking at the patient */
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    const tx = 0.15 + cameraState.mouseX * 0.55;
    const ty = 1.9 - cameraState.mouseY * 0.22;
    camera.position.x += (tx - camera.position.x) * 0.032;
    camera.position.y += (ty - camera.position.y) * 0.032;
    // Always look at the sitting patient's face area
    camera.lookAt(0.15, 1.75, 0);
  });
  return null;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

const SKIN = "#c9845a";
const SKIN2 = "#d4956a";
const COAT = "#eef2f6";
const SCRUB = "#5a8fae";
const HAIR_D = "#2a1a0a";
const DARK_TROUSER = "#2c3540";
const METAL = "#8a9ab0";

function SphereHead({
  pos,
  skinColor = SKIN,
}: {
  pos: [number, number, number];
  skinColor?: string;
}) {
  return (
    <>
      <mesh position={pos} castShadow>
        <sphereGeometry args={[0.21, 20, 14]} />
        <meshStandardMaterial
          color={skinColor}
          roughness={0.75}
          metalness={0}
        />
      </mesh>
      {/* Hair cap */}
      <mesh position={[pos[0], pos[1] + 0.1, pos[2] - 0.02]} castShadow>
        <sphereGeometry
          args={[0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52]}
        />
        <meshStandardMaterial color={HAIR_D} roughness={1} />
      </mesh>
    </>
  );
}

/* ── Room ───────────────────────────────────────────────────────────── */
function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial
          color="#c4cdd4"
          roughness={0.55}
          metalness={0.06}
        />
      </mesh>
      {/* Tile grid */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh
          key={`fh-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[i * 2 - 8, 0.001, 0]}
        >
          <planeGeometry args={[0.025, 14]} />
          <meshStandardMaterial color="#aab4bc" roughness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`fv-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, i * 2 - 7]}
        >
          <planeGeometry args={[16, 0.025]} />
          <meshStandardMaterial color="#aab4bc" roughness={0.8} />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 2.9, -6.5]} receiveShadow>
        <boxGeometry args={[16, 5.8, 0.1]} />
        <meshStandardMaterial color="#e6e9ec" roughness={0.95} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-7.5, 2.9, 0]} receiveShadow>
        <boxGeometry args={[0.1, 5.8, 14]} />
        <meshStandardMaterial color="#dde2e6" roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh position={[7.5, 2.9, 0]} receiveShadow>
        <boxGeometry args={[0.1, 5.8, 14]} />
        <meshStandardMaterial color="#dde2e6" roughness={0.95} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 5.8, 0]}>
        <boxGeometry args={[16, 0.1, 14]} />
        <meshStandardMaterial color="#f0f2f4" roughness={1} />
      </mesh>
      {/* Ceiling light panels */}
      {[
        [-2.5, -1],
        [2.5, -1],
        [0, 2],
      ].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 5.72, z]}>
            <boxGeometry args={[1.8, 0.04, 0.75]} />
            <meshStandardMaterial
              color="#f8f8ff"
              emissive="#e8f0ff"
              emissiveIntensity={1.2}
              roughness={0.2}
            />
          </mesh>
          <pointLight
            position={[x, 5.3, z]}
            intensity={7}
            color="#f0f4ff"
            distance={9}
            decay={2}
          />
        </group>
      ))}
      {/* Baseboard */}
      <mesh position={[0, 0.07, -6.44]}>
        <boxGeometry args={[16, 0.14, 0.08]} />
        <meshStandardMaterial color="#c8cdd2" roughness={0.7} />
      </mesh>

      {/* Window frame — back wall right side */}
      <mesh position={[3.8, 3.1, -6.44]}>
        <boxGeometry args={[2.8, 2.1, 0.16]} />
        <meshStandardMaterial color={METAL} roughness={0.5} metalness={0.35} />
      </mesh>
      {/* Window glass */}
      <mesh position={[3.8, 3.1, -6.41]}>
        <boxGeometry args={[2.55, 1.85, 0.04]} />
        <meshStandardMaterial
          color="#8ab8d8"
          transparent
          opacity={0.3}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>
      {/* Window sill */}
      <mesh position={[3.8, 2.12, -6.25]}>
        <boxGeometry args={[2.9, 0.1, 0.32]} />
        <meshStandardMaterial color="#d0d5d8" roughness={0.5} />
      </mesh>
      {/* Window mullion */}
      <mesh position={[3.8, 3.1, -6.39]}>
        <boxGeometry args={[2.6, 0.06, 0.06]} />
        <meshStandardMaterial color={METAL} roughness={0.5} />
      </mesh>
      <mesh position={[3.8, 3.1, -6.39]}>
        <boxGeometry args={[0.06, 1.8, 0.06]} />
        <meshStandardMaterial color={METAL} roughness={0.5} />
      </mesh>

      {/* ── Snellen Eye Chart — back wall center-left ── */}
      <group position={[-1.8, 3.4, -6.42]}>
        {/* Chart background */}
        <mesh>
          <boxGeometry args={[0.8, 1.1, 0.04]} />
          <meshStandardMaterial
            color="#f8f6f0"
            roughness={0.9}
            emissive="#f5f0e8"
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Chart rows — stylized stripes */}
        {[0.42, 0.3, 0.18, 0.06, -0.06, -0.16, -0.25, -0.34].map((y, i) => (
          <mesh key={i} position={[0, y, 0.025]}>
            <boxGeometry args={[0.55 - i * 0.03, 0.018 - i * 0.001, 0.002]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
        ))}
        {/* Border */}
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[0.82, 1.12, 0.002]} />
          <meshStandardMaterial color="#888880" roughness={0.8} wireframe />
        </mesh>
      </group>

      {/* ── CN Nerve Diagram poster — left wall ── */}
      <group position={[-7.42, 2.8, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 1.0, 0.04]} />
          <meshStandardMaterial color="#e8e0d0" roughness={0.9} />
        </mesh>
        {/* Nerve lines decoration */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              fastCos((i / 12) * Math.PI * 2) * 0.3,
              fastSin((i / 12) * Math.PI * 2) * 0.28,
              0.025,
            ]}
          >
            <boxGeometry args={[0.26, 0.012, 0.002]} />
            <meshStandardMaterial color="#2a3a5a" roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.025]}>
          <cylinderGeometry args={[0.08, 0.08, 0.012, 20]} />
          <meshStandardMaterial color="#2a3a5a" roughness={0.8} />
        </mesh>
      </group>

      {/* Diploma frame */}
      <mesh position={[-6.5, 3.8, -6.42]}>
        <boxGeometry args={[0.7, 0.52, 0.04]} />
        <meshStandardMaterial color="#c8a870" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[-6.5, 3.8, -6.4]}>
        <boxGeometry args={[0.62, 0.44, 0.02]} />
        <meshStandardMaterial color="#f5f0e4" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ── Exam Table ─────────────────────────────────────────────────────── */
function ExamTable() {
  return (
    <group position={[0.2, 0, 0.3]}>
      {/* Table surface */}
      <mesh position={[0, 0.88, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.12, 1.0]} />
        <meshStandardMaterial
          color="#8fa0ae"
          roughness={0.4}
          metalness={0.18}
        />
      </mesh>
      {/* Paper roll on top */}
      <mesh position={[0, 0.96, 0]} receiveShadow>
        <boxGeometry args={[2.58, 0.02, 0.97]} />
        <meshStandardMaterial color="#f0ede6" roughness={0.9} />
      </mesh>
      {/* Edge padding */}
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[2.65, 0.05, 1.05]} />
        <meshStandardMaterial color="#506070" roughness={0.7} />
      </mesh>
      {/* Legs */}
      {[
        [-1.1, 0.44],
        [1.1, 0.44],
        [-1.1, -0.44],
        [1.1, -0.44],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.4, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.82, 8]} />
          <meshStandardMaterial
            color="#607080"
            roughness={0.3}
            metalness={0.65}
          />
        </mesh>
      ))}
      {/* Support bar */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[2.2, 0.04, 0.04]} />
        <meshStandardMaterial
          color="#607080"
          roughness={0.3}
          metalness={0.65}
        />
      </mesh>
    </group>
  );
}

/* ── Patient (sitting up) ───────────────────────────────────────────── */
function PatientCharacter() {
  const bodyRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!bodyRef.current) return;
    const s = 1 + fastSin(state.clock.elapsedTime * 0.65) * 0.018;
    bodyRef.current.scale.y = s;
  });

  return (
    <group position={[0.2, 0, 0.75]}>
      {/* Torso — scrub top */}
      <group ref={bodyRef}>
        <mesh position={[0, 1.52, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.55, 8, 16]} />
          <meshStandardMaterial color={SCRUB} roughness={0.85} />
        </mesh>
      </group>
      {/* Neck */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.11, 0.22, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.75} />
      </mesh>
      {/* Head */}
      <SphereHead pos={[0, 2.2, 0]} skinColor={SKIN} />
      {/* Eyes */}
      <mesh position={[-0.08, 2.22, 0.19]} castShadow>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      <mesh position={[0.08, 2.22, 0.19]} castShadow>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Eyebrows */}
      <mesh position={[-0.08, 2.3, 0.185]}>
        <boxGeometry args={[0.07, 0.015, 0.012]} />
        <meshStandardMaterial color="#3a2010" roughness={1} />
      </mesh>
      <mesh position={[0.08, 2.3, 0.185]}>
        <boxGeometry args={[0.07, 0.015, 0.012]} />
        <meshStandardMaterial color="#3a2010" roughness={1} />
      </mesh>
      {/* Flat mouth line */}
      <mesh position={[0, 2.07, 0.195]}>
        <boxGeometry args={[0.1, 0.014, 0.01]} />
        <meshStandardMaterial color="#8a4030" roughness={1} />
      </mesh>

      {/* Thighs — sitting, horizontal */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh
          key={i}
          position={[x, 1.04, 0.26]}
          rotation={[Math.PI * 0.45, 0, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.09, 0.38, 6, 12]} />
          <meshStandardMaterial color="#3a4858" roughness={0.9} />
        </mesh>
      ))}
      {/* Calves — hanging down */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.52, 0.56]}
          rotation={[Math.PI * 0.08, 0, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.075, 0.42, 6, 12]} />
          <meshStandardMaterial color="#3a4858" roughness={0.9} />
        </mesh>
      ))}
      {/* Shoes */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.22, 0.68]} castShadow>
          <boxGeometry args={[0.13, 0.1, 0.28]} />
          <meshStandardMaterial
            color="#1a1c22"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      ))}
      {/* Arms resting on thighs */}
      <mesh
        position={[-0.28, 1.45, 0.12]}
        rotation={[0.35, 0, 0.25]}
        castShadow
      >
        <capsuleGeometry args={[0.065, 0.4, 6, 12]} />
        <meshStandardMaterial color={SCRUB} roughness={0.85} />
      </mesh>
      <mesh
        position={[0.28, 1.45, 0.12]}
        rotation={[0.35, 0, -0.25]}
        castShadow
      >
        <capsuleGeometry args={[0.065, 0.4, 6, 12]} />
        <meshStandardMaterial color={SCRUB} roughness={0.85} />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.3, 1.22, 0.3]} castShadow>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 1.22, 0.3]} castShadow>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.8} />
      </mesh>

      {/* Patient label card on chest */}
      <mesh position={[-0.1, 1.62, 0.23]}>
        <boxGeometry args={[0.16, 0.1, 0.01]} />
        <meshStandardMaterial
          color="#e8f0f8"
          roughness={0.8}
          emissive="#c0d8f0"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

/* ── Doctor ─────────────────────────────────────────────────────────── */
function DoctorCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      fastSin(state.clock.elapsedTime * 0.42) * 0.007;
  });

  return (
    <group ref={groupRef} position={[-2.2, 0, 0.6]}>
      {/* Shoes */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.075, 0.06]} castShadow>
          <boxGeometry args={[0.18, 0.1, 0.3]} />
          <meshStandardMaterial
            color="#18181e"
            roughness={0.65}
            metalness={0.12}
          />
        </mesh>
      ))}
      {/* Trousers */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0]}>
          <capsuleGeometry args={[0.1, 0.65, 6, 12]} />
          <meshStandardMaterial color={DARK_TROUSER} roughness={0.9} />
        </mesh>
      ))}
      {/* White coat body */}
      <mesh position={[0, 1.28, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.62, 8, 16]} />
        <meshStandardMaterial color={COAT} roughness={0.88} />
      </mesh>
      {/* Shirt / tie suggestion */}
      <mesh position={[0, 1.26, 0.24]}>
        <boxGeometry args={[0.12, 0.52, 0.02]} />
        <meshStandardMaterial color="#b0c8e0" roughness={0.8} />
      </mesh>
      {/* Pocket */}
      <mesh position={[0.18, 1.42, 0.25]}>
        <boxGeometry args={[0.11, 0.09, 0.018]} />
        <meshStandardMaterial color="#dce8f0" roughness={0.9} />
      </mesh>
      {/* Pen in pocket */}
      <mesh position={[0.2, 1.47, 0.255]}>
        <cylinderGeometry args={[0.008, 0.008, 0.1, 6]} />
        <meshStandardMaterial color="#2244aa" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Left arm — extended toward patient */}
      <mesh position={[0.48, 1.14, 0.26]} rotation={[0.5, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.085, 0.44, 6, 12]} />
        <meshStandardMaterial color={COAT} roughness={0.88} />
      </mesh>
      {/* Left hand */}
      <mesh position={[0.72, 0.85, 0.44]} castShadow>
        <sphereGeometry args={[0.075, 10, 8]} />
        <meshStandardMaterial color={SKIN2} roughness={0.78} />
      </mesh>
      {/* Right arm — clipboard/notepad side */}
      <mesh position={[-0.42, 1.14, 0.05]} rotation={[0.2, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.085, 0.44, 6, 12]} />
        <meshStandardMaterial color={COAT} roughness={0.88} />
      </mesh>
      {/* Clipboard */}
      <mesh position={[-0.55, 0.82, 0.08]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.22, 0.3, 0.025]} />
        <meshStandardMaterial
          color="#c8a860"
          roughness={0.5}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[-0.55, 0.81, 0.095]}>
        <boxGeometry args={[0.19, 0.27, 0.01]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.11, 0.22, 12]} />
        <meshStandardMaterial color={SKIN2} roughness={0.75} />
      </mesh>
      {/* Head */}
      <SphereHead pos={[0, 1.99, 0]} skinColor={SKIN2} />
      {/* Eyes */}
      <mesh position={[-0.08, 2.01, 0.19]} castShadow>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      <mesh position={[0.08, 2.01, 0.19]} castShadow>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Glasses frames */}
      {[-0.09, 0.09].map((x, i) => (
        <mesh key={i} position={[x, 2.01, 0.205]}>
          <torusGeometry args={[0.048, 0.007, 6, 16]} />
          <meshStandardMaterial
            color="#2a2830"
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>
      ))}
      {/* Glasses bridge */}
      <mesh position={[0, 2.01, 0.21]}>
        <boxGeometry args={[0.04, 0.008, 0.008]} />
        <meshStandardMaterial
          color="#2a2830"
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>
      {/* Stethoscope */}
      <mesh position={[0, 1.55, 0.25]}>
        <torusGeometry args={[0.09, 0.012, 6, 14, Math.PI]} />
        <meshStandardMaterial
          color="#1e2a3a"
          roughness={0.35}
          metalness={0.8}
        />
      </mesh>
      <mesh position={[-0.09, 1.46, 0.24]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.01, 0.01, 0.14, 6]} />
        <meshStandardMaterial
          color="#1e2a3a"
          roughness={0.35}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

/* ── Medical Cabinet ────────────────────────────────────────────────── */
function MedicalCabinet() {
  return (
    <group position={[-6.0, 0, -3.5]}>
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 2.3, 0.55]} />
        <meshStandardMaterial
          color="#cdd5da"
          roughness={0.55}
          metalness={0.18}
        />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[1.2, 0.09, 0.6]} />
        <meshStandardMaterial color="#b8c0c8" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Door panel */}
      <mesh position={[0, 1.15, 0.285]}>
        <boxGeometry args={[1.12, 2.28, 0.015]} />
        <meshStandardMaterial
          color="#bec8d0"
          roughness={0.45}
          metalness={0.12}
        />
      </mesh>
      {/* Handle */}
      <mesh position={[0.32, 1.15, 0.3]}>
        <cylinderGeometry
          args={[0.015, 0.015, 0.22, 8]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <meshStandardMaterial color={METAL} roughness={0.25} metalness={0.9} />
      </mesh>
      {/* Items on top */}
      <mesh position={[-0.22, 2.52, 0]}>
        <cylinderGeometry args={[0.065, 0.085, 0.3, 14]} />
        <meshStandardMaterial
          color="#88c4e4"
          transparent
          opacity={0.72}
          roughness={0.08}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.18, 2.5, 0.04]}>
        <boxGeometry args={[0.18, 0.24, 0.12]} />
        <meshStandardMaterial color="#e8d8c0" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ── Doctor Stool ───────────────────────────────────────────────────── */
function DoctorStool() {
  return (
    <group position={[-3.2, 0, 1.8]}>
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.09, 18]} />
        <meshStandardMaterial color="#3a4a58" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.68, 8]} />
        <meshStandardMaterial
          color="#607080"
          roughness={0.35}
          metalness={0.65}
        />
      </mesh>
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <mesh
            key={i}
            position={[fastCos(r) * 0.24, 0.04, fastSin(r) * 0.24]}
            rotation={[0, -r, 0]}
          >
            <boxGeometry args={[0.42, 0.04, 0.06]} />
            <meshStandardMaterial
              color="#607080"
              roughness={0.35}
              metalness={0.65}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── EKG Monitor ────────────────────────────────────────────────────── */
function EKGMonitor() {
  const screenRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!screenRef.current) return;
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity =
      0.65 + fastSin(state.clock.elapsedTime * 1.8) * 0.15;
  });

  return (
    <group position={[5.2, 0, -1.8]}>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 1.7, 8]} />
        <meshStandardMaterial
          color="#4a5560"
          roughness={0.35}
          metalness={0.75}
        />
      </mesh>
      <mesh position={[0, 1.82, 0]} castShadow>
        <boxGeometry args={[0.58, 0.44, 0.2]} />
        <meshStandardMaterial
          color="#252e36"
          roughness={0.45}
          metalness={0.35}
        />
      </mesh>
      <mesh ref={screenRef} position={[0, 1.82, 0.11]}>
        <boxGeometry args={[0.5, 0.37, 0.008]} />
        <meshStandardMaterial
          color="#061410"
          emissive="#0a3820"
          emissiveIntensity={0.65}
          roughness={0.08}
        />
      </mesh>
      {/* EKG line on screen */}
      {[-0.08, 0, 0.08].map((y, i) => (
        <mesh key={i} position={[0, 1.82 + y, 0.116]}>
          <boxGeometry args={[0.44, 0.008, 0.001]} />
          <meshStandardMaterial
            color="#00cc66"
            emissive="#00aa44"
            emissiveIntensity={1}
            roughness={0.1}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.42, 0.08, 0.42]} />
        <meshStandardMaterial color="#3a4048" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ── IV Stand ───────────────────────────────────────────────────────── */
function IVStand() {
  return (
    <group position={[2.2, 0, 0.8]}>
      {/* Pole */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.8, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Hook */}
      <mesh position={[0, 2.85, 0]}>
        <torusGeometry args={[0.06, 0.014, 6, 12, Math.PI * 1.2]} />
        <meshStandardMaterial color={METAL} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* IV bag */}
      <mesh position={[0, 2.6, 0.04]}>
        <boxGeometry args={[0.18, 0.28, 0.06]} />
        <meshStandardMaterial
          color="#c0e4f8"
          transparent
          opacity={0.65}
          roughness={0.08}
          metalness={0.05}
        />
      </mesh>
      {/* Tube */}
      <mesh position={[0.04, 2.38, 0.04]} rotation={[0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.35, 6]} />
        <meshStandardMaterial
          color="#d0d8e0"
          transparent
          opacity={0.7}
          roughness={0.1}
        />
      </mesh>
      {/* Base wheels */}
      {[0, 90, 180, 270].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <mesh key={i} position={[fastCos(r) * 0.28, 0.05, fastSin(r) * 0.28]}>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
            <meshStandardMaterial
              color="#3a3a40"
              roughness={0.5}
              metalness={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function DoctorsOffice3D() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#ddeeff" />
      <directionalLight
        position={[2, 9, 5]}
        intensity={1.1}
        color="#f2f5ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={35}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />
      {/* Fill from left */}
      <directionalLight position={[-5, 5, 3]} intensity={0.4} color="#e0e8ff" />
      {/* Warm key on patient from front-right */}
      <pointLight
        position={[1.5, 3.5, 3.5]}
        intensity={4.5}
        color="#ffeedd"
        distance={7}
        decay={2}
      />
      {/* Window light — cool blue */}
      <pointLight
        position={[3.8, 3.1, -4.8]}
        intensity={2.5}
        color="#a0c8e8"
        distance={10}
        decay={2}
      />
      {/* EKG screen glow */}
      <pointLight
        position={[5.2, 1.82, 0.5]}
        intensity={0.6}
        color="#00cc66"
        distance={3}
        decay={2}
      />

      <CameraRig />
      <Room />
      <ExamTable />
      <PatientCharacter />
      <DoctorCharacter />
      <MedicalCabinet />
      <DoctorStool />
      <EKGMonitor />
      <IVStand />

      {/* Window of Distraction vignette */}
      <WindowVignette position={[3.8, 3.1, -6.38]} size={[2.52, 1.78]} />

      {/* Subtle atmospheric fog */}
      <fog attach="fog" args={["#c8d2dc", 14, 36]} />
    </>
  );
}

```
