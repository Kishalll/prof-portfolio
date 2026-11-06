import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  BookOpen, 
  MessageSquare 
} from 'lucide-react';
import { gsap, ScrollTrigger, waitForFontsAndLayout } from '../../animation/motionUtils';
import { buildText, buildBlock, createTargetTrigger } from '../../animation/builders';
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

        const allContentElements = [
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          ...pillarRefs.map((r) => r.current),
          pin1Ref.current,
          pin2Ref.current,
        ].filter(Boolean) as HTMLElement[];

        if (prefersReducedMotion) {
          gsap.set(allContentElements, { autoAlpha: 1, y: 0, scale: 1 });
          return;
        }

        ctx.add(() => {
          // 0. Red Vertical Ruler: onToggle scaling
          if (rulerRef.current) {
            gsap.set(rulerRef.current, { scaleY: 0, transformOrigin: 'top center', autoAlpha: 0 });
            ScrollTrigger.create({
              trigger: container,
              start: 'top bottom',
              end: 'bottom top',
              onToggle: (self) => {
                gsap.to(rulerRef.current, {
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
            createTargetTrigger(headerBadgeRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.0,
            });
          }

          // 2. Target: Header Title (SplitText typing)
          if (headerTitleRef.current) {
            const agent = assign({ target: headerTitleRef.current, label: 'Type Spec Title', isHeadline: true, isIBeam: true });
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

          // 3. Target: Header Description (SplitText typing)
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

          // 4. Targets: 3 Architectural Pillars
          pillarRefs.forEach((pRef, idx) => {
            const el = pRef.current;
            if (!el) return;
            const agent = assign({ target: el, label: PILLARS_DATA[idx]?.actionLabel || 'Assemble Pillar' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: el,
              agent,
              agentIndex: 3 + idx,
              totalAgents: 8,
              isMobile,
            });

            const numSpan = pillarNumRefs[idx]?.current;
            if (numSpan) {
              tl.to(
                numSpan,
                {
                  scrambleText: {
                    text: `0${idx + 1}`,
                    chars: '0123456789',
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
              if (numSpan) numSpan.textContent = `0${idx + 1}`;
            };

            createTargetTrigger(el, tl, fullReset, {
              rebuildOnReentry,
              staggerDelay: idx * 0.08,
            });
          });

          // 5. Targets: 2 Note Pins
          [pin1Ref.current, pin2Ref.current].forEach((pinEl, pIdx) => {
            if (!pinEl) return;
            const agent = assign({ target: pinEl, label: pIdx === 0 ? 'Mount Reading' : 'Verify Feedback' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: pinEl,
              agent,
              agentIndex: 6 + pIdx,
              totalAgents: 8,
              isMobile,
            });
            createTargetTrigger(pinEl, tl, reset, {
              rebuildOnReentry,
              staggerDelay: pIdx * 0.08,
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
      className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 min-h-[480px] w-full scroll-mt-24" 
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
