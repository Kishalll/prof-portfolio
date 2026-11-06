import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText, MotionPathPlugin);
}

export { gsap, ScrollTrigger, ScrambleTextPlugin, SplitText, MotionPathPlugin };

/**
 * Ensures custom web fonts and initial layout measurements have stabilized before calculating bounds.
 */
export async function waitForFontsAndLayout(): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Fallback if fonts.ready rejects
    }
  }
  // Wait two animation frames to ensure layout is settled
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Computes target element's bounding rect strictly relative to its parent section container.
 * This ensures that Lenis smooth scroll translations can never desync overlays from targets.
 */
export function getRelativeBounds(targetEl: HTMLElement, containerEl: HTMLElement) {
  const targetRect = targetEl.getBoundingClientRect();
  const containerRect = containerEl.getBoundingClientRect();

  return {
    x: targetRect.left - containerRect.left,
    y: targetRect.top - containerRect.top,
    width: targetRect.width,
    height: targetRect.height,
  };
}

/**
 * Standard masked blur-to-sharp heading reveal animation
 */
export function headingReveal(
  tl: gsap.core.Timeline,
  headingEl: HTMLElement,
  options: {
    duration?: number;
    position?: number | string;
    ease?: string;
  } = {}
) {
  const duration = options.duration ?? 0.72;
  const position = options.position ?? '+=0';
  const ease = options.ease ?? 'power3.out';

  return tl.fromTo(
    headingEl,
    {
      autoAlpha: 0,
      filter: 'blur(8px)',
      y: 14,
      clipPath: 'inset(0 0 100% 0)',
    },
    {
      autoAlpha: 1,
      filter: 'blur(0px)',
      y: 0,
      clipPath: 'inset(0 0 0% 0)',
      duration,
      ease,
    },
    position
  );
}

/**
 * Generates an entry point from a random viewport/container edge (outside visible frame)
 */
export function getRandomEdgePosition(containerWidth: number, containerHeight: number) {
  const edges = ['top', 'bottom', 'left', 'right'] as const;
  const edge = edges[Math.floor(Math.random() * edges.length)];
  const pad = 80;

  switch (edge) {
    case 'top':
      return {
        x: Math.random() * containerWidth,
        y: -pad - Math.random() * 60,
      };
    case 'bottom':
      return {
        x: Math.random() * containerWidth,
        y: containerHeight + pad + Math.random() * 60,
      };
    case 'left':
      return {
        x: -pad - Math.random() * 80,
        y: Math.random() * containerHeight,
      };
    case 'right':
      return {
        x: containerWidth + pad + Math.random() * 80,
        y: Math.random() * containerHeight,
      };
  }
}

/**
 * Adds a curved cursor travel tween to a timeline using quadratic bezier motion:
 * control point offset perpendicular to the line (random sign, magnitude 60-160px)
 * with ease back.out(1.2) for slight overshoot and settle.
 * Tilts slightly toward the travel direction during motion and settles to 0.
 */
export function addCurvedCursorTravel(
  tl: gsap.core.Timeline,
  cursorEl: HTMLElement,
  start: { x: number; y: number },
  target: { x: number; y: number },
  options: {
    duration?: number;
    position?: number | string;
    ease?: string;
  } = {}
) {
  const duration = options.duration ?? 0.75;
  const ease = options.ease ?? 'back.out(1.2)';
  const position = options.position ?? '+=0';

  const dx = target.x - start.x;
  const dy = target.y - start.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Perpendicular normal (-dy, dx)
  const nx = -dy / dist;
  const ny = dx / dist;

  // Random sign (+1 or -1) and perpendicular magnitude (60 to 160 px)
  const sign = Math.random() > 0.5 ? 1 : -1;
  const mag = 60 + Math.random() * 100;
  const cx = (start.x + target.x) / 2 + nx * sign * mag;
  const cy = (start.y + target.y) / 2 + ny * sign * mag;

  // Angle of overall travel for banking
  const travelAngle = Math.atan2(dy, dx) * (180 / Math.PI);
  // Bank angle clamped to [-16, 16] deg
  const bankAngle = Math.max(-16, Math.min(16, (travelAngle - 45) * 0.25));

  const proxy = { t: 0 };

  // Set initial position
  gsap.set(cursorEl, {
    x: start.x,
    y: start.y,
    rotation: 0,
    autoAlpha: 1,
  });

  tl.to(
    proxy,
    {
      t: 1,
      duration,
      ease,
      onUpdate: () => {
        const t = proxy.t;
        const inv = 1 - t;
        // Quadratic bezier formula B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const x = inv * inv * start.x + 2 * inv * t * cx + t * t * target.x;
        const y = inv * inv * start.y + 2 * inv * t * cy + t * t * target.y;
        // Bank cursor mid-flight, settle to 0 near end
        const rotation = bankAngle * Math.sin(Math.max(0, Math.min(1, t)) * Math.PI);

        gsap.set(cursorEl, {
          x,
          y,
          rotation,
          force3D: true,
        });
      },
      onComplete: () => {
        gsap.set(cursorEl, { rotation: 0 });
      },
    },
    position
  );
}

/**
 * Animates a SelectionBox using transforms only:
 * - Starts as 24x16 at the cursor arrival point (using transformOrigin)
 * - Expands to 1x1 scale (measured element bounds) with expo.out
 * - Counter-scales handles so they stay 6px without distortion
 * - Live-updates the dimension label DOM text during resize via proxy (no setState)
 * - Fades out as content reveals
 */
export function addSelectionBoxBuild(
  tl: gsap.core.Timeline,
  boxEl: HTMLElement,
  bounds: { x: number; y: number; width: number; height: number },
  cursorArrival: { x: number; y: number },
  options: {
    delay?: number;
    duration?: number;
    fadeDelay?: number;
    ease?: string;
  } = {}
) {
  const duration = options.duration ?? 0.52;
  const delay = options.delay ?? 0;
  const fadeDelay = options.fadeDelay ?? (delay + duration + 0.25);
  const ease = options.ease ?? 'expo.out';

  const w = Math.max(bounds.width, 24);
  const h = Math.max(bounds.height, 16);

  // Set width & height once from measured bounds
  gsap.set(boxEl, {
    x: bounds.x,
    y: bounds.y,
    width: w,
    height: h,
  });

  // Calculate transform-origin from cursor arrival point relative to box bounds
  const relX = cursorArrival.x - bounds.x;
  const relY = cursorArrival.y - bounds.y;
  const origXPercent = Math.max(0, Math.min(100, (relX / w) * 100));
  const origYPercent = Math.max(0, Math.min(100, (relY / h) * 100));
  const transformOrigin = `${origXPercent}% ${origYPercent}%`;

  const startScaleX = Math.min(1, 24 / w);
  const startScaleY = Math.min(1, 16 / h);

  const handles = boxEl.querySelectorAll('.selection-handle');
  const labelWrap = boxEl.querySelector('.selection-label-wrap');
  const dimTextEl = boxEl.querySelector('.dimension-text');

  // Set initial small state at cursor arrival point
  gsap.set(boxEl, {
    transformOrigin,
    scaleX: startScaleX,
    scaleY: startScaleY,
    autoAlpha: 1,
  });

  // Counter-scale handles so they stay exactly 6px
  if (handles.length > 0) {
    gsap.set(handles, {
      scaleX: 1 / startScaleX,
      scaleY: 1 / startScaleY,
      transformOrigin: 'center center',
    });
  }

  if (labelWrap) {
    gsap.set(labelWrap, {
      scaleX: 1 / startScaleX,
      scaleY: 1 / startScaleY,
      transformOrigin: 'top center',
    });
  }

  if (dimTextEl) {
    dimTextEl.textContent = `24 \u00D7 16`;
  }

  // 1. Box expands to full element bounds
  tl.to(
    boxEl,
    {
      scaleX: 1,
      scaleY: 1,
      duration,
      ease,
    },
    delay
  );

  // 2. Counter-scale handles to 1:1
  if (handles.length > 0) {
    tl.to(
      handles,
      {
        scaleX: 1,
        scaleY: 1,
        duration,
        ease,
      },
      delay
    );
  }

  if (labelWrap) {
    tl.to(
      labelWrap,
      {
        scaleX: 1,
        scaleY: 1,
        duration,
        ease,
      },
      delay
    );
  }

  // 3. Proxy tween updates dimension label DOM text live
  const dimProxy = { w: 24, h: 16 };
  tl.to(
    dimProxy,
    {
      w,
      h,
      duration,
      ease,
      onUpdate: () => {
        if (dimTextEl) {
          dimTextEl.textContent = `${Math.round(dimProxy.w)} \u00D7 ${Math.round(dimProxy.h)}`;
        }
      },
    },
    delay
  );

  // 4. Fade out selection box as content reveals
  tl.to(
    boxEl,
    {
      autoAlpha: 0,
      duration: 0.35,
      ease: 'power2.inOut',
    },
    fadeDelay
  );
}

/**
 * Creates 2-4 horizontal and 2-4 vertical guide lines tied to real element edges,
 * rendered in a fixed viewport overlay (pointer-events: none).
 * Drawn with scaleX/scaleY from 0, visible for ~0.4s then faded.
 * Positioned once via CSS transforms (x/y), not top/left.
 * Includes the red vertical ruler line and cleans up overlay on completion.
 */
export function createFixedGuideLinesOverlay(
  tl: gsap.core.Timeline,
  targetElements: HTMLElement[],
  options: {
    showRuler?: boolean;
    rulerOffset?: number;
    delay?: number;
  } = {}
): (() => void) {
  if (typeof document === 'undefined') return () => {};

  const showRuler = options.showRuler ?? true;
  const rulerOffset = options.rulerOffset ?? 24;
  const baseDelay = options.delay ?? 0.05;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 pointer-events-none select-none z-40 overflow-hidden';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  const cleanup = () => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  };

  const validEls = targetElements.filter(Boolean);
  if (validEls.length === 0) {
    cleanup();
    return () => {};
  }

  // Red vertical ruler line near left edge
  if (showRuler) {
    const ruler = document.createElement('div');
    ruler.className = 'absolute top-0 bottom-0 w-[1px] bg-[#FF3B30] pointer-events-none';
    ruler.innerHTML = `<span class="absolute top-2 left-1 text-[8px] font-mono text-[#FF3B30]/80">RULER ${rulerOffset}px</span>`;
    gsap.set(ruler, {
      x: rulerOffset,
      scaleY: 0,
      transformOrigin: 'top center',
      autoAlpha: 0,
    });
    overlay.appendChild(ruler);

    tl.to(
      ruler,
      {
        scaleY: 1,
        autoAlpha: 0.85,
        duration: 0.65,
        ease: 'power2.out',
      },
      baseDelay
    );
  }

  // 2-4 Horizontal & Vertical guide lines tied to real element edges
  const count = Math.min(4, Math.max(2, validEls.length));
  for (let i = 0; i < count; i++) {
    const el = validEls[i];
    const rect = el.getBoundingClientRect();
    const yEdge = i % 2 === 0 ? rect.top : rect.bottom;
    const xEdge = i % 2 === 0 ? rect.left : rect.right;
    const stagger = baseDelay + 0.15 + i * 0.12;

    // Horizontal guide line spanning viewport width
    const hLine = document.createElement('div');
    hLine.className = 'absolute left-0 w-full h-[1px] bg-[#0D99FF] pointer-events-none';
    gsap.set(hLine, {
      y: yEdge,
      scaleX: 0,
      transformOrigin: 'left center',
      autoAlpha: 0.75,
    });
    overlay.appendChild(hLine);

    tl.to(
      hLine,
      {
        scaleX: 1,
        duration: 0.35,
        ease: 'power2.out',
      },
      stagger
    );

    tl.to(
      hLine,
      {
        autoAlpha: 0,
        duration: 0.25,
        ease: 'power1.out',
      },
      stagger + 0.4
    );

    // Vertical guide line spanning viewport height
    const vLine = document.createElement('div');
    vLine.className = 'absolute top-0 h-full w-[1px] bg-[#0D99FF] pointer-events-none';
    gsap.set(vLine, {
      x: xEdge,
      scaleY: 0,
      transformOrigin: 'top center',
      autoAlpha: 0.75,
    });
    overlay.appendChild(vLine);

    tl.to(
      vLine,
      {
        scaleY: 1,
        duration: 0.35,
        ease: 'power2.out',
      },
      stagger
    );

    tl.to(
      vLine,
      {
        autoAlpha: 0,
        duration: 0.25,
        ease: 'power1.out',
      },
      stagger + 0.4
    );
  }

  // Auto remove overlay once the build completes
  tl.eventCallback('onComplete', () => {
    cleanup();
  });

  return cleanup;
}

/**
 * Calculates a deterministic idle parking position in a 24px margin
 * along the left or right edges of the section, spaced to prevent overlapping content.
 */
export function getDeterministicIdlePosition(
  index: number,
  total: number,
  containerW: number,
  containerH: number
): { x: number; y: number } {
  const isLeft = index % 2 === 0;
  const x = isLeft ? 24 : Math.max(containerW - 80, 24);

  const topPad = 80;
  const bottomPad = 80;
  const availableH = Math.max(120, containerH - topPad - bottomPad);

  const countOnSide = isLeft ? Math.ceil(total / 2) : Math.floor(total / 2);
  const sideIndex = Math.floor(index / 2);
  const step = countOnSide > 1 ? availableH / (countOnSide - 1) : availableH * 0.5;

  const y = topPad + (isLeft ? 0 : 25) + sideIndex * step;

  return { x, y };
}

/**
 * Transitions cursor to its deterministic idle position, then initiates
 * a slow looping yoyo drift (6-10s) to keep it alive without blocking timeline completion.
 */
export function addCursorIdleDrift(
  tl: gsap.core.Timeline,
  cursorEl: HTMLElement,
  index: number,
  total: number,
  containerW: number,
  containerH: number,
  position: number | string
) {
  const idle = getDeterministicIdlePosition(index, total, containerW, containerH);

  // Transition to edge idle position
  tl.to(
    cursorEl,
    {
      x: idle.x,
      y: idle.y,
      rotation: 0,
      autoAlpha: 0.5,
      duration: 1.1,
      ease: 'power2.out',
      onComplete: () => {
        // Slow looping drift (6 to 10s, small amplitude 6-12px)
        const duration = 6 + (index % 5) * 0.8;
        const ampX = 6 + (index % 3) * 2;
        const ampY = 8 + (index % 4) * 2;

        gsap.to(cursorEl, {
          x: idle.x + (index % 2 === 0 ? ampX : -ampX),
          y: idle.y + ampY,
          duration,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      },
    },
    position
  );
}



