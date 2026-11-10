import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Github, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Gamepad2, 
  Chrome, 
  ExternalLink,
  Bot
} from 'lucide-react';
import { gsap, ScrollTrigger, waitForFontsAndLayout } from '../../animation/motionUtils';
import { buildText, buildBlock, createTargetTrigger } from '../../animation/builders';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { useSectionChoreographer, ChoreographerLayer } from '../../animation/CursorChoreographer';
import { GuideLines } from '../canvas/overlays';

interface ProjectsCanvasProps {
  buildKey?: number;
}

interface ProjectData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  link: string;
  isExternal?: boolean;
  icon: React.ElementType;
  span?: string;
  accentColor: string;
  actionLabel: string;
}

const PROJECTS_DATA: ProjectData[] = [
  {
    id: 'ai-trains-ai',
    name: 'AI-Trains-AI',
    tagline: 'Role-Locked AI Assistant Framework with Synthetic Training & 4-Layer Guardrails',
    description: 'Framework for building, fine-tuning, evaluating, and deploying role-locked AI assistants where AI teaches AI. Features synthetic dataset generation via teacher models, CPU/CUDA LoRA fine-tuning (PyTorch/PEFT) on Qwen2.5, persistent ChromaDB RAG grounding, a 4-layer defense pipeline (input guardrails, regional script detection, jailbreak filters, output sanitization), and a FastAPI streaming server.',
    tech: ['Python', 'PyTorch', 'LoRA/PEFT', 'Ollama', 'ChromaDB', 'FastAPI', 'Qwen2.5', 'Linux CLI'],
    link: 'https://github.com/Kishalll/ai-trains-ai',
    icon: Bot,
    span: 'col-span-1',
    accentColor: '#CCFF00',
    actionLabel: 'Train AI Weights',
  },
  {
    id: 'hyprpilot',
    name: 'HyprPilot',
    tagline: 'Local Terminal Assistant for Linux System Automation',
    description: 'Locally hosted AI assistant for Linux system configuration and environment management, powered by a dense-vector RAG pipeline (FAISS + sentence-transformer embeddings) over curated system docs and configuration files. Automates system setup and terminal workflows with safety guardrails.',
    tech: ['Bash', 'Python', 'Linux CLI', 'FAISS RAG', 'Local Ollama'],
    link: 'https://github.com/Kishalll/hypr-pilot',
    icon: Terminal,
    span: 'col-span-1',
    accentColor: '#DFFF00',
    actionLabel: 'Assemble CLI Agent',
  },
  {
    id: 'threatlens',
    name: 'ThreatLens',
    tagline: 'Mobile Threat Detection with On-Device AI & Breach Alerts',
    description: 'React Native mobile security app combining message scam/phishing detection, breach monitoring, and image authenticity checks in one dashboard. Features NVIDIA NIM AI threat detection tuned for fraud patterns, background notification scanning across WhatsApp/SMS/Telegram, breach alerts (XposedOrNot, LeakCheck), DCT watermarking, and a Cloudflare Workers backend.',
    tech: ['React Native', 'Expo', 'Python', 'TypeScript', 'NVIDIA NIM', 'Cloudflare Workers', 'SQLite'],
    link: 'https://github.com/Kishalll/threat_lens',
    icon: ShieldCheck,
    span: 'col-span-1',
    accentColor: '#FFFF00',
    actionLabel: 'Verify Threat Model',
  },
  {
    id: 'fastfrwd',
    name: 'FastFrwd',
    tagline: 'Video Indexing & Document Q&A with Real-Time Streaming',
    description: 'Full-stack platform built with Vite and Express SSE for live playlist indexing and token-streamed AI chat. Uses a yt-dlp pipeline to chunk lecture videos into structured learning units with NVIDIA NIM RAG (nv-embedqa-e5-v5 + Llama 3.3 70B) and multi-format document ingestion (PDF, DOCX, TXT, MD).',
    tech: ['React.js', 'Node.js', 'Vite', 'Express SSE', 'NVIDIA NIM', 'yt-dlp', 'RAG'],
    link: 'https://github.com/Kishalll/fastfrwd',
    icon: Cpu,
    span: 'col-span-1',
    accentColor: '#DFFF00',
    actionLabel: 'Mount Vector RAG',
  },
  {
    id: 'promptwars',
    name: 'PromptWars',
    tagline: 'Multiplayer Prompt-Engineering Arena with Local LLM Scoring',
    description: 'LAN & web multiplayer prompt battle game where competitors battle across 3 rounds to describe hidden targets. Features synchronized round timers, Socket.IO real-time matchmaking, SQLite persistent leaderboards, and an Ollama local scoring pipeline combining embedding cosine similarity with an LLM evaluator.',
    tech: ['Next.js', 'React.js', 'Node.js', 'Socket.IO', 'SQLite', 'Ollama LLM'],
    link: 'https://github.com/Kishalll/PromptWars',
    icon: Gamepad2,
    span: 'col-span-1',
    accentColor: '#CCFF00',
    actionLabel: 'Build Arena Layout',
  },
  {
    id: 'egateway',
    name: 'eGateway Extension',
    tagline: 'Automatic Institutional Proxy Routing for Academic Portals',
    description: 'Manifest V3 Chrome extension detecting visits to supported academic repositories (IEEE Xplore, ScienceDirect, JSTOR, Springer, Wiley) and dynamically routing requests through institutional authentication proxies with session preservation.',
    tech: ['JavaScript', 'Chrome Extension API', 'Manifest V3', 'WebNavigation'],
    link: 'https://chromewebstore.google.com/detail/ajapkokgpikmgcoehejlhccjjgmhfblp?utm_source=item-share-cb',
    isExternal: true,
    icon: Chrome,
    span: 'col-span-1',
    accentColor: '#FFFFFF',
    actionLabel: 'Mount Proxy Engine',
  },
];

export const ProjectsCanvas: React.FC<ProjectsCanvasProps> = ({ buildKey = 0 }) => {
  const containerRef = useRef<HTMLElement>(null);
  const { isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Header Elements
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerDescRef = useRef<HTMLParagraphElement>(null);

  // 6 Project Card Refs
  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
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
          headerTitleRef.current,
          headerDescRef.current,
          ...cardRefs.map((r) => r.current),
        ].filter(Boolean),
        { autoAlpha: 0 }
      );
      agents.forEach((agent) => {
        if (agent.cursorRef.current) gsap.set(agent.cursorRef.current, { autoAlpha: 0 });
        if (agent.boxRef.current) gsap.set(agent.boxRef.current, { autoAlpha: 0 });
      });
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

        const allContentElements = [
          headerTitleRef.current,
          headerDescRef.current,
          ...cardRefs.map((r) => r.current),
        ].filter(Boolean) as HTMLElement[];

        if (prefersReducedMotion) {
          gsap.set(allContentElements, { autoAlpha: 1, y: 0, scale: 1 });
          return;
        }

        ctx.add(() => {
          // 0. Red Ruler onToggle
          const rulerEl = container.querySelector('.bg-\\[\\#FF3B30\\]');
          if (rulerEl) {
            gsap.set(rulerEl, { scaleY: 0, transformOrigin: 'top center', autoAlpha: 0 });
            ScrollTrigger.create({
              trigger: container,
              start: 'top bottom',
              end: 'bottom top',
              onToggle: (self) => {
                gsap.to(rulerEl, {
                  scaleY: self.isActive ? 1 : 0,
                  autoAlpha: self.isActive ? 0.85 : 0,
                  duration: 0.6,
                  ease: 'power2.out',
                });
              },
            });
          }

          // 1. Target: Header Title (SplitText typing)
          if (headerTitleRef.current) {
            const agent = assign({ target: headerTitleRef.current, label: 'Type Title', isHeadline: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: headerTitleRef.current,
              agent,
              agentIndex: 0,
              isHeadline: true,
              isMobile,
            });
            createTargetTrigger(headerTitleRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.08,
            });
          }

          // 2. Target: Header Desc (SplitText typing)
          if (headerDescRef.current) {
            const agent = assign({ target: headerDescRef.current, label: 'Format Bio', isParagraph: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: headerDescRef.current,
              agent,
              agentIndex: 1,
              isParagraph: true,
              isMobile,
            });
            createTargetTrigger(headerDescRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.14,
            });
          }

          // 3. Targets: 5 Project Cards
          cardRefs.forEach((cRef, idx) => {
            const cardEl = cRef.current;
            if (!cardEl) return;
            const proj = PROJECTS_DATA[idx];
            const agent = assign({ target: cardEl, label: proj.actionLabel });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: cardEl,
              agent,
              agentIndex: 2 + (idx % 5),
              isMobile,
            });

            createTargetTrigger(cardEl, tl, reset, {
              rebuildOnReentry,
              staggerDelay: (idx % 2) * 0.08,
            });
          });
        });

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
      className="relative pt-4 pb-10 sm:pt-6 sm:pb-14 min-h-[600px] w-full scroll-mt-16" 
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
          <h2 
            ref={headerTitleRef}
            style={initialStyle}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            Featured Projects
          </h2>

          <p 
            ref={headerDescRef}
            style={initialStyle}
            className="text-zinc-300 text-sm sm:text-base leading-relaxed"
          >
            Systems software, local AI tools, mobile security applications, and browser extensions built for real-world use.
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
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-kiwi transition-colors">
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
