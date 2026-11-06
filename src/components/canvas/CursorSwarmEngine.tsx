import { useEffect, useState, useMemo } from 'react';
import { CollaborativeCursor } from './CollaborativeCursor';
import { CursorPersona } from '../../types/cursor';

const SWARM_PERSONAS: CursorPersona[] = [
  {
    id: 'dev-kishal',
    name: 'Dev [Kishal]',
    role: 'Lead Architect',
    color: '#CCFF00', // Electric Kiwi Lime
    accentBg: '#12140D',
    textColor: '#CCFF00',
  },
  {
    id: 'secops',
    name: 'SecOps',
    role: 'Security & Verification',
    color: '#FFFF00', // Electric Yellow
    accentBg: '#14140D',
    textColor: '#FFFF00',
  },
  {
    id: 'ai-rag',
    name: 'AI_Agent [RAG]',
    role: 'Vector Embeddings',
    color: '#DFFF00', // Chartreuse
    accentBg: '#13140D',
    textColor: '#DFFF00',
  },
  {
    id: 'ui-ux',
    name: 'UI_Design',
    role: 'Layout & Auto-Layout',
    color: '#CCFF00',
    accentBg: '#12140D',
    textColor: '#CCFF00',
  },
  {
    id: 'kernel',
    name: 'Kernel [Linux]',
    role: 'Systems & Tooling',
    color: '#DFFF00',
    accentBg: '#13140D',
    textColor: '#DFFF00',
  },
  {
    id: 'qa-audit',
    name: 'QA_Audit',
    role: 'Test Assertions',
    color: '#FFFF00',
    accentBg: '#14140D',
    textColor: '#FFFF00',
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    role: 'Code Quality',
    color: '#FFFFFF',
    accentBg: '#1A1A1A',
    textColor: '#FFFFFF',
  },
];

interface CursorState {
  x: number;
  y: number;
  actionText?: string;
  isDrawing?: boolean;
}

export const CursorSwarmEngine = () => {
  const [scrollY, setScrollY] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width < 768);
    };

    handleResize();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Compute dynamic positions for the swarm based on scroll and screen layout
  const cursorStates = useMemo(() => {
    const states: Record<string, CursorState> = {};
    const centerX = viewportWidth / 2;

    // Scroll interpolation phases
    // Zone 1: Hero Section (0 - 350px)
    // Zone 2: Design System & Swatches (350px - 850px)
    // Zone 3: Lower Technical Pillars (850px+)

    if (scrollY < 350) {
      // SQUAD A (Frame Builders): Dev [Kishal] & UI_Design pulling opposite corners
      states['dev-kishal'] = {
        x: Math.max(30, centerX - 420),
        y: 200 + scrollY * 0.4,
        actionText: '960 × 440',
        isDrawing: true,
      };

      states['ui-ux'] = {
        x: Math.min(viewportWidth - 140, centerX + 380),
        y: 420 + scrollY * 0.3,
        actionText: 'Auto-Layout [H]',
        isDrawing: true,
      };

      // SQUAD B (Tag Injectors): SecOps & AI_Agent dropping badges
      states['secops'] = {
        x: Math.max(50, centerX - 120),
        y: 155 + scrollY * 0.2,
        actionText: '✓ P-256 ECDSA',
      };

      states['ai-rag'] = {
        x: Math.min(viewportWidth - 160, centerX + 180),
        y: 280 + scrollY * 0.35,
        actionText: 'FAISS Vector RAG',
      };

      // SQUAD C (Review & Kernel): Inspecting CTA buttons
      states['kernel'] = {
        x: Math.max(40, centerX - 320),
        y: 460 + scrollY * 0.45,
        actionText: 'Linux CLI',
      };

      states['qa-audit'] = {
        x: Math.min(viewportWidth - 180, centerX + 140),
        y: 455 + scrollY * 0.4,
        actionText: 'PASS: 100%',
      };

      states['reviewer'] = {
        x: Math.min(viewportWidth - 120, centerX + 320),
        y: 90 + scrollY * 0.1,
        actionText: 'Spec Approved',
      };
    } else {
      // Swarm converges onto Design System & Technical Pillars
      const offset = scrollY - 350;

      // Dev [Kishal] & SecOps inspect the color architecture tokens
      states['dev-kishal'] = {
        x: Math.max(40, centerX - 340 + Math.sin(offset * 0.01) * 15),
        y: 560 + offset * 0.7,
        actionText: '#CCFF00 Kiwi',
        isDrawing: false,
      };

      states['secops'] = {
        x: Math.max(60, centerX - 120),
        y: 580 + offset * 0.75,
        actionText: '#FFFF00 Alert',
      };

      states['ai-rag'] = {
        x: Math.min(viewportWidth - 160, centerX + 110),
        y: 575 + offset * 0.72,
        actionText: '#DFFF00 Node',
      };

      states['ui-ux'] = {
        x: Math.min(viewportWidth - 140, centerX + 340),
        y: 590 + offset * 0.68,
        actionText: 'snap: 24px',
      };

      // Kernel, QA, and Reviewer converge on Technical Pillars
      states['kernel'] = {
        x: Math.max(30, centerX - 360),
        y: 780 + offset * 0.85,
        actionText: 'Hyprland Rice',
      };

      states['qa-audit'] = {
        x: centerX - 20,
        y: 790 + offset * 0.88,
        actionText: 'ThreatLens Zero-Day',
      };

      states['reviewer'] = {
        x: Math.min(viewportWidth - 140, centerX + 320),
        y: 775 + offset * 0.82,
        actionText: 'Clean Code',
      };
    }

    return states;
  }, [scrollY, viewportWidth]);

  // On mobile screens, display a minimal 2-cursor squad so content stays readable
  const activePersonas = isMobile 
    ? SWARM_PERSONAS.slice(0, 2) 
    : SWARM_PERSONAS;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden z-30" 
      aria-hidden="true"
    >
      {activePersonas.map((persona) => {
        const state = cursorStates[persona.id];
        if (!state) return null;

        return (
          <CollaborativeCursor
            key={persona.id}
            persona={persona}
            x={state.x}
            y={state.y}
            actionText={state.actionText}
            isDrawing={state.isDrawing}
          />
        );
      })}
    </div>
  );
};

