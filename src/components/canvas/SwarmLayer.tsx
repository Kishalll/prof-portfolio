import React, { useLayoutEffect, useRef } from 'react';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { swarm } from '../../animation/swarm';

/** Fading copies rendered behind each arrow while it flies (the motion trail). */
const GHOSTS_PER_AGENT = 3;

const ARROW_PATH = 'M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z';

const ArrowIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg
    className="block w-[14px] h-[14px]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={ARROW_PATH} fill={color} stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/**
 * The global flock of agent arrows.
 *
 * Rendered once, in fixed viewport coordinates. All per-frame movement is done by the swarm
 * manager (`animation/swarm.ts`) writing transforms straight to these elements, so React never
 * re-renders while the arrows move.
 *
 * Cursors start off-screen and only join this flock after building; members hover around the visitor's mouse (or the last touch point / a default
 * point). When a build starts, one agent leaves the flock; when it finishes it flies back.
 */
export const SwarmLayer: React.FC = () => {
  const { personaPool, prefersReducedMotion } = useChoreographer();

  const agentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const ghostRefs = useRef<Array<HTMLDivElement | null>>([]);

  // The context rebuilds the pool array on every render; only react when the personas change
  const poolKey = personaPool.map((p) => p.id).join('|');

  useLayoutEffect(() => {
    swarm.setReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion]);

  useLayoutEffect(() => {
    swarm.setAgents(personaPool);
    personaPool.forEach((_, i) => {
      const ghosts: HTMLElement[] = [];
      for (let g = 0; g < GHOSTS_PER_AGENT; g++) {
        const el = ghostRefs.current[i * GHOSTS_PER_AGENT + g];
        if (el) ghosts.push(el);
      }
      swarm.register(i, agentRefs.current[i], ghosts);
    });

    return () => {
      personaPool.forEach((_, i) => swarm.unregister(i));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKey]);

  return (
    <div
      className="fixed inset-0 z-[45] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {personaPool.map((persona, i) => (
        <React.Fragment key={persona.id}>
          {/* Trail copies first so the real arrow always paints on top */}
          {Array.from({ length: GHOSTS_PER_AGENT }, (_, g) => (
            <div
              key={`ghost-${g}`}
              ref={(el) => {
                ghostRefs.current[i * GHOSTS_PER_AGENT + g] = el;
              }}
              className="absolute top-0 left-0 will-change-transform select-none"
              style={{ opacity: 0, transform: 'translate3d(-100px, -100px, 0)' }}
            >
              <ArrowIcon color={persona.color} />
            </div>
          ))}
          <div
            ref={(el) => {
              agentRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 will-change-transform select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
            style={{ visibility: 'hidden', transform: 'translate3d(-100px, -100px, 0)' }}
          >
            <ArrowIcon color={persona.color} />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
