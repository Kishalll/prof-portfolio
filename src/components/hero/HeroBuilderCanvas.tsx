import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowUpRight, 
  Github, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
import { gsap, ScrollTrigger, waitForFontsAndLayout, getRelativeBounds, getRandomEdgePosition } from '../../animation/motionUtils';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { SelectionBox, GuideLines, CursorAgent } from '../canvas/overlays';

interface HeroBuilderCanvasProps {
  buildKey?: number;
}

export const HeroBuilderCanvas: React.FC<HeroBuilderCanvasProps> = ({ 
  buildKey = 0,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const { personaPool, isMobile, prefersReducedMotion } = useChoreographer();

  // Content Element Refs
  const badge1Ref = useRef<HTMLDivElement>(null);
  const badge2Ref = useRef<HTMLDivElement>(null);
  const badge3Ref = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const cta1Ref = useRef<HTMLDivElement>(null);
  const cta2Ref = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const specDividerRef = useRef<HTMLDivElement>(null);
  const specGridRef = useRef<HTMLDivElement>(null);

  // Stat Number Scramble Target Refs
  const statNum1Ref = useRef<HTMLSpanElement>(null);
  const statNum2Ref = useRef<HTMLSpanElement>(null);
  const statNum3Ref = useRef<HTMLSpanElement>(null);
  const statNum4Ref = useRef<HTMLSpanElement>(null);

  // GuideLines Refs
  const hLineRef = useRef<HTMLDivElement>(null);
  const vLineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  // Selection Box Refs (1 per target element)
  const boxBadge1Ref = useRef<HTMLDivElement>(null);
  const boxBadge2Ref = useRef<HTMLDivElement>(null);
  const boxBadge3Ref = useRef<HTMLDivElement>(null);
  const boxHeadlineRef = useRef<HTMLDivElement>(null);
  const boxBioRef = useRef<HTMLDivElement>(null);
  const boxCta1Ref = useRef<HTMLDivElement>(null);
  const boxCta2Ref = useRef<HTMLDivElement>(null);
  const boxLockRef = useRef<HTMLDivElement>(null);
  const boxSpecRef = useRef<HTMLDivElement>(null);

  // Cursor Agent Refs (1 per target element)
  const cursorBadge1Ref = useRef<HTMLDivElement>(null);
  const cursorBadge2Ref = useRef<HTMLDivElement>(null);
  const cursorBadge3Ref = useRef<HTMLDivElement>(null);
  const cursorHeadlineRef = useRef<HTMLDivElement>(null);
  const cursorBioRef = useRef<HTMLDivElement>(null);
  const cursorCta1Ref = useRef<HTMLDivElement>(null);
  const cursorCta2Ref = useRef<HTMLDivElement>(null);
  const cursorLockRef = useRef<HTMLDivElement>(null);
  const cursorSpecRef = useRef<HTMLDivElement>(null);

  // Dimensions state for labels
  const [boxDims, setBoxDims] = useState<Record<string, { width: number; height: number }>>({});

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

        const containerRect = container.getBoundingClientRect();
        const containerW = containerRect.width || window.innerWidth;
        const containerH = containerRect.height || 600;

        const contentElements = [
          badge1Ref.current,
          badge2Ref.current,
          badge3Ref.current,
          headlineRef.current,
          bioRef.current,
          cta1Ref.current,
          cta2Ref.current,
          lockRef.current,
          specDividerRef.current,
          specGridRef.current,
        ].filter(Boolean) as HTMLElement[];

        const selectionBoxes = [
          boxBadge1Ref.current,
          boxBadge2Ref.current,
          boxBadge3Ref.current,
          boxHeadlineRef.current,
          boxBioRef.current,
          boxCta1Ref.current,
          boxCta2Ref.current,
          boxLockRef.current,
          boxSpecRef.current,
        ].filter(Boolean) as HTMLElement[];

        const cursors = [
          cursorBadge1Ref.current,
          cursorBadge2Ref.current,
          cursorBadge3Ref.current,
          cursorHeadlineRef.current,
          cursorBioRef.current,
          cursorCta1Ref.current,
          cursorCta2Ref.current,
          cursorLockRef.current,
          cursorSpecRef.current,
        ].filter(Boolean) as HTMLElement[];

        // Handle prefers-reduced-motion: reveal all content immediately with zero overlays
        if (prefersReducedMotion) {
          gsap.set(contentElements, { autoAlpha: 1, y: 0, filter: 'none', clipPath: 'none' });
          gsap.set(selectionBoxes, { autoAlpha: 0 });
          gsap.set(cursors, { autoAlpha: 0 });
          return;
        }

        // 1. Initial State: Content is in layout but invisible (autoAlpha: 0)
        gsap.set(contentElements, { autoAlpha: 0 });
        gsap.set(selectionBoxes, { autoAlpha: 0 });
        gsap.set([hLineRef.current, vLineRef.current], { autoAlpha: 0 });

        // Measure true relative bounds for each target
        const targets = [
          { key: 'badge1', el: badge1Ref.current, box: boxBadge1Ref.current, cursor: cursorBadge1Ref.current, delay: 0.0, isHeadline: false },
          { key: 'badge2', el: badge2Ref.current, box: boxBadge2Ref.current, cursor: cursorBadge2Ref.current, delay: 0.06, isHeadline: false },
          { key: 'badge3', el: badge3Ref.current, box: boxBadge3Ref.current, cursor: cursorBadge3Ref.current, delay: 0.12, isHeadline: false },
          { key: 'headline', el: headlineRef.current, box: boxHeadlineRef.current, cursor: cursorHeadlineRef.current, delay: 0.20, isHeadline: true },
          { key: 'bio', el: bioRef.current, box: boxBioRef.current, cursor: cursorBioRef.current, delay: 0.30, isHeadline: false },
          { key: 'cta1', el: cta1Ref.current, box: boxCta1Ref.current, cursor: cursorCta1Ref.current, delay: 0.40, isHeadline: false },
          { key: 'cta2', el: cta2Ref.current, box: boxCta2Ref.current, cursor: cursorCta2Ref.current, delay: 0.46, isHeadline: false },
          { key: 'lock', el: lockRef.current, box: boxLockRef.current, cursor: cursorLockRef.current, delay: 0.52, isHeadline: false },
          { key: 'spec', el: specGridRef.current, box: boxSpecRef.current, cursor: cursorSpecRef.current, delay: 0.60, isHeadline: false },
        ];

        const calculatedDims: Record<string, { width: number; height: number }> = {};
        const measuredTargets = targets.map((t) => {
          if (!t.el) return null;
          const bounds = getRelativeBounds(t.el, container);
          calculatedDims[t.key] = { width: bounds.width, height: bounds.height };
          const start = getRandomEdgePosition(containerW, containerH);
          return { ...t, bounds, start };
        }).filter(Boolean) as (typeof targets[0] & { bounds: { x: number; y: number; width: number; height: number }; start: { x: number; y: number } })[];

        setBoxDims(calculatedDims);

        // Position cursors at initial off-screen edge origins
        measuredTargets.forEach((t) => {
          if (t.cursor) {
            gsap.set(t.cursor, {
              x: t.start.x,
              y: t.start.y,
              autoAlpha: 1,
            });
          }
        });

        // 2. Master Intro Construction Timeline
        const masterTl = gsap.timeline();

        // Animate Red Vertical Ruler Line (Reference alignment near left edge)
        if (rulerRef.current && !isMobile) {
          masterTl.fromTo(
            rulerRef.current,
            { scaleY: 0, transformOrigin: 'top center', autoAlpha: 0 },
            { scaleY: 1, autoAlpha: 0.8, duration: 0.8, ease: 'power2.out' },
            0.0
          );
        }

        // Animate Each Target Element Concurrently with 40-80ms Stagger
        measuredTargets.forEach((t) => {
          const { el, box, cursor, bounds, delay, isHeadline } = t;

          // A. Cursor travels along curved path to target bounds with slight overshoot
          if (cursor) {
            masterTl.to(
              cursor,
              {
                x: bounds.x + Math.min(16, bounds.width * 0.1),
                y: bounds.y + Math.min(16, bounds.height * 0.2),
                duration: 0.7,
                ease: 'back.out(1.4)',
              },
              delay
            );
          }

          // B. Selection Box starts small near cursor and resizes to bounds
          if (box) {
            masterTl.fromTo(
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
                duration: 0.55,
                ease: 'expo.out',
              },
              delay + 0.22
            );

            // Alignment Snap Guide Lines flash at bounds edges
            if (hLineRef.current && vLineRef.current && !isMobile) {
              masterTl.set(hLineRef.current, { top: bounds.y, autoAlpha: 0.7 }, delay + 0.22);
              masterTl.set(vLineRef.current, { left: bounds.x, autoAlpha: 0.7 }, delay + 0.22);
              masterTl.to([hLineRef.current, vLineRef.current], { autoAlpha: 0, duration: 0.25 }, delay + 0.5);
            }

            // Selection Box fades out once content reveals
            masterTl.to(
              box,
              {
                autoAlpha: 0,
                duration: 0.35,
                ease: 'power2.inOut',
              },
              delay + 0.85
            );
          }

          // C. Content Reveals inside the box
          if (el) {
            if (isHeadline) {
              // Heading masked blur-to-sharp effect
              masterTl.fromTo(
                el,
                {
                  autoAlpha: 0,
                  filter: 'blur(8px)',
                  y: 14,
                  clipPath: 'inset(0 0 100% 0)',
                },
                {
                  autoAlpha: 1,
                  filter: 'blur(0px)',
                  y: 0,
                  clipPath: 'inset(0 0 0% 0)',
                  duration: 0.75,
                  ease: 'power3.out',
                },
                delay + 0.45
              );
            } else {
              // Clean alpha & y reveal for badges, bio, CTAs
              masterTl.fromTo(
                el,
                {
                  autoAlpha: 0,
                  y: 10,
                },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.5,
                  ease: 'power2.out',
                },
                delay + 0.45
              );
            }
          }

          // D. Cursor idles & drifts gracefully toward edge (does NOT follow visitor mouse)
          if (cursor) {
            const idleOffset = getRandomEdgePosition(containerW, containerH);
            masterTl.to(
              cursor,
              {
                x: bounds.x + (Math.random() - 0.5) * 40,
                y: bounds.y + (Math.random() - 0.5) * 40,
                duration: 0.5,
                ease: 'power1.out',
              },
              delay + 0.85
            );
            masterTl.to(
              cursor,
              {
                x: idleOffset.x * 0.85,
                y: idleOffset.y * 0.85,
                opacity: 0.3,
                duration: 1.6,
                ease: 'power2.out',
              },
              delay + 1.35
            );
          }
        });

        // Spec Divider Line Reveal
        if (specDividerRef.current) {
          masterTl.fromTo(
            specDividerRef.current,
            { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 },
            { scaleX: 1, autoAlpha: 1, duration: 0.6, ease: 'power2.out' },
            0.55
          );
        }

        // E. Stat Numbers Scramble Animation (using ScrambleTextPlugin for 600-800ms)
        const stats = [
          { ref: statNum1Ref.current, finalVal: 'Full-Stack + SecOps' },
          { ref: statNum2Ref.current, finalVal: 'Class of 2027' },
          { ref: statNum3Ref.current, finalVal: '05 Flagship Pipelines' },
          { ref: statNum4Ref.current, finalVal: 'Summer 2026' },
        ];

        stats.forEach((st) => {
          if (st.ref) {
            masterTl.to(
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
              0.65
            );
          }
        });

        // Ensure ScrollTrigger recalculates all down-page section triggers accurately
        ScrollTrigger.refresh();
      };

      runBuild();
    }, container);

    return () => {
      isCancelled = true;
      ctx.revert();
    };
  }, [buildKey, prefersReducedMotion, isMobile]);

  return (
    <section 
      ref={containerRef}
      className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 min-h-[580px] w-full" 
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

      {/* 2. SELECTION BOXES LAYER (1 per target element, sized and positioned by GSAP) */}
      <SelectionBox ref={boxBadge1Ref} dimensions={boxDims['badge1']} />
      <SelectionBox ref={boxBadge2Ref} dimensions={boxDims['badge2']} />
      <SelectionBox ref={boxBadge3Ref} dimensions={boxDims['badge3']} />
      <SelectionBox ref={boxHeadlineRef} dimensions={boxDims['headline']} />
      <SelectionBox ref={boxBioRef} dimensions={boxDims['bio']} />
      <SelectionBox ref={boxCta1Ref} dimensions={boxDims['cta1']} />
      <SelectionBox ref={boxCta2Ref} dimensions={boxDims['cta2']} />
      <SelectionBox ref={boxLockRef} dimensions={boxDims['lock']} />
      <SelectionBox ref={boxSpecRef} dimensions={boxDims['spec']} />

      {/* 3. AUTONOMOUS CURSOR AGENTS LAYER (Each owns one element) */}
      <CursorAgent ref={cursorBadge1Ref} persona={personaPool[0] || { id: 'dev', name: 'Dev [Kishal]', role: 'Lead', color: '#CCFF00' }} actionLabel="Select" />
      <CursorAgent ref={cursorBadge2Ref} persona={personaPool[1] || { id: 'secops', name: 'SecOps', role: 'Security', color: '#FFFF00' }} actionLabel="Audit" />
      <CursorAgent ref={cursorBadge3Ref} persona={personaPool[2] || { id: 'ai', name: 'AI_Agent', role: 'RAG', color: '#DFFF00' }} actionLabel="Mount" />
      <CursorAgent ref={cursorHeadlineRef} persona={personaPool[3] || { id: 'ui', name: 'UI_Design', role: 'Type', color: '#CCFF00' }} actionLabel="Type Headline" />
      <CursorAgent ref={cursorBioRef} persona={personaPool[4] || { id: 'reviewer', name: 'Reviewer', role: 'Spec', color: '#FFFFFF' }} actionLabel="Format Bio" />
      <CursorAgent ref={cursorCta1Ref} persona={personaPool[5] || { id: 'kernel', name: 'Kernel', role: 'Actions', color: '#DFFF00' }} actionLabel="Resize CTA" />
      <CursorAgent ref={cursorCta2Ref} persona={personaPool[6] || { id: 'syntax', name: 'Syntax_Worker', role: 'Git', color: '#CCFF00' }} actionLabel="Link Repo" />
      <CursorAgent ref={cursorLockRef} persona={personaPool[7] || { id: 'crypto', name: 'Crypto_Worker', role: 'ECDSA', color: '#FFFF00' }} actionLabel="P-256 Assert" />
      <CursorAgent ref={cursorSpecRef} persona={personaPool[8] || { id: 'qa', name: 'QA_Audit', role: 'Metrics', color: '#FFFF00' }} actionLabel="Scramble Stats" />

      {/* 4. MAIN CONTENT DOM (Kept in layout; measured then revealed) */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* ROW 1: BADGES */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono min-h-[36px]">
          {/* Badge 1: VIT Chennai */}
          <div ref={badge1Ref} className="relative inline-flex">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi/50 text-kiwi font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-kiwi animate-pulse" />
              VIT Chennai &bull; Computer Science
            </span>
          </div>

          {/* Badge 2: Cybersecurity */}
          <div ref={badge2Ref} className="relative inline-flex">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi-yellow/50 text-kiwi-yellow font-medium shadow-sm">
              <ShieldCheck size={13} />
              Cybersecurity &bull; ThreatLens
            </span>
          </div>

          {/* Badge 3: Applied AI */}
          <div ref={badge3Ref} className="relative inline-flex">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi-chartreuse/50 text-kiwi-chartreuse font-medium shadow-sm">
              <Cpu size={13} />
              Applied AI &bull; FAISS RAG
            </span>
          </div>
        </div>

        {/* ROW 2: HEADLINE & BIO */}
        <div className="space-y-4 max-w-3xl min-h-[140px]">
          <div>
            <h1 
              ref={headlineRef}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans inline-block"
            >
              Full-Stack Developer &amp; Systems Engineer
            </h1>

            <div className="mt-4 min-h-[60px]">
              <p 
                ref={bioRef}
                className="text-zinc-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-normal inline-block"
              >
                Hey, I'm Kishal P. I build full-stack systems, threat detection architectures, and applied AI/RAG pipelines with rigorous precision and intuitive user experience.
              </p>
            </div>
          </div>
        </div>

        {/* ROW 3: CTAS */}
        <div className="flex flex-wrap items-center gap-3 min-h-[44px]">
          {/* Primary CTA */}
          <div ref={cta1Ref} className="relative inline-flex">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-kiwi text-black font-semibold text-xs transition-all hover:bg-kiwi/90 shadow-kiwi-glow hover:scale-[1.02]"
            >
              <span>Explore Selected Works</span>
              <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Secondary CTA */}
          <div ref={cta2Ref} className="relative inline-flex">
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

          {/* Verified Badge */}
          <div ref={lockRef} className="relative hidden sm:inline-flex">
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-400 font-mono text-[11px]">
              <Lock size={12} className="text-kiwi-yellow" />
              <span>P-256 ECDSA Verified</span>
            </div>
          </div>
        </div>

        {/* ROW 4: SPEC FOOTER & SCRAMBLE STATS */}
        <div className="relative pt-6">
          {/* Dividing Ruler Line */}
          <div ref={specDividerRef} className="w-full h-[1px] bg-kiwi-border/80 origin-left" />

          {/* 4 Column Stat Blocks */}
          <div ref={specGridRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400 mt-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Focus</div>
              <div className="text-white font-medium mt-0.5">
                <span ref={statNum1Ref}>Full-Stack + SecOps</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Education</div>
              <div className="text-white font-medium mt-0.5">
                <span ref={statNum2Ref}>Class of 2027</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Systems</div>
              <div className="text-white font-medium mt-0.5">
                <span ref={statNum3Ref}>05 Flagship Pipelines</span>
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
