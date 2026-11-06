import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Code2, 
  Layout, 
  Brain, 
  Shield, 
  Layers
} from 'lucide-react';

interface SkillsCanvasProps {
  onFollowChange?: (followingIds: string[]) => void;
  buildKey?: number;
}

interface SkillTrayData {
  id: string;
  title: string;
  badge: string;
  description: string;
  skills: string[];
  icon: React.ElementType;
  color: string;
  builderPersona: {
    id: string;
    name: string;
    color: string;
    action: string;
  };
  subHelperPersona: {
    id: string;
    name: string;
    color: string;
    action: string;
  };
}

const SKILL_TRAYS: SkillTrayData[] = [
  {
    id: 'languages-tray',
    title: 'Languages & Core Runtimes',
    badge: 'EXECUTION ENVIRONMENTS',
    description: 'Strict typing, systems compilation, shell automation, and relational querying.',
    skills: ['TypeScript', 'JavaScript', 'Python', 'C++', 'Bash/Shell', 'SQL', 'HTML5/CSS3'],
    icon: Code2,
    color: '#CCFF00',
    builderPersona: {
      id: 'dev-kishal',
      name: 'Dev [Kishal]',
      color: '#CCFF00',
      action: 'Draw Language Tray',
    },
    subHelperPersona: {
      id: 'syntax-bot',
      name: 'Syntax_Worker',
      color: '#FFFF00',
      action: 'Stamp Syntax Token',
    },
  },
  {
    id: 'frontend-tray',
    title: 'Frontend & Mobile Architecture',
    badge: 'INTERACTIVE CLIENTS',
    description: 'Responsive web apps, cross-platform mobile suites, and reactive UI component trees.',
    skills: ['React.js', 'React Native', 'Next.js', 'Tailwind CSS', 'Expo', 'Framer Motion', 'Vite', 'Redux Toolkit'],
    icon: Layout,
    color: '#FFFF00',
    builderPersona: {
      id: 'ui-ux',
      name: 'UI_Design',
      color: '#CCFF00',
      action: 'Assemble UI Tray',
    },
    subHelperPersona: {
      id: 'layout-bot',
      name: 'Layout_Worker',
      color: '#DFFF00',
      action: 'Stamp Client Token',
    },
  },
  {
    id: 'backend-ai-tray',
    title: 'Backend, AI & RAG Pipelines',
    badge: 'INTELLIGENCE & SERVICES',
    description: 'Dense-vector retrieval, NVIDIA NIM models, local LLMs, and real-time streaming sockets.',
    skills: ['Node.js', 'Express.js', 'FastAPI', 'NVIDIA NIM', 'FAISS RAG', 'Local Ollama', 'Socket.IO', 'Server-Sent Events (SSE)', 'REST APIs'],
    icon: Brain,
    color: '#DFFF00',
    builderPersona: {
      id: 'ai-rag',
      name: 'AI_Agent',
      color: '#DFFF00',
      action: 'Deploy Vector Tray',
    },
    subHelperPersona: {
      id: 'vector-bot',
      name: 'RAG_Worker',
      color: '#CCFF00',
      action: 'Stamp Model Token',
    },
  },
  {
    id: 'systems-sec-tray',
    title: 'Systems, Security & Cloud Edge',
    badge: 'INFRASTRUCTURE & CRYPTO',
    description: 'Cryptographic signatures, Linux window management, edge serverless, and cloud deployments.',
    skills: ['Linux / Hyprland CLI', 'Docker', 'P-256 ECDSA', 'Cloudflare Workers & D1', 'SQLite', 'Git & GitHub', 'AWS', 'Security Auditing'],
    icon: Shield,
    color: '#FFFF00',
    builderPersona: {
      id: 'secops',
      name: 'SecOps',
      color: '#FFFF00',
      action: 'Deploy Systems Tray',
    },
    subHelperPersona: {
      id: 'crypto-worker',
      name: 'Crypto_Worker',
      color: '#CCFF00',
      action: 'Stamp Crypto Token',
    },
  },
];

// Sub-Component: Individual Micro-Constructed Skill Tray
const SkillTrayBuilder: React.FC<{
  tray: SkillTrayData;
  isSectionInView: boolean;
  onComplete: (personaId: string) => void;
}> = ({ tray, isSectionInView, onComplete }) => {
  // Step Progression:
  // 0: Unbuilt / empty
  // 1: Frame drawing (blank inside, no text/pills exist yet) (0 - 350ms)
  // 2: Icon drops with snap, badge stamps, title types letter-by-letter (350ms - 900ms)
  // 3: Description streams character-by-character (900ms - 1300ms)
  // 4: Skill pills stamped one-by-one by helper cursor into flex tray (1300ms - 1900ms)
  // 5: Complete -> snap flash, builder persona releases to mouse follow (1950ms+)
  const [step, setStep] = useState(0);
  const [titleChars, setTitleChars] = useState(0);
  const [descChars, setDescChars] = useState(0);
  const [visibleSkills, setVisibleSkills] = useState(0);

  const Icon = tray.icon;

  useEffect(() => {
    if (!isSectionInView) {
      setStep(0);
      setTitleChars(0);
      setDescChars(0);
      setVisibleSkills(0);
      return;
    }

    // Step 1: Draw empty frame outline (blank inside)
    setStep(1);

    // Step 2: Drop icon & badge, start typing title letter-by-letter (350ms)
    let titleInterval: ReturnType<typeof setInterval> | null = null;
    const tStep2 = setTimeout(() => {
      setStep(2);
      let count = 0;
      titleInterval = setInterval(() => {
        count += 1;
        if (count >= tray.title.length) {
          setTitleChars(tray.title.length);
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
        dCount += 3;
        if (dCount >= tray.description.length) {
          setDescChars(tray.description.length);
          if (descInterval) clearInterval(descInterval);
        } else {
          setDescChars(dCount);
        }
      }, 16);
    }, 850);

    // Step 4: Inject skill pills one-by-one (1300ms)
    let skillInterval: ReturnType<typeof setInterval> | null = null;
    const tStep4 = setTimeout(() => {
      setStep(4);
      let sCount = 0;
      skillInterval = setInterval(() => {
        sCount += 1;
        if (sCount >= tray.skills.length) {
          setVisibleSkills(tray.skills.length);
          if (skillInterval) clearInterval(skillInterval);
        } else {
          setVisibleSkills(sCount);
        }
      }, 65);
    }, 1300);

    // Step 5: Complete construction, release persona to mouse follow (1950ms)
    const tStep5 = setTimeout(() => {
      setStep(5);
      setTitleChars(tray.title.length);
      setDescChars(tray.description.length);
      setVisibleSkills(tray.skills.length);
      onComplete(tray.builderPersona.id);
    }, 1950);

    return () => {
      clearTimeout(tStep2);
      clearTimeout(tStep3);
      clearTimeout(tStep4);
      clearTimeout(tStep5);
      if (titleInterval) clearInterval(titleInterval);
      if (descInterval) clearInterval(descInterval);
      if (skillInterval) clearInterval(skillInterval);
    };
  }, [isSectionInView, tray.title, tray.description, tray.skills.length, tray.builderPersona.id]);

  if (!isSectionInView || step === 0) return null;

  const isBuilding = step >= 1 && step < 5;

  return (
    <div className="relative min-h-[260px]">
      {/* 1. TRAY FRAME: Empty container drawn open diagonally from top-left */}
      <motion.div
        className="relative p-6 sm:p-7 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex flex-col justify-between gap-5 shadow-xl origin-top-left overflow-hidden h-full group"
        initial={{ scaleX: 0.05, scaleY: 0.1, opacity: 0 }}
        animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        {/* Step 1 Cursor: Dragging the blank frame open */}
        {isBuilding && step === 1 && (
          <motion.div
            className="absolute pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
            initial={{ left: '0%', top: '10%' }}
            animate={{ left: '90%', top: '88%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
              <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={tray.builderPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span 
              className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
              style={{ color: tray.builderPersona.color, borderColor: `${tray.builderPersona.color}60` }}
            >
              {tray.builderPersona.name} &bull; Draw Tray Frame
            </span>
          </motion.div>
        )}

        {/* 2. TRAY HEADER: Dropped Icon, Domain Badge, Typed Title */}
        {step >= 2 && (
          <div className="flex items-start gap-4">
            {/* Dropped Icon Box with Snap Animation */}
            <motion.div 
              className="w-10 h-10 rounded-xl bg-black border flex items-center justify-center shrink-0 shadow-md"
              style={{ borderColor: `${tray.color}40` }}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              <Icon size={18} style={{ color: tray.color }} />
            </motion.div>

            <div className="flex-1 min-w-0">
              {/* Category Badge Pill with Snap Animation */}
              <motion.span 
                className="text-[10px] font-mono font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-black/80 border inline-block"
                style={{ 
                  color: tray.color,
                  borderColor: `${tray.color}30` 
                }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {tray.badge}
              </motion.span>

              {/* Tray Title TYPED LETTER-BY-LETTER with Cursor on Caret */}
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1 group-hover:text-kiwi transition-colors">
                {tray.title.slice(0, titleChars)}

                {/* Title Typing Caret Cursor */}
                {isBuilding && step === 2 && (
                  <span className="inline-block relative ml-1 align-baseline">
                    <span className="inline-block w-1.5 sm:w-2 h-5 bg-kiwi animate-pulse align-middle" />
                    <span className="absolute -top-7 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                      <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                        <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={tray.builderPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      <span 
                        className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                        style={{ color: tray.builderPersona.color, borderColor: `${tray.builderPersona.color}60` }}
                      >
                        {tray.builderPersona.name} &bull; Type Title
                      </span>
                    </span>
                  </span>
                )}
              </h3>
            </div>
          </div>
        )}

        {/* 3. TRAY SPEC STREAM: Description Streamed Character by Character */}
        {step >= 3 && (
          <div className="min-h-[40px]">
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal inline">
              {tray.description.slice(0, descChars)}

              {/* Cursor riding the description stream caret */}
              {isBuilding && step === 3 && (
                <span className="inline-block relative ml-1 align-baseline">
                  <span className="inline-block w-1.5 h-3.5 bg-zinc-300 animate-pulse align-middle" />
                  <span className="absolute -top-7 -left-1 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                    <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={tray.builderPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    <span 
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                      style={{ color: tray.builderPersona.color, borderColor: `${tray.builderPersona.color}60` }}
                    >
                      {tray.builderPersona.name} &bull; Stream Spec
                    </span>
                  </span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* 4. AUTO-LAYOUT SKILL PILLS: Stamped One by One with Sub-Helper Cursors */}
        {step >= 4 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-kiwi-border/60 relative min-h-[50px]">
            {tray.skills.slice(0, visibleSkills).map((skill) => (
              <motion.span 
                key={skill}
                className="px-2.5 py-1 text-xs font-mono rounded-lg bg-black/90 border border-zinc-800 text-zinc-300 font-medium shadow-sm hover:border-kiwi hover:text-white transition-colors"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                {skill}
              </motion.span>
            ))}

            {/* Sub-Helper Cursor stamping the skill tokens */}
            {isBuilding && step === 4 && visibleSkills < tray.skills.length && (
              <span className="inline-block relative ml-2">
                <span className="absolute -top-7 -left-2 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                  <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                    <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill={tray.subHelperPersona.color} stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  <span 
                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] border ml-2 mt-0.5"
                    style={{ color: tray.subHelperPersona.color, borderColor: `${tray.subHelperPersona.color}60` }}
                  >
                    {tray.subHelperPersona.name} &bull; Stamp Token
                  </span>
                </span>
              </span>
            )}
          </div>
        )}

        {/* Step 5: Construction complete snap border flash */}
        {step === 5 && (
          <motion.div 
            className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
            style={{ borderColor: tray.color }}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </motion.div>
    </div>
  );
};

export const SkillsCanvas: React.FC<SkillsCanvasProps> = ({
  onFollowChange,
  buildKey = 0,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { 
    amount: 0.15,
  });

  const [completedPersonas, setCompletedPersonas] = useState<string[]>([]);
  const [titleChars, setTitleChars] = useState(0);

  const fullTitle = "Technical Arsenal & Auto-Layout Trays";

  useEffect(() => {
    // UNBUILD: When section leaves viewport, collapse back to 0
    if (!isInView) {
      setCompletedPersonas([]);
      setTitleChars(0);
      if (onFollowChange) onFollowChange([]);
      return;
    }

    // SIMULTANEOUS PARALLEL BUILD WITH INDIVIDUAL HANDOFF:
    setCompletedPersonas([]);
    setTitleChars(0);
    if (onFollowChange) onFollowChange([]);

    const finished = new Set<string>();

    const releasePersonas = (newIds: string[]) => {
      newIds.forEach(id => finished.add(id));
      const arr = Array.from(finished);
      setCompletedPersonas(arr);
      if (onFollowChange) onFollowChange(arr);
    };

    // Concurrently stream headline letter-by-letter with Dev [Kishal] cursor
    let titleInterval: ReturnType<typeof setInterval> | null = null;
    let tCount = 0;
    titleInterval = setInterval(() => {
      tCount += 1;
      if (tCount >= fullTitle.length) {
        setTitleChars(fullTitle.length);
        if (titleInterval) clearInterval(titleInterval);
        // Dev finishes title typing and immediately follows mouse
        releasePersonas(['kernel', 'qa-audit']);
      } else {
        setTitleChars(tCount);
      }
    }, 28);

    return () => {
      if (titleInterval) clearInterval(titleInterval);
    };
  }, [isInView, buildKey]);

  const handleTrayComplete = (personaId: string) => {
    setCompletedPersonas(prev => {
      const next = Array.from(new Set([...prev, personaId]));
      if (onFollowChange) onFollowChange(next);
      return next;
    });
  };

  return (
    <section 
      ref={containerRef}
      className="relative pt-8 pb-16 sm:pt-12 sm:pb-20 min-h-[600px]" 
      id="skills"
    >
      {/* NO OUTER BOX - CLEAN DIRECT CANVAS PRESENTATION */}
      <div className="flex flex-col gap-8 relative z-10">
        
        {/* SECTION HEADER (Typed letter-by-letter with Dev [Kishal] cursor) */}
        {isInView && (
          <div className="space-y-3 max-w-3xl min-h-[100px]">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
              <Layers size={14} />
              <span>Skill Matrix &bull; Production Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block">
              {fullTitle.slice(0, titleChars)}

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

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Domain-categorized auto-layout trays spanning system kernels, real-time AI vector stores, full-stack client runtimes, and cryptographic edge protocols.
            </p>
          </div>
        )}

        {/* SKILL TRAYS GRID: 4 Trays Built Step-by-Step in Parallel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {SKILL_TRAYS.map((tray) => (
            <SkillTrayBuilder
              key={tray.id}
              tray={tray}
              isSectionInView={isInView}
              onComplete={handleTrayComplete}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

