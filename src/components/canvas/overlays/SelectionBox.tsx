import React, { forwardRef } from 'react';

interface SelectionBoxProps {
  label?: string;
  dimensions?: { width: number; height: number };
  className?: string;
  style?: React.CSSProperties;
}

export const SelectionBox = forwardRef<HTMLDivElement, SelectionBoxProps>(
  ({ label, dimensions, className = '', style }, ref) => {
    return (
      <div
        ref={ref}
        className={`absolute top-0 left-0 pointer-events-none select-none border border-[#0D99FF] z-20 ${className}`}
        style={{
          boxShadow: '0 0 12px rgba(13, 153, 255, 0.25)',
          ...style,
        }}
        aria-hidden="true"
      >
        {/* 4 Corner Handles (6x6 px white squares with blue borders) */}
        <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-white border border-[#0D99FF] rounded-[0.5px] pointer-events-none" />
        <span className="absolute -top-[3px] -right-[3px] w-1.5 h-1.5 bg-white border border-[#0D99FF] rounded-[0.5px] pointer-events-none" />
        <span className="absolute -bottom-[3px] -left-[3px] w-1.5 h-1.5 bg-white border border-[#0D99FF] rounded-[0.5px] pointer-events-none" />
        <span className="absolute -bottom-[3px] -right-[3px] w-1.5 h-1.5 bg-white border border-[#0D99FF] rounded-[0.5px] pointer-events-none" />

        {/* 4 Midpoint Handles */}
        <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border border-[#0D99FF] rounded-[0.5px] pointer-events-none" />
        <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white border border-[#0D99FF] rounded-[0.5px] pointer-events-none" />
        <span className="absolute top-1/2 -left-[3px] -translate-y-1/2 w-1.5 h-1.5 bg-white border border-[#0D99FF] rounded-[0.5px] pointer-events-none" />
        <span className="absolute top-1/2 -right-[3px] -translate-y-1/2 w-1.5 h-1.5 bg-white border border-[#0D99FF] rounded-[0.5px] pointer-events-none" />

        {/* Floating Dimension Label / Action Tag */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none select-none">
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium rounded bg-[#0D99FF] text-white shadow-sm whitespace-nowrap">
            {dimensions && dimensions.width > 0
              ? `${Math.round(dimensions.width)} \u00D7 ${Math.round(dimensions.height)}`
              : 'Auto-Layout'}
          </span>
          {label && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium rounded bg-black/90 text-zinc-300 border border-zinc-800 shadow-sm whitespace-nowrap">
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }
);

SelectionBox.displayName = 'SelectionBox';

