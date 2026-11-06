import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Code2, 
  Layout, 
  Brain, 
  Shield, 
  Layers
} from 'lucide-react';
import { gsap, ScrollTrigger, waitForFontsAndLayout, getRelativeBounds, getRandomEdgePosition, addCurvedCursorTravel, addSelectionBoxBuild, createFixedGuideLinesOverlay, addCursorIdleDrift, headingReveal } from '../../animation/motionUtils';
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
    id: 'languages-tray',
    title: 'Languages & Core Runtimes',
    badge: 'EXECUTION ENVIRONMENTS',
    description: 'Strict typing, systems compilation, shell automation, and relational querying.',
    skills: ['TypeScript', 'JavaScript', 'Python', 'C++', 'Bash/Shell', 'SQL', 'HTML5/CSS3'],
    icon: Code2,
    color: '#CCFF00',
    personaIndex: 0, // Dev [Kishal]
    actionLabel: 'Select Languages',
  },
  {
    id: 'frontend-tray',
    title: 'Frontend & Mobile Architecture',
    badge: 'INTERACTIVE CLIENTS',
    description: 'Responsive web apps, cross-platform mobile suites, and reactive UI component trees.',
    skills: ['React.js', 'React Native', 'Next.js', 'Tailwind CSS', 'Expo', 'Framer Motion', 'Vite', 'Redux Toolkit'],
    icon: Layout,
    color: '#FFFF00',
    personaIndex: 1, // UI_Design
    actionLabel: 'Layout Interface',
  },
  {
    id: 'backend-ai-tray',
    title: 'Backend, AI & RAG Pipelines',
    badge: 'INTELLIGENCE & SERVICES',
    description: 'Dense-vector retrieval, NVIDIA NIM models, local LLMs, and real-time streaming sockets.',
    skills: ['Node.js', 'Express.js', 'FastAPI', 'NVIDIA NIM', 'FAISS RAG', 'Local Ollama', 'Socket.IO', 'Server-Sent Events (SSE)', 'REST APIs'],
    icon: Brain,
    color: '#DFFF00',
    personaIndex: 4, // AI_Agent
    actionLabel: 'Deploy Vector DB',
  },
  {
    id: 'systems-sec-tray',
    title: 'Systems, Security & Cloud Edge',
    badge: 'INFRASTRUCTURE & CRYPTO',
    description: 'Cryptographic signatures, Linux window management, edge serverless, and cloud deployments.',
    skills: ['Linux / Hyprland CLI', 'Docker', 'P-256 ECDSA', 'Cloudflare Workers & D1', 'SQLite', 'Git & GitHub', 'AWS', 'Security Auditing'],
    icon: Shield,
    color: '#FFFF00',
    personaIndex: 2, // SecOps
    actionLabel: 'Assert Security',
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
        const containerH = containerRect.height || 600;

        const allContentElements = [
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          ...trayRefs.map((r) => r.current),
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
          { key: 'header', el: headerTitleRef.current, label: 'Select Skills', delay: 0.0, isHeadline: true },
          { key: 't0', el: trayRefs[0].current, label: 'Languages Tray', delay: 0.15, isHeadline: false },
          { key: 't1', el: trayRefs[1].current, label: 'Frontend Tray', delay: 0.25, isHeadline: false },
          { key: 't2', el: trayRefs[2].current, label: 'Backend AI Tray', delay: 0.35, isHeadline: false },
          { key: 't3', el: trayRefs[3].current, label: 'Systems Sec Tray', delay: 0.45, isHeadline: false },
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
          [headerTitleRef.current, trayRefs[0].current, trayRefs[1].current, trayRefs[2].current].filter(Boolean) as HTMLElement[],
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

        // Stat Scramble: Header Badge
        if (headerBadgeTextRef.current) {
          tl.to(
            headerBadgeTextRef.current,
            {
              scrambleText: {
                text: 'Skill Matrix • Production Architecture',
                chars: '0123456789ABCDEF!<>-_/[]{}',
                speed: 0.5,
              },
              duration: 0.75,
              ease: 'none',
            },
            0.15
          );
        }

        // Stat Scramble: Tray Badges
        SKILL_TRAYS.forEach((tray, idx) => {
          if (trayBadgeRefs[idx].current) {
            tl.to(
              trayBadgeRefs[idx].current,
              {
                scrambleText: {
                  text: tray.badge,
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

        // Concurrently build trays with 60ms stagger
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

          // 3. Tray reveals inside box
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
            <span ref={headerBadgeTextRef}>Skill Matrix &bull; Production Architecture</span>
          </div>

          <h2 
            ref={headerTitleRef}
            style={initialStyle}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            Technical Arsenal &amp; Auto-Layout Trays
          </h2>

          <p 
            ref={headerDescRef}
            style={initialStyle}
            className="text-zinc-300 text-sm sm:text-base leading-relaxed"
          >
            Domain-categorized auto-layout trays spanning system kernels, real-time AI vector stores, full-stack client runtimes, and cryptographic edge protocols.
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
