import { useEffect, useRef } from 'react';

const COLS = 80;
const ROWS = 28;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

function charFrom(h: number): string | null {
  if (h > 0.85) return '@';
  if (h > 0.70) return '#';
  if (h > 0.55) return 'x';
  if (h > 0.40) return '*';
  if (h > 0.26) return '+';
  if (h > 0.13) return '.';
  return null;
}

interface FireCanvasProps {
  className?: string;
}

export default function FireCanvas({ className }: FireCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const heat = new Float32Array(COLS * ROWS);
    // Per-column intensity multiplier — gives each column a "personality"
    const colStrength = Float32Array.from({ length: COLS }, () =>
      0.7 + Math.random() * 0.3
    );

    let animId: number;
    let time = 0;
    let lastFrame = 0;
    let W = 0, H = 0, cw = 0, rh = 0, fs = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
      W = rect.width;
      H = rect.height;
      cw = W / COLS;
      rh = H / ROWS;
      fs = Math.max(8, Math.round(rh * 0.92));
    };

    const seed = (t: number) => {
      // Slowly evolve column strengths for organic pulsing
      for (let x = 0; x < COLS; x++) {
        colStrength[x] = Math.min(1.0, Math.max(0.5,
          colStrength[x] + (Math.random() - 0.5) * 0.04
        ));
      }

      for (let x = 0; x < COLS; x++) {
        const wave =
          0.15 * Math.sin((x / COLS) * Math.PI * 3.1 + t * 0.04) +
          0.08 * Math.sin((x / COLS) * Math.PI * 7.3 - t * 0.06) +
          0.05 * Math.sin((x / COLS) * Math.PI * 13 + t * 0.09);
        const base = (0.82 + wave) * colStrength[x] + Math.random() * 0.18;
        heat[(ROWS - 1) * COLS + x] = Math.min(1.0, base);
        heat[(ROWS - 2) * COLS + x] = Math.min(1.0, base * 0.96);
        heat[(ROWS - 3) * COLS + x] = Math.min(1.0, base * 0.90);
      }
    };

    const update = (t: number) => {
      // Slowly shifting wind
      const wind = Math.sin(t * 0.025) * 0.5 + Math.sin(t * 0.011) * 0.3;

      for (let y = 0; y < ROWS - 3; y++) {
        for (let x = 0; x < COLS; x++) {
          // Wider lateral spread (±2) + wind bias = distinct flame tongues
          const drift = Math.floor((Math.random() - 0.5) * 4) + (wind > 0 ? 1 : -1) * (Math.random() > 0.6 ? 1 : 0);
          const nx = Math.max(0, Math.min(COLS - 1, x + drift));
          const below = heat[(y + 1) * COLS + nx];

          // High variance decay = some columns shoot tall, others die fast
          const decay = Math.random() < 0.05
            ? Math.random() * 0.005           // rare slow-decay = tall spike
            : Math.random() * 0.08 + 0.008;   // normal fast decay

          heat[y * COLS + x] = Math.max(0, below - decay);
        }
      }
      seed(t);
    };

    const draw = () => {
      if (W <= 0 || H <= 0) return;
      ctx.clearRect(0, 0, W, H);
      ctx.font = `bold ${fs}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const h = heat[y * COLS + x];
          if (h <= 0.05) continue;
          const ch = charFrom(h);
          if (!ch) continue;

          let r: number, g: number, b: number;
          if (h > 0.90) { r = 255; g = 240; b = 120; } // hot white-yellow core
          else if (h > 0.78) { r = 255; g = 160; b = 0; } // orange
          else if (h > 0.62) { r = 255; g = 80; b = 0; } // deep orange
          else if (h > 0.45) { r = 220; g = 30; b = 0; } // red-orange
          else if (h > 0.28) { r = 180; g = 10; b = 0; } // red
          else if (h > 0.13) { r = 120; g = 5; b = 0; } // dark red
          else { r = 60; g = 0; b = 0; } // near-black ember

          const vertFade = Math.pow(1 - y / ROWS, 0.28);
          ctx.globalAlpha = Math.pow(h, 0.28) * vertFade;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillText(ch, (x + 0.5) * cw, (y + 0.5) * rh);
        }
      }
      ctx.globalAlpha = 1;
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();
    seed(0);

    const tick = (ts: number) => {
      animId = requestAnimationFrame(tick);
      if (ts - lastFrame < FRAME_INTERVAL) return;
      lastFrame = ts;
      time++;
      update(time);
      draw();
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}