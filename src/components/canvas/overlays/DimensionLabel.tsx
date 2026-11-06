import React from 'react';

interface DimensionLabelProps {
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DimensionLabel: React.FC<DimensionLabelProps> = ({
  width,
  height,
  className = '',
  style,
}) => {
  return (
    <div
      className={`px-1.5 py-0.5 text-[9px] font-mono font-medium rounded bg-[#0D99FF] text-white shadow-sm pointer-events-none select-none whitespace-nowrap flex items-center justify-center ${className}`}
      style={style}
    >
      <span>
        {Math.round(width)} &times; {Math.round(height)}
      </span>
    </div>
  );
};

