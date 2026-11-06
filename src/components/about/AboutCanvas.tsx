import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  BookOpen, 
  MessageSquare 
} from 'lucide-react';
import { gsap, ScrollTrigger, waitForFontsAndLayout, getRelativeBounds, getRandomEdgePosition, addCurvedCursorTravel, addSelectionBoxBuild, createFixedGuideLinesOverlay, addCursorIdleDrift, headingReveal } from '../../animation/motionUtils';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { useSectionChoreographer, ChoreographerLayer } from '../../animation/CursorChoreographer';
import { GuideLines } from '../canvas/overlays';

interface AboutCanvasProps {
  buildKey?: number;
}

const PILLARS_DATA = [
  {
    id: 'ai-pillar',
    number: '01',
    title: 'Applied AI & RAG',
    description: 'End-to-end fullstack apps with dense-vector RAG architectures (FAISS, NVIDIA NIM, Ollama) and real-time streaming interfaces.',
    icon: Cpu,
    color: '#CCFF00',
    personaIndex: 4, // AI_Agent
    actionLabel: 'Deploy RAG Vector',
  },
  {
    id: 'linux-pillar',
    number: '02',
    title: 'Linux Systems',
    description: 'Extensive exploration of Wayland/Hyprland dotfiles, Bash automation, Docker containerization, and terminal-first workflows.',
    icon: Terminal,
    color: '#DFFF00',
    personaIndex: 5, // Kernel
    actionLabel: 'Assemble Wayland CLI',
  },
  {
    id: 'sec-pillar',
    number: '03',
    title: 'Security & Auth',
    description: 'Rigorous security implementations: P-256 ECDSA cryptographic verification, DCT watermarking, phishing intelligence, and session diffing.',
    icon: ShieldCheck,
    color: '#FFFF00',
    personaIndex: 2, // SecOps
    actionLabel: 'Assert P-256 Auth',
  },
];

export const AboutCanvas: React.FC<AboutCanvasProps> = ({ buildKey = 0 }) => {
  const containerRef = useRef<HTMLElement>(null);
  const { isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Content Element Refs
  const headerBadgeRef = useRef<HTMLDivElement>(null);
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerDescRef = useRef<HTMLDivElement>(null);
  const pillarRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const pillarNumRefs = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];
  const pin1Ref = useRef<HTMLDivElement>(null);
  const pin2Ref = useRef<HTMLDivElement>(null);

  // GuideLines Refs
  const hLineRef = useRef<HTMLDivElement>(null);
  const vLineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

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
          ...pillarRefs.map((r) => r.current),
          pin1Ref.current,
          pin2Ref.current,
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
        const containerH = containerRect.height || 500;

        const allContentElements = [
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          ...pillarRefs.map((r) => r.current),
          pin1Ref.current,
          pin2Ref.current,
        ].filter(Boolean) as HTMLElement[];

        const allBoxes = agents.map((a) => a.boxRef.current).filter(Boolean) as HTMLElement[];
        const allCursors = agents.map((a) => a.cursorRef.current).filter(Boolean) as HTMLElement[];

        if (prefersReducedMotion) {
          gsap.set(allContentElements, { autoAlpha: 1, y: 0, filter: 'none', clipPath: 'none' });
          gsap.set(allBoxes, { autoAlpha: 0 });
          gsap.set(allCursors, { autoAlpha: 0 });
          return;
        }

        // Keep content in layout but hidden initially
        gsap.set(allContentElements, { autoAlpha: 0 });
        gsap.set(allBoxes, { autoAlpha: 0 });
        gsap.set([hLineRef.current, vLineRef.current], { autoAlpha: 0 });

        // Measure true relative bounds
        const targets = [
          { key: 'header', el: headerTitleRef.current, label: 'Select Title', delay: 0.0, isHeadline: true },
          { key: 'p1', el: pillarRefs[0].current, label: 'Deploy Vector', delay: 0.15, isHeadline: false },
          { key: 'p2', el: pillarRefs[1].current, label: 'Build CLI', delay: 0.25, isHeadline: false },
          { key: 'p3', el: pillarRefs[2].current, label: 'Verify Auth', delay: 0.35, isHeadline: false },
          { key: 'pin1', el: pin1Ref.current, label: 'Mount Pin', delay: 0.45, isHeadline: false },
          { key: 'pin2', el: pin2Ref.current, label: 'Verify Spec', delay: 0.55, isHeadline: false },
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

        // Position cursors at initial off-screen edge origins
        measured.forEach((t) => {
          if (t.cursor) {
            gsap.set(t.cursor, { x: t.start.x, y: t.start.y, autoAlpha: 1 });
          }
        });

        // Build Master ScrollTrigger Timeline inside ctx.add so GSAP tracks it properly
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
          [headerTitleRef.current, pillarRefs[0].current, pillarRefs[1].current, pin1Ref.current].filter(Boolean) as HTMLElement[],
          {
            showRuler: !isMobile,
            rulerOffset: isMobile ? 12 : 28,
            delay: 0.05,
          }
        );

        // Header Badge & Desc
        if (headerBadgeRef.current) {
          tl.fromTo(headerBadgeRef.current, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.0);
        }
        if (headerDescRef.current) {
          tl.fromTo(headerDescRef.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25);
        }

        // Build Elements in Parallel with 60-80ms Stagger
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

          // 2. Selection Box expands with 8 handles & dimension tag via transforms
          if (box) {
            addSelectionBoxBuild(tl, box, bounds, targetPos, {
              delay: delay + 0.2,
              duration: 0.5,
              fadeDelay: delay + 0.75,
              ease: 'expo.out',
            });
          }

          // 3. Content Reveals inside box
          if (el) {
            if (isHeadline) {
              headingReveal(tl, el, {
                duration: 0.7,
                position: delay + 0.35,
              });
            } else {
              tl.fromTo(
                el,
                { autoAlpha: 0, y: 12 },
                { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
                delay + 0.35
              );
            }
          }

          // 4. Cursor drifts gently to edge
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

        // 5. Scramble numbers for pillars ('01', '02', '03')
        pillarNumRefs.forEach((nr, idx) => {
          if (nr.current) {
            tl.to(
              nr.current,
              {
                scrambleText: {
                  text: `0${idx + 1}`,
                  chars: '0123456789',
                  speed: 0.5,
                },
                duration: 0.7,
                ease: 'none',
              },
              0.3 + idx * 0.1
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
      className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 min-h-[480px] w-full" 
      id="about"
    >
      {/* 1. GUIDELINES OVERLAY LAYER */}
      <GuideLines
        showRuler={!isMobile}
        rulerOffset={isMobile ? 12 : 28}
        hLineRef={hLineRef}
        vLineRef={vLineRef}
        rulerRef={rulerRef}
      />

      {/* 2. POOL-MANAGED AUTONOMOUS CURSOR & SELECTION BOX OVERLAYS */}
      <ChoreographerLayer agents={agents} />

      {/* 4. MAIN CONTENT DOM (Kept in layout; measured then revealed) */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* HEADER & BIO SUMMARY */}
        <div className="space-y-3 max-w-3xl min-h-[140px]">
          <div ref={headerBadgeRef} style={initialStyle} className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
            <BookOpen size={14} />
            <span>Engineering Background &bull; VIT Chennai</span>
          </div>

          <h2 
            ref={headerTitleRef}
            style={initialStyle}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiwi via-kiwi-yellow to-kiwi-chartreuse">
              Bridging Deep Systems Engineering with Intuitive User Experience
            </span>
          </h2>

          <div ref={headerDescRef} style={initialStyle} className="mt-2 min-h-[50px]">
            <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed inline-block">
              I am a 3rd-year B.Tech Computer Science and Engineering student at VIT Chennai. A self-driven developer who explores Linux systems, desktop configurations, and applied AI pipelines outside the classroom, with a commitment to building software that solves genuine problems.
            </p>
          </div>
        </div>

        {/* THE 3 CONTENT PILLAR BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 min-h-[160px]">
          {PILLARS_DATA.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                ref={pillarRefs[idx]}
                style={initialStyle}
                className="relative p-5 rounded-xl bg-kiwi-surface/80 border border-kiwi-border hover:border-kiwi/40 transition-colors flex flex-col justify-between gap-3 shadow-lg min-h-[160px] group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 font-semibold" style={{ color: pillar.color }}>
                    <Icon size={15} />
                    <span>{pillar.title}</span>
                  </div>

                  <span ref={pillarNumRefs[idx]} className="text-[10px] text-zinc-500 font-mono">
                    {pillar.number}
                  </span>
                </div>

                <div className="mt-1">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* COLLABORATIVE COMMENT PIN BOXES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 min-h-[90px]">
          {/* Comment 1: Philosophy */}
          <div 
            ref={pin1Ref}
            style={initialStyle}
            className="p-4 rounded-xl bg-black/60 border border-kiwi/30 flex items-start gap-3 shadow-md"
          >
            <MessageSquare size={16} className="text-kiwi shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <div className="text-kiwi font-semibold flex items-center gap-2">
                <span>Dev [Kishal]</span>
                <span className="text-[10px] text-zinc-500">&bull; Core Philosophy</span>
              </div>
              <p className="text-zinc-300 mt-1.5 leading-relaxed">
                "Build things that actually matter with smooth, intuitive UX. Fun doesn't mean sloppy; precision is earned through code."
              </p>
            </div>
          </div>

          {/* Comment 2: Audit */}
          <div 
            ref={pin2Ref}
            style={initialStyle}
            className="p-4 rounded-xl bg-black/60 border border-kiwi-yellow/30 flex items-start gap-3 shadow-md"
          >
            <MessageSquare size={16} className="text-kiwi-yellow shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <div className="text-kiwi-yellow font-semibold flex items-center gap-2">
                <span>SecOps</span>
                <span className="text-[10px] text-zinc-500">&bull; Verification Audit</span>
              </div>
              <p className="text-zinc-300 mt-1.5 leading-relaxed">
                "Security is woven directly into the application architecture, not added as a superficial decoration."
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
