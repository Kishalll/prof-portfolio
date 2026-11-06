import React, { forwardRef } from 'react';
import { AgentPersona } from '../../../animation/types';

interface CursorAgentProps {
  persona: AgentPersona;
  actionLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CursorAgent = forwardRef<HTMLDivElement, CursorAgentProps>(
  ({ persona, actionLabel, className = '', style }, ref) => {
    return (
      <div
        ref={ref}
        className={`absolute top-0 left-0 pointer-events-none select-none z-30 flex flex-col items-start will-change-transform ${className}`}
        style={{
          transform: 'translate3d(-100px, -100px, 0)', // initial off-screen placement
          ...style,
        }}
        aria-hidden="true"
      >
        {/* SVG Cursor Pointer Arrow */}
        <svg
          className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
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

        {/* Persona Name Pill + Optional Action Tag */}
        <div className="flex items-center gap-1.5 ml-2 mt-0.5">
          <span
            className="px-2 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl whitespace-nowrap border"
            style={{
              backgroundColor: '#0A0B08',
              color: persona.color,
              borderColor: `${persona.color}55`,
            }}
          >
            {persona.name}
          </span>

          {actionLabel && (
            <span className="px-1.5 py-0.5 text-[8.5px] font-mono font-medium rounded shadow bg-black/90 text-zinc-300 border border-zinc-800 whitespace-nowrap">
              {actionLabel}
            </span>
          )}
        </div>
      </div>
    );
  }
);

CursorAgent.displayName = 'CursorAgent';

