import React, { useRef, useMemo, useCallback } from 'react';
import { AgentPersona } from './types';
import { DEFAULT_PERSONA_POOL } from './personas';
import { swarm } from './swarm';
import { SelectionBox, CursorAgent } from '../components/canvas/overlays';

/**
 * Number of section-level cursor + selection-box elements rendered per section.
 * Independent of the swarm size: the swarm (global flock) has 12 agents on desktop and 4 on
 * mobile, but each section needs one element pair per build target so that two builds never
 * share (and fight over) the same DOM nodes.
 */
const SECTION_ELEMENT_POOL = Math.min(12, DEFAULT_PERSONA_POOL.length);

export interface ChoreographerTask {
  target: HTMLElement | null;
  label?: string;
  isHeadline?: boolean;
  isParagraph?: boolean;
  isIBeam?: boolean;
  variant?: 'pointer' | 'ibeam';
  delay?: number;
}

export interface ChoreographerAgent {
  id: string;
  persona: AgentPersona;
  cursorRef: React.RefObject<HTMLDivElement>;
  boxRef: React.RefObject<HTMLDivElement>;
  target: HTMLElement | null;
  label: string;
  isHeadline: boolean;
  variant: 'pointer' | 'ibeam';
  isBusy: boolean;
  allocatedAt: number;
}

export class CursorChoreographer {
  private pool: ChoreographerAgent[] = [];
  private maxPoolSize: number = 12;

  constructor(isMobile: boolean = false) {
    this.initPool(isMobile);
  }

  public initPool(_isMobile: boolean) {
    this.maxPoolSize = SECTION_ELEMENT_POOL;
    const personas = DEFAULT_PERSONA_POOL.slice(0, this.maxPoolSize);

    this.pool = personas.map((persona, idx) => ({
      id: `agent-${persona.id}-${idx}`,
      persona,
      cursorRef: React.createRef<HTMLDivElement>(),
      boxRef: React.createRef<HTMLDivElement>(),
      target: null,
      label: persona.name,
      isHeadline: false,
      variant: 'pointer',
      isBusy: false,
      allocatedAt: 0,
    }));
  }

  public assign(task: ChoreographerTask): ChoreographerAgent {
    // 1. Find a free agent
    let agent = this.pool.find((a) => !a.isBusy);

    // 2. If all agents are currently busy, reuse the least recently allocated one
    if (!agent) {
      agent = [...this.pool].sort((a, b) => a.allocatedAt - b.allocatedAt)[0];
    }

    agent.isBusy = true;
    agent.allocatedAt = Date.now();
    agent.target = task.target;
    agent.label = task.label || agent.persona.name;
    agent.isHeadline = !!task.isHeadline;
    agent.variant = task.variant || (task.isIBeam ? 'ibeam' : 'pointer');

    return agent;
  }

  public release(agent: ChoreographerAgent) {
    const found = this.pool.find((a) => a.id === agent.id);
    if (found) {
      found.isBusy = false;
      found.target = null;
    }
  }

  public releaseAll() {
    this.pool.forEach((a) => {
      a.isBusy = false;
      a.target = null;
    });
  }

  public getAgents(): ChoreographerAgent[] {
    return this.pool;
  }
}

/**
 * Hook providing a scoped choreographer instance with stable DOM refs for sections
 */
export function useSectionChoreographer(_isMobile: boolean = false) {
  const poolCap = SECTION_ELEMENT_POOL;
  const personas = useMemo(() => DEFAULT_PERSONA_POOL.slice(0, poolCap), [poolCap]);

  // Create stable refs array
  const cursorRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const boxRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  if (cursorRefs.current.length !== poolCap) {
    cursorRefs.current = Array.from({ length: poolCap }, () => React.createRef<HTMLDivElement>());
    boxRefs.current = Array.from({ length: poolCap }, () => React.createRef<HTMLDivElement>());
  }

  const agents = useMemo<ChoreographerAgent[]>(() => {
    return personas.map((persona, idx) => ({
      id: `agent-${persona.id}-${idx}`,
      persona,
      cursorRef: cursorRefs.current[idx],
      boxRef: boxRefs.current[idx],
      target: null,
      label: persona.name,
      isHeadline: false,
      variant: 'pointer',
      isBusy: false,
      allocatedAt: 0,
    }));
  }, [personas]);

  const assign = useCallback((task: ChoreographerTask): ChoreographerAgent => {
    let agent = agents.find((a) => !a.isBusy);
    if (!agent) {
      agent = [...agents].sort((a, b) => a.allocatedAt - b.allocatedAt)[0];
    }
    agent.isBusy = true;
    agent.allocatedAt = Date.now();
    agent.target = task.target;
    agent.label = task.label || agent.persona.name;
    agent.isHeadline = !!task.isHeadline;
    agent.variant = task.variant || (task.isIBeam ? 'ibeam' : 'pointer');
    return agent;
  }, [agents]);

  const release = useCallback((agent: ChoreographerAgent) => {
    const found = agents.find((a) => a.id === agent.id);
    if (found) {
      found.isBusy = false;
      found.target = null;
    }
  }, [agents]);

  const releaseAll = useCallback(() => {
    // Any swarm agent still away on one of this section's builds flies back to the flock
    swarm.handBackByCursorEls(agents.map((a) => a.cursorRef.current));
    agents.forEach((a) => {
      a.isBusy = false;
      a.target = null;
    });
  }, [agents]);

  return {
    agents,
    assign,
    release,
    releaseAll,
  };
}

/**
 * Shared Choreographer Layer that renders all pool agents & selection boxes
 */
export const ChoreographerLayer: React.FC<{ agents: ChoreographerAgent[] }> = ({ agents }) => {
  return (
    <>
      {agents.map((agent) => (
        <React.Fragment key={agent.id}>
          <SelectionBox ref={agent.boxRef} label={agent.label} />
          <CursorAgent
            ref={agent.cursorRef}
            persona={agent.persona}
            actionLabel={agent.label}
            variant={agent.variant}
          />
        </React.Fragment>
      ))}
    </>
  );
};

