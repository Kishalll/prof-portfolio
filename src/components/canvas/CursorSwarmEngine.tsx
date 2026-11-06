import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMousePosition } from '../../hooks/useMousePosition';
import { CursorPersona } from '../../types/cursor';

const SWARM_PERSONAS: (CursorPersona & {
  offsetX: number;
  offsetY: number;
  stiffness: number;
  damping: number;
})[] = [
  {
    id: 'dev-kishal',
    name: 'Dev [Kishal]',
    role: 'Lead Architect',
    color: '#CCFF00',
    accentBg: '#12140D',
    textColor: '#CCFF00',
    offsetX: 28,
    offsetY: 20,
    stiffness: 320,
    damping: 26,
  },
  {
    id: 'secops',
    name: 'SecOps',
    role: 'Security & Auth',
    color: '#FFFF00',
    accentBg: '#14140D',
    textColor: '#FFFF00',
    offsetX: -34,
    offsetY: 28,
    stiffness: 280,
    damping: 24,
  },
  {
    id: 'ai-rag',
    name: 'AI_Agent',
    role: 'Vector Embeddings',
    color: '#DFFF00',
    accentBg: '#13140D',
    textColor: '#DFFF00',
    offsetX: 42,
    offsetY: -20,
    stiffness: 260,
    damping: 22,
  },
  {
    id: 'kernel',
    name: 'Kernel [Linux]',
    role: 'Systems Tooling',
    color: '#DFFF00',
    accentBg: '#13140D',
    textColor: '#DFFF00',
    offsetX: -40,
    offsetY: -24,
    stiffness: 240,
    damping: 20,
  },
  {
    id: 'ui-ux',
    name: 'UI_Design',
    role: 'Auto-Layout',
    color: '#CCFF00',
    accentBg: '#12140D',
    textColor: '#CCFF00',
    offsetX: -22,
    offsetY: 46,
    stiffness: 220,
    damping: 19,
  },
  {
    id: 'qa-audit',
    name: 'QA_Audit',
    role: 'Test Assertions',
    color: '#FFFF00',
    accentBg: '#14140D',
    textColor: '#FFFF00',
    offsetX: 46,
    offsetY: 36,
    stiffness: 200,
    damping: 18,
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    role: 'Code Quality',
    color: '#FFFFFF',
    accentBg: '#1A1A1A',
    textColor: '#FFFFFF',
    offsetX: 18,
    offsetY: -42,
    stiffness: 190,
    damping: 17,
  },
];

interface CursorSwarmEngineProps {
  followingIds?: string[];
}

export const CursorSwarmEngine: React.FC<CursorSwarmEngineProps> = ({ 
  followingIds = ['dev-kishal', 'secops', 'ai-rag', 'kernel', 'ui-ux', 'qa-audit', 'reviewer']
}) => {
  const mouse = useMousePosition();

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-50 select-none" 
      aria-hidden="true"
    >
      <AnimatePresence>
        {SWARM_PERSONAS.map((persona) => {
          const isFollowing = followingIds.includes(persona.id);
          if (!isFollowing) return null;

          const targetX = mouse.clientX + persona.offsetX;
          const targetY = mouse.clientY + persona.offsetY;

          return (
            <motion.div
              key={persona.id}
              className="fixed top-0 left-0 pointer-events-none flex flex-col items-start z-50"
              initial={{
                x: mouse.clientX + persona.offsetX * 2.5,
                y: mouse.clientY + persona.offsetY * 2.5,
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                x: targetX,
                y: targetY,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.2 },
              }}
              transition={{
                type: 'spring',
                stiffness: persona.stiffness,
                damping: persona.damping,
                mass: 0.45,
              }}
              style={{
                willChange: 'transform',
              }}
            >
              {/* SVG Pointer Arrow */}
              <svg
                className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z"
                  fill={persona.color}
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Persona Badge Pill */}
              <div className="flex items-center gap-1 ml-2 mt-0.5">
                <span
                  className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl whitespace-nowrap border"
                  style={{
                    backgroundColor: '#0A0B08',
                    color: persona.color,
                    borderColor: `${persona.color}50`,
                  }}
                >
                  {persona.name}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
