import { useEffect, useRef } from 'react';

const COLS = 120;
const ROWS = 32;

function baseHeat(x: number) {
  const t = x / COLS;
  return 0.88
    + 0.06 * Math.sin(t * Math.PI * 3.1 + 0.5)
    + 0.04 * Math.sin(t * Math.PI * 7.3 + 1.2)
    + 0.02 * Math.sin(t * Math.PI * 13 + 2.1);
}

function charFrom(h: number): string | null {
  if (h > 0.85) return '@';
  if (h > 0.72) return '#';
  if (h > 0.58) return 'x';
  if (h > 0.42) return '*';
  if (h > 0.28) return '+';
  if (h > 0.15) return 'v';
  if (h > 0.05) return '.';
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
    let animId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    const baseHeatWithTime = (x: number, t_offset: number) => {
      const t = x / COLS;
      const speed = t_offset * 0.05;
      return 0.75
        + 0.15 * Math.sin(t * Math.PI * 3.1 + speed)
        + 0.08 * Math.sin(t * Math.PI * 7.3 + speed * 1.5)
        + 0.04 * Math.sin(t * Math.PI * 13 + speed * 2.1)
        + (Math.random() * 0.2); // Add flicker/randomness to the base
    };

    const seed = (t_offset: number) => {
      for (let x = 0; x < COLS; x++) {
        const h = baseHeatWithTime(x, t_offset);
        heat[(ROWS - 1) * COLS + x] = h;
        heat[(ROWS - 2) * COLS + x] = h * 0.98;
        heat[(ROWS - 3) * COLS + x] = h * 0.95;
      }
    };

    const update = (t_offset: number) => {
      for (let y = 0; y < ROWS - 3; y++) {
        for (let x = 0; x < COLS; x++) {
          const rx = Math.floor(Math.random() * 3) - 1;
          const nx = Math.max(0, Math.min(COLS - 1, x + rx));
          const below = heat[(y + 1) * COLS + nx];
          // Slightly slower decay and more variation for "taller/smaller" look
          const decay = Math.random() * 0.045 + 0.005; 
          heat[y * COLS + x] = Math.max(0, below - decay);
        }
      }
      seed(t_offset);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cw = canvas.width / COLS;
      const rh = canvas.height / ROWS;
      if (cw <= 0 || rh <= 0) return;

      // Bigger font size as requested
      const fs = Math.max(10, Math.round(rh * 0.95));
      ctx.font = `bold ${fs}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const h = heat[y * COLS + x];
          if (h <= 0.05) continue; // Skip cold spots

          const ch = charFrom(h);
          if (!ch) continue;

          // Richer fire colors
          const r = Math.min(255, 230 + Math.round(h * 25));
          const g = Math.round(Math.pow(h, 1.5) * 160);
          const b = Math.round(Math.pow(h, 3) * 50);
          
          ctx.globalAlpha = Math.pow(h, 0.5) * 0.95;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillText(ch, (x + 0.5) * cw, (y + 0.5) * rh);
        }
      }
      ctx.globalAlpha = 1;
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    resize();
    seed(0);

    const tick = () => {
      time++;
      update(time);
      draw();
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
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
