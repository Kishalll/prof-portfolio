import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  BookOpen, 
  MessageSquare 
} from 'lucide-react';

interface AboutCanvasProps {
  onFollowChange?: (followingIds: string[]) => void;
}

export const AboutCanvas: React.FC<AboutCanvasProps> = ({ onFollowChange }) => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { 
    amount: 0.2,
  });

  const [isRendered, setIsRendered] = useState(false);
  const [completedPersonas, setCompletedPersonas] = useState<string[]>([]);
  const [titleChars, setTitleChars] = useState(0);
  const [descChars, setDescChars] = useState(0);

  const fullTitle = "Bridging Deep Systems Engineering with Intuitive User Experience";
  const fullDesc = "I am a 3rd-year B.Tech Computer Science and Engineering student at VIT Chennai. A self-driven developer who explores Linux systems, desktop configurations, and applied AI pipelines outside the classroom, with a commitment to building software that solves genuine problems.";

  useEffect(() => {
    // UNBUILD: When About leaves viewport, collapse back to 0
    if (!isInView) {
      setIsRendered(false);
      setCompletedPersonas([]);
      setTitleChars(0);
      setDescChars(0);
      if (onFollowChange) onFollowChange([]);
      return;
    }

    // SIMULTANEOUS PARALLEL BUILD WITH INDIVIDUAL HANDOFF:
    setIsRendered(true);
    setCompletedPersonas([]);
    setTitleChars(0);
    setDescChars(0);
    if (onFollowChange) onFollowChange([]);

    const finished = new Set<string>();

    const releasePersonas = (newIds: string[]) => {
      newIds.forEach(id => finished.add(id));
      const arr = Array.from(finished);
      setCompletedPersonas(arr);
      if (onFollowChange) onFollowChange(arr);
    };

    // Concurrently stream title letter-by-letter with Dev [Kishal] cursor
    let titleInterval: ReturnType<typeof setInterval> | null = null;
    let tCount = 0;
    titleInterval = setInterval(() => {
      tCount += 1;
      if (tCount >= fullTitle.length) {
        setTitleChars(fullTitle.length);
        if (titleInterval) clearInterval(titleInterval);
        // Dev Kishal finishes typing title and immediately follows mouse
        releasePersonas(['dev-kishal', 'ui-ux']);
      } else {
        setTitleChars(tCount);
      }
    }, 28);

    // Concurrently stream description letter-by-letter
    let descInterval: ReturnType<typeof setInterval> | null = null;
    let dCount = 0;
    descInterval = setInterval(() => {
      dCount += 3;
      if (dCount >= fullDesc.length) {
        setDescChars(fullDesc.length);
        if (descInterval) clearInterval(descInterval);
      } else {
        setDescChars(dCount);
      }
    }, 22);

    // Task 1: Pillar 01 card frame finishes at 700ms -> AI_Agent immediately follows mouse!
    const tPillar1 = setTimeout(() => {
      releasePersonas(['ai-rag']);
    }, 700);

    // Task 2: Pillar 02 card frame finishes at 950ms -> Kernel immediately follows mouse!
    const tPillar2 = setTimeout(() => {
      releasePersonas(['kernel']);
    }, 950);

    // Task 3: Pillar 03 card frame finishes at 1200ms -> SecOps immediately follows mouse!
    const tPillar3 = setTimeout(() => {
      releasePersonas(['secops']);
    }, 1200);

    // Task 4: Comment pin cards finish at 1450ms -> QA_Audit & Reviewer immediately follow mouse!
    const tPins = setTimeout(() => {
      releasePersonas(['qa-audit', 'reviewer']);
    }, 1450);

    return () => {
      clearTimeout(tPillar1);
      clearTimeout(tPillar2);
      clearTimeout(tPillar3);
      clearTimeout(tPins);
      if (titleInterval) clearInterval(titleInterval);
      if (descInterval) clearInterval(descInterval);
    };
  }, [isInView]);

  return (
    <section 
      ref={containerRef}
      className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 min-h-[480px]" 
      id="about"
    >
      {/* NO OUTER BOX - CLEAN DIRECT CANVAS PRESENTATION */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* PIECE 1: HEADER & BIO SUMMARY (Simultaneously typed by Dev [Kishal]) */}
        {isRendered && (
          <div className="space-y-3 max-w-3xl min-h-[140px]">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
              <BookOpen size={14} />
              <span>Engineering Background &bull; VIT Chennai</span>
            </div>

            {/* Title typed letter by letter */}
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiwi via-kiwi-yellow to-kiwi-chartreuse">
                {fullTitle.slice(0, titleChars)}
              </span>

              {/* Dev Kishal cursor riding the typing caret */}
              {!completedPersonas.includes('dev-kishal') && (
                <span className="inline-block relative ml-1 align-baseline">
                  <span className="inline-block w-2 sm:w-2.5 h-6 sm:h-10 bg-kiwi animate-pulse align-middle" />
                  <span className="absolute -top-8 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#CCFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-kiwi border border-kiwi/50 ml-2 mt-0.5">
                      Dev [Kishal] &bull; Typing
                    </span>
                  </span>
                </span>
              )}
            </h2>

            {/* Description typed letter by letter */}
            <div className="mt-2 min-h-[50px]">
              <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed inline">
                {fullDesc.slice(0, descChars)}
              </p>
            </div>
          </div>
        )}

        {/* PIECE 2: THE 3 CONTENT PILLAR BOXES (Simultaneously Dragged Open by AI_Agent, Kernel, SecOps) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 min-h-[160px]">
          
          {/* Pillar 1: AI_Agent drags open box from top-left to bottom-right */}
          <div className="relative">
            {isRendered && (
              <motion.div 
                className="relative p-5 rounded-xl bg-kiwi-surface/80 border border-kiwi-border hover:border-kiwi/40 transition-colors flex flex-col gap-2 shadow-lg origin-top-left overflow-hidden min-h-[150px]"
                initial={{ scaleX: 0.05, scaleY: 0.1, opacity: 0 }}
                animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-kiwi flex items-center gap-1.5 font-semibold">
                    <Cpu size={15} />
                    <span>Applied AI &amp; RAG</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">01</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed mt-2">
                  End-to-end fullstack apps with dense-vector RAG architectures (FAISS, NVIDIA NIM, Ollama) and real-time streaming interfaces.
                </p>
              </motion.div>
            )}

            {!completedPersonas.includes('ai-rag') && (
              <motion.div 
                className="absolute pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                initial={{ left: '0%', top: '10%' }}
                animate={{ left: '95%', top: '90%' }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#DFFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-[#DFFF00] border border-[#DFFF00]/50 ml-2 mt-0.5">
                  AI_Agent &bull; Pull Card Frame
                </span>
              </motion.div>
            )}
          </div>

          {/* Pillar 2: Kernel drags open box from top-left to bottom-right */}
          <div className="relative">
            {isRendered && (
              <motion.div 
                className="relative p-5 rounded-xl bg-kiwi-surface/80 border border-kiwi-border hover:border-kiwi-chartreuse/40 transition-colors flex flex-col gap-2 shadow-lg origin-top-left overflow-hidden min-h-[150px]"
                initial={{ scaleX: 0.05, scaleY: 0.1, opacity: 0 }}
                animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-kiwi-chartreuse flex items-center gap-1.5 font-semibold">
                    <Terminal size={15} />
                    <span>Linux Systems</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">02</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed mt-2">
                  Extensive exploration of Wayland/Hyprland dotfiles, Bash automation, Docker containerization, and terminal-first workflows.
                </p>
              </motion.div>
            )}

            {!completedPersonas.includes('kernel') && (
              <motion.div 
                className="absolute pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                initial={{ left: '0%', top: '10%' }}
                animate={{ left: '95%', top: '90%' }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#DFFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-[#DFFF00] border border-[#DFFF00]/50 ml-2 mt-0.5">
                  Kernel &bull; Pull Card Frame
                </span>
              </motion.div>
            )}
          </div>

          {/* Pillar 3: SecOps drags open box from top-left to bottom-right */}
          <div className="relative">
            {isRendered && (
              <motion.div 
                className="relative p-5 rounded-xl bg-kiwi-surface/80 border border-kiwi-border hover:border-kiwi-yellow/40 transition-colors flex flex-col gap-2 shadow-lg origin-top-left overflow-hidden min-h-[150px]"
                initial={{ scaleX: 0.05, scaleY: 0.1, opacity: 0 }}
                animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-kiwi-yellow flex items-center gap-1.5 font-semibold">
                    <ShieldCheck size={15} />
                    <span>Security &amp; Auth</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">03</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed mt-2">
                  Rigorous security implementations: P-256 ECDSA cryptographic verification, DCT watermarking, phishing intelligence, and session diffing.
                </p>
              </motion.div>
            )}

            {!completedPersonas.includes('secops') && (
              <motion.div 
                className="absolute pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                initial={{ left: '0%', top: '10%' }}
                animate={{ left: '95%', top: '90%' }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-[#FFFF00] border border-[#FFFF00]/50 ml-2 mt-0.5">
                  SecOps &bull; Pull Card Frame
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* PIECE 3: COLLABORATIVE COMMENT PIN BOXES (Simultaneously Dragged Open by Reviewer & QA_Audit) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 min-h-[90px]">
          {/* Comment 1: Reviewer drags open card */}
          <div className="relative">
            {isRendered && (
              <motion.div 
                className="relative p-4 rounded-xl bg-black/60 border border-kiwi/30 flex items-start gap-3 shadow-md origin-left overflow-hidden"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
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
              </motion.div>
            )}

            {!completedPersonas.includes('reviewer') && (
              <motion.div 
                className="absolute -top-6 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                initial={{ left: '0%' }}
                animate={{ left: '96%' }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-white border border-white/50 ml-2 mt-0.5">
                  Reviewer &bull; Pull Pin Box
                </span>
              </motion.div>
            )}
          </div>

          {/* Comment 2: QA_Audit drags open card */}
          <div className="relative">
            {isRendered && (
              <motion.div 
                className="relative p-4 rounded-xl bg-black/60 border border-kiwi-yellow/30 flex items-start gap-3 shadow-md origin-left overflow-hidden"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
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
              </motion.div>
            )}

            {!completedPersonas.includes('qa-audit') && (
              <motion.div 
                className="absolute -top-6 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                initial={{ left: '0%' }}
                animate={{ left: '96%' }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFF00" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-[#FFFF00] border border-[#FFFF00]/50 ml-2 mt-0.5">
                  QA_Audit &bull; Pull Pin Box
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
