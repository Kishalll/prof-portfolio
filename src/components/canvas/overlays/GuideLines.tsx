import React, { forwardRef } from 'react';

interface GuideLinesProps {
  showRuler?: boolean;
  rulerOffset?: number; // e.g. 24 or 32px from left edge
  className?: string;
  horizontalY?: number | null;
  verticalX?: number | null;
}

export interface GuideLinesRefs {
  container: HTMLDivElement | null;
  hLine: HTMLDivElement | null;
  vLine: HTMLDivElement | null;
  ruler: HTMLDivElement | null;
}

export const GuideLines = forwardRef<
  HTMLDivElement,
  GuideLinesProps & {
    hLineRef?: React.RefObject<HTMLDivElement>;
    vLineRef?: React.RefObject<HTMLDivElement>;
    rulerRef?: React.RefObject<HTMLDivElement>;
  }
>(
  (
    {
      showRuler = true,
      rulerOffset = 24,
      className = '',
      horizontalY = null,
      verticalX = null,
      hLineRef,
      vLineRef,
      rulerRef,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-10 ${className}`}
        aria-hidden="true"
      >
        {/* Red Vertical Ruler Line (Reference alignment near left edge) */}
        {showRuler && (
          <div
            ref={rulerRef}
            className="absolute top-0 bottom-0 w-[1px] bg-[#FF3B30] opacity-0 pointer-events-none"
            style={{ left: `${rulerOffset}px`, visibility: 'hidden' }}
          >
            {/* Small ruler tick indicator */}
            <span className="absolute top-2 left-1 text-[8px] font-mono text-[#FF3B30]/70 select-none">
              RULER {rulerOffset}px
            </span>
          </div>
        )}

        {/* Dynamic Horizontal Blue Guide Line */}
        <div
          ref={hLineRef}
          className="absolute left-0 right-0 h-[1px] bg-[#0D99FF] opacity-0 pointer-events-none"
          style={
            horizontalY !== null
              ? { top: `${horizontalY}px`, opacity: 0.75, visibility: 'visible' }
              : { visibility: 'hidden' }
          }
        />

        {/* Dynamic Vertical Blue Guide Line */}
        <div
          ref={vLineRef}
          className="absolute top-0 bottom-0 w-[1px] bg-[#0D99FF] opacity-0 pointer-events-none"
          style={
            verticalX !== null
              ? { left: `${verticalX}px`, opacity: 0.75, visibility: 'visible' }
              : { visibility: 'hidden' }
          }
        />
      </div>
    );
  }
);

GuideLines.displayName = 'GuideLines';

