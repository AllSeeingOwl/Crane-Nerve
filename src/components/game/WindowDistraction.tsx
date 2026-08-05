import { useRef, useEffect, useState } from "react";
import { fastSin } from "@/lib/mathLUT";

interface VignetteDrawFn {
  (ctx: CanvasRenderingContext2D, t: number, phase: number): void;
}

function drawDarkWater(
  ctx: CanvasRenderingContext2D,
  t: number,
  phase: number,
) {
  const { width, height } = ctx.canvas;
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.55);
  sky.addColorStop(0, "#020810");
  sky.addColorStop(1, "#0a1625");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height * 0.55);

  // Stars
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
  ];
  stars.forEach(([x, y]) => {
    ctx.fillStyle = `rgba(200,220,255,${0.3 + 0.5 * Math.abs(fastSin(t * 0.3 + x * 0.1))})`;
    ctx.fillRect(x % width, y, 1.5, 1.5);
  });

  // Moon
  ctx.beginPath();
  ctx.arc(width * 0.88, 22, 12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(200,210,230,0.8)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width * 0.88 + 5, 20, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#020810";
  ctx.fill();

  // Water
  const water = ctx.createLinearGradient(0, height * 0.55, 0, height);
  water.addColorStop(0, "#0d1f35");
  water.addColorStop(1, "#060f1a");
  ctx.fillStyle = water;
  ctx.fillRect(0, height * 0.55, width, height);

  // Ripples
  const ra = (phase % 7) / 7;
  if (ra < 0.8) {
    const r = ra * 50 + 8;
    ctx.beginPath();
    ctx.ellipse(width * 0.4, height * 0.64, r, r * 0.28, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(100,160,210,${0.35 * (1 - ra / 0.8)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Figure sinking
  const sink = Math.min(1, phase / 18);
  const fy = height * 0.52 + sink * height * 0.15;
  if (sink < 0.9) {
    ctx.fillStyle = `rgba(4,6,12,${1 - sink * 0.9})`;
    ctx.fillRect(width * 0.38, fy - 18, 10, 22);
    ctx.beginPath();
    ctx.arc(width * 0.38 + 5, fy - 22, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vignette
  const v = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.2,
    width / 2,
    height / 2,
    height * 0.85,
  );
  v.addColorStop(0, "transparent");
  v.addColorStop(1, "rgba(0,2,5,0.75)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, width, height);
}

function drawHighVoltage(
  ctx: CanvasRenderingContext2D,
  t: number,
  _phase: number,
) {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = "#141620";
  ctx.fillRect(0, 0, width, height);

  // Cloudy sky bands
  [
    [0, "#1a1c25"],
    [0.3, "#22242e"],
    [0.6, "#181a22"],
  ].forEach(([y, c]) => {
    ctx.fillStyle = c as string;
    ctx.fillRect(0, (y as number) * height, width, height * 0.32);
  });

  // Ground
  const g = ctx.createLinearGradient(0, height * 0.65, 0, height);
  g.addColorStop(0, "#1a2010");
  g.addColorStop(1, "#0a1008");
  ctx.fillStyle = g;
  ctx.fillRect(0, height * 0.65, width, height);

  // Pylons
  const pylon = (cx: number, h: number) => {
    ctx.fillStyle = "rgba(12,14,18,0.95)";
    ctx.beginPath();
    ctx.moveTo(cx, height * 0.65 - h);
    ctx.lineTo(cx - 5, height * 0.65);
    ctx.lineTo(cx + 5, height * 0.65);
    ctx.closePath();
    ctx.fill();
    [0.3, 0.55, 0.78].forEach((f) => {
      const y = height * 0.65 - h * (1 - f);
      const w = 22 * (1 - f * 0.4);
      ctx.fillRect(cx - w, y - 2, w * 2, 3);
    });
  };
  pylon(60, 100);
  pylon(180, 120);
  pylon(330, 95);

  // Spark
  if (fastSin(t * 9) > 0.6) {
    ctx.strokeStyle = "rgba(180,200,255,0.9)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(120,160,255,1)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(60, height * 0.65 - 70);
    ctx.lineTo(58, height * 0.65 - 50);
    ctx.lineTo(180, height * 0.65 - 84);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  if (fastSin(t * 13 + 2) > 0.75) {
    ctx.strokeStyle = "rgba(200,220,255,0.7)";
    ctx.lineWidth = 1;
    ctx.shadowColor = "rgba(150,180,255,1)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(180, height * 0.65 - 78);
    ctx.lineTo(175, height * 0.65 - 55);
    ctx.lineTo(330, height * 0.65 - 66);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Warning triangle
  ctx.fillStyle = "rgba(220,180,0,0.75)";
  ctx.beginPath();
  ctx.moveTo(140, 70);
  ctx.lineTo(148, 54);
  ctx.lineTo(156, 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(20,18,10,0.9)";
  ctx.fillRect(147, 59, 2, 6);
  ctx.fillRect(147, 67, 2, 2);

  const v = ctx.createRadialGradient(
    width / 2,
    height / 2,
    40,
    width / 2,
    height / 2,
    width * 0.75,
  );
  v.addColorStop(0, "transparent");
  v.addColorStop(1, "rgba(0,0,2,0.82)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, width, height);
}

function drawDarkRoad(ctx: CanvasRenderingContext2D, t: number, phase: number) {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = "#010308";
  ctx.fillRect(0, 0, width, height);

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.52);
  sky.addColorStop(0, "#010308");
  sky.addColorStop(1, "#080c18");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height * 0.52);

  // Stars
  [
    [40, 15],
    [90, 8],
    [160, 22],
    [220, 12],
    [300, 18],
    [360, 8],
    [130, 35],
    [280, 28],
  ].forEach(([x, y]) => {
    ctx.fillStyle = `rgba(200,220,255,${0.3 + 0.4 * Math.abs(fastSin(t * 0.4 + x * 0.07))})`;
    ctx.fillRect(x, y, 1, 1);
  });

  // Road
  ctx.fillStyle = "#0c0d10";
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, height);
  ctx.lineTo(width * 0.63, height * 0.52);
  ctx.lineTo(width * 0.37, height * 0.52);
  ctx.closePath();
  ctx.fill();

  // Road markings
  for (let i = 0; i < 5; i++) {
    const p = (i / 5 + ((t * 0.035) % 0.2)) % 1;
    const yp = height * 0.52 + p * height * 0.48;
    const xc = width * 0.5;
    const wm = 3 + p * 10;
    const hm = 5 + p * 12;
    ctx.fillStyle = `rgba(55,58,65,${p * 0.5})`;
    ctx.fillRect(xc - wm / 2, yp, wm, hm);
  }

  // Trees
  const tree = (x: number, y: number, s: number) => {
    ctx.fillStyle = "rgba(4,7,4,0.96)";
    ctx.fillRect(x - 3 * s, y, 6 * s, 28 * s);
    ctx.beginPath();
    ctx.moveTo(x, y - 36 * s);
    ctx.lineTo(x - 16 * s, y + 8 * s);
    ctx.lineTo(x + 16 * s, y + 8 * s);
    ctx.closePath();
    ctx.fill();
  };
  [
    [25, height * 0.68, 0.85],
    [5, height * 0.78, 1.05],
    [50, height * 0.9, 1.2],
    [width - 25, height * 0.68, 0.85],
    [width - 5, height * 0.78, 1.05],
    [width - 50, height * 0.9, 1.2],
  ].forEach(([x, y, s]) => tree(x as number, y as number, s as number));

  // Approaching headlights
  const hd = (phase % 28) / 28;
  const hy = height * 0.52 + hd * height * 0.48;
  const hs = 4 + hd * 28;
  const hcx = width * 0.5;
  if (hd < 0.97) {
    ctx.shadowColor = "rgba(210,230,255,0.9)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = `rgba(200,220,255,${0.5 + hd * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(hcx - hs * 0.85, hy, hs * 0.35, hs * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hcx + hs * 0.85, hy, hs * 0.35, hs * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(210,230,255,${0.03 + hd * 0.025})`;
    ctx.beginPath();
    ctx.moveTo(hcx - hs * 0.85, hy);
    ctx.lineTo(hcx - width * 0.28, height);
    ctx.lineTo(hcx + width * 0.28, height);
    ctx.lineTo(hcx + hs * 0.85, hy);
    ctx.closePath();
    ctx.fill();
  }

  // Figure in road
  ctx.fillStyle = "rgba(5,5,8,0.95)";
  ctx.fillRect(width * 0.5 - 5, height * 0.56 - 24, 10, 26);
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.56 - 28, 6, 0, Math.PI * 2);
  ctx.fill();

  const v = ctx.createRadialGradient(
    width / 2,
    height / 2,
    30,
    width / 2,
    height / 2,
    width * 0.75,
  );
  v.addColorStop(0, "transparent");
  v.addColorStop(1, "rgba(0,0,0,0.88)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, width, height);
}

const VIGNETTE_FNS: VignetteDrawFn[] = [
  drawDarkWater,
  drawHighVoltage,
  drawDarkRoad,
];
const VIGNETTE_NAMES = ["Dark Water", "High Voltage", "Dark Road"];
const VIGNETTE_DURATIONS = [30, 25, 35];

interface Props {
  className?: string;
}

export default function WindowDistraction({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const sceneRef = useRef(0);
  const sceneStartRef = useRef(0);
  const [sceneName, setSceneName] = useState(VIGNETTE_NAMES[0]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay showing so it doesn't immediately appear
    const t = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    startRef.current = performance.now();
    sceneStartRef.current = performance.now();

    const render = (now: number) => {
      const t = (now - startRef.current) / 1000;
      const phase = (now - sceneStartRef.current) / 1000;

      if (phase >= VIGNETTE_DURATIONS[sceneRef.current]) {
        sceneRef.current = (sceneRef.current + 1) % VIGNETTE_FNS.length;
        sceneStartRef.current = now;
        setSceneName(VIGNETTE_NAMES[sceneRef.current]);
      }

      VIGNETTE_FNS[sceneRef.current](ctx, t, phase);
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={`absolute z-20 select-none pointer-events-none ${className}`}
      style={{ bottom: 72, right: 24 }}
      aria-hidden="true"
    >
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(5,8,15,0.85)",
          boxShadow:
            "0 0 20px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "rgba(15,20,30,0.9)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "rgba(255,80,80,0.7)",
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
            }}
          >
            WINDOW — {sceneName.toUpperCase()}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={240}
          height={160}
          style={{ display: "block" }}
        />
      </div>
      <p
        style={{
          fontSize: 8,
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          marginTop: 3,
          fontFamily: "monospace",
        }}
      >
        OUTSIDE. DO NOT LOOK.
      </p>
    </div>
  );
}
