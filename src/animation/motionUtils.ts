import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { swarm } from './swarm';

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
 * Spawns just outside the visible viewport, computed in section coordinates at trigger time.
 * Prevents cursors from spawning off-screen on tall down-page sections.
 */
export function getVisibleViewportSpawn(containerEl: HTMLElement): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  const rect = containerEl.getBoundingClientRect();
  const cWidth = rect.width || window.innerWidth;
  const cHeight = rect.height || 600;

  // Visible boundaries of container within viewport
  const visibleTop = Math.max(0, -rect.top);
  const visibleBottom = Math.min(cHeight, window.innerHeight - rect.top);
  const visibleLeft = Math.max(0, -rect.left);
  const visibleRight = Math.min(cWidth, window.innerWidth - rect.left);

  const edges = ['top', 'bottom', 'left', 'right'] as const;
  const edge = edges[Math.floor(Math.random() * edges.length)];
  const pad = 80;

  switch (edge) {
    case 'top':
      return {
        x: visibleLeft + Math.random() * Math.max(40, visibleRight - visibleLeft),
        y: visibleTop - pad - Math.random() * 40,
      };
    case 'bottom':
      return {
        x: visibleLeft + Math.random() * Math.max(40, visibleRight - visibleLeft),
        y: visibleBottom + pad + Math.random() * 40,
      };
    case 'left':
      return {
        x: visibleLeft - pad - Math.random() * 60,
        y: visibleTop + Math.random() * Math.max(40, visibleBottom - visibleTop),
      };
    case 'right':
      return {
        x: visibleRight + pad + Math.random() * 60,
        y: visibleTop + Math.random() * Math.max(40, visibleBottom - visibleTop),
      };
  }
}

/**
 * Describes a cursor that leaves the global swarm to start this leg of the build.
 * The swarm agent that leaves is the one nearest to `index` in the flock; the section-level
 * cursor takes over at the exact on-screen position where that agent was hovering.
 */
export interface SwarmDeparture {
  /** Unique key for the departure (the build timeline) so the agent can be handed back later. */
  owner: object;
  /** Section container the cursor element is absolutely positioned in. */
  containerEl: HTMLElement;
  /** Preferred swarm agent index (decides which persona leaves the flock). */
  index: number;
}

/**
 * Adds a curved cursor travel tween to a timeline using quadratic bezier motion:
 * control point offset perpendicular to the line (random sign, magnitude 60-160px)
 * with ease back.out(1.2) for slight overshoot and settle.
 * Tilts slightly toward the travel direction during motion and settles to 0.
 *
 * When `options.depart` is given, the leg does not start from the static `start` point.
 * Instead, at the moment the leg begins, one swarm agent leaves the flock and the leg starts
 * from exactly where that agent is hovering on screen (re-planned every run).
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
    depart?: SwarmDeparture;
  } = {}
) {
  const duration = options.duration ?? 0.75;
  const ease = options.ease ?? 'back.out(1.2)';
  const position = options.position ?? '+=0';
  const depart = options.depart;

  // Mutable plan: recomputed at the start of every run (the departure point depends on the swarm)
  let s = { x: start.x, y: start.y };
  let cx = 0;
  let cy = 0;
  let bankAngle = 0;

  const plan = () => {
    const dx = target.x - s.x;
    const dy = target.y - s.y;
    const dist = Math.hypot(dx, dy) || 1;

    // Perpendicular normal (-dy, dx)
    const nx = -dy / dist;
    const ny = dx / dist;

    // Random sign (+1 or -1) and perpendicular magnitude (60 to 160 px)
    const sign = Math.random() > 0.5 ? 1 : -1;
    const mag = 60 + Math.random() * 100;
    cx = (s.x + target.x) / 2 + nx * sign * mag;
    cy = (s.y + target.y) / 2 + ny * sign * mag;

    // Angle of overall travel for banking, clamped to [-16, 16] deg
    const travelAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    bankAngle = Math.max(-16, Math.min(16, (travelAngle - 45) * 0.25));
  };
  plan();

  const proxy = { t: 0 };

  // Runs when this leg begins (never at setup time, so nothing is shown before its trigger):
  // leave the swarm if departing, then place the cursor at the start of the path.
  tl.call(
    () => {
      if (depart) {
        const p = swarm.dispatch(depart.owner, cursorEl, depart.containerEl, depart.index);
        s = { x: p.x, y: p.y };
        plan();
      }
      gsap.set(cursorEl, { x: s.x, y: s.y, rotation: 0, autoAlpha: 1 });
    },
    undefined,
    position
  );

  tl.fromTo(
    proxy,
    { t: 0 },
    {
      t: 1,
      duration,
      ease,
      // fromTo renders immediately by default, which would show the cursor at page load
      immediateRender: false,
      onUpdate: () => {
        const t = proxy.t;
        const inv = 1 - t;
        // Quadratic bezier formula B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const x = inv * inv * s.x + 2 * inv * t * cx + t * t * target.x;
        const y = inv * inv * s.y + 2 * inv * t * cy + t * t * target.y;
        // Bank cursor mid-flight, settle to 0 near end
        const rotation = bankAngle * Math.sin(Math.max(0, Math.min(1, t)) * Math.PI);

        gsap.set(cursorEl, {
          x,
          y,
          rotation,
          autoAlpha: 1,
          force3D: true,
        });
      },
      onComplete: () => {
        gsap.set(cursorEl, { rotation: 0, autoAlpha: 1 });
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

  // Set initial state inside timeline at delay so every replay/restart initializes cleanly
  tl.set(
    boxEl,
    {
      x: bounds.x,
      y: bounds.y,
      width: w,
      height: h,
      transformOrigin,
      scaleX: startScaleX,
      scaleY: startScaleY,
      autoAlpha: 1,
      immediateRender: false,
    },
    delay
  );

  // Counter-scale handles so they stay exactly 6px
  if (handles.length > 0) {
    tl.set(
      handles,
      {
        scaleX: 1 / startScaleX,
        scaleY: 1 / startScaleY,
        transformOrigin: 'center center',
        immediateRender: false,
      },
      delay
    );
  }

  if (labelWrap) {
    tl.set(
      labelWrap,
      {
        scaleX: 1 / startScaleX,
        scaleY: 1 / startScaleY,
        transformOrigin: 'top center',
        immediateRender: false,
      },
      delay
    );
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
  tl.fromTo(
    dimProxy,
    { w: 24, h: 16 },
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
 * The section-level cursor has finished its build: hand it back to the swarm.
 * The swarm agent re-appears where the cursor currently is and flies back to the cluster
 * around the visitor's mouse (curved path with a speed-dependent trail).
 * Safe to call more than once for the same owner.
 */
export function addSwarmReturn(
  tl: gsap.core.Timeline,
  owner: object,
  position: number | string
) {
  tl.call(() => swarm.handBack(owner), undefined, position);
}
