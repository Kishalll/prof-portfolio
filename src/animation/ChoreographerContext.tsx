import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChoreographerContextValue, AgentPersona } from './types';
import { DEFAULT_PERSONA_POOL } from './personas';
import { globalLenis } from '../hooks/useLenis';
import { ScrollTrigger } from './motionUtils';

const ChoreographerContext = createContext<ChoreographerContextValue | null>(null);

interface ChoreographerProviderProps {
  children: React.ReactNode;
  rebuildOnReentry?: boolean;
}

export const ChoreographerProvider: React.FC<ChoreographerProviderProps> = ({
  children,
  rebuildOnReentry = false,
}) => {
  const [replayKey, setReplayKey] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMedia = () => {
      setIsMobile(window.innerWidth < 768);
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);
    };

    checkMedia();
    window.addEventListener('resize', checkMedia);
    return () => window.removeEventListener('resize', checkMedia);
  }, []);

  const triggerReplay = useCallback(() => {
    // Scroll cleanly back to top
    if (globalLenis) {
      globalLenis.scrollTo(0, { immediate: false, duration: 1.0 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Bump replayKey to cause section timelines to reconstruct and re-run
    setReplayKey((prev) => prev + 1);

    // Refresh ScrollTrigger calculations
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, []);

  // On mobile, cap active persona pool to 3 or 4 agents to optimize performance
  const activePersonaPool: AgentPersona[] = isMobile
    ? DEFAULT_PERSONA_POOL.slice(0, 4)
    : DEFAULT_PERSONA_POOL;

  const value: ChoreographerContextValue = {
    replayKey,
    triggerReplay,
    rebuildOnReentry,
    isMobile,
    prefersReducedMotion,
    personaPool: activePersonaPool,
  };

  return (
    <ChoreographerContext.Provider value={value}>
      {children}
    </ChoreographerContext.Provider>
  );
};

export function useChoreographer(): ChoreographerContextValue {
  const context = useContext(ChoreographerContext);
  if (!context) {
    throw new Error('useChoreographer must be used within a ChoreographerProvider');
  }
  return context;
}

