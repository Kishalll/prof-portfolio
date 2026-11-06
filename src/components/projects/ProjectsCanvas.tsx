import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Github, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Gamepad2, 
  Chrome, 
  FolderGit2,
  ExternalLink
} from 'lucide-react';

interface ProjectsCanvasProps {
  onFollowChange?: (followingIds: string[]) => void;
  buildKey?: number;
}

interface ProjectData {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  tech: string[];
  link: string;
  isExternal?: boolean;
  builderPersona: {
    id: string;
    name: string;
    color: string;
    action: string;
  };
  subHelperPersona: {
    id: string;
    name: string;
    color: string;
    action: string;
  };
  icon: React.ElementType;
  span?: string;
  accentColor: string;
}

const PROJECTS_DATA: ProjectData[] = [
  {
    id: 'threatlens',
    name: 'ThreatLens',
    badge: 'Flagship • Mobile Cybersecurity',
    tagline: 'Multi-Vector Mobile Threat Detection & Cryptographic Verification',
    description: 'React Native mobile security suite combining message scam/phishing detection, breach monitoring, and image authenticity verification. Integrates NVIDIA NIM AI threat detection (Llama 3.2 Vision + Mistral Nemotron fallback) tuned for regional fraud patterns, background notification scanning across WhatsApp/SMS/Telegram, DCT watermarking, P-256 ECDSA cryptographic assertion, and a Cloudflare Workers & D1 edge backend.',
    tech: ['React Native', 'Expo', 'Python', 'TypeScript', 'NVIDIA NIM', 'Cloudflare Workers', 'P-256 ECDSA', 'SQLite'],
    link: 'https://github.com/Kishalll/threat_lens',
    builderPersona: {
      id: 'secops',
      name: 'SecOps',
      color: '#FFFF00',
      action: 'Construct Security Suite',
    },
    subHelperPersona: {
      id: 'crypto-bot',
      name: 'Crypto_Worker',
      color: '#CCFF00',
      action: 'Inject P-256 Keys',
    },
    icon: ShieldCheck,
    span: 'col-span-1 md:col-span-2',
    accentColor: '#FFFF00',
  },
  {
    id: 'hyprpilot',
    name: 'HyprPilot',
    badge: 'Agentic AI • Linux Systems',
    tagline: 'Locally Hosted Terminal Assistant for Hyprland Configurations',
    description: 'Local agentic AI assistant for Hyprland desktop management on Linux, powered by a dense-vector RAG pipeline (FAISS + sentence-transformer embeddings) over curated system configs and dotfiles. Automates window rules and keybind orchestration with safety guardrails.',
    tech: ['Bash', 'Python', 'Hyprland', 'FAISS RAG', 'Local Ollama', 'Linux CLI'],
    link: 'https://github.com/Kishalll/hypr-pilot',
    builderPersona: {
      id: 'kernel',
      name: 'Kernel [Linux]',
      color: '#DFFF00',
      action: 'Assemble Kernel CLI',
    },
    subHelperPersona: {
      id: 'hypr-helper',
      name: 'Wayland_Worker',
      color: '#CCFF00',
      action: 'Wire IPC Sockets',
    },
    icon: Terminal,
    span: 'col-span-1',
    accentColor: '#DFFF00',
  },
  {
    id: 'fastfrwd',
    name: 'FastFrwd',
    badge: 'Streaming AI • Video RAG',
    tagline: 'Token-Streamed Video Indexing & Knowledge Synthesis',
    description: 'Full-stack platform built with Vite and Express SSE token streams for live playlist indexing and multi-format document RAG. Features an automated yt-dlp pipeline to chunk lectures into structured learning units with NVIDIA NIM batched embeddings.',
    tech: ['React.js', 'Node.js', 'Vite', 'Express SSE', 'NVIDIA NIM', 'yt-dlp RAG'],
    link: 'https://github.com/Kishalll/fastfrwd',
    builderPersona: {
      id: 'ai-rag',
      name: 'AI_Agent',
      color: '#DFFF00',
      action: 'Deploy RAG Pipeline',
    },
    subHelperPersona: {
      id: 'sse-streamer',
      name: 'SSE_Worker',
      color: '#FFFF00',
      action: 'Batch Token Streams',
    },
    icon: Cpu,
    span: 'col-span-1',
    accentColor: '#DFFF00',
  },
  {
    id: 'promptwars',
    name: 'PromptWars',
    badge: 'Real-Time • Multiplayer AI',
    tagline: 'Synchronized Prompt-Engineering Arena with Local LLM Scoring',
    description: 'LAN & web multiplayer prompt battle game where competitors battle across 3 rounds to describe hidden targets. Features synchronized round timers, Socket.IO real-time room matchmaking, SQLite persistent leaderboards, and an Ollama local scoring pipeline.',
    tech: ['Next.js', 'React.js', 'Node.js', 'Socket.IO', 'SQLite', 'Ollama LLM'],
    link: 'https://github.com/Kishalll/PromptWars',
    builderPersona: {
      id: 'ui-ux',
      name: 'UI_Design',
      color: '#CCFF00',
      action: 'Build Arena Layout',
    },
    subHelperPersona: {
      id: 'socket-sync',
      name: 'Socket_Worker',
      color: '#FFFFFF',
      action: 'Sync Match Rooms',
    },
    icon: Gamepad2,
    span: 'col-span-1',
    accentColor: '#CCFF00',
  },
  {
    id: 'egateway',
    name: 'eGateway Extension',
    badge: 'Manifest V3 • Network Security',
    tagline: 'Automated Academic Research Proxy Routing Engine',
    description: 'Manifest V3 Chrome extension detecting visits to supported academic repositories (IEEE Xplore, ScienceDirect, JSTOR, Springer, Wiley) and dynamically routing requests through institutional authentication proxies with cookie diffing and session preservation.',
    tech: ['JavaScript', 'Chrome Extension API', 'Manifest V3', 'Cookie Diffing'],
    link: 'https://chromewebstore.google.com/detail/ajapkokgpikmgcoehejlhccjjgmhfblp?utm_source=item-share-cb',
    isExternal: true,
    builderPersona: {
      id: 'reviewer',
      name: 'Reviewer',
      color: '#FFFFFF',
      action: 'Mount Extension Proxy',
    },
    subHelperPersona: {
      id: 'cookie-diff',
      name: 'Proxy_Worker',
      color: '#FFFF00',
      action: 'Diff Session Cookies',
    },
    icon: Chrome,
    span: 'col-span-1',
    accentColor: '#FFFFFF',
  },
];

// Sub-Component: Individual Micro-Constructed Project Card
const ProjectCardBuilder: React.FC<{
  project: ProjectData;
  isSectionInView: boolean;
  onComplete: (personaId: string) => void;
}> = ({ project, isSectionInView, onComplete }) => {
  // Step Progression:
  // 0: Unbuilt / empty
  // 1: Frame drawing (blank inside, no text/icons exist yet) (0 - 350ms)
  // 2: Icon drops, badge stamps, title types letter-by-letter (350ms - 900ms)
  // 3: Description streams character-by-character (900ms - 1500ms)
  // 4: Tech stack tags injected one-by-one by helper cursors (1500ms - 1950ms)
  // 5: Complete -> snap flash, cursors release to mouse follow (1950ms+)
  const [step, setStep] = useState(0);
  const [titleChars, setTitleChars] = useState(0);
  const [descChars, setDescChars] = useState(0);
  const [visibleTags, setVisibleTags] = useState(0);

  const Icon = project.icon;

  useEffect(() => {
    if (!isSectionInView) {
      setStep(0);
      setTitleChars(0);
      setDescChars(0);
      setVisibleTags(0);
      return;
    }

    // Step 1: Draw empty frame outline (blank inside)
    setStep(1);

    // Step 2: Drop icon & badge, start typing title letter-by-letter (350ms)
    let titleInterval: ReturnType<typeof setInterval> | null = null;
    const tStep2 = setTimeout(() => {
      setStep(2);
      let count = 0;
      titleInterval = setInterval(() => {
        count += 1;
        if (count >= project.name.length) {
          setTitleChars(project.name.length);
          if (titleInterval) clearInterval(titleInterval);
        } else {
          setTitleChars(count);
        }
      }, 35);
    }, 350);

    // Step 3: Stream technical description character-by-character (900ms)
    let descInterval: ReturnType<typeof setInterval> | null = null;
    const tStep3 = setTimeout(() => {
      setStep(3);
      let dCount = 0;
      descInterval = setInterval(() => {
        dCount += 4;
        if (dCount >= project.description.length) {
          setDescChars(project.description.length);
          if (descInterval) clearInterval(descInterval);
        } else {
          setDescChars(dCount);
        }
      }, 18);
    }, 900);

    // Step 4: Inject tech stack tags one-by-one (1500ms)
    let tagInterval: ReturnType<typeof setInterval> | null = null;
    const tStep4 = setTimeout(() => {
      setStep(4);
      let tCount = 0;
      tagInterval = setInterval(() => {
        tCount += 1;
        if (tCount >= project.tech.length) {
          setVisibleTags(project.tech.length);
          if (tagInterval) clearInterval(tagInterval);
        } else {
          setVisibleTags(tCount);
        }
      }, 60);
    }, 1500);

    // Step 5: Complete construction, release persona to mouse follow (2000ms)
    const tStep5 = setTimeout(() => {
      setStep(5);
      setTitleChars(project.name.length);
      setDescChars(project.description.length);
      setVisibleTags(project.tech.length);
      onComplete(project.builderPersona.id);
    }, 2000);

    return () => {
      clearTimeout(tStep2);
      clearTimeout(tStep3);
      clearTimeout(tStep4);
      clearTimeout(tStep5);
      if (titleInterval) clearInterval(titleInterval);
      if (descInterval) clearInterval(descInterval);
      if (tagInterval) clearInterval(tagInterval);
    };
  }, [isSectionInView, project.name, project.description, project.tech.length, project.builderPersona.id]);

  if (!isSectionInView || step === 0) return null;

  const isBuilding = step >= 1 && step < 5;

  return (
    <div className={`relative ${project.span || 'col-span-1'} min-h-[300px]`}>
      {/* 1. CARD FRAME: Empty container drawn open diagonally from top-left */}
      <motion.div
        className="relative p-6 sm:p-7 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex flex-col justify-between gap-6 shadow-xl origin-top-left overflow-hidden h-full group"
        initial={{ scaleX: 0.05, scaleY: 0.1, opacity: 0 }}
        animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        {/* Step 1 Cursor: Dragging the blank frame open */}
        {isBuilding && step === 1 && (
          <motion.div
            className="absolute pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
            initial={{ left: '0%', top: '10%' }}
            animate={{ left: '92%', top: '90%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
              <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={project.builderPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span 
              className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
              style={{ color: project.builderPersona.color, borderColor: `${project.builderPersona.color}60` }}
            >
              {project.builderPersona.name} &bull; Draw Card Frame
            </span>
          </motion.div>
        )}

        {/* 2. ARCHITECTURE HEADER: Icon, Badge, Title Typed, Source Link */}
        {step >= 2 && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Dropped Icon Box with Snap Animation */}
              <motion.div 
                className="w-10 h-10 rounded-xl bg-black border flex items-center justify-center shrink-0 shadow-md"
                style={{ borderColor: `${project.accentColor}40` }}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              >
                <Icon size={18} style={{ color: project.accentColor }} />
              </motion.div>

              <div>
                {/* Category Badge Pill with Snap Animation */}
                <motion.span 
                  className="text-[11px] font-mono font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-black/80 border inline-block"
                  style={{ 
                    color: project.accentColor,
                    borderColor: `${project.accentColor}30` 
                  }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {project.badge}
                </motion.span>

                {/* Project Title TYPED LETTER-BY-LETTER with Cursor on Caret */}
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 group-hover:text-kiwi transition-colors inline-block">
                  {project.name.slice(0, titleChars)}

                  {/* Title Typing Caret Cursor */}
                  {isBuilding && step === 2 && (
                    <span className="inline-block relative ml-1 align-baseline">
                      <span className="inline-block w-1.5 sm:w-2 h-5 sm:h-6 bg-kiwi animate-pulse align-middle" />
                      <span className="absolute -top-7 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                        <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                          <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={project.builderPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        <span 
                          className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                          style={{ color: project.builderPersona.color, borderColor: `${project.builderPersona.color}60` }}
                        >
                          {project.builderPersona.name} &bull; Type Title
                        </span>
                      </span>
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Source Link Button Dropped by Helper Cursor */}
            <motion.a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-black/80 border border-kiwi-border text-zinc-400 hover:text-black hover:bg-kiwi hover:border-kiwi transition-all duration-200 shrink-0 shadow-md flex items-center gap-1.5 text-xs font-semibold relative"
              aria-label={`Open ${project.name} repository`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.15 }}
            >
              {project.isExternal ? (
                <>
                  <span className="hidden sm:inline">Web Store</span>
                  <ExternalLink size={15} />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Source</span>
                  <Github size={15} />
                </>
              )}

              {/* Sub-Helper Cursor dropping the Source link */}
              {isBuilding && step === 2 && (
                <div className="absolute -bottom-7 -left-6 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                  <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                    <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={project.subHelperPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  <span 
                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                    style={{ color: project.subHelperPersona.color, borderColor: `${project.subHelperPersona.color}60` }}
                  >
                    {project.subHelperPersona.name} &bull; Link
                  </span>
                </div>
              )}
            </motion.a>
          </div>
        )}

        {/* 3. TECHNICAL SPEC STREAM: Tagline & Detailed Technical Description */}
        {step >= 3 && (
          <div className="space-y-2 min-h-[90px]">
            <motion.p 
              className="text-xs font-mono font-medium text-zinc-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {project.tagline}
            </motion.p>

            {/* Description Streamed Character by Character */}
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal inline">
              {project.description.slice(0, descChars)}

              {/* Cursor riding the description stream caret */}
              {isBuilding && step === 3 && (
                <span className="inline-block relative ml-1 align-baseline">
                  <span className="inline-block w-1.5 h-3.5 bg-zinc-300 animate-pulse align-middle" />
                  <span className="absolute -top-7 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={project.builderPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span 
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                      style={{ color: project.builderPersona.color, borderColor: `${project.builderPersona.color}60` }}
                    >
                      {project.builderPersona.name} &bull; Stream Spec
                    </span>
                  </span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* 4. TECH STACK TAGS: Injected One by One with Sub-Helper Cursors */}
        {step >= 4 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-kiwi-border/60 relative min-h-[36px]">
            {project.tech.slice(0, visibleTags).map((t) => (
              <motion.span 
                key={t}
                className="px-2 py-0.5 text-[10px] font-mono rounded bg-black/90 border border-zinc-800 text-zinc-300 font-medium shadow-sm"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                {t}
              </motion.span>
            ))}

            {/* Sub-Helper Cursor stamping the tech stack tags */}
            {isBuilding && step === 4 && (
              <motion.div 
                className="absolute -top-7 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                initial={{ left: '0%' }}
                animate={{ left: `${Math.min(visibleTags * 12, 85)}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={project.subHelperPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span 
                  className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                  style={{ color: project.subHelperPersona.color, borderColor: `${project.subHelperPersona.color}60` }}
                >
                  {project.subHelperPersona.name} &bull; Stamp Tech Stack
                </span>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const ProjectsCanvas: React.FC<ProjectsCanvasProps> = ({ 
  onFollowChange,
  buildKey = 0,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { 
    amount: 0.15,
  });

  const [completedPersonas, setCompletedPersonas] = useState<string[]>([]);
  const [titleChars, setTitleChars] = useState(0);

  const fullTitle = "Featured Systems & Production Pipelines";

  useEffect(() => {
    // UNBUILD: When section leaves viewport, collapse back to 0
    if (!isInView) {
      setCompletedPersonas([]);
      setTitleChars(0);
      if (onFollowChange) onFollowChange([]);
      return;
    }

    // SIMULTANEOUS PARALLEL BUILD WITH INDIVIDUAL HANDOFF:
    setCompletedPersonas([]);
    setTitleChars(0);
    if (onFollowChange) onFollowChange([]);

    const finished = new Set<string>();

    const releasePersonas = (newIds: string[]) => {
      newIds.forEach(id => finished.add(id));
      const arr = Array.from(finished);
      setCompletedPersonas(arr);
      if (onFollowChange) onFollowChange(arr);
    };

    // Concurrently stream headline letter-by-letter with Dev [Kishal] cursor
    let titleInterval: ReturnType<typeof setInterval> | null = null;
    let tCount = 0;
    titleInterval = setInterval(() => {
      tCount += 1;
      if (tCount >= fullTitle.length) {
        setTitleChars(fullTitle.length);
        if (titleInterval) clearInterval(titleInterval);
        // Dev finishes title typing and immediately follows mouse
        releasePersonas(['dev-kishal', 'qa-audit']);
      } else {
        setTitleChars(tCount);
      }
    }, 28);

    return () => {
      if (titleInterval) clearInterval(titleInterval);
    };
  }, [isInView, buildKey]);

  const handleCardComplete = (personaId: string) => {
    setCompletedPersonas(prev => {
      const next = Array.from(new Set([...prev, personaId]));
      if (onFollowChange) onFollowChange(next);
      return next;
    });
  };

  return (
    <section 
      ref={containerRef}
      className="relative pt-8 pb-16 sm:pt-12 sm:pb-20 min-h-[600px]" 
      id="projects"
    >
      {/* NO OUTER BOX - CLEAN DIRECT CANVAS PRESENTATION */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* SECTION HEADER (Typed letter-by-letter with Dev [Kishal] cursor) */}
        {isInView && (
          <div className="space-y-3 max-w-3xl min-h-[100px]">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
              <FolderGit2 size={14} />
              <span>Selected Engineering Works &bull; 2025–2026</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block">
              {fullTitle.slice(0, titleChars)}

              {/* Dev Kishal cursor riding the typing caret */}
              {!completedPersonas.includes('dev-kishal') && (
                <span className="inline-block relative ml-1 align-baseline">
                  <span className="inline-block w-2 sm:w-2.5 h-6 sm:h-10 bg-kiwi animate-pulse align-middle" />
                  <span className="absolute -top-8 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#CCFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-kiwi border border-kiwi/50 ml-2 mt-0.5">
                      Dev [Kishal] &bull; Typing
                    </span>
                  </span>
                </span>
              )}
            </h2>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Full-stack platforms, local RAG engines, cryptographic security architectures, and system-level tooling built with rigorous engineering standards.
            </p>
          </div>
        )}

        {/* PROJECTS GRID: Each Card Built Step-by-Step by its Swarm and Sub-Helper Cursors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {PROJECTS_DATA.map((project) => (
            <ProjectCardBuilder
              key={project.id}
              project={project}
              isSectionInView={isInView}
              onComplete={handleCardComplete}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
