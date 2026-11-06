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

interface PillarData {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  builderPersona: {
    name: string;
    action: string;
    color: string;
    id: string;
  };
  subHelperPersona: {
    name: string;
    action: string;
    color: string;
  };
}

const PILLARS_DATA: PillarData[] = [
  {
    id: 'ai-pillar',
    number: '01',
    title: 'Applied AI & RAG',
    description: 'End-to-end fullstack apps with dense-vector RAG architectures (FAISS, NVIDIA NIM, Ollama) and real-time streaming interfaces.',
    icon: Cpu,
    color: '#CCFF00',
    builderPersona: {
      name: 'AI_Agent',
      action: 'Draw Frame & Mount Vector DB',
      color: '#DFFF00',
      id: 'ai-rag',
    },
    subHelperPersona: {
      name: 'Embed_Worker',
      action: 'Stream FAISS Pipeline',
      color: '#CCFF00',
    },
  },
  {
    id: 'linux-pillar',
    number: '02',
    title: 'Linux Systems',
    description: 'Extensive exploration of Wayland/Hyprland dotfiles, Bash automation, Docker containerization, and terminal-first workflows.',
    icon: Terminal,
    color: '#DFFF00',
    builderPersona: {
      name: 'Kernel [Linux]',
      action: 'Draw Frame & Wire Wayland IPC',
      color: '#DFFF00',
      id: 'kernel',
    },
    subHelperPersona: {
      name: 'Bash_Worker',
      action: 'Automate Shell Scripting',
      color: '#FFFF00',
    },
  },
  {
    id: 'sec-pillar',
    number: '03',
    title: 'Security & Auth',
    description: 'Rigorous security implementations: P-256 ECDSA cryptographic verification, DCT watermarking, phishing intelligence, and session diffing.',
    icon: ShieldCheck,
    color: '#FFFF00',
    builderPersona: {
      name: 'SecOps',
      action: 'Draw Frame & Assert ECDSA',
      color: '#FFFF00',
      id: 'secops',
    },
    subHelperPersona: {
      name: 'Crypto_Worker',
      action: 'Verify Auth Signatures',
      color: '#FFFFFF',
    },
  },
];

// Sub-Component: Individual Micro-Constructed Pillar Card
const PillarCardBuilder: React.FC<{
  pillar: PillarData;
  isSectionInView: boolean;
  onComplete: (personaId: string) => void;
}> = ({ pillar, isSectionInView, onComplete }) => {
  const [step, setStep] = useState(0);
  const [titleChars, setTitleChars] = useState(0);
  const [descChars, setDescChars] = useState(0);

  const Icon = pillar.icon;

  useEffect(() => {
    if (!isSectionInView) {
      setStep(0);
      setTitleChars(0);
      setDescChars(0);
      return;
    }

    // Step 1: Draw empty card frame outline (blank inside)
    setStep(1);

    // Step 2: Drop icon & number, start typing title letter-by-letter (350ms)
    let titleInterval: ReturnType<typeof setInterval> | null = null;
    const tStep2 = setTimeout(() => {
      setStep(2);
      let count = 0;
      titleInterval = setInterval(() => {
        count += 1;
        if (count >= pillar.title.length) {
          setTitleChars(pillar.title.length);
          if (titleInterval) clearInterval(titleInterval);
        } else {
          setTitleChars(count);
        }
      }, 30);
    }, 350);

    // Step 3: Stream description character-by-character (850ms)
    let descInterval: ReturnType<typeof setInterval> | null = null;
    const tStep3 = setTimeout(() => {
      setStep(3);
      let dCount = 0;
      descInterval = setInterval(() => {
        dCount += 4;
        if (dCount >= pillar.description.length) {
          setDescChars(pillar.description.length);
          if (descInterval) clearInterval(descInterval);
        } else {
          setDescChars(dCount);
        }
      }, 18);
    }, 850);

    // Step 4: Card completed, release persona to mouse follower flock (1750ms)
    const tStep4 = setTimeout(() => {
      setStep(4);
      setTitleChars(pillar.title.length);
      setDescChars(pillar.description.length);
      onComplete(pillar.builderPersona.id);
    }, 1750);

    return () => {
      clearTimeout(tStep2);
      clearTimeout(tStep3);
      clearTimeout(tStep4);
      if (titleInterval) clearInterval(titleInterval);
      if (descInterval) clearInterval(descInterval);
    };
  }, [isSectionInView, pillar.title, pillar.description, pillar.builderPersona.id]);

  if (!isSectionInView || step === 0) return null;

  const isBuilding = step >= 1 && step < 4;

  return (
    <div className="relative min-h-[170px]">
      {/* 1. CARD FRAME: Empty container drawn open diagonally from top-left */}
      <motion.div 
        className="relative p-5 rounded-xl bg-kiwi-surface/80 border border-kiwi-border hover:border-kiwi/40 transition-colors flex flex-col gap-2 shadow-lg origin-top-left overflow-hidden min-h-[160px] h-full"
        initial={{ scaleX: 0.05, scaleY: 0.1, opacity: 0 }}
        animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        {/* Step 1 Cursor: Dragging the blank frame open */}
        {isBuilding && step === 1 && (
          <motion.div 
            className="absolute pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
            initial={{ left: '0%', top: '10%' }}
            animate={{ left: '92%', top: '88%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
              <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={pillar.builderPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span 
              className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
              style={{ color: pillar.builderPersona.color, borderColor: `${pillar.builderPersona.color}60` }}
            >
              {pillar.builderPersona.name} &bull; Draw Pillar Frame
            </span>
          </motion.div>
        )}

        {/* 2. HEADER: Icon Dropped & Title Typed Letter-by-Letter */}
        {step >= 2 && (
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 font-semibold" style={{ color: pillar.color }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              >
                <Icon size={15} />
              </motion.div>
              <span>{pillar.title.slice(0, titleChars)}</span>

              {/* Title typing caret cursor */}
              {isBuilding && step === 2 && (
                <span className="inline-block relative ml-1 align-baseline">
                  <span className="inline-block w-1.5 h-3.5 bg-kiwi animate-pulse align-middle" />
                  <span className="absolute -top-7 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={pillar.builderPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span 
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                      style={{ color: pillar.builderPersona.color, borderColor: `${pillar.builderPersona.color}60` }}
                    >
                      {pillar.builderPersona.name} &bull; Type Title
                    </span>
                  </span>
                </span>
              )}
            </div>

            <motion.span 
              className="text-[10px] text-zinc-500 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {pillar.number}
            </motion.span>
          </div>
        )}

        {/* 3. DESCRIPTION STREAMED LETTER-BY-LETTER */}
        {step >= 3 && (
          <div className="mt-2 min-h-[50px]">
            <p className="text-xs text-zinc-300 leading-relaxed inline">
              {pillar.description.slice(0, descChars)}

              {/* Description stream caret cursor */}
              {isBuilding && step === 3 && (
                <span className="inline-block relative ml-1 align-baseline">
                  <span className="inline-block w-1 h-3 bg-zinc-300 animate-pulse align-middle" />
                  <span className="absolute -top-7 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={pillar.subHelperPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span 
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                      style={{ color: pillar.subHelperPersona.color, borderColor: `${pillar.subHelperPersona.color}60` }}
                    >
                      {pillar.subHelperPersona.name} &bull; Stream Architecture
                    </span>
                  </span>
                </span>
              )}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const AboutCanvas: React.FC<AboutCanvasProps> = ({ onFollowChange }) => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { 
    amount: 0.2,
  });

  const [completedPersonas, setCompletedPersonas] = useState<string[]>([]);
  const [titleChars, setTitleChars] = useState(0);
  const [descChars, setDescChars] = useState(0);

  const fullTitle = "Bridging Deep Systems Engineering with Intuitive User Experience";
  const fullDesc = "I am a 3rd-year B.Tech Computer Science and Engineering student at VIT Chennai. A self-driven developer who explores Linux systems, desktop configurations, and applied AI pipelines outside the classroom, with a commitment to building software that solves genuine problems.";

  useEffect(() => {
    // UNBUILD: When About leaves viewport, collapse back to 0
    if (!isInView) {
      setCompletedPersonas([]);
      setTitleChars(0);
      setDescChars(0);
      if (onFollowChange) onFollowChange([]);
      return;
    }

    // SIMULTANEOUS PARALLEL BUILD WITH INDIVIDUAL HANDOFF:
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
    }, 20);

    // Comment pin cards finish at 1500ms -> QA_Audit & Reviewer follow mouse
    const tPins = setTimeout(() => {
      releasePersonas(['qa-audit', 'reviewer']);
    }, 1500);

    return () => {
      clearTimeout(tPins);
      if (titleInterval) clearInterval(titleInterval);
      if (descInterval) clearInterval(descInterval);
    };
  }, [isInView]);

  const handlePillarComplete = (personaId: string) => {
    setCompletedPersonas(prev => {
      const next = Array.from(new Set([...prev, personaId]));
      if (onFollowChange) onFollowChange(next);
      return next;
    });
  };

  return (
    <section 
      ref={containerRef}
      className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 min-h-[480px]" 
      id="about"
    >
      {/* NO OUTER BOX - CLEAN DIRECT CANVAS PRESENTATION */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* PIECE 1: HEADER & BIO SUMMARY (Typed Letter-by-Letter by Dev [Kishal]) */}
        {isInView && (
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

        {/* PIECE 2: THE 3 CONTENT PILLAR BOXES (Each Drawn Blank First, Then Built Internally by Cursors) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 min-h-[160px]">
          {PILLARS_DATA.map((pillar) => (
            <PillarCardBuilder
              key={pillar.id}
              pillar={pillar}
              isSectionInView={isInView}
              onComplete={handlePillarComplete}
            />
          ))}
        </div>

        {/* PIECE 3: COLLABORATIVE COMMENT PIN BOXES (Drawn Blank First, Then Quotes Typed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 min-h-[90px]">
          {/* Comment 1: Reviewer drags open card */}
          <div className="relative">
            {isInView && (
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

            {!completedPersonas.includes('reviewer') && isInView && (
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
            {isInView && (
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

            {!completedPersonas.includes('qa-audit') && isInView && (
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
