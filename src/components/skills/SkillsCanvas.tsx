import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Terminal, 
  Brain, 
  Server, 
  Layout, 
  Layers
} from 'lucide-react';
import { gsap, ScrollTrigger, waitForFontsAndLayout } from '../../animation/motionUtils';
import { buildText, buildBlock, createTargetTrigger } from '../../animation/builders';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { useSectionChoreographer, ChoreographerLayer } from '../../animation/CursorChoreographer';
import { GuideLines } from '../canvas/overlays';

interface SkillsCanvasProps {
  buildKey?: number;
}

interface SkillTrayData {
  id: string;
  title: string;
  badge: string;
  description: string;
  skills: string[];
  icon: React.ElementType;
  color: string;
  personaIndex: number;
  actionLabel: string;
}

const SKILL_TRAYS: SkillTrayData[] = [
  {
    id: 'systems-tray',
    title: 'Systems, Shell & Languages',
    badge: 'SYSTEMS & LANGUAGES',
    description: 'Low-level system languages, shell scripting, strict typing, and relational databases.',
    skills: ['Linux / Bash', 'Python', 'C++', 'TypeScript', 'JavaScript', 'SQL', 'Git & GitHub'],
    icon: Terminal,
    color: '#DFFF00',
    personaIndex: 5, // Kernel
    actionLabel: 'Inspect Kernel & Shell',
  },
  {
    id: 'ai-tray',
    title: 'AI/ML, RAG & Local Models',
    badge: 'APPLIED AI & ML PIPELINES',
    description: 'Local model fine-tuning, vector search, dense retrieval, and multi-layer agent orchestration.',
    skills: ['PyTorch', 'LoRA / PEFT', 'Ollama', 'ChromaDB', 'FAISS RAG', 'NVIDIA NIM', 'FastAPI', 'Hugging Face'],
    icon: Brain,
    color: '#CCFF00',
    personaIndex: 4, // AI_Agent
    actionLabel: 'Deploy Model Pipeline',
  },
  {
    id: 'devops-tray',
    title: 'Systems Deployment & DevOps',
    badge: 'SYSTEMS DEPLOYMENT & DEVOPS',
    description: 'Reverse proxy routing (Nginx, Caddy), containerization, serverless edge functions, and deployment pipelines.',
    skills: ['Nginx', 'Caddy', 'Docker', 'Linux Server', 'Cloudflare Workers & D1', 'SQLite', 'AWS', 'REST APIs', 'Server-Sent Events (SSE)'],
    icon: Server,
    color: '#FFFF00',
    personaIndex: 2, // SecOps
    actionLabel: 'Verify Deployment',
  },
  {
    id: 'frontend-tray',
    title: 'Frontend & Mobile Applications',
    badge: 'FULL-STACK & CLIENTS',
    description: 'Cross-platform mobile apps and responsive web interfaces built with modern reactive component frameworks.',
    skills: ['React.js', 'React Native', 'Next.js', 'Vite', 'Expo', 'Tailwind CSS', 'Redux Toolkit', 'Framer Motion'],
    icon: Layout,
    color: '#CCFF00',
    personaIndex: 1, // UI_Design
    actionLabel: 'Render Client Tree',
  },
];

export const SkillsCanvas: React.FC<SkillsCanvasProps> = ({ buildKey = 0 }) => {
  const containerRef = useRef<HTMLElement>(null);
  const { isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Header Elements
  const headerBadgeRef = useRef<HTMLDivElement>(null);
  const headerBadgeTextRef = useRef<HTMLSpanElement>(null);
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerDescRef = useRef<HTMLParagraphElement>(null);

  // 4 Tray Refs
  const trayRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const trayBadgeRefs = [
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
          ...trayRefs.map((r) => r.current),
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
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          ...trayRefs.map((r) => r.current),
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

          // 1. Target: Header Badge
          if (headerBadgeRef.current) {
            const agent = assign({ target: headerBadgeRef.current, label: 'Select Badge' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: headerBadgeRef.current,
              agent,
              agentIndex: 0,
              totalAgents: 8,
              isMobile,
            });

            if (headerBadgeTextRef.current) {
              tl.to(
                headerBadgeTextRef.current,
                {
                  scrambleText: {
                    text: 'Skills & Technologies • Tech Stack',
                    chars: '0123456789ABCDEF!<>-_/[]{}',
                    speed: 0.5,
                  },
                  duration: 0.75,
                  ease: 'none',
                },
                '-=0.2'
              );
            }

            const fullReset = () => {
              reset();
              if (headerBadgeTextRef.current) {
                headerBadgeTextRef.current.textContent = 'Skills & Technologies • Tech Stack';
              }
            };

            createTargetTrigger(headerBadgeRef.current, tl, fullReset, {
              rebuildOnReentry,
              staggerDelay: 0.0,
            });
          }

          // 2. Target: Header Title (SplitText typing)
          if (headerTitleRef.current) {
            const agent = assign({ target: headerTitleRef.current, label: 'Type Skills Title', isHeadline: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: headerTitleRef.current,
              agent,
              agentIndex: 1,
              totalAgents: 8,
              isHeadline: true,
              isMobile,
            });
            createTargetTrigger(headerTitleRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.08,
            });
          }

          // 3. Target: Header Desc (SplitText typing)
          if (headerDescRef.current) {
            const agent = assign({ target: headerDescRef.current, label: 'Format Description', isParagraph: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: headerDescRef.current,
              agent,
              agentIndex: 2,
              totalAgents: 8,
              isParagraph: true,
              isMobile,
            });
            createTargetTrigger(headerDescRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.14,
            });
          }

          // 4. Targets: 4 Skill Trays
          trayRefs.forEach((tRef, idx) => {
            const trayEl = tRef.current;
            if (!trayEl) return;
            const trayData = SKILL_TRAYS[idx];
            const agent = assign({ target: trayEl, label: trayData.actionLabel });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: trayEl,
              agent,
              agentIndex: 3 + idx,
              totalAgents: 8,
              isMobile,
            });

            const badgeSpan = trayBadgeRefs[idx].current;
            if (badgeSpan) {
              tl.to(
                badgeSpan,
                {
                  scrambleText: {
                    text: trayData.badge,
                    chars: '0123456789ABCDEF!<>-_/[]{}',
                    speed: 0.5,
                  },
                  duration: 0.7,
                  ease: 'none',
                },
                '-=0.2'
              );
            }

            const fullReset = () => {
              reset();
              if (badgeSpan) badgeSpan.textContent = trayData.badge;
            };

            createTargetTrigger(trayEl, tl, fullReset, {
              rebuildOnReentry,
              staggerDelay: idx * 0.08,
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
      className="relative pt-8 pb-16 sm:pt-12 sm:pb-20 min-h-[600px] w-full scroll-mt-24" 
      id="skills"
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
            <Layers size={14} />
            <span ref={headerBadgeTextRef}>Skills &amp; Technologies &bull; Tech Stack</span>
          </div>

          <h2 
            ref={headerTitleRef}
            style={initialStyle}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            Technologies &amp; Tools
          </h2>

          <p 
            ref={headerDescRef}
            style={initialStyle}
            className="text-zinc-300 text-sm sm:text-base leading-relaxed"
          >
            Languages, frameworks, and developer tools I work with across systems engineering, AI pipelines, and application development.
          </p>
        </div>

        {/* SKILL TRAYS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {SKILL_TRAYS.map((tray, idx) => {
            const Icon = tray.icon;
            return (
              <div 
                key={tray.id}
                ref={trayRefs[idx]}
                style={initialStyle}
                className="relative min-h-[260px]"
              >
                <div className="relative p-6 sm:p-7 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex flex-col justify-between gap-5 shadow-xl overflow-hidden h-full group">
                  
                  {/* TRAY HEADER */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl bg-black border flex items-center justify-center shrink-0 shadow-md"
                      style={{ borderColor: `${tray.color}40` }}
                    >
                      <Icon size={18} style={{ color: tray.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span 
                        ref={trayBadgeRefs[idx]}
                        className="text-[10px] font-mono font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-black/80 border inline-block"
                        style={{ 
                          color: tray.color,
                          borderColor: `${tray.color}30` 
                        }}
                      >
                        {tray.badge}
                      </span>

                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1 group-hover:text-kiwi transition-colors">
                        {tray.title}
                      </h3>
                    </div>
                  </div>

                  {/* TRAY SPEC */}
                  <div className="min-h-[40px]">
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                      {tray.description}
                    </p>
                  </div>

                  {/* AUTO-LAYOUT SKILL PILLS */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-kiwi-border/60 relative min-h-[50px]">
                    {tray.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="px-2.5 py-1 text-xs font-mono rounded-lg bg-black/90 border border-zinc-800 text-zinc-300 font-medium shadow-sm hover:border-kiwi hover:text-white transition-colors"
                      >
                        {skill}
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
