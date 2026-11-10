import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { 
  Github, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Gamepad2, 
  Chrome, 
  ChevronDown,
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
  /** Full paragraph, shown on desktop */
  description: string;
  /** Phone view, collapsed: a short, complete overview */
  overview: string;
  /** Phone view, expanded: the detailed write-up (shares no sentences with `overview`) */
  details: { label: string; text: string }[];
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
    overview: "Builds AI assistants that stay within a fixed role. One model creates the training data for another, and a four-stage safety pipeline screens what goes in and what comes out.",
    details: [
      { label: "Training data", text: "Teacher models generate the synthetic dataset the assistant is trained on." },
      { label: "Fine-tuning", text: "Qwen2.5 is fine-tuned with LoRA using PyTorch and PEFT, on either CPU or CUDA, then evaluated before deployment." },
      { label: "Grounding", text: "Responses are grounded in a persistent ChromaDB store using retrieval-augmented generation." },
      { label: "Guardrails", text: "Input guardrails, regional script detection, jailbreak filters and output sanitization make up the four defence layers." },
      { label: "Serving", text: "A FastAPI server streams responses to the client." },
    ],
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
    overview: "A terminal assistant that runs entirely on your own machine and helps set up and manage a Linux system.",
    details: [
      { label: "Knowledge", text: "A dense-vector retrieval pipeline (FAISS with sentence-transformer embeddings) searches curated system docs and configuration files." },
      { label: "Automation", text: "It uses that context to automate system setup and everyday terminal workflows." },
      { label: "Safety", text: "Safety guardrails apply to the workflows it automates." },
      { label: "Runtime", text: "Written in Bash and Python, using a local Ollama model." },
    ],
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
    overview: "A mobile security app that brings scam detection, data-breach monitoring and image authenticity checks into one dashboard.",
    details: [
      { label: "Scam detection", text: "An NVIDIA NIM model tuned for fraud patterns checks messages for scam and phishing attempts." },
      { label: "Background scanning", text: "Notifications from WhatsApp, SMS and Telegram are scanned in the background." },
      { label: "Breach alerts", text: "Alerts are powered by XposedOrNot and LeakCheck." },
      { label: "Image checks", text: "Image authenticity is verified using DCT watermarking." },
      { label: "Architecture", text: "A React Native and Expo app with a Cloudflare Workers backend." },
    ],
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
    overview: "A web platform for learning from lecture videos and documents: it indexes them, then answers questions about them in a live chat.",
    details: [
      { label: "Video indexing", text: "A yt-dlp pipeline indexes playlists live and splits each lecture video into structured learning units." },
      { label: "Documents", text: "PDF, DOCX, TXT and Markdown files can be ingested alongside the videos." },
      { label: "Answers", text: "Retrieval-augmented generation with NVIDIA NIM, using nv-embedqa-e5-v5 embeddings and Llama 3.3 70B." },
      { label: "Streaming", text: "Express server-sent events stream the chat reply token by token to a Vite and React front end." },
    ],
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
    overview: "A multiplayer game where players write prompts to describe a hidden target, and a locally run language model scores how close each one gets.",
    details: [
      { label: "Gameplay", text: "Played over LAN or the web across three rounds, with synchronized round timers." },
      { label: "Matchmaking", text: "Socket.IO handles real-time matchmaking between players." },
      { label: "Scoring", text: "An Ollama pipeline combines embedding cosine similarity with an LLM evaluator." },
      { label: "Leaderboard", text: "Results persist in a SQLite leaderboard." },
      { label: "Built with", text: "Next.js, React and Node.js." },
    ],
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
    overview: "A Chrome extension that sends visits to academic journal sites through your institution's login proxy automatically.",
    details: [
      { label: "Supported sites", text: "IEEE Xplore, ScienceDirect, JSTOR, Springer and Wiley." },
      { label: "Routing", text: "It detects a visit to one of these sites and reroutes the requests through the institutional authentication proxy." },
      { label: "Session", text: "Your session is preserved while requests are rerouted." },
      { label: "Built with", text: "JavaScript on Manifest V3, using the Chrome WebNavigation API." },
    ],
    tech: ['JavaScript', 'Chrome Extension API', 'Manifest V3', 'WebNavigation'],
    link: 'https://chromewebstore.google.com/detail/ajapkokgpikmgcoehejlhccjjgmhfblp?utm_source=item-share-cb',
    isExternal: true,
    icon: Chrome,
    span: 'col-span-1',
    accentColor: '#FFFFFF',
    actionLabel: 'Mount Proxy Engine',
  },
];

/**
 * Phone-only card body. Collapsed it shows a short overview; "Read more" swaps it for the detailed
 * write-up. The two views never share a paragraph. (Desktop keeps the full description.)
 */
const ProjectReadMore: React.FC<{
  id: string;
  overview: string;
  details: { label: string; text: string }[];
}> = ({ id, overview, details }) => {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-details`;

  const toggle = () => {
    setOpen((v) => !v);
    // The card changes height: let ScrollTrigger re-measure everything below it
    window.setTimeout(() => ScrollTrigger.refresh(), 360);
  };

  const pane = 'grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out';

  return (
    <div className="md:hidden pt-2">
      <div
        className={`${pane} ${open ? 'grid-rows-[0fr] opacity-0 invisible' : 'grid-rows-[1fr] opacity-100 visible'}`}
        aria-hidden={open}
      >
        <p className="min-h-0 overflow-hidden text-sm text-zinc-400 leading-relaxed">{overview}</p>
      </div>

      <div
        id={panelId}
        className={`${pane} ${open ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'}`}
        aria-hidden={!open}
      >
        <dl className="min-h-0 overflow-hidden space-y-3.5">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-[11px] font-mono font-semibold uppercase tracking-wider text-kiwi/80">{d.label}</dt>
              <dd className="mt-0.5 text-sm text-zinc-300 leading-relaxed">{d.text}</dd>
            </div>
          ))}
        </dl>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="mt-2 -mb-1 inline-flex items-center gap-1.5 min-h-11 pr-3 text-sm font-semibold text-kiwi"
      >
        {open ? 'Show less' : 'Read more'}
        <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};

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
                className={`relative ${project.span || 'col-span-1'} md:min-h-[300px]`}
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
                  <div className="space-y-2 md:min-h-[90px]">
                    <p className="text-xs sm:text-[13px] font-mono font-medium text-zinc-200 leading-snug">
                      {project.tagline}
                    </p>
                    <p className="hidden md:block text-sm text-zinc-400 leading-relaxed font-normal">
                      {project.description}
                    </p>
                    <ProjectReadMore id={project.id} overview={project.overview} details={project.details} />
                  </div>

                  {/* TECH STACK TAGS */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-kiwi-border/60 relative min-h-[36px]">
                    {project.tech.map((t) => (
                      <span 
                        key={t}
                        className="px-2 py-0.5 text-[11px] font-mono rounded bg-black/90 border border-zinc-800 text-zinc-300 font-medium shadow-sm hover:border-kiwi hover:text-white transition-colors"
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
