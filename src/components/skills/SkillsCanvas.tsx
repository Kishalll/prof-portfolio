import React, { useEffect, useRef, useState } from 'react';
import { 
  Code2, 
  Layout, 
  Brain, 
  Shield, 
  Layers
} from 'lucide-react';
import { gsap, waitForFontsAndLayout, getRelativeBounds, getRandomEdgePosition } from '../../animation/motionUtils';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { SelectionBox, GuideLines, CursorAgent } from '../canvas/overlays';

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
  const { personaPool, isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Header Elements
  const headerBadgeRef = useRef<HTMLDivElement>(null);
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerDescRef = useRef<HTMLParagraphElement>(null);

  // 4 Tray Refs
  const trayRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Selection Boxes (1 header + 4 trays)
  const boxHeaderRef = useRef<HTMLDivElement>(null);
  const boxTrayRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Cursors (1 header + 4 trays)
  const cursorHeaderRef = useRef<HTMLDivElement>(null);
  const cursorTrayRefs = [
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
        const containerH = containerRect.height || 600;

        const allContentElements = [
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          ...trayRefs.map((r) => r.current),
        ].filter(Boolean) as HTMLElement[];

        const allBoxes = [
          boxHeaderRef.current,
          ...boxTrayRefs.map((r) => r.current),
        ].filter(Boolean) as HTMLElement[];

        const allCursors = [
          cursorHeaderRef.current,
          ...cursorTrayRefs.map((r) => r.current),
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
          { key: 't0', el: trayRefs[0].current, box: boxTrayRefs[0].current, cursor: cursorTrayRefs[0].current, delay: 0.15, isHeadline: false },
          { key: 't1', el: trayRefs[1].current, box: boxTrayRefs[1].current, cursor: cursorTrayRefs[1].current, delay: 0.25, isHeadline: false },
          { key: 't2', el: trayRefs[2].current, box: boxTrayRefs[2].current, cursor: cursorTrayRefs[2].current, delay: 0.35, isHeadline: false },
          { key: 't3', el: trayRefs[3].current, box: boxTrayRefs[3].current, cursor: cursorTrayRefs[3].current, delay: 0.45, isHeadline: false },
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

        // Concurrently build trays with 60ms stagger
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

          // 3. Tray reveals inside box
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
      id="skills"
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
      <SelectionBox ref={boxTrayRefs[0]} dimensions={boxDims['t0']} />
      <SelectionBox ref={boxTrayRefs[1]} dimensions={boxDims['t1']} />
      <SelectionBox ref={boxTrayRefs[2]} dimensions={boxDims['t2']} />
      <SelectionBox ref={boxTrayRefs[3]} dimensions={boxDims['t3']} />

      {/* 3. AUTONOMOUS CURSOR AGENTS LAYER */}
      <CursorAgent ref={cursorHeaderRef} persona={personaPool[0] || { id: 'dev', name: 'Dev [Kishal]', role: 'Lead', color: '#CCFF00' }} actionLabel="Select Skills" />
      <CursorAgent ref={cursorTrayRefs[0]} persona={personaPool[7] || { id: 'syntax', name: 'Syntax_Worker', role: 'Runtime', color: '#CCFF00' }} actionLabel="Languages Tray" />
      <CursorAgent ref={cursorTrayRefs[1]} persona={personaPool[1] || { id: 'ui', name: 'UI_Design', role: 'Interface', color: '#FFFF00' }} actionLabel="Frontend Tray" />
      <CursorAgent ref={cursorTrayRefs[2]} persona={personaPool[9] || { id: 'rag', name: 'RAG_Worker', role: 'AI', color: '#DFFF00' }} actionLabel="Backend AI Tray" />
      <CursorAgent ref={cursorTrayRefs[3]} persona={personaPool[2] || { id: 'secops', name: 'SecOps', role: 'Security', color: '#FFFF00' }} actionLabel="Systems Sec Tray" />

      {/* 4. MAIN CONTENT DOM (Kept in layout; measured then revealed) */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="space-y-3 max-w-3xl min-h-[100px]">
          <div ref={headerBadgeRef} className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
            <Layers size={14} />
            <span>Skill Matrix &bull; Production Architecture</span>
          </div>

          <h2 
            ref={headerTitleRef}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            Technical Arsenal &amp; Auto-Layout Trays
          </h2>

          <p 
            ref={headerDescRef}
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
