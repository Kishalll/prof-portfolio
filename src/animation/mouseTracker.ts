/**
 * Global Mouse Tracker
 * Tracks window cursor position without triggering React component re-renders.
 * Preserves the last known position when mouse is motionless or leaves the screen,
 * so the agent swarm can fly there and stay put.
 * Touch input updates the same position (last touch point), so touch devices get a
 * sensible gathering point too.
 */

interface MousePosition {
  clientX: number;
  clientY: number;
  hasMoved: boolean;
  isInside: boolean;
}

const state: MousePosition = {
  clientX: typeof window !== 'undefined' ? window.innerWidth * 0.55 : 400,
  clientY: typeof window !== 'undefined' ? window.innerHeight * 0.35 : 300,
  hasMoved: false,
  isInside: true,
};

type MouseMoveListener = (pos: MousePosition) => void;
const listeners = new Set<MouseMoveListener>();

if (typeof window !== 'undefined') {
  const handleMouseMove = (e: MouseEvent) => {
    state.clientX = e.clientX;
    state.clientY = e.clientY;
    state.hasMoved = true;
    state.isInside = true;
    listeners.forEach((listener) => listener(state));
  };

  const handleMouseLeave = () => {
    state.isInside = false;
  };

  const handleMouseEnter = (e: MouseEvent) => {
    state.isInside = true;
    // Browsers can fire a synthetic mouseenter at (0,0) on load before the visitor has touched
    // the mouse. Only trust enter coordinates once a real mousemove / touch has happened;
    // until then the swarm keeps gathering at the default point.
    if (!state.hasMoved) return;
    state.clientX = e.clientX;
    state.clientY = e.clientY;
    listeners.forEach((listener) => listener(state));
  };

  const handleTouch = (e: TouchEvent) => {
    const t = e.touches[0] || e.changedTouches[0];
    if (!t) return;
    state.clientX = t.clientX;
    state.clientY = t.clientY;
    state.hasMoved = true;
    state.isInside = true;
    listeners.forEach((listener) => listener(state));
  };

  // Until the visitor actually moves, keep the default gathering point proportional to the window
  const handleResize = () => {
    if (state.hasMoved) return;
    state.clientX = window.innerWidth * 0.55;
    state.clientY = window.innerHeight * 0.35;
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  window.addEventListener('touchstart', handleTouch, { passive: true });
  window.addEventListener('touchmove', handleTouch, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
  document.addEventListener('mouseleave', handleMouseLeave);
  document.addEventListener('mouseenter', handleMouseEnter);
}

export function getMousePos(): MousePosition {
  return state;
}

export function onMouseMove(listener: MouseMoveListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
