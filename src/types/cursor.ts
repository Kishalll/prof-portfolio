export type CursorAction = 'idle' | 'drawing_frame' | 'injecting_tag' | 'typing' | 'validating';

export interface CursorPersona {
  id: string;
  name: string;
  role: string;
  color: string; // e.g., '#CCFF00', '#FFFF00', '#DFFF00', '#FFFFFF'
  accentBg: string;
  textColor: string;
}

export interface CursorPosition {
  x: number; // percentage or px
  y: number; // percentage or px
  targetX?: number;
  targetY?: number;
  action?: CursorAction;
  label?: string;
  isHovered?: boolean;
}

