import React, { useEffect, useRef } from 'react';
import { getMousePos } from '../../animation/mouseTracker';
import { useChoreographer } from '../../animation/ChoreographerContext';

/**
 * Site-wide animated honeycomb background (alternative to WaveBackground).
 *
 * A fixed canvas of thin hexagon outlines. Slow light ripples travel across the grid, soft zones
 * pulse on and off, the grid drifts with page scroll, and cells light up around the visitor's
 * cursor (stronger while the mouse is moving). Intentionally faint so content stays readable.
 * Plain requestAnimationFrame loop, no React re-renders; still frame when reduced motion is on.
 */

const KIWI = '204,255,0';

// Look & feel (tweak these)
const LINE_ALPHA = 0.065; // resting outline opacity
const RIPPLE_ALPHA = 0.07; // extra opacity on the travelling ripple
const GLOW_ALPHA = 0.32; // extra outline opacity next to the cursor
const FILL_ALPHA = 0.08; // fill opacity next to the cursor
const GLOW_RADIUS = 170; // reach of the cursor effect (px)

export const HexBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { prefersReducedMotion } = useChoreographer();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let W = 0;
    let H = 0;
    let raf = 0;

    const cur = { x: window.innerWidth * 0.55, y: window.innerHeight * 0.35, power: 0, energy: 0 };
    let lastRawX = cur.x;
    let lastRawY = cur.y;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (prefersReducedMotion) draw(0);
    };

    const hexPath = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const draw = (tMs: number) => {
      const t = tMs / 1000;
      const m = getMousePos();
      const scroll = window.scrollY || 0;

      if (!prefersReducedMotion) {
        const wantPower = m.hasMoved && m.isInside ? 1 : 0;
        cur.x += (m.clientX - cur.x) * 0.14;
        cur.y += (m.clientY - cur.y) * 0.14;
        cur.power += (wantPower - cur.power) * 0.06;
        const speed = Math.hypot(m.clientX - lastRawX, m.clientY - lastRawY);
        lastRawX = m.clientX;
        lastRawY = m.clientY;
        cur.energy += (Math.min(1, speed / 38) - cur.energy) * 0.07;
      }
      const power = prefersReducedMotion ? 0 : cur.power;
      const energy = prefersReducedMotion ? 0 : cur.energy;

      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = 'round';

      const r = W < 700 ? 26 : 34; // cell radius
      const dx = 1.5 * r; // column spacing
      const dy = Math.sqrt(3) * r; // row spacing
      const drift = ((scroll * 0.12) % dy + dy) % dy; // grid slides slowly as you scroll
      const sigma2 = 2 * GLOW_RADIUS * GLOW_RADIUS;
      // Ripple origin: top-right, where the hero portrait sits
      const ox = W * 0.85;
      const oy = H * 0.2;

      for (let c = -1; c * dx < W + r; c++) {
        const cx = c * dx;
        const colShift = c % 2 === 0 ? 0 : dy / 2;
        for (let row = -2; row * dy < H + dy; row++) {
          const cy = row * dy + colShift + drift;

          // Slow ripple travelling outward from the origin
          const dOrigin = Math.hypot(cx - ox, cy - oy);
          const wave = Math.sin(dOrigin * 0.011 - t * 0.9);
          const ripple = wave > 0 ? Math.pow(wave, 7) : 0;

          // Soft zones that fade in and out
          const zone = Math.sin(cx * 0.006 + cy * 0.009 + t * 0.5) * Math.sin(cx * 0.004 - cy * 0.007 - t * 0.35);
          const twinkle = zone > 0.35 ? (zone - 0.35) * 0.9 : 0;

          let a = LINE_ALPHA + RIPPLE_ALPHA * ripple * (0.7 + energy * 0.9) + 0.045 * twinkle;
          let fill = 0;
          let rr = r - 1.5;

          if (power > 0.002) {
            const mdx = cx - cur.x;
            const mdy = cy - cur.y;
            const g = Math.exp(-(mdx * mdx + mdy * mdy) / sigma2) * power;
            a += GLOW_ALPHA * g;
            fill = FILL_ALPHA * g;
            rr += g * 2.5; // cells swell slightly under the cursor
          }

          hexPath(cx, cy, rr);
          if (fill > 0.004) {
            ctx.fillStyle = `rgba(${KIWI},${fill.toFixed(3)})`;
            ctx.fill();
          }
          ctx.strokeStyle = `rgba(${KIWI},${a.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    };

    const loop = (tMs: number) => {
      draw(tMs);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    if (!prefersReducedMotion) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
