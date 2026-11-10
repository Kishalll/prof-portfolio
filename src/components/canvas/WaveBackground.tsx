import React, { useEffect, useRef } from 'react';
import { getMousePos } from '../../animation/mouseTracker';
import { useChoreographer } from '../../animation/ChoreographerContext';

/**
 * Site-wide animated wave background.
 *
 * One fixed canvas behind every section. Thin lime lines drift slowly, shift a little as the page
 * scrolls, and react to the visitor's cursor: lines bend away from the pointer and glow near it,
 * and moving the mouse quickly adds energy to the whole field (it settles again when you stop).
 *
 * Kept deliberately faint so text and cards on top stay fully readable. Draws on a plain
 * requestAnimationFrame loop (no React re-renders), pauses in background tabs, and shows a still
 * frame when the visitor prefers reduced motion.
 */

const KIWI = '204,255,0';

// Look & feel (tweak these)
const LINE_ALPHA = 0.09; // resting opacity of every line
const GLOW_ALPHA = 0.22; // extra opacity added right next to the cursor
const BEND_PX = 54; // how far lines are pushed away from the cursor
const BEND_RADIUS = 190; // reach of the cursor effect (px)

export const WaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { prefersReducedMotion } = useChoreographer();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let W = 0;
    let H = 0;
    let raf = 0;

    // Smoothed cursor state
    const cur = { x: window.innerWidth * 0.55, y: window.innerHeight * 0.35, power: 0, energy: 0 };
    let lastRawX = cur.x;
    let lastRawY = cur.y;

    const resize = () => {
      W = window.innerWidth;
      // Phones: cap the pixel ratio so the canvas stays cheap to redraw
      const dpr = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 2);
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (prefersReducedMotion) draw(0);
    };

    const draw = (tMs: number) => {
      const t = tMs / 1000;
      const m = getMousePos();
      const scroll = window.scrollY || 0;

      if (!prefersReducedMotion) {
        // Follow the pointer smoothly; power fades the effect in/out when the mouse leaves/returns
        const wantPower = m.hasMoved && m.isInside ? 1 : 0;
        cur.x += (m.clientX - cur.x) * 0.12;
        cur.y += (m.clientY - cur.y) * 0.12;
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

      const compact = W < 700;
      const n = compact ? 14 : 26;
      const step = compact ? 18 : 12;
      const sigma2 = 2 * BEND_RADIUS * BEND_RADIUS;
      const glowSigma2 = 2 * 150 * 150;

      for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const baseY = H * (0.06 + 0.88 * k);

        // Two slow travelling sine layers; the scroll nudges the phase so the field flows as you read
        const a1 = 16 + 12 * Math.sin(i * 0.7) + energy * 16;
        const a2 = 7 + 5 * Math.cos(i * 1.3) + energy * 8;
        const ph = t * 0.42 + i * 0.46 + scroll * 0.0016;
        const ph2 = -t * 0.27 + i * 0.93 - scroll * 0.001;

        const dyLine = baseY - cur.y;
        const lineGlow = Math.exp(-(dyLine * dyLine) / glowSigma2) * power;

        ctx.beginPath();
        for (let x = -20; x <= W + 20; x += step) {
          let y = baseY + a1 * Math.sin(x * 0.0042 + ph) + a2 * Math.sin(x * 0.0113 + ph2);

          if (power > 0.002) {
            const dx = x - cur.x;
            const dy = y - cur.y;
            const g = Math.exp(-(dx * dx + dy * dy) / sigma2);
            // push away from the pointer; the soft denominator avoids a hard flip at dy = 0
            y += (dy / (Math.abs(dy) + 28)) * BEND_PX * g * power;
          }
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        if (lineGlow > 0.02) {
          // Brighter around the cursor, resting opacity elsewhere
          const gr = ctx.createLinearGradient(cur.x - 320, 0, cur.x + 320, 0);
          gr.addColorStop(0, `rgba(${KIWI},${LINE_ALPHA})`);
          gr.addColorStop(0.5, `rgba(${KIWI},${LINE_ALPHA + GLOW_ALPHA * lineGlow})`);
          gr.addColorStop(1, `rgba(${KIWI},${LINE_ALPHA})`);
          ctx.strokeStyle = gr;
        } else {
          ctx.strokeStyle = `rgba(${KIWI},${LINE_ALPHA})`;
        }
        ctx.lineWidth = i % 5 === 0 ? 1.4 : 1;
        ctx.stroke();
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
