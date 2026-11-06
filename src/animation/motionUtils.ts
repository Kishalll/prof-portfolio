import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { getMousePos } from './mouseTracker';

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

  // Set initial position inside the timeline so it resets cleanly on every restart
  tl.set(
    cursorEl,
    {
      x: start.x,
      y: start.y,
      rotation: 0,
      autoAlpha: 1,
    },
    position
  );

  tl.fromTo(
    proxy,
    { t: 0 },
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

interface ActiveFollower {
  cursorEl: HTMLElement;
  containerEl: HTMLElement;
  dx: number;
  dy: number;
  easeFactor: number;
  currentX: number;
  currentY: number;
  isSettled: boolean;
}

const activeFollowers = new Map<HTMLElement, ActiveFollower>();
let isTickerActive = false;

function onFollowerTick() {
  if (activeFollowers.size === 0) {
    if (isTickerActive) {
      gsap.ticker.remove(onFollowerTick);
      isTickerActive = false;
    }
    return;
  }

  const mouse = getMousePos();

  activeFollowers.forEach((follower) => {
    // If element or container is no longer connected to DOM, cleanup
    if (!follower.cursorEl.parentNode || !follower.containerEl.parentNode) {
      activeFollowers.delete(follower.cursorEl);
      return;
    }

    const cRect = follower.containerEl.getBoundingClientRect();
    const targetX = mouse.clientX - cRect.left + follower.dx;
    const targetY = mouse.clientY - cRect.top + follower.dy;

    const diffX = targetX - follower.currentX;
    const diffY = targetY - follower.currentY;
    const dist = Math.hypot(diffX, diffY);

    if (dist > 0.5) {
      follower.isSettled = false;
      follower.currentX += diffX * follower.easeFactor;
      follower.currentY += diffY * follower.easeFactor;
      gsap.set(follower.cursorEl, {
        x: follower.currentX,
        y: follower.currentY,
        rotation: 0,
        autoAlpha: 0.95,
        force3D: true,
      });
    } else if (!follower.isSettled) {
      // Reached exact target: stay completely still right there
      follower.isSettled = true;
      follower.currentX = targetX;
      follower.currentY = targetY;
      gsap.set(follower.cursorEl, {
        x: targetX,
        y: targetY,
        rotation: 0,
        autoAlpha: 0.95,
        force3D: true,
      });
    }
  });
}

/**
 * Calculates a unique follower cluster offset around the visitor cursor.
 * Spreads cursors in a comfortable arc around the pointer with no overlapping.
 */
export function getFollowerOffset(index: number, total: number): { dx: number; dy: number } {
  const count = Math.max(total, 5);
  // Spread in an arc around the cursor pointer (from 30deg to 300deg)
  const angle = 0.5 + (index / count) * 1.7 * Math.PI;
  const radius = 34 + (index % 3) * 14;
  const dx = Math.cos(angle) * radius;
  const dy = Math.sin(angle) * radius + 18;
  return { dx, dy };
}

/**
 * Attaches an autonomous cursor to follow the user's cursor once its build completes.
 * Transitions smoothly to the user's cursor, follows while moving, and stays strictly stationary
 * when motionless or off-screen.
 */
export function attachCursorToUserFollow(
  cursorEl: HTMLElement,
  containerEl: HTMLElement,
  index: number,
  total: number
) {
  // Kill any existing conflicting tweens
  gsap.killTweensOf(cursorEl);

  const { dx, dy } = getFollowerOffset(index, total);
  const mouse = getMousePos();
  const cRect = containerEl.getBoundingClientRect();
  const targetX = mouse.clientX - cRect.left + dx;
  const targetY = mouse.clientY - cRect.top + dy;

  // Read current position of cursor in container
  const curX = Number(gsap.getProperty(cursorEl, 'x')) || targetX;
  const curY = Number(gsap.getProperty(cursorEl, 'y')) || targetY;

  // Staggered ease factor for natural follow latency (first follower follows briskly, later ones trail slightly)
  const easeFactor = Math.max(0.08, 0.16 - (index % 4) * 0.02);

  const follower: ActiveFollower = {
    cursorEl,
    containerEl,
    dx,
    dy,
    easeFactor,
    currentX: curX,
    currentY: curY,
    isSettled: false,
  };

  activeFollowers.set(cursorEl, follower);

  // Smooth entry flight from element build finish position to user cursor
  gsap.to(cursorEl, {
    x: targetX,
    y: targetY,
    rotation: 0,
    autoAlpha: 0.95,
    duration: 0.65,
    ease: 'power2.out',
    onUpdate: () => {
      follower.currentX = Number(gsap.getProperty(cursorEl, 'x'));
      follower.currentY = Number(gsap.getProperty(cursorEl, 'y'));
    },
    onComplete: () => {
      follower.isSettled = true;
    },
  });

  if (!isTickerActive) {
    gsap.ticker.add(onFollowerTick);
    isTickerActive = true;
  }
}

/**
 * Detaches an autonomous cursor from following the user's cursor.
 * Called on task reset and before starting a new build task.
 */
export function detachCursorFromUserFollow(cursorEl: HTMLElement) {
  activeFollowers.delete(cursorEl);
  gsap.killTweensOf(cursorEl);
}

/**
 * Transition cursor to follow user's cursor upon completing build.
 * Stays strictly still when motionless or off-screen.
 */
export function addCursorIdleDrift(
  tl: gsap.core.Timeline,
  cursorEl: HTMLElement,
  index: number,
  total: number,
  _containerW: number,
  _containerH: number,
  position: number | string,
  containerEl?: HTMLElement
) {
  tl.call(
    () => {
      const container = containerEl || cursorEl.closest('section') || (cursorEl.parentElement as HTMLElement);
      if (container) {
        attachCursorToUserFollow(cursorEl, container, index, total);
      }
    },
    undefined,
    position
  );
}



