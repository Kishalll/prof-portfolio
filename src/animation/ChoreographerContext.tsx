import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Synchronous lazy initializers so section effects never double-run on initial page load
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const currentlyMobile = window.innerWidth < 768;
        // Only update if the mobile breakpoint actually flipped
        if (currentlyMobile !== isMobileRef.current) {
          setIsMobile(currentlyMobile);
        }
      }, 150);
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const triggerReplay = useCallback(() => {
    if (globalLenis) {
      globalLenis.scrollTo(0, { immediate: false, duration: 1.0 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setReplayKey((prev) => prev + 1);

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
  }, []);

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
