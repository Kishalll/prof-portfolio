import React, { useEffect, useRef, useState } from 'react';
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
import { gsap, waitForFontsAndLayout, getRelativeBounds, getRandomEdgePosition } from '../../animation/motionUtils';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { SelectionBox, GuideLines, CursorAgent } from '../canvas/overlays';

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
  const { personaPool, isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Header Elements
  const headerBadgeRef = useRef<HTMLDivElement>(null);
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

  // Selection Boxes (1 header + 5 cards)
  const boxHeaderRef = useRef<HTMLDivElement>(null);
  const boxCardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Cursors (1 header + 5 cards)
  const cursorHeaderRef = useRef<HTMLDivElement>(null);
  const cursorCardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // GuideLines Refs
  const hLineRef = useRef<HTMLDivElement>(null);
  const vLineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  // Dimensions state
  const [boxDims, setBoxDims] = useState<Record<string, { width: number; height: number }>>({});

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

        const allBoxes = [
          boxHeaderRef.current,
          ...boxCardRefs.map((r) => r.current),
        ].filter(Boolean) as HTMLElement[];

        const allCursors = [
          cursorHeaderRef.current,
          ...cursorCardRefs.map((r) => r.current),
        ].filter(Boolean) as HTMLElement[];

        if (prefersReducedMotion) {
          gsap.set(allContentElements, { autoAlpha: 1, y: 0, filter: 'none', clipPath: 'none' });
          gsap.set(allBoxes, { autoAlpha: 0 });
          gsap.set(allCursors, { autoAlpha: 0 });
          return;
        }

        // Hide content initially in layout
        gsap.set(allContentElements, { autoAlpha: 0 });
        gsap.set(allBoxes, { autoAlpha: 0 });
        gsap.set([hLineRef.current, vLineRef.current], { autoAlpha: 0 });

        const targets = [
          { key: 'header', el: headerTitleRef.current, box: boxHeaderRef.current, cursor: cursorHeaderRef.current, delay: 0.0, isHeadline: true },
          { key: 'p0', el: cardRefs[0].current, box: boxCardRefs[0].current, cursor: cursorCardRefs[0].current, delay: 0.15, isHeadline: false },
          { key: 'p1', el: cardRefs[1].current, box: boxCardRefs[1].current, cursor: cursorCardRefs[1].current, delay: 0.25, isHeadline: false },
          { key: 'p2', el: cardRefs[2].current, box: boxCardRefs[2].current, cursor: cursorCardRefs[2].current, delay: 0.35, isHeadline: false },
          { key: 'p3', el: cardRefs[3].current, box: boxCardRefs[3].current, cursor: cursorCardRefs[3].current, delay: 0.45, isHeadline: false },
          { key: 'p4', el: cardRefs[4].current, box: boxCardRefs[4].current, cursor: cursorCardRefs[4].current, delay: 0.55, isHeadline: false },
        ];

        const calculatedDims: Record<string, { width: number; height: number }> = {};
        const measured = targets.map((t) => {
          if (!t.el) return null;
          const bounds = getRelativeBounds(t.el, container);
          calculatedDims[t.key] = { width: bounds.width, height: bounds.height };
          const start = getRandomEdgePosition(containerW, containerH);
          return { ...t, bounds, start };
        }).filter(Boolean) as (typeof targets[0] & { bounds: { x: number; y: number; width: number; height: number }; start: { x: number; y: number } })[];

        setBoxDims(calculatedDims);

        // Position cursors at initial off-screen edges
        measured.forEach((t) => {
          if (t.cursor) {
            gsap.set(t.cursor, { x: t.start.x, y: t.start.y, autoAlpha: 1 });
          }
        });

        // Master ScrollTrigger Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top 75%',
            once: !rebuildOnReentry,
          },
        });

        // Red ruler line
        if (rulerRef.current && !isMobile) {
          tl.fromTo(
            rulerRef.current,
            { scaleY: 0, transformOrigin: 'top center', autoAlpha: 0 },
            { scaleY: 1, autoAlpha: 0.8, duration: 0.7, ease: 'power2.out' },
            0.0
          );
        }

        // Header badge & desc
        if (headerBadgeRef.current) {
          tl.fromTo(headerBadgeRef.current, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.0);
        }
        if (headerDescRef.current) {
          tl.fromTo(headerDescRef.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.2);
        }

        // Concurrently build cards with 60ms stagger
        measured.forEach((t) => {
          const { el, box, cursor, bounds, delay, isHeadline } = t;

          // 1. Cursor enters
          if (cursor) {
            tl.to(
              cursor,
              {
                x: bounds.x + Math.min(16, bounds.width * 0.1),
                y: bounds.y + Math.min(16, bounds.height * 0.2),
                duration: 0.65,
                ease: 'back.out(1.4)',
              },
              delay
            );
          }

          // 2. Selection Box expands with 8 handles
          if (box) {
            tl.fromTo(
              box,
              {
                x: bounds.x,
                y: bounds.y,
                width: 28,
                height: 18,
                autoAlpha: 1,
              },
              {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                duration: 0.52,
                ease: 'expo.out',
              },
              delay + 0.2
            );

            // Snap guide lines
            if (hLineRef.current && vLineRef.current && !isMobile) {
              tl.set(hLineRef.current, { top: bounds.y, autoAlpha: 0.7 }, delay + 0.2);
              tl.set(vLineRef.current, { left: bounds.x, autoAlpha: 0.7 }, delay + 0.2);
              tl.to([hLineRef.current, vLineRef.current], { autoAlpha: 0, duration: 0.25 }, delay + 0.45);
            }

            // Selection box fades out
            tl.to(
              box,
              {
                autoAlpha: 0,
                duration: 0.35,
                ease: 'power2.inOut',
              },
              delay + 0.8
            );
          }

          // 3. Card reveals inside box
          if (el) {
            if (isHeadline) {
              tl.fromTo(
                el,
                { autoAlpha: 0, filter: 'blur(8px)', y: 12, clipPath: 'inset(0 0 100% 0)' },
                { autoAlpha: 1, filter: 'blur(0px)', y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'power3.out' },
                delay + 0.35
              );
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
            const idleOffset = getRandomEdgePosition(containerW, containerH);
            tl.to(
              cursor,
              {
                x: bounds.x + (Math.random() - 0.5) * 40,
                y: bounds.y + (Math.random() - 0.5) * 40,
                duration: 0.45,
                ease: 'power1.out',
              },
              delay + 0.75
            );
            tl.to(
              cursor,
              {
                x: idleOffset.x * 0.85,
                y: idleOffset.y * 0.85,
                opacity: 0.3,
                duration: 1.5,
                ease: 'power2.out',
              },
              delay + 1.2
            );
          }
        });
      };

      initScrollBuild();
    }, container);

    return () => {
      isCancelled = true;
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
        hLineRef={hLineRef}
        vLineRef={vLineRef}
        rulerRef={rulerRef}
      />

      {/* 2. SELECTION BOXES LAYER */}
      <SelectionBox ref={boxHeaderRef} dimensions={boxDims['header']} />
      <SelectionBox ref={boxCardRefs[0]} dimensions={boxDims['p0']} />
      <SelectionBox ref={boxCardRefs[1]} dimensions={boxDims['p1']} />
      <SelectionBox ref={boxCardRefs[2]} dimensions={boxDims['p2']} />
      <SelectionBox ref={boxCardRefs[3]} dimensions={boxDims['p3']} />
      <SelectionBox ref={boxCardRefs[4]} dimensions={boxDims['p4']} />

      {/* 3. AUTONOMOUS CURSOR AGENTS LAYER */}
      <CursorAgent ref={cursorHeaderRef} persona={personaPool[0] || { id: 'dev', name: 'Dev [Kishal]', role: 'Lead', color: '#CCFF00' }} actionLabel="Select Projects" />
      <CursorAgent ref={cursorCardRefs[0]} persona={personaPool[2] || { id: 'secops', name: 'SecOps', role: 'Security', color: '#FFFF00' }} actionLabel="ThreatLens Frame" />
      <CursorAgent ref={cursorCardRefs[1]} persona={personaPool[5] || { id: 'kernel', name: 'Kernel', role: 'Systems', color: '#DFFF00' }} actionLabel="HyprPilot Frame" />
      <CursorAgent ref={cursorCardRefs[2]} persona={personaPool[4] || { id: 'ai', name: 'AI_Agent', role: 'RAG', color: '#DFFF00' }} actionLabel="FastFrwd Frame" />
      <CursorAgent ref={cursorCardRefs[3]} persona={personaPool[1] || { id: 'ui', name: 'UI_Design', role: 'Arena', color: '#CCFF00' }} actionLabel="PromptWars Frame" />
      <CursorAgent ref={cursorCardRefs[4]} persona={personaPool[6] || { id: 'reviewer', name: 'Reviewer', role: 'Proxy', color: '#FFFFFF' }} actionLabel="eGateway Frame" />

      {/* 4. MAIN CONTENT DOM (Kept in layout; measured then revealed) */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="space-y-3 max-w-3xl min-h-[100px]">
          <div ref={headerBadgeRef} className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
            <FolderGit2 size={14} />
            <span>Selected Engineering Works &bull; 2025–2026</span>
          </div>

          <h2 
            ref={headerTitleRef}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            Featured Systems &amp; Production Pipelines
          </h2>

          <p 
            ref={headerDescRef}
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
