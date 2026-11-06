import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ArrowUpRight, 
  Github, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';

interface HeroBuilderCanvasProps {
  onFollowChange?: (followingIds: string[]) => void;
  buildKey?: number;
}

export const HeroBuilderCanvas: React.FC<HeroBuilderCanvasProps> = ({ 
  onFollowChange,
  buildKey = 0,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { 
    amount: 0.2, 
  });

  const [isRendered, setIsRendered] = useState(false);
  const [completedPersonas, setCompletedPersonas] = useState<string[]>([]);
  const [headlineChars, setHeadlineChars] = useState(0);
  const [bioChars, setBioChars] = useState(0);

  const fullHeadline = "Full-Stack Developer & Systems Engineer";
  const fullBio = "Hey, I'm Kishal P. I build full-stack systems, threat detection architectures, and applied AI/RAG pipelines with rigorous precision and intuitive user experience.";

  useEffect(() => {
    // UNBUILD: When section leaves viewport, reset all states
    if (!isInView) {
      setIsRendered(false);
      setCompletedPersonas([]);
      setHeadlineChars(0);
      setBioChars(0);
      if (onFollowChange) onFollowChange([]);
      return;
    }

    // SIMULTANEOUS PARALLEL BUILD WITH INDIVIDUAL HANDOFF:
    setIsRendered(true);
    setCompletedPersonas([]);
    setHeadlineChars(0);
    setBioChars(0);
    if (onFollowChange) onFollowChange([]);

    const finished = new Set<string>();

    const releasePersonas = (newIds: string[]) => {
      newIds.forEach(id => finished.add(id));
      const arr = Array.from(finished);
      setCompletedPersonas(arr);
      if (onFollowChange) onFollowChange(arr);
    };

    // Concurrently stream headline letter-by-letter with UI_Design cursor (paced for clarity)
    let headlineInterval: ReturnType<typeof setInterval> | null = null;
    let hCount = 0;
    headlineInterval = setInterval(() => {
      hCount += 1;
      if (hCount >= fullHeadline.length) {
        setHeadlineChars(fullHeadline.length);
        if (headlineInterval) clearInterval(headlineInterval);
        // UI_Design finishes typing headline and immediately follows mouse
        releasePersonas(['ui-ux']);
      } else {
        setHeadlineChars(hCount);
      }
    }, 32);

    // Concurrently stream bio letter-by-letter with Reviewer cursor (paced for clarity)
    let bioInterval: ReturnType<typeof setInterval> | null = null;
    let bCount = 0;
    bioInterval = setInterval(() => {
      bCount += 2;
      if (bCount >= fullBio.length) {
        setBioChars(fullBio.length);
        if (bioInterval) clearInterval(bioInterval);
        // Reviewer finishes typing bio and immediately follows mouse
        releasePersonas(['reviewer']);
      } else {
        setBioChars(bCount);
      }
    }, 24);

    // Task 1: Badges snap into place at 600ms -> Dev, SecOps, AI_Agent immediately follow mouse!
    const tBadges = setTimeout(() => {
      releasePersonas(['dev-kishal', 'secops', 'ai-rag']);
    }, 600);

    // Task 2: CTA buttons finish stretching at 950ms -> Kernel immediately follows mouse!
    const tCtas = setTimeout(() => {
      releasePersonas(['kernel']);
    }, 950);

    // Task 3: Spec ruler drawn and columns stamped at 1250ms -> QA_Audit immediately follows mouse!
    const tSpec = setTimeout(() => {
      releasePersonas(['qa-audit']);
    }, 1250);

    return () => {
      clearTimeout(tBadges);
      clearTimeout(tCtas);
      clearTimeout(tSpec);
      if (headlineInterval) clearInterval(headlineInterval);
      if (bioInterval) clearInterval(bioInterval);
    };
  }, [isInView, buildKey]);

  return (
    <section 
      ref={containerRef}
      className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 min-h-[500px]" 
      id="hero"
    >
      {/* NO OUTER BOX - CLEAN DIRECT CANVAS PRESENTATION */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* ROW 1: BADGES (Simultaneously placed by Dev, SecOps, AI_Agent) */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono min-h-[36px]">
          {isRendered && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Badge 1: VIT Chennai dragged in by Dev [Kishal] */}
              <div className="relative inline-flex">
                <motion.div 
                  className="origin-left"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi/50 text-kiwi font-medium shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-kiwi animate-pulse" />
                    VIT Chennai &bull; Computer Science
                  </span>
                </motion.div>
                
                {/* Active building cursor (disappears the instant Dev Kishal starts following user mouse) */}
                {!completedPersonas.includes('dev-kishal') && (
                  <motion.div 
                    className="absolute -top-7 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                    initial={{ left: '0%' }}
                    animate={{ left: '100%' }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  >
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#CCFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-kiwi border border-kiwi/50 ml-2 mt-0.5">
                      Dev [Kishal] &bull; Snap
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Badge 2: Cybersecurity dragged in by SecOps */}
              <div className="relative inline-flex">
                <motion.div 
                  className="origin-left"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi-yellow/50 text-kiwi-yellow font-medium shadow-sm">
                    <ShieldCheck size={13} />
                    Cybersecurity &bull; ThreatLens
                  </span>
                </motion.div>

                {!completedPersonas.includes('secops') && (
                  <motion.div 
                    className="absolute -top-7 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                    initial={{ left: '0%' }}
                    animate={{ left: '100%' }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  >
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-[#FFFF00] border border-[#FFFF00]/50 ml-2 mt-0.5">
                      SecOps &bull; Mount
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Badge 3: Applied AI dragged in by AI_Agent */}
              <div className="relative inline-flex">
                <motion.div 
                  className="origin-left"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black border border-kiwi-chartreuse/50 text-kiwi-chartreuse font-medium shadow-sm">
                    <Cpu size={13} />
                    Applied AI &bull; FAISS RAG
                  </span>
                </motion.div>

                {!completedPersonas.includes('ai-rag') && (
                  <motion.div 
                    className="absolute -top-7 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                    initial={{ left: '0%' }}
                    animate={{ left: '100%' }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  >
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#DFFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-[#DFFF00] border border-[#DFFF00]/50 ml-2 mt-0.5">
                      AI_Agent &bull; Inject
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: HEADLINE & BIO (Simultaneously typed letter-by-letter with cursors) */}
        <div className="space-y-4 max-w-3xl min-h-[140px]">
          {isRendered && (
            <div>
              {/* Headline character stream */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans inline">
                {fullHeadline.slice(0, headlineChars)}
                
                {/* Dynamic Inline Typing Cursor (UI_Design) - disappears as soon as UI_Design starts following mouse */}
                {!completedPersonas.includes('ui-ux') && (
                  <span className="inline-block relative ml-1 align-baseline">
                    <span className="inline-block w-2 sm:w-3 h-8 sm:h-12 bg-kiwi animate-pulse align-middle" />
                    <span className="absolute -top-8 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                      <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                        <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#CCFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-kiwi border border-kiwi/50 ml-2 mt-0.5">
                        UI_Design &bull; Typing
                      </span>
                    </span>
                  </span>
                )}
              </h1>

              {/* Concurrently typed bio character stream */}
              <div className="mt-4 min-h-[60px]">
                <p className="text-zinc-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-normal inline">
                  {fullBio.slice(0, bioChars)}

                  {/* Inline Caret Cursor moving concurrently with Reviewer */}
                  {!completedPersonas.includes('reviewer') && (
                    <span className="inline-block relative ml-1 align-baseline">
                      <span className="inline-block w-1.5 sm:w-2 h-4 sm:h-5 bg-white animate-pulse align-middle" />
                      <span className="absolute -top-7 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                        <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                          <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-white border border-white/50 ml-2 mt-0.5">
                          Reviewer &bull; Typing
                        </span>
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ROW 3: CTAS (Simultaneously dragged open by Kernel & Reviewer, SecOps locks badge) */}
        <div className="flex flex-wrap items-center gap-3 min-h-[44px]">
          {isRendered && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary CTA dragged open from width: 0 by Kernel */}
              <div className="relative inline-flex">
                <motion.div
                  className="origin-left"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-kiwi text-black font-semibold text-xs transition-all hover:bg-kiwi/90 shadow-kiwi-glow hover:scale-[1.02]"
                  >
                    <span>Explore Selected Works</span>
                    <ArrowUpRight size={15} />
                  </a>
                </motion.div>

                {!completedPersonas.includes('kernel') && (
                  <motion.div 
                    className="absolute -top-7 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                    initial={{ left: '0%' }}
                    animate={{ left: '100%' }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  >
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#DFFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-[#DFFF00] border border-[#DFFF00]/50 ml-2 mt-0.5">
                      Kernel &bull; Stretch Button
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Secondary CTA dragged open by Reviewer */}
              <div className="relative inline-flex">
                <motion.div
                  className="origin-left"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                  <a
                    href="https://github.com/Kishalll"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black/80 border border-kiwi-border text-white text-xs font-medium hover:border-kiwi/50 hover:bg-kiwi-surface transition-all"
                  >
                    <Github size={15} className="text-zinc-400" />
                    <span>github.com/Kishalll</span>
                  </a>
                </motion.div>
              </div>

              {/* Verified Badge stamped by SecOps */}
              <div className="relative hidden sm:inline-flex">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-400 font-mono text-[11px]"
                >
                  <Lock size={12} className="text-kiwi-yellow" />
                  <span>P-256 ECDSA Verified</span>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* ROW 4: SPEC FOOTER (Simultaneously drawn across by QA_Audit, columns stamped) */}
        {isRendered && (
          <div className="relative pt-6">
            {/* Dividing Line drawn across by QA_Audit */}
            <div className="relative w-full h-[1px]">
              <motion.div 
                className="h-[1px] bg-kiwi-border/80 origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />
              {!completedPersonas.includes('qa-audit') && (
                <motion.div
                  className="absolute -top-6 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                  initial={{ left: '0%' }}
                  animate={{ left: '98%' }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                  <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                    <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-[#FFFF00] border border-[#FFFF00]/50 ml-2 mt-0.5">
                    QA_Audit &bull; Draw Ruler
                  </span>
                </motion.div>
              )}
            </div>

            {/* 4 Column Blocks Concurrently Stamped */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Focus</div>
                <div className="text-white font-medium mt-0.5">Full-Stack + SecOps</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Education</div>
                <div className="text-white font-medium mt-0.5">B.Tech CSE (3rd Yr)</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Systems</div>
                <div className="text-white font-medium mt-0.5">Linux / Hyprland CLI</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Availability</div>
                <div className="text-kiwi font-medium mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  <span>Open for Internships</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
