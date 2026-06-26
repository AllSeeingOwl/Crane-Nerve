import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface VignetteScene {
  name: string;
  duration: number;
  draw: (ctx: CanvasRenderingContext2D, t: number, phase: number) => void;
}

function drawStars(ctx: CanvasRenderingContext2D, seed: number) {
  const stars = [
    [30, 20],
    [80, 15],
    [120, 35],
    [60, 50],
    [150, 10],
    [200, 28],
    [250, 18],
    [300, 40],
    [350, 12],
    [180, 55],
    [320, 30],
    [90, 65],
    [270, 50],
    [140, 75],
    [380, 22],
  ];
  ctx.fillStyle = "rgba(200,220,255,0.6)";
  stars.forEach(([x, y]) => {
    const flicker = 0.4 + 0.6 * Math.abs(Math.sin(seed * 0.3 + x * 0.05));
    ctx.globalAlpha = flicker;
    ctx.fillRect(x, y, 1, 1);
  });
  ctx.globalAlpha = 1;
}

const SCENES: VignetteScene[] = [
  {
    name: "Dark Water",
    duration: 30,
    draw(ctx, t, phase) {
      const { width, height } = ctx.canvas;
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.55);
      sky.addColorStop(0, "#020810");
      sky.addColorStop(1, "#0a1625");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height * 0.55);

      drawStars(ctx, t);

      // Moon
      ctx.beginPath();
      ctx.arc(360, 30, 15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,210,230,0.85)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(366, 28, 13, 0, Math.PI * 2);
      ctx.fillStyle = "#020810";
      ctx.fill();

      // Water surface
      const water = ctx.createLinearGradient(0, height * 0.55, 0, height);
      water.addColorStop(0, "#0d1f35");
      water.addColorStop(1, "#060f1a");
      ctx.fillStyle = water;
      ctx.fillRect(0, height * 0.55, width, height * 0.45);

      // Moon reflection ripple
      for (let i = 0; i < 6; i++) {
        const yOff = height * 0.58 + i * 6 + Math.sin(t * 1.5 + i) * 2;
        const w = 20 - i * 2;
        ctx.fillStyle = `rgba(180,195,220,${0.15 - i * 0.02})`;
        ctx.fillRect(width * 0.88 - w / 2, yOff, w, 1.5);
      }

      // Ripples from the figure's entry point
      const rippleAge = (phase % 8) / 8;
      if (rippleAge < 0.7) {
        const r = rippleAge * 60 + 10;
        ctx.beginPath();
        ctx.ellipse(width * 0.38, height * 0.62, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100,150,200,${0.4 * (1 - rippleAge / 0.7)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Figure silhouette — slowly sinking
      const sinkProgress = Math.min(1, phase / 20);
      const figureY = height * 0.52 + sinkProgress * height * 0.12;
      const figureVisible = sinkProgress < 0.95;
      if (figureVisible) {
        ctx.fillStyle = `rgba(5,8,15,${1 - sinkProgress * 0.8})`;
        // Body
        ctx.fillRect(width * 0.36, figureY - 20, 12, 24);
        // Head
        ctx.beginPath();
        ctx.arc(width * 0.36 + 6, figureY - 24, 7, 0, Math.PI * 2);
        ctx.fill();
        // Arms out
        const armAngle = Math.sin(phase * 2) * 0.4 + 0.3;
        ctx.save();
        ctx.translate(width * 0.36 + 6, figureY - 12);
        ctx.rotate(-armAngle);
        ctx.fillRect(-16, -2, 14, 3);
        ctx.rotate(armAngle * 2);
        ctx.fillRect(2, -2, 14, 3);
        ctx.restore();
      }

      // Dark vignette frame
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.2,
        width / 2,
        height / 2,
        height * 0.85,
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0,2,5,0.75)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    name: "High Voltage",
    duration: 25,
    draw(ctx, t, phase) {
      const { width, height } = ctx.canvas;
      // Overcast sky
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#1a1c22");
      sky.addColorStop(0.7, "#2a2c35");
      sky.addColorStop(1, "#0a0c10");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Clouds
      ctx.fillStyle = "rgba(40,42,55,0.7)";
      [
        [60, 30, 80, 25],
        [200, 20, 100, 30],
        [350, 35, 70, 22],
      ].forEach(([x, y, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ground / field
      const ground = ctx.createLinearGradient(0, height * 0.65, 0, height);
      ground.addColorStop(0, "#1a2010");
      ground.addColorStop(1, "#0a1008");
      ctx.fillStyle = ground;
      ctx.fillRect(0, height * 0.65, width, height * 0.35);

      // Pylon silhouettes
      const drawPylon = (cx: number, h: number, scale: number) => {
        ctx.fillStyle = `rgba(15,17,22,${0.9 * scale})`;
        // Main structure
        ctx.beginPath();
        ctx.moveTo(cx, height * 0.65 - h);
        ctx.lineTo(cx - 5 * scale, height * 0.65);
        ctx.lineTo(cx + 5 * scale, height * 0.65);
        ctx.closePath();
        ctx.fill();
        // Cross arms
        [0.3, 0.55, 0.75].forEach((frac) => {
          const y = height * 0.65 - h * (1 - frac);
          const w = 20 * scale * (1 - frac * 0.4);
          ctx.fillRect(cx - w, y - 2, w * 2, 3 * scale);
          // Insulators
          ctx.fillStyle = `rgba(30,30,40,${0.8 * scale})`;
          ctx.fillRect(cx - w - 3, y - 4, 4, 7);
          ctx.fillRect(cx + w - 1, y - 4, 4, 7);
          ctx.fillStyle = `rgba(15,17,22,${0.9 * scale})`;
        });
      };

      drawPylon(80, 120, 1);
      drawPylon(230, 140, 1.1);
      drawPylon(380, 100, 0.85);

      // Electric arcs / sparks
      const sparkOn = Math.sin(t * 8) > 0.5;
      const sparkOn2 = Math.sin(t * 12 + 1.5) > 0.7;
      if (sparkOn) {
        ctx.strokeStyle = "rgba(180,200,255,0.9)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgba(100,150,255,1)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(80, height * 0.65 - 120 * 0.7);
        ctx.lineTo(75 + Math.random() * 10, height * 0.65 - 100);
        ctx.lineTo(230, height * 0.65 - 140 * 0.7);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      if (sparkOn2) {
        ctx.strokeStyle = "rgba(220,230,255,0.7)";
        ctx.lineWidth = 1;
        ctx.shadowColor = "rgba(150,180,255,1)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(230, height * 0.65 - 140 * 0.55);
        ctx.lineTo(222, height * 0.65 - 100);
        ctx.lineTo(380, height * 0.65 - 100 * 0.55);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Warning sign
      ctx.fillStyle = "rgba(220,180,0,0.7)";
      ctx.beginPath();
      ctx.moveTo(168, 85);
      ctx.lineTo(178, 65);
      ctx.lineTo(188, 85);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(20,18,10,0.9)";
      ctx.fillRect(175, 72, 2, 8);
      ctx.fillRect(175, 82, 2, 2);

      // Vignette
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.15,
        width / 2,
        height / 2,
        height * 0.8,
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0,0,2,0.8)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    name: "Dark Road",
    duration: 35,
    draw(ctx, t, phase) {
      const { width, height } = ctx.canvas;
      // Night sky
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.5);
      sky.addColorStop(0, "#010308");
      sky.addColorStop(1, "#080c18");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height * 0.5);

      drawStars(ctx, t * 0.5);

      // Road in perspective
      ctx.fillStyle = "#0d0e10";
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.lineTo(width * 0.65, height * 0.5);
      ctx.lineTo(width * 0.35, height * 0.5);
      ctx.closePath();
      ctx.fill();

      // Road markings
      for (let i = 0; i < 6; i++) {
        const prog = (i / 6 + ((t * 0.04) % (1 / 6))) % 1;
        const yp = height * 0.5 + prog * height * 0.5;
        const xCenter = width * 0.5;
        const wMark = 4 + prog * 12;
        const hMark = 6 + prog * 14;
        ctx.fillStyle = `rgba(60,62,70,${prog * 0.6})`;
        ctx.fillRect(xCenter - wMark / 2, yp, wMark, hMark);
      }

      // Tree silhouettes on sides
      const drawTree = (x: number, y: number, scale: number) => {
        ctx.fillStyle = `rgba(5,8,5,${0.95})`;
        ctx.fillRect(x - 3 * scale, y, 6 * scale, 30 * scale);
        ctx.beginPath();
        ctx.moveTo(x, y - 40 * scale);
        ctx.lineTo(x - 18 * scale, y + 10 * scale);
        ctx.lineTo(x + 18 * scale, y + 10 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 55 * scale);
        ctx.lineTo(x - 13 * scale, y - 15 * scale);
        ctx.lineTo(x + 13 * scale, y - 15 * scale);
        ctx.closePath();
        ctx.fill();
      };

      [
        [30, height * 0.7, 0.9],
        [10, height * 0.8, 1.1],
        [45, height * 0.92, 1.3],
        [width - 30, height * 0.7, 0.9],
        [width - 10, height * 0.8, 1.1],
        [width - 45, height * 0.92, 1.3],
        [70, height * 0.62, 0.6],
        [width - 70, height * 0.62, 0.6],
      ].forEach(([x, y, s]) => drawTree(x as number, y as number, s as number));

      // Headlights approaching
      const headlightDist = (phase % 30) / 30;
      const hX = width * 0.5;
      const hY = height * 0.5 + headlightDist * height * 0.5;
      const hSize = 5 + headlightDist * 30;
      if (headlightDist < 0.98) {
        ctx.shadowColor = "rgba(220,240,255,0.8)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = `rgba(200,220,255,${0.6 + headlightDist * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(
          hX - hSize * 0.8,
          hY,
          hSize * 0.4,
          hSize * 0.2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(
          hX + hSize * 0.8,
          hY,
          hSize * 0.4,
          hSize * 0.2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Light cone
        ctx.fillStyle = `rgba(200,220,255,${0.04 + headlightDist * 0.03})`;
        ctx.beginPath();
        ctx.moveTo(hX - hSize * 0.8, hY);
        ctx.lineTo(hX - width * 0.3, height);
        ctx.lineTo(hX + width * 0.3, height);
        ctx.lineTo(hX + hSize * 0.8, hY);
        ctx.closePath();
        ctx.fill();
      }

      // Standing figure in road (doesn't move)
      const figX = width * 0.5;
      const figY = height * 0.56;
      ctx.fillStyle = "rgba(5,6,8,0.95)";
      ctx.fillRect(figX - 5, figY - 25, 10, 28);
      ctx.beginPath();
      ctx.arc(figX, figY - 30, 7, 0, Math.PI * 2);
      ctx.fill();

      // Vignette
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.1,
        width / 2,
        height / 2,
        height * 0.85,
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    },
  },
];

interface WindowVignetteProps {
  position: [number, number, number];
  size: [number, number];
}

export default function WindowVignette({
  position,
  size,
}: WindowVignetteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const timeRef = useRef(0);
  const sceneIdxRef = useRef(0);
  const sceneTimeRef = useRef(0);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 280;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    textureRef.current = tex;
    return () => {
      tex.dispose();
    };
  }, []);

  useFrame((_, delta) => {
    if (!canvasRef.current || !textureRef.current || !meshRef.current) return;
    timeRef.current += delta;
    sceneTimeRef.current += delta;

    const scene = SCENES[sceneIdxRef.current];
    if (sceneTimeRef.current >= scene.duration) {
      sceneIdxRef.current = (sceneIdxRef.current + 1) % SCENES.length;
      sceneTimeRef.current = 0;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const currentScene = SCENES[sceneIdxRef.current];
    currentScene.draw(ctx, timeRef.current, sceneTimeRef.current);

    textureRef.current.needsUpdate = true;

    // Apply texture to mesh
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (!mat.map) mat.map = textureRef.current;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial />
    </mesh>
  );
}

export { SCENES };
