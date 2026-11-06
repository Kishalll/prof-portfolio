import React from 'react';
import { motion } from 'framer-motion';
import { CursorPersona } from '../../types/cursor';

interface CollaborativeCursorProps {
  persona: CursorPersona;
  x: number;
  y: number;
  actionText?: string;
  isDrawing?: boolean;
}

export const CollaborativeCursor: React.FC<CollaborativeCursorProps> = ({
  persona,
  x,
  y,
  actionText,
  isDrawing = false,
}) => {
  return (
    <motion.div
      className="absolute top-0 left-0 pointer-events-none z-30 flex flex-col items-start select-none"
      animate={{
        x,
        y,
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 240,
        mass: 0.8,
      }}
      style={{
        willChange: 'transform',
      }}
    >
      {/* Precision SVG Cursor Pointer */}
      <svg
        className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
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

      {/* Collaborator Badge Pill */}
      <div className="flex items-center gap-1.5 ml-2 mt-0.5">
        <span
          className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded shadow-lg whitespace-nowrap border"
          style={{
            backgroundColor: '#0A0B08',
            color: persona.color,
            borderColor: `${persona.color}40`,
          }}
        >
          {persona.name}
        </span>

        {/* Dynamic Action Tag (e.g. Dimensions or Snap Rulers) */}
        {actionText && (
          <span
            className="px-1.5 py-0.5 text-[9px] font-mono font-medium rounded shadow bg-black/90 text-zinc-300 border border-zinc-800 whitespace-nowrap"
          >
            {actionText}
          </span>
        )}
      </div>

      {/* Corner Anchor Handles if cursor is actively pulling/drawing */}
      {isDrawing && (
        <div 
          className="absolute -top-1 -left-1 w-2.5 h-2.5 border bg-white"
          style={{ borderColor: persona.color }}
        />
      )}
    </motion.div>
  );
};

