import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Terminal, 
  Layers, 
  Cpu
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
    id: 'linux-pillar',
    number: '01',
    title: 'Systems & Deployment',
    description: 'Reverse proxy routing (Nginx, Caddy), SSL/TLS orchestration, Docker containerization, and production Linux server deployment workflows.',
    icon: Terminal,
    color: '#DFFF00',
    actionLabel: 'Configure Deployment',
  },
  {
    id: 'ai-pillar',
    number: '02',
    title: 'Applied AI & Local LLMs',
    description: 'End-to-end AI pipelines: synthetic data generation, LoRA fine-tuning (PyTorch/PEFT), local LLM inference (Ollama), ChromaDB/FAISS RAG, and multi-layer guardrails.',
    icon: Cpu,
    color: '#CCFF00',
    actionLabel: 'Deploy AI Pipeline',
  },
  {
    id: 'fullstack-pillar',
    number: '03',
    title: 'Full-Stack & Practical Tools',
    description: 'Responsive web and mobile applications with real-time streaming (SSE/WebSockets), scam/phishing detection, session management, and clean user experience.',
    icon: Layers,
    color: '#FFFF00',
    actionLabel: 'Build Full-Stack UX',
  },
];

export const AboutCanvas: React.FC<AboutCanvasProps> = ({ buildKey = 0 }) => {
  const containerRef = useRef<HTMLElement>(null);
  const { isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Content Element Refs
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerDescRef = useRef<HTMLDivElement>(null);
  const pillarRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const pillarNumRefs = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];

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
          headerTitleRef.current,
          headerDescRef.current,
          ...pillarRefs.map((r) => r.current),
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
          ...pillarRefs.map((r) => r.current),
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

          // 1. Target: Header Title (SplitText typing)
          if (headerTitleRef.current) {
            const agent = assign({ target: headerTitleRef.current, label: 'Type Spec Title', isHeadline: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: headerTitleRef.current,
              agent,
              agentIndex: 1,
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
          <h2 
            ref={headerTitleRef}
            style={initialStyle}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiwi via-kiwi-yellow to-kiwi-chartreuse">
              Bridging Low-Level Systems with Practical AI Engineering
            </span>
          </h2>

          <div ref={headerDescRef} style={initialStyle} className="mt-2 min-h-[50px]">
            <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed inline-block">
              I'm a 3rd-year Computer Science student at VIT Chennai focusing on Linux server infrastructure, deployment pipelines, and applied AI/ML architectures. I like digging under the hood—from reverse proxies (Nginx, Caddy) and containerization to local LLM fine-tuning and multi-layer defense pipelines—while wrapping them in clean, responsive full-stack interfaces.
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
      </div>
    </section>
  );
};
