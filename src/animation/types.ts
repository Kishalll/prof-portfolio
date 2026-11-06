export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface ChoreographerContextValue {
  replayKey: number;
  triggerReplay: () => void;
  rebuildOnReentry: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  personaPool: AgentPersona[];
}

