import React, { useEffect, useLayoutEffect, useRef } from 'react';
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
import { gsap, ScrollTrigger, waitForFontsAndLayout, getRelativeBounds, getRandomEdgePosition, addCurvedCursorTravel, addSelectionBoxBuild, createFixedGuideLinesOverlay, addCursorIdleDrift, headingReveal } from '../../animation/motionUtils';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { useSectionChoreographer, ChoreographerLayer } from '../../animation/CursorChoreographer';
import { GuideLines } from '../canvas/overlays';

interface ProjectsCanvasProps {
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
  icon: React.ElementType;
  span?: string;
  accentColor: string;
  personaIndex: number;
  actionLabel: string;
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
    icon: ShieldCheck,
    span: 'col-span-1 md:col-span-2',
    accentColor: '#FFFF00',
    personaIndex: 2, // SecOps
    actionLabel: 'Select ThreatLens',
  },
  {
    id: 'hyprpilot',
    name: 'HyprPilot',
    badge: 'Agentic AI • Linux Systems',
    tagline: 'Locally Hosted Terminal Assistant for Hyprland Configurations',
    description: 'Local agentic AI assistant for Hyprland desktop management on Linux, powered by a dense-vector RAG pipeline (FAISS + sentence-transformer embeddings) over curated system configs and dotfiles. Automates window rules and keybind orchestration with safety guardrails.',
    tech: ['Bash', 'Python', 'Hyprland', 'FAISS RAG', 'Local Ollama', 'Linux CLI'],
    link: 'https://github.com/Kishalll/hypr-pilot',
    icon: Terminal,
    span: 'col-span-1',
    accentColor: '#DFFF00',
    personaIndex: 5, // Kernel
    actionLabel: 'Assemble HyprPilot',
  },
  {
    id: 'fastfrwd',
    name: 'FastFrwd',
    badge: 'Streaming AI • Video RAG',
    tagline: 'Token-Streamed Video Indexing & Knowledge Synthesis',
    description: 'Full-stack platform built with Vite and Express SSE token streams for live playlist indexing and multi-format document RAG. Features an automated yt-dlp pipeline to chunk lectures into structured learning units with NVIDIA NIM batched embeddings.',
    tech: ['React.js', 'Node.js', 'Vite', 'Express SSE', 'NVIDIA NIM', 'yt-dlp RAG'],
    link: 'https://github.com/Kishalll/fastfrwd',
    icon: Cpu,
    span: 'col-span-1',
    accentColor: '#DFFF00',
    personaIndex: 4, // AI_Agent
    actionLabel: 'Mount Vector RAG',
  },
  {
    id: 'promptwars',
    name: 'PromptWars',
    badge: 'Real-Time • Multiplayer AI',
    tagline: 'Synchronized Prompt-Engineering Arena with Local LLM Scoring',
    description: 'LAN & web multiplayer prompt battle game where competitors battle across 3 rounds to describe hidden targets. Features synchronized round timers, Socket.IO real-time room matchmaking, SQLite persistent leaderboards, and an Ollama local scoring pipeline.',
    tech: ['Next.js', 'React.js', 'Node.js', 'Socket.IO', 'SQLite', 'Ollama LLM'],
    link: 'https://github.com/Kishalll/PromptWars',
    icon: Gamepad2,
    span: 'col-span-1',
    accentColor: '#CCFF00',
    personaIndex: 1, // UI_Design
    actionLabel: 'Build Arena Layout',
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
    icon: Chrome,
    span: 'col-span-1',
    accentColor: '#FFFFFF',
    personaIndex: 6, // Reviewer
    actionLabel: 'Mount Proxy Engine',
  },
];

export const ProjectsCanvas: React.FC<ProjectsCanvasProps> = ({ buildKey = 0 }) => {
  const containerRef = useRef<HTMLElement>(null);
  const { isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Header Elements
  const headerBadgeRef = useRef<HTMLDivElement>(null);
  const headerBadgeTextRef = useRef<HTMLSpanElement>(null);
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerDescRef = useRef<HTMLParagraphElement>(null);

  // 5 Project Card Refs
  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const badgeRefs = [
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
    useRef<HTMLSpanElement>(null),
  ];

  // Pool-managed autonomous cursor choreographer
  const { agents, assign, releaseAll } = useSectionChoreographer(isMobile);

  const initialStyle = prefersReducedMotion ? undefined : { opacity: 0, visibility: 'hidden' as const };

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.set(
        [
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          ...cardRefs.map((r) => r.current),
        ].filter(Boolean),
        { autoAlpha: 0 }
      );
    }, container);

    return () => ctx.revert();
  }, [buildKey, prefersReducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isCancelled = false;

    const ctx = gsap.context(() => {
      const initScrollBuild = async () => {
        await waitForFontsAndLayout();
        if (isCancelled || !container) return;

        const containerRect = container.getBoundingClientRect();
        const containerW = containerRect.width || window.innerWidth;
        const containerH = containerRect.height || 800;

        const allContentElements = [
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          ...cardRefs.map((r) => r.current),
        ].filter(Boolean) as HTMLElement[];

        const allBoxes = agents.map((a) => a.boxRef.current).filter(Boolean) as HTMLElement[];
        const allCursors = agents.map((a) => a.cursorRef.current).filter(Boolean) as HTMLElement[];

        if (prefersReducedMotion) {
          gsap.set(allContentElements, { autoAlpha: 1, y: 0, filter: 'none', clipPath: 'none' });
          gsap.set(allBoxes, { autoAlpha: 0 });
          gsap.set(allCursors, { autoAlpha: 0 });
          return;
        }

        // Hide content initially in layout
        gsap.set(allContentElements, { autoAlpha: 0 });
        gsap.set(allBoxes, { autoAlpha: 0 });

        const targets = [
          { key: 'header', el: headerTitleRef.current, label: 'Select Projects', delay: 0.0, isHeadline: true },
          { key: 'p0', el: cardRefs[0].current, label: 'ThreatLens Frame', delay: 0.15, isHeadline: false },
          { key: 'p1', el: cardRefs[1].current, label: 'HyprPilot Frame', delay: 0.25, isHeadline: false },
          { key: 'p2', el: cardRefs[2].current, label: 'FastFrwd Frame', delay: 0.35, isHeadline: false },
          { key: 'p3', el: cardRefs[3].current, label: 'PromptWars Frame', delay: 0.45, isHeadline: false },
          { key: 'p4', el: cardRefs[4].current, label: 'eGateway Frame', delay: 0.55, isHeadline: false },
        ];

        const measured = targets.map((t) => {
          if (!t.el) return null;
          const bounds = getRelativeBounds(t.el, container);
          const start = getRandomEdgePosition(containerW, containerH);
          const agent = assign({ target: t.el, label: t.label, isHeadline: t.isHeadline });
          return {
            ...t,
            bounds,
            start,
            agent,
            box: agent.boxRef.current,
            cursor: agent.cursorRef.current,
          };
        }).filter(Boolean) as (typeof targets[0] & {
          bounds: { x: number; y: number; width: number; height: number };
          start: { x: number; y: number };
          box: HTMLDivElement | null;
          cursor: HTMLDivElement | null;
        })[];

        // Position cursors at initial off-screen edges
        measured.forEach((t) => {
          if (t.cursor) {
            gsap.set(t.cursor, { x: t.start.x, y: t.start.y, autoAlpha: 1 });
          }
        });

        // Master ScrollTrigger Timeline
        ctx.add(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
              once: !rebuildOnReentry,
            },
          });

        // Fixed viewport guide lines overlay (2-4 H & V lines spanning viewport + red ruler)
        const cleanupGuideLines = createFixedGuideLinesOverlay(
          tl,
          [headerTitleRef.current, cardRefs[0].current, cardRefs[1].current, cardRefs[2].current].filter(Boolean) as HTMLElement[],
          {
            showRuler: !isMobile,
            rulerOffset: isMobile ? 12 : 28,
            delay: 0.05,
          }
        );

        // Header badge & desc
        if (headerBadgeRef.current) {
          tl.fromTo(headerBadgeRef.current, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.0);
        }
        if (headerDescRef.current) {
          tl.fromTo(headerDescRef.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.2);
        }

        // Stat Scramble: Header Badge Year
        if (headerBadgeTextRef.current) {
          tl.to(
            headerBadgeTextRef.current,
            {
              scrambleText: {
                text: 'Selected Engineering Works • 2025–2026',
                chars: '0123456789ABCDEF!<>-_/[]{}',
                speed: 0.5,
              },
              duration: 0.75,
              ease: 'none',
            },
            0.15
          );
        }

        // Stat Scramble: Project Card Badges
        PROJECTS_DATA.forEach((proj, idx) => {
          if (badgeRefs[idx].current) {
            tl.to(
              badgeRefs[idx].current,
              {
                scrambleText: {
                  text: proj.badge,
                  chars: '0123456789ABCDEF!<>-_/[]{}',
                  speed: 0.5,
                },
                duration: 0.7,
                ease: 'none',
              },
              0.25 + idx * 0.1
            );
          }
        });

        // Concurrently build cards with 60ms stagger
        measured.forEach((t, i) => {
          const { el, box, cursor, bounds, delay, isHeadline } = t;
          const targetPos = {
            x: bounds.x + Math.min(16, bounds.width * 0.1),
            y: bounds.y + Math.min(16, bounds.height * 0.2),
          };

          // 1. Cursor enters along curved path with overshoot and banking
          if (cursor) {
            addCurvedCursorTravel(tl, cursor, t.start, targetPos, {
              duration: 0.75,
              position: delay,
              ease: 'back.out(1.2)',
            });
          }

          // 2. Selection Box expands with 8 handles via transforms
          if (box) {
            addSelectionBoxBuild(tl, box, bounds, targetPos, {
              delay: delay + 0.2,
              duration: 0.52,
              fadeDelay: delay + 0.8,
              ease: 'expo.out',
            });
          }

          // 3. Card reveals inside box
          if (el) {
            if (isHeadline) {
              headingReveal(tl, el, {
                duration: 0.7,
                position: delay + 0.35,
              });
            } else {
              tl.fromTo(
                el,
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                delay + 0.35
              );
            }
          }

          // 4. Cursor idles & drifts to edge
          if (cursor) {
            addCursorIdleDrift(
              tl,
              cursor,
              i,
              measured.length,
              containerW,
              containerH,
              delay + 1.0
            );
          }
        });

        return () => {
          cleanupGuideLines?.();
        };
      });

      // Ensure ScrollTrigger updates trigger metrics after DOM calculations
      ScrollTrigger.refresh();
    };

    initScrollBuild();
    }, container);

    return () => {
      isCancelled = true;
      releaseAll();
      ctx.revert();
    };
  }, [buildKey, prefersReducedMotion, isMobile, rebuildOnReentry]);

  return (
    <section 
      ref={containerRef}
      className="relative pt-8 pb-16 sm:pt-12 sm:pb-20 min-h-[600px] w-full" 
      id="projects"
    >
      {/* 1. GUIDELINES OVERLAY LAYER */}
      <GuideLines
        showRuler={!isMobile}
        rulerOffset={isMobile ? 12 : 28}
      />

      {/* 2. POOL-MANAGED AUTONOMOUS CURSOR & SELECTION BOX OVERLAYS */}
      <ChoreographerLayer agents={agents} />

      {/* 4. MAIN CONTENT DOM (Kept in layout; measured then revealed) */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="space-y-3 max-w-3xl min-h-[100px]">
          <div ref={headerBadgeRef} style={initialStyle} className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
            <FolderGit2 size={14} />
            <span ref={headerBadgeTextRef}>Selected Engineering Works &bull; 2025–2026</span>
          </div>

          <h2 
            ref={headerTitleRef}
            style={initialStyle}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            Featured Systems &amp; Production Pipelines
          </h2>

          <p 
            ref={headerDescRef}
            style={initialStyle}
            className="text-zinc-300 text-sm sm:text-base leading-relaxed"
          >
            Full-stack platforms, local RAG engines, cryptographic security architectures, and system-level tooling built with rigorous engineering standards.
          </p>
        </div>

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {PROJECTS_DATA.map((project, idx) => {
            const Icon = project.icon;
            return (
              <div 
                key={project.id}
                ref={cardRefs[idx]}
                style={initialStyle}
                className={`relative ${project.span || 'col-span-1'} min-h-[300px]`}
              >
                <div className="relative p-6 sm:p-7 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex flex-col justify-between gap-6 shadow-xl overflow-hidden h-full group">
                  
                  {/* ARCHITECTURE HEADER */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl bg-black border flex items-center justify-center shrink-0 shadow-md"
                        style={{ borderColor: `${project.accentColor}40` }}
                      >
                        <Icon size={18} style={{ color: project.accentColor }} />
                      </div>

                      <div>
                        <span 
                          ref={badgeRefs[idx]}
                          className="text-[11px] font-mono font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-black/80 border inline-block"
                          style={{ 
                            color: project.accentColor,
                            borderColor: `${project.accentColor}30` 
                          }}
                        >
                          {project.badge}
                        </span>

                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 group-hover:text-kiwi transition-colors">
                          {project.name}
                        </h3>
                      </div>
                    </div>

                    {/* Action link */}
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-black/80 border border-kiwi-border text-zinc-400 hover:text-black hover:bg-kiwi hover:border-kiwi transition-all duration-200 shrink-0 shadow-md flex items-center gap-1.5 text-xs font-semibold relative"
                      aria-label={`Open ${project.name} repository`}
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
                    </a>
                  </div>

                  {/* SPECS & DESCRIPTION */}
                  <div className="space-y-2 min-h-[90px]">
                    <p className="text-xs font-mono font-medium text-zinc-300">
                      {project.tagline}
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                      {project.description}
                    </p>
                  </div>

                  {/* TECH STACK TAGS */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-kiwi-border/60 relative min-h-[36px]">
                    {project.tech.map((t) => (
                      <span 
                        key={t}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-black/90 border border-zinc-800 text-zinc-300 font-medium shadow-sm hover:border-kiwi hover:text-white transition-colors"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
