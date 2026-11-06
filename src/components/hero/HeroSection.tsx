import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  Github, 
  ShieldCheck, 
  Cpu, 
  Lock,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  // Construction Phase: 
  // 0: Initializing
  // 1: Dragging & Stretching Bounding Frame (Dev & UI cursors)
  // 2: Injecting Badges & Snap Guides (SecOps & AI cursors)
  // 3: Unfolding Headline & Content
  // 4: Snapping CTA Buttons (Kernel cursor)
  // 5: Complete & Interactive
  const [phase, setPhase] = useState<number>(0);
  const [frameDimensions, setFrameDimensions] = useState({ w: 120, h: 80 });

  const startConstruction = () => {
    setPhase(0);
    setFrameDimensions({ w: 120, h: 80 });

    // Step 1: Start stretching frame
    setTimeout(() => {
      setPhase(1);
    }, 200);

    // Step 2: Inject badges
    setTimeout(() => {
      setPhase(2);
    }, 1300);

    // Step 3: Unfold headline
    setTimeout(() => {
      setPhase(3);
    }, 2000);

    // Step 4: Snap CTAs
    setTimeout(() => {
      setPhase(4);
    }, 2700);

    // Step 5: Fully built & verified
    setTimeout(() => {
      setPhase(5);
    }, 3400);
  };

  useEffect(() => {
    startConstruction();
  }, []);

  // Animate dimension counter during Phase 1
  useEffect(() => {
    if (phase === 1) {
      const interval = setInterval(() => {
        setFrameDimensions(prev => {
          if (prev.w >= 980) {
            clearInterval(interval);
            return { w: 980, h: 520 };
          }
          return {
            w: Math.min(980, prev.w + 48),
            h: Math.min(520, prev.h + 24),
          };
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16" id="hero">
      {/* CONSTRUCTION CONTROL BAR */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-kiwi animate-pulse" />
          <span className="text-white font-medium">Swarm Assembly:</span>
          <span className="text-kiwi">
            {phase === 0 && 'Awaiting Swarm Dispatch...'}
            {phase === 1 && 'Pulling & Stretching Bounding Box [Dev + UI]'}
            {phase === 2 && 'Snapping Architecture Badges [SecOps + AI]'}
            {phase === 3 && 'Rendering Core Headline & Spec'}
            {phase === 4 && 'Placing Action CTAs [Kernel]'}
            {phase >= 5 && 'Frame Assembly Complete • Active'}
          </span>
        </div>

        <button
          onClick={startConstruction}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black border border-kiwi-border text-[11px] text-zinc-300 hover:text-kiwi hover:border-kiwi/50 transition-colors"
          title="Watch the Swarm construct the frame again"
        >
          <RotateCcw size={12} />
          <span>Replay Build</span>
        </button>
      </div>

      {/* THE CONSTRUCTED FIGMA CANVAS FRAME */}
      <div className="relative min-h-[460px] sm:min-h-[520px] flex items-center justify-center">
        {/* THE DYNAMIC BOUNDING BOX */}
        <motion.div
          className={`relative w-full rounded-xl transition-colors duration-500 overflow-hidden ${
            phase >= 2 
              ? 'border border-kiwi/60 bg-kiwi-surface/90 backdrop-blur-md shadow-2xl' 
              : 'border-2 border-dashed border-kiwi/80 bg-black/60 shadow-kiwi-glow'
          }`}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{
            scale: phase >= 1 ? 1 : 0.2,
            opacity: phase >= 1 ? 1 : 0,
          }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 180,
          }}
        >
          {/* 4 Corner Anchor Handles Being Physically Stretched by Cursors */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-kiwi z-30 shadow-md">
            {/* Dev Cursor attached to top-left handle during build */}
            {phase <= 2 && (
              <motion.div 
                className="absolute -top-7 -left-3 pointer-events-none z-40 flex flex-col items-start select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <svg className="w-4 h-4 drop-shadow" viewBox="0 0 24 24" fill="none">
                  <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#CCFF00" stroke="#000" strokeWidth="1.5"/>
                </svg>
                <span className="px-1.5 py-0.2 bg-black text-[#CCFF00] border border-[#CCFF00]/40 text-[9px] font-mono font-bold rounded shadow">
                  Dev [Kishal] &bull; Drag
                </span>
              </motion.div>
            )}
          </div>

          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-kiwi z-30 shadow-md" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-kiwi z-30 shadow-md" />

          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-kiwi z-30 shadow-md">
            {/* UI_Design Cursor attached to bottom-right handle pulling it open */}
            {phase <= 2 && (
              <motion.div 
                className="absolute -bottom-7 -right-4 pointer-events-none z-40 flex flex-col items-start select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <svg className="w-4 h-4 drop-shadow" viewBox="0 0 24 24" fill="none">
                  <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#CCFF00" stroke="#000" strokeWidth="1.5"/>
                </svg>
                <span className="px-1.5 py-0.2 bg-black text-[#CCFF00] border border-[#CCFF00]/40 text-[9px] font-mono font-bold rounded shadow">
                  UI_Design &bull; Stretch
                </span>
              </motion.div>
            )}
          </div>

          {/* Top-Right Dynamic Dimension Tag that updates as it expands */}
          <div className="absolute -top-3 right-6 bg-kiwi text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5 z-30">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span>FRAME: {frameDimensions.w} × {frameDimensions.h}</span>
          </div>

          {/* Top-Left Component Instance Tag */}
          <div className="absolute -top-3 left-6 bg-black text-kiwi border border-kiwi/40 text-[10px] font-mono font-semibold px-2 py-0.5 rounded shadow z-30">
            HeroSection.instance
          </div>

          {/* Pink/Chartreuse Alignment Snap Guidelines (flashes during build) */}
          <AnimatePresence>
            {phase >= 2 && phase <= 4 && (
              <motion.div 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-kiwi-chartreuse z-30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="w-12 h-px bg-kiwi-chartreuse" />
                <span>snap: auto-layout 32px</span>
                <span className="w-12 h-px bg-kiwi-chartreuse" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* INNER CONTENT ASSEMBLED BY SWARM */}
          <div className="p-6 sm:p-10 md:p-12 flex flex-col gap-8 relative z-20">
            {/* ROW 1: BADGES (Injected by SecOps & AI_Agent) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono min-h-[32px]">
              {phase >= 2 ? (
                <>
                  <motion.span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi/40 text-kiwi font-medium shadow"
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-kiwi animate-pulse" />
                    VIT Chennai &bull; Computer Science
                  </motion.span>

                  <motion.div 
                    className="relative"
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, delay: 0.1 }}
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi-yellow/40 text-kiwi-yellow font-medium shadow">
                      <ShieldCheck size={13} />
                      Cybersecurity &bull; ThreatLens
                    </span>

                    {/* SecOps cursor dropping this badge */}
                    {phase === 2 && (
                      <motion.div 
                        className="absolute -top-8 -right-2 pointer-events-none z-40 flex flex-col items-start select-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <svg className="w-4 h-4 drop-shadow" viewBox="0 0 24 24" fill="none">
                          <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFF00" stroke="#000" strokeWidth="1.5"/>
                        </svg>
                        <span className="px-1.5 py-0.2 bg-black text-[#FFFF00] border border-[#FFFF00]/40 text-[9px] font-mono font-bold rounded shadow">
                          SecOps &bull; Injected
                        </span>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div
                    className="relative"
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, delay: 0.2 }}
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi-chartreuse/40 text-kiwi-chartreuse font-medium shadow">
                      <Cpu size={13} />
                      Applied AI &bull; FAISS RAG
                    </span>

                    {/* AI_Agent cursor dropping this badge */}
                    {phase === 2 && (
                      <motion.div 
                        className="absolute -top-8 -right-2 pointer-events-none z-40 flex flex-col items-start select-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <svg className="w-4 h-4 drop-shadow" viewBox="0 0 24 24" fill="none">
                          <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#DFFF00" stroke="#000" strokeWidth="1.5"/>
                        </svg>
                        <span className="px-1.5 py-0.2 bg-black text-[#DFFF00] border border-[#DFFF00]/40 text-[9px] font-mono font-bold rounded shadow">
                          AI_Agent &bull; Snapped
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                </>
              ) : (
                <span className="text-[11px] text-zinc-600 font-mono italic">
                  [Swarm preparing layout slots...]
                </span>
              )}
            </div>

            {/* ROW 2: HEADLINE & BIO (Unfolded in Phase 3) */}
            <div className="space-y-4 max-w-3xl min-h-[140px]">
              {phase >= 3 ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                    Full-Stack Developer &amp; <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiwi via-kiwi-yellow to-kiwi-chartreuse">
                      Systems Engineer
                    </span>
                  </h1>
                  
                  <p className="text-zinc-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-normal">
                    Hey, I'm <span className="text-white font-semibold">Kishal P</span>. I build full-stack systems, 
                    threat detection architectures, and applied AI/RAG pipelines with rigorous precision 
                    and smooth, intuitive user experience.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3 py-6">
                  <div className="h-10 sm:h-16 w-3/4 bg-zinc-900/60 rounded animate-pulse border border-zinc-800" />
                  <div className="h-5 w-1/2 bg-zinc-900/40 rounded animate-pulse" />
                </div>
              )}
            </div>

            {/* ROW 3: CTAS (Placed by Kernel cursor in Phase 4) */}
            <div className="flex flex-wrap items-center gap-3 pt-1 min-h-[44px]">
              {phase >= 4 ? (
                <motion.div
                  className="flex flex-wrap items-center gap-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <div className="relative">
                    <a
                      href="#projects"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-kiwi text-black font-semibold text-xs transition-all hover:bg-kiwi/90 shadow-kiwi-glow hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Explore Selected Works</span>
                      <ArrowUpRight size={15} />
                    </a>

                    {/* Kernel cursor snapping the CTA */}
                    {phase === 4 && (
                      <motion.div 
                        className="absolute -top-7 -right-2 pointer-events-none z-40 flex flex-col items-start select-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <svg className="w-4 h-4 drop-shadow" viewBox="0 0 24 24" fill="none">
                          <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#DFFF00" stroke="#000" strokeWidth="1.5"/>
                        </svg>
                        <span className="px-1.5 py-0.2 bg-black text-[#DFFF00] border border-[#DFFF00]/40 text-[9px] font-mono font-bold rounded shadow">
                          Kernel &bull; Bound CTA
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <a
                    href="https://github.com/Kishalll"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black/80 border border-kiwi-border text-white text-xs font-medium hover:border-kiwi/50 hover:bg-kiwi-surface transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                <div className="h-9 w-40 bg-zinc-900/40 rounded animate-pulse" />
              )}
            </div>

            {/* ROW 4: SPEC FOOTER (Stamped by QA & Reviewer) */}
            <motion.div 
              className="pt-6 border-t border-kiwi-border/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 5 ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
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
          </div>
        </motion.div>
      </div>
    </section>
  );
};
