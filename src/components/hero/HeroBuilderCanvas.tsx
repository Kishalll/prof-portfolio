import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Github, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const HeroBuilderCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setContainerSize] = useState({ width: 900, height: 480 });

  // Construction timeline progress: 0 to 100
  // Stage 1 (0 -> 35): Cursor 1 (Dev) drags out the bounding frame
  // Stage 2 (35 -> 60): Cursor 2 (SecOps) & Cursor 3 (AI) fly in carrying badges and snap them
  // Stage 3 (60 -> 80): Cursor 1 types out the headline text
  // Stage 4 (80 -> 95): Cursor 4 (Kernel) flies up carrying the CTA button and clicks it
  // Stage 5 (95 -> 100): Frame solidifies, checkmark passes, cursors move to idle monitor
  const [stage, setStage] = useState<'drawing' | 'badges' | 'typing' | 'cta' | 'complete'>('drawing');

  // Animated cursor positions (relative to container)
  const [cursorDev, setCursorDev] = useState({ x: 30, y: 30 });
  const [cursorSecOps, setCursorSecOps] = useState({ x: -200, y: 50 });
  const [cursorAI, setCursorAI] = useState({ x: 1200, y: 50 });
  const [cursorKernel, setCursorKernel] = useState({ x: 40, y: 600 });
  
  // Real-time dragged frame dimensions
  const [draggedBox, setDraggedBox] = useState({ width: 0, height: 0 });
  const [badgesPlaced, setBadgesPlaced] = useState(false);
  const [typedTitleIndex, setTypedTitleIndex] = useState(0);
  const [ctaPlaced, setCtaPlaced] = useState(false);
  const [showSnapGuide, setShowSnapGuide] = useState(false);

  const fullHeadline = "Full-Stack Developer & Systems Engineer";

  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: Math.max(480, containerRef.current.clientHeight),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Run Choreographed Builder Sequence
  const runBuildSequence = () => {
    const W = containerRef.current ? containerRef.current.clientWidth : 900;
    const H = 480;

    // Reset everything
    setStage('drawing');
    setCursorDev({ x: 16, y: 16 });
    setDraggedBox({ width: 0, height: 0 });
    setCursorSecOps({ x: -250, y: 40 });
    setCursorAI({ x: W + 250, y: 40 });
    setCursorKernel({ x: 40, y: H + 150 });
    setBadgesPlaced(false);
    setTypedTitleIndex(0);
    setCtaPlaced(false);
    setShowSnapGuide(false);

    let startTime = performance.now();

    const animateLoop = (time: number) => {
      const elapsed = time - startTime;

      // STEP 1: CursorDev drags bounding box across screen (0 to 1400ms)
      if (elapsed < 1400) {
        const progress = Math.min(1, elapsed / 1400);
        // Easing (easeOutCubic)
        const ease = 1 - Math.pow(1 - progress, 3);
        
        const currentW = Math.max(0, (W - 32) * ease);
        const currentH = Math.max(0, (H - 32) * ease);

        setCursorDev({
          x: 16 + currentW,
          y: 16 + currentH,
        });
        setDraggedBox({
          width: currentW,
          height: currentH,
        });
        requestAnimationFrame(animateLoop);
      } 
      // STEP 2: SecOps & AI cursors fly in with badges (1400ms to 2400ms)
      else if (elapsed < 2400) {
        setStage('badges');
        setShowSnapGuide(true);
        const progress = Math.min(1, (elapsed - 1400) / 1000);
        const ease = 1 - Math.pow(1 - progress, 3);

        // SecOps flies from -250 to 220
        setCursorSecOps({
          x: -250 + (220 - -250) * ease,
          y: 45,
        });

        // AI flies from W + 250 to 450
        setCursorAI({
          x: (W + 250) + (450 - (W + 250)) * ease,
          y: 45,
        });

        // Dev cursor idles to top-right
        setCursorDev({ x: W - 40, y: 20 });
        requestAnimationFrame(animateLoop);
      } 
      // STEP 3: Badges snap, CursorDev moves down and types headline (2400ms to 3800ms)
      else if (elapsed < 3800) {
        setStage('typing');
        setBadgesPlaced(true);
        setShowSnapGuide(false);
        const progress = Math.min(1, (elapsed - 2400) / 1400);

        const chars = Math.floor(progress * fullHeadline.length);
        setTypedTitleIndex(chars);

        // CursorDev moves horizontally as it types!
        setCursorDev({
          x: 40 + (W * 0.7) * progress,
          y: 140,
        });

        requestAnimationFrame(animateLoop);
      } 
      // STEP 4: Kernel cursor flies up carrying the CTA button (3800ms to 4800ms)
      else if (elapsed < 4800) {
        setStage('cta');
        setTypedTitleIndex(fullHeadline.length);
        const progress = Math.min(1, (elapsed - 3800) / 1000);
        const ease = 1 - Math.pow(1 - progress, 3);

        // Kernel flies from H + 150 up to 340
        setCursorKernel({
          x: 40,
          y: (H + 150) + (340 - (H + 150)) * ease,
        });

        requestAnimationFrame(animateLoop);
      } 
      // STEP 5: Completed & Verified
      else {
        setCtaPlaced(true);
        setStage('complete');
        // Swarm cursors drift to monitoring positions
        setCursorDev({ x: W - 140, y: 16 });
        setCursorSecOps({ x: 220, y: 45 });
        setCursorAI({ x: 450, y: 45 });
        setCursorKernel({ x: 180, y: 340 });
      }
    };

    requestAnimationFrame(animateLoop);
  };

  useEffect(() => {
    runBuildSequence();
  }, []);

  return (
    <section className="relative pt-4 pb-12 sm:pt-8 sm:pb-16" id="hero">
      {/* BUILD CONTROLLER STATUS BAR */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-kiwi animate-pulse" />
          <span className="text-white font-medium">Multi-Cursor Assembly:</span>
          <span className="text-kiwi">
            {stage === 'drawing' && 'Cursor [Dev] physically dragging selection box across canvas'}
            {stage === 'badges' && 'Cursors [SecOps & AI] carrying badges into position'}
            {stage === 'typing' && 'Cursor [Dev] typing headline character-by-character'}
            {stage === 'cta' && 'Cursor [Kernel] dragging CTA button from offscreen'}
            {stage === 'complete' && 'Assembly Complete &bull; Frame Verified'}
          </span>
        </div>

        <button
          onClick={runBuildSequence}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black border border-kiwi-border text-xs text-zinc-300 hover:text-kiwi hover:border-kiwi/50 transition-colors shadow-sm"
        >
          <RotateCcw size={12} />
          <span>Replay Construction</span>
        </button>
      </div>

      {/* THE LIVE WORKSPACE CANVAS */}
      <div 
        ref={containerRef}
        className="relative w-full min-h-[480px] select-none"
        style={{ minHeight: '480px' }}
      >
        {/* ============================================================ */}
        {/* 1. THE DYNAMICALLY DRAGGED BOUNDING RECTANGLE                 */}
        {/* ============================================================ */}
        <div
          className={`absolute top-4 left-4 transition-colors duration-300 ${
            stage === 'complete'
              ? 'border border-kiwi/60 bg-kiwi-surface/90 backdrop-blur-md shadow-2xl rounded-xl'
              : 'border-2 border-dashed border-kiwi bg-black/60 shadow-kiwi-glow rounded-lg'
          }`}
          style={{
            width: `${draggedBox.width}px`,
            height: `${draggedBox.height}px`,
          }}
        >
          {/* Top-Left Origin Anchor */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-kiwi shadow" />
          
          {/* Bottom-Right Corner Anchor (follows draggedBox) */}
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-kiwi shadow" />

          {/* Component Instance Tag */}
          <div className="absolute -top-3 left-4 bg-black text-kiwi border border-kiwi/40 text-[10px] font-mono font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap">
            HeroSection.frame
          </div>

          {/* Live Updating Dimensions Tag */}
          <div className="absolute -top-3 right-4 bg-kiwi text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span>{Math.round(draggedBox.width)} × {Math.round(draggedBox.height)} px</span>
          </div>

          {/* Snap Alignment Ruler Line */}
          {showSnapGuide && (
            <div className="absolute top-14 left-4 right-4 flex items-center gap-2 text-[10px] font-mono text-kiwi-chartreuse pointer-events-none">
              <span className="w-full h-px bg-kiwi-chartreuse/60" />
              <span className="whitespace-nowrap px-1 bg-black rounded border border-kiwi-chartreuse/30">
                auto-layout: 32px
              </span>
              <span className="w-full h-px bg-kiwi-chartreuse/60" />
            </div>
          )}

          {/* CONTENT INSIDE THE ASSEMBLED FRAME */}
          <div className="p-6 sm:p-10 flex flex-col gap-6 relative z-10 overflow-hidden">
            {/* ROW 1: BADGES (Dropped by SecOps & AI cursors) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono min-h-[30px]">
              {badgesPlaced ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black border border-kiwi/40 text-kiwi font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-kiwi animate-pulse" />
                    VIT Chennai &bull; Computer Science
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black border border-kiwi-yellow/40 text-kiwi-yellow font-medium">
                    <ShieldCheck size={13} />
                    Cybersecurity &bull; ThreatLens
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black border border-kiwi-chartreuse/40 text-kiwi-chartreuse font-medium">
                    <Cpu size={13} />
                    Applied AI &bull; FAISS RAG
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-mono text-zinc-600 italic">
                  [Waiting for cursors to snap badges...]
                </span>
              )}
            </div>

            {/* ROW 2: HEADLINE TYPED BY CURSOR */}
            <div className="space-y-4 max-w-3xl min-h-[140px]">
              {typedTitleIndex > 0 ? (
                <div>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
                    {fullHeadline.slice(0, typedTitleIndex)}
                    {stage === 'typing' && (
                      <span className="inline-block w-3 h-8 sm:h-12 bg-kiwi ml-1 animate-pulse align-middle" />
                    )}
                  </h1>

                  {(stage === 'cta' || stage === 'complete') && (
                    <motion.p 
                      className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal mt-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Hey, I'm <span className="text-white font-semibold">Kishal P</span>. I build full-stack systems, 
                      threat detection architectures, and applied AI/RAG pipelines with rigorous precision 
                      and intuitive user experience.
                    </motion.p>
                  )}
                </div>
              ) : (
                <div className="py-4">
                  <span className="text-xs font-mono text-zinc-600">[Awaiting typing insertion...]</span>
                </div>
              )}
            </div>

            {/* ROW 3: CTAS (Dropped by Kernel cursor) */}
            <div className="flex flex-wrap items-center gap-3 min-h-[44px]">
              {ctaPlaced ? (
                <motion.div 
                  className="flex flex-wrap items-center gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-kiwi text-black font-semibold text-xs transition-all hover:bg-kiwi/90 shadow-kiwi-glow hover:scale-[1.02]"
                  >
                    <span>Explore Selected Works</span>
                    <ArrowUpRight size={15} />
                  </a>

                  <a
                    href="https://github.com/Kishalll"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black/80 border border-kiwi-border text-white text-xs font-medium hover:border-kiwi/50 hover:bg-kiwi-surface transition-all"
                  >
                    <Github size={15} className="text-zinc-400" />
                    <span>github.com/Kishalll</span>
                  </a>

                  <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-400 font-mono text-[11px]">
                    <Lock size={12} className="text-kiwi-yellow" />
                    <span>P-256 ECDSA Verified</span>
                  </div>
                </motion.div>
              ) : (
                <span className="text-xs font-mono text-zinc-600">[Kernel cursor carrying CTA...]</span>
              )}
            </div>

            {/* ROW 4: SPEC FOOTER */}
            {stage === 'complete' && (
              <motion.div 
                className="pt-6 border-t border-kiwi-border/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Focus</div>
                  <div className="text-white font-medium mt-0.5">Full-Stack + SecOps</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Education</div>
                  <div className="text-white font-medium mt-0.5">B.Tech CSE (3rd Yr)</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Systems</div>
                  <div className="text-white font-medium mt-0.5">Linux / Hyprland CLI</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Availability</div>
                  <div className="text-kiwi font-medium mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    <span>Open for Internships</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. THE MOVING ACTIVE BUILDER CURSORS                         */}
        {/* ============================================================ */}

        {/* CURSOR 1: Dev [Kishal] (Drags Box & Types Headline) */}
        <div
          className="absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-start transition-transform duration-75"
          style={{
            transform: `translate3d(${cursorDev.x}px, ${cursorDev.y}px, 0)`,
          }}
        >
          <svg className="w-5 h-5 drop-shadow-[0_2px_10px_rgba(204,255,0,0.5)]" viewBox="0 0 24 24" fill="none">
            <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#CCFF00" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <div className="flex items-center gap-1.5 ml-2 mt-0.5">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded shadow-lg bg-black text-[#CCFF00] border border-[#CCFF00]/40 whitespace-nowrap">
              Dev [Kishal]
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-[#CCFF00] text-black shadow whitespace-nowrap">
              {stage === 'drawing' && `Drag: ${Math.round(draggedBox.width)}×${Math.round(draggedBox.height)}`}
              {stage === 'typing' && 'Typing Spec...'}
              {stage === 'complete' && 'Verified'}
            </span>
          </div>
        </div>

        {/* CURSOR 2: SecOps (Carries & Snaps Cybersecurity Badge) */}
        {stage !== 'complete' && (
          <div
            className="absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-start transition-transform duration-75"
            style={{
              transform: `translate3d(${cursorSecOps.x}px, ${cursorSecOps.y}px, 0)`,
            }}
          >
            <svg className="w-5 h-5 drop-shadow-[0_2px_10px_rgba(255,255,0,0.5)]" viewBox="0 0 24 24" fill="none">
              <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFF00" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <div className="flex items-center gap-1.5 ml-2 mt-0.5">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded shadow-lg bg-black text-[#FFFF00] border border-[#FFFF00]/40 whitespace-nowrap">
                SecOps
              </span>
              {!badgesPlaced && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-black/90 text-[#FFFF00] border border-[#FFFF00]/60 shadow flex items-center gap-1 whitespace-nowrap">
                  <ShieldCheck size={11} /> ThreatLens Badge
                </span>
              )}
            </div>
          </div>
        )}

        {/* CURSOR 3: AI_Agent (Carries & Snaps FAISS RAG Badge) */}
        {stage !== 'complete' && (
          <div
            className="absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-start transition-transform duration-75"
            style={{
              transform: `translate3d(${cursorAI.x}px, ${cursorAI.y}px, 0)`,
            }}
          >
            <svg className="w-5 h-5 drop-shadow-[0_2px_10px_rgba(223,255,0,0.5)]" viewBox="0 0 24 24" fill="none">
              <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#DFFF00" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <div className="flex items-center gap-1.5 ml-2 mt-0.5">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded shadow-lg bg-black text-[#DFFF00] border border-[#DFFF00]/40 whitespace-nowrap">
                AI_Agent
              </span>
              {!badgesPlaced && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-black/90 text-[#DFFF00] border border-[#DFFF00]/60 shadow flex items-center gap-1 whitespace-nowrap">
                  <Cpu size={11} /> FAISS RAG Node
                </span>
              )}
            </div>
          </div>
        )}

        {/* CURSOR 4: Kernel [Linux] (Carries CTA Button from Bottom) */}
        {stage === 'cta' && (
          <div
            className="absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-start transition-transform duration-75"
            style={{
              transform: `translate3d(${cursorKernel.x}px, ${cursorKernel.y}px, 0)`,
            }}
          >
            <svg className="w-5 h-5 drop-shadow-[0_2px_10px_rgba(223,255,0,0.5)]" viewBox="0 0 24 24" fill="none">
              <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#DFFF00" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <div className="flex items-center gap-1.5 ml-2 mt-0.5">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded shadow-lg bg-black text-[#DFFF00] border border-[#DFFF00]/40 whitespace-nowrap">
                Kernel [Linux]
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-kiwi text-black shadow-lg flex items-center gap-1 whitespace-nowrap">
                <span>Explore Works</span>
                <ArrowUpRight size={13} />
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
