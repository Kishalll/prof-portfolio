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
    id: 'ui-ux',
    name: 'UI_Design',
    role: 'Layout & Auto-Layout',
    color: '#CCFF00',
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

  // Compute dynamic positions for the swarm across scroll progress
  const cursorStates = useMemo(() => {
    const states: Record<string, CursorState> = {};
    const centerX = viewportWidth / 2;

    // Zone 1: Hero Section Assembly (Scroll 0 - 380px)
    if (scrollY < 380) {
      // 1. Dev [Kishal]: Pulling Top-Left corner anchor handle
      states['dev-kishal'] = {
        x: Math.max(20, centerX - 480),
        y: 110 + scrollY * 0.35,
        actionText: '980 × 520',
        isDrawing: true,
      };

      // 2. UI_Design: Pulling Bottom-Right corner anchor handle
      states['ui-ux'] = {
        x: Math.min(viewportWidth - 140, centerX + 440),
        y: 530 + scrollY * 0.25,
        actionText: 'auto-layout: 32px',
        isDrawing: true,
      };

      // 3. SecOps: Inspecting ThreatLens chip
      states['secops'] = {
        x: Math.max(60, centerX - 140),
        y: 180 + scrollY * 0.28,
        actionText: '✓ P-256 ECDSA',
      };

      // 4. AI_Agent [RAG]: Inspecting FAISS RAG badge
      states['ai-rag'] = {
        x: Math.min(viewportWidth - 170, centerX + 180),
        y: 185 + scrollY * 0.26,
        actionText: 'FAISS Vector RAG',
      };

      // 5. Kernel [Linux]: Hovering near Primary CTA
      states['kernel'] = {
        x: Math.max(40, centerX - 360),
        y: 420 + scrollY * 0.38,
        actionText: 'Click: #projects',
      };

      // 6. QA_Audit: Stamping bottom spec check
      states['qa-audit'] = {
        x: Math.min(viewportWidth - 160, centerX + 260),
        y: 480 + scrollY * 0.3,
        actionText: 'PASS: 100%',
      };

      // 7. Reviewer: Inspecting top tag
      states['reviewer'] = {
        x: Math.max(40, centerX - 380),
        y: 95 + scrollY * 0.15,
        actionText: 'HeroSection.instance',
      };
    } else {
      // Zone 2: Swarm glides down into Design System & Foundation Cards
      const offset = scrollY - 380;

      states['dev-kishal'] = {
        x: Math.max(40, centerX - 360 + Math.sin(offset * 0.01) * 15),
        y: 640 + offset * 0.75,
        actionText: '#CCFF00 Kiwi',
        isDrawing: false,
      };

      states['secops'] = {
        x: Math.max(60, centerX - 120),
        y: 660 + offset * 0.78,
        actionText: '#FFFF00 SecOps',
      };

      states['ai-rag'] = {
        x: Math.min(viewportWidth - 160, centerX + 120),
        y: 655 + offset * 0.74,
        actionText: '#DFFF00 RAG',
      };

      states['ui-ux'] = {
        x: Math.min(viewportWidth - 140, centerX + 360),
        y: 670 + offset * 0.72,
        actionText: 'snap: 24px',
      };

      states['kernel'] = {
        x: Math.max(30, centerX - 380),
        y: 860 + offset * 0.86,
        actionText: 'Linux Architecture',
      };

      states['qa-audit'] = {
        x: centerX - 20,
        y: 870 + offset * 0.88,
        actionText: 'Security Verified',
      };

      states['reviewer'] = {
        x: Math.min(viewportWidth - 140, centerX + 340),
        y: 855 + offset * 0.84,
        actionText: 'Spec Approved',
      };
    }

    return states;
  }, [scrollY, viewportWidth]);

  // On mobile screens, limit active cursors to 2 so reading is comfortable
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
