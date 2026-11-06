import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);
}

export { gsap, ScrollTrigger, ScrambleTextPlugin, SplitText };

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

