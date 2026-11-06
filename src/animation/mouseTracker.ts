/**
 * Global Mouse Tracker
 * Tracks window cursor position without triggering React component re-renders.
 * Preserves the last known position when mouse is motionless or leaves the screen.
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
    state.clientX = e.clientX;
    state.clientY = e.clientY;
    state.isInside = true;
    listeners.forEach((listener) => listener(state));
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
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

