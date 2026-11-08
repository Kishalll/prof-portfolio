import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { 
  ArrowUpRight, 
  Github, 
  CheckCircle2 
} from 'lucide-react';
import { gsap, ScrollTrigger, waitForFontsAndLayout } from '../../animation/motionUtils';
import { buildText, buildBlock, createTargetTrigger } from '../../animation/builders';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { useSectionChoreographer, ChoreographerLayer } from '../../animation/CursorChoreographer';
import { GuideLines } from '../canvas/overlays';
import { HeroPhoto } from './HeroPhoto';

interface HeroBuilderCanvasProps {
  buildKey?: number;
}

export const HeroBuilderCanvas: React.FC<HeroBuilderCanvasProps> = ({ 
  buildKey = 0,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const { isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Leaf Target Element Refs
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const specBlockRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  // Stat Number Scramble Target Refs
  const statNum1Ref = useRef<HTMLSpanElement>(null);
  const statNum2Ref = useRef<HTMLSpanElement>(null);
  const statNum3Ref = useRef<HTMLSpanElement>(null);
  const statNum4Ref = useRef<HTMLSpanElement>(null);

  // GuideLines & Ruler Refs
  const hLineRef = useRef<HTMLDivElement>(null);
  const vLineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  // Pool-managed autonomous cursor choreographer
  const { agents, assign, releaseAll } = useSectionChoreographer(isMobile);

  const initialStyle = prefersReducedMotion ? undefined : { opacity: 0, visibility: 'hidden' as const };

  // Synchronous hide before paint (stops the flash completely)
  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.set(
        [
          headlineRef.current,
          bioRef.current,
          ctaRowRef.current,
          specBlockRef.current,
          photoRef.current,
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

    // Use gsap.context so all tweens, timelines, and listeners revert cleanly on unmount/replay
    const ctx = gsap.context(() => {
      const runBuild = async () => {
        // Wait for fonts to be ready and layout stabilized
        await waitForFontsAndLayout();
        if (isCancelled || !container) return;

        const leafTargets = [
          headlineRef.current,
          bioRef.current,
          ctaRowRef.current,
          specBlockRef.current,
          photoRef.current,
        ].filter(Boolean) as HTMLElement[];

        // Handle prefers-reduced-motion: reveal all content immediately with zero overlays
        if (prefersReducedMotion) {
          gsap.set(leafTargets, { autoAlpha: 1, y: 0, scale: 1 });
          return;
        }

        ctx.add(() => {
          // 0. Red Vertical Ruler: scales in when section enters viewport, hides when off-screen
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

          // 1. Target: Headline (SplitText character-by-character typing with hugging box & 0.35 scale-up)
          if (headlineRef.current) {
            const agent = assign({ target: headlineRef.current, label: 'Type Headline', isHeadline: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: headlineRef.current,
              agent,
              agentIndex: 0,
              isHeadline: true,
              isMobile,
            });
            createTargetTrigger(headlineRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.08,
            });
          }

          // 2. Target: Bio Paragraph (SplitText character-by-character typing with hugging box)
          if (bioRef.current) {
            const agent = assign({ target: bioRef.current, label: 'Format Bio', isParagraph: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: bioRef.current,
              agent,
              agentIndex: 1,
              isParagraph: true,
              isMobile,
            });
            createTargetTrigger(bioRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.16,
            });
          }

          // 3. Target: CTA Button Row
          if (ctaRowRef.current) {
            const agent = assign({ target: ctaRowRef.current, label: 'Resize CTAs' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: ctaRowRef.current,
              agent,
              agentIndex: 2,
              isMobile,
            });
            createTargetTrigger(ctaRowRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.22,
            });
          }

          // 5. Target: Portrait (top right)
          if (photoRef.current) {
            const agent = assign({ target: photoRef.current, label: 'Place Portrait' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: photoRef.current,
              agent,
              agentIndex: 4,
              isMobile,
            });
            createTargetTrigger(photoRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.1,
            });
          }

          // 4. Target: Spec Telemetry Block + ScrambleText
          if (specBlockRef.current) {
            const agent = assign({ target: specBlockRef.current, label: 'Scramble Stats' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: specBlockRef.current,
              agent,
              agentIndex: 3,
              isMobile,
            });

            const stats = [
              { ref: statNum1Ref.current, finalVal: 'Systems & Applied AI' },
              { ref: statNum2Ref.current, finalVal: "B.Tech CSE '28" },
              { ref: statNum3Ref.current, finalVal: '06 Live Projects' },
              { ref: statNum4Ref.current, finalVal: 'Summer 2026' },
            ];

            stats.forEach((st) => {
              if (st.ref) {
                tl.to(
                  st.ref,
                  {
                    scrambleText: {
                      text: st.finalVal,
                      chars: '0123456789ABCDEF!<>-_/[]{}',
                      speed: 0.5,
                    },
                    duration: 0.75,
                    ease: 'none',
                  },
                  '-=0.2'
                );
              }
            });

            const fullReset = () => {
              reset();
              stats.forEach((st) => {
                if (st.ref) st.ref.textContent = st.finalVal;
              });
            };

            createTargetTrigger(specBlockRef.current, tl, fullReset, {
              rebuildOnReentry,
              staggerDelay: 0.28,
            });
          }
        });

        // Ensure triggers recalculate immediately
        ScrollTrigger.refresh();
      };

      runBuild();
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
      className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 min-h-[580px] w-full scroll-mt-24" 
      id="hero"
    >
      {/* 1. GUIDELINES OVERLAY LAYER (Position absolute inside section container) */}
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
        
        {/* PORTRAIT: top right (md+), small above the headline on mobile. Swap the picture in HeroPhoto.tsx */}
        <div className="relative">
        <HeroPhoto ref={photoRef} style={initialStyle} />

        {/* ROW 2: HEADLINE & BIO */}
        <div className="space-y-4 max-w-3xl md:max-w-none md:w-[calc(100%-250px)] lg:w-[calc(100%-290px)] min-h-[140px]">
          <div>
            <h1 
              ref={headlineRef}
              style={initialStyle}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans inline-block"
            >
              Systems &amp; Applied AI Engineer
            </h1>

            <div className="mt-4 min-h-[60px]">
              <p 
                ref={bioRef}
                style={initialStyle}
                className="text-zinc-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-normal inline-block"
              >
                Hey, I'm Kishal. I build low-level system tooling, production deployments, and applied AI/ML pipelines. Passionate about Linux server infrastructure, local LLM orchestration, and crafting intuitive software that solves real problems.
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* ROW 3: CTAS (Leaf target) */}
        <div ref={ctaRowRef} style={initialStyle} className="flex flex-wrap items-center gap-3 min-h-[44px]">
          {/* Primary CTA */}
          <div className="relative inline-flex">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-kiwi text-black font-semibold text-xs transition-all hover:bg-kiwi/90 shadow-kiwi-glow hover:scale-[1.02]"
            >
              <span>Explore Selected Works</span>
              <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Secondary CTA */}
          <div className="relative inline-flex">
            <a
              href="https://github.com/Kishalll"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black/80 border border-kiwi-border text-white text-xs font-medium hover:border-kiwi/50 hover:bg-kiwi-surface transition-all"
            >
              <Github size={15} className="text-zinc-400" />
              <span>github.com/Kishalll</span>
            </a>
          </div>

          {/* Availability Status Badge */}
          <div className="relative hidden sm:inline-flex">
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-kiwi" />
              <span>Available for Internships</span>
            </div>
          </div>
        </div>

        {/* ROW 4: SPEC FOOTER & SCRAMBLE STATS (Leaf target) */}
        <div ref={specBlockRef} style={initialStyle} className="relative pt-6">
          {/* Dividing Ruler Line */}
          <div className="w-full h-[1px] bg-kiwi-border/80 origin-left" />

          {/* 4 Column Stat Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400 mt-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Focus</div>
              <div className="text-white font-medium mt-0.5">
                <span ref={statNum1Ref}>Systems &amp; Applied AI</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Education</div>
              <div className="text-white font-medium mt-0.5">
                <span ref={statNum2Ref}>B.Tech CSE '28</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Projects</div>
              <div className="text-white font-medium mt-0.5">
                <span ref={statNum3Ref}>06 Live Projects</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Availability</div>
              <div className="text-kiwi font-medium mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                <span ref={statNum4Ref}>Summer 2026</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
