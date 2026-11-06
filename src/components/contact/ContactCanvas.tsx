import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Mail, 
  Github, 
  Linkedin, 
  GraduationCap, 
  Send, 
  Copy, 
  Check, 
  ArrowUpRight,
  MessageSquareCode
} from 'lucide-react';

interface ContactCanvasProps {
  onFollowChange?: (followingIds: string[]) => void;
  buildKey?: number;
}

export const ContactCanvas: React.FC<ContactCanvasProps> = ({
  onFollowChange,
  buildKey = 0,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { amount: 0.15 });

  const [completedPersonas, setCompletedPersonas] = useState<string[]>([]);
  const [titleChars, setTitleChars] = useState(0);

  // Micro-component construction step for the interactive composer card:
  // 0: Unbuilt
  // 1: Blank frame drawn open (0 - 350ms)
  // 2: Header & badge drop with snap (350ms - 850ms)
  // 3: Input fields etched by QA_Audit (850ms - 1400ms)
  // 4: Send button stamped by SecOps (1400ms - 1900ms)
  // 5: Complete & release to mouse flock (1950ms+)
  const [composerStep, setComposerStep] = useState(0);

  // Form states
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [dispatched, setDispatched] = useState(false);

  const fullTitle = "Initiate Collaboration & Direct Inquiries";

  useEffect(() => {
    // UNBUILD: When section leaves viewport, reset all states
    if (!isInView) {
      setCompletedPersonas([]);
      setTitleChars(0);
      setComposerStep(0);
      setDispatched(false);
      if (onFollowChange) onFollowChange([]);
      return;
    }

    // SIMULTANEOUS PARALLEL BUILD WITH INDIVIDUAL HANDOFF:
    setCompletedPersonas([]);
    setTitleChars(0);
    setComposerStep(0);
    setDispatched(false);
    if (onFollowChange) onFollowChange([]);

    const finished = new Set<string>();
    const releasePersonas = (newIds: string[]) => {
      newIds.forEach(id => finished.add(id));
      const arr = Array.from(finished);
      setCompletedPersonas(arr);
      if (onFollowChange) onFollowChange(arr);
    };

    // 1. Concurrently stream headline letter-by-letter with Dev [Kishal] cursor
    let titleInterval: ReturnType<typeof setInterval> | null = null;
    let tCount = 0;
    titleInterval = setInterval(() => {
      tCount += 1;
      if (tCount >= fullTitle.length) {
        setTitleChars(fullTitle.length);
        if (titleInterval) clearInterval(titleInterval);
        // Dev finishes title typing and releases to mouse flock
        releasePersonas(['dev-kishal', 'kernel']);
      } else {
        setTitleChars(tCount);
      }
    }, 28);

    // 2. Composer Card Micro-Construction sequence
    setComposerStep(1);

    const t2 = setTimeout(() => setComposerStep(2), 350);
    const t3 = setTimeout(() => setComposerStep(3), 850);
    const t4 = setTimeout(() => setComposerStep(4), 1400);
    const t5 = setTimeout(() => {
      setComposerStep(5);
      releasePersonas(['reviewer', 'qa-audit', 'secops', 'ui-ux', 'ai-rag']);
    }, 1950);

    return () => {
      if (titleInterval) clearInterval(titleInterval);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isInView, buildKey]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('kishal2007@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;

    const mailtoUrl = `mailto:kishal2007@gmail.com?subject=${encodeURIComponent(
      formData.subject || `Inquiry from ${formData.name || 'Portfolio Collaborator'}`
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    window.open(mailtoUrl, '_blank');
    setDispatched(true);
    setTimeout(() => setDispatched(false), 4000);
  };

  const isBuildingComposer = composerStep >= 1 && composerStep < 5;

  return (
    <section 
      ref={containerRef}
      className="relative pt-8 pb-20 sm:pt-12 sm:pb-24 min-h-[600px]" 
      id="contact"
    >
      {/* NO OUTER BOX - CLEAN DIRECT CANVAS PRESENTATION */}
      <div className="flex flex-col gap-10 relative z-10">
        
        {/* SECTION HEADER (Typed letter-by-letter with Dev [Kishal] cursor) */}
        {isInView && (
          <div className="space-y-3 max-w-3xl min-h-[100px]">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
              <MessageSquareCode size={14} />
              <span>Direct Coordinates &bull; Collaborative Inquiries</span>
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
              Available for full-stack engineering roles, applied AI/RAG system architecture, security research, and direct technical consultations.
            </p>
          </div>
        )}

        {/* 2-COLUMN COLLABORATIVE CONTACT CANVAS */}
        {isInView && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN (5 Cols): Direct Connection Badges & Verified Coordinates */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Email Connection Badge */}
              <motion.div
                className="p-5 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex items-center justify-between gap-4 shadow-xl group"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black border border-kiwi/30 flex items-center justify-center shrink-0 text-kiwi">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Primary Channel</span>
                    <a 
                      href="mailto:kishal2007@gmail.com"
                      className="text-sm sm:text-base font-bold text-white hover:text-kiwi transition-colors truncate block"
                    >
                      kishal2007@gmail.com
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="p-2 rounded-lg bg-black/80 border border-zinc-800 hover:border-kiwi text-zinc-400 hover:text-white transition-all shrink-0"
                  title="Copy email to clipboard"
                  aria-label="Copy email"
                >
                  {copiedEmail ? <Check size={16} className="text-kiwi" /> : <Copy size={16} />}
                </button>
              </motion.div>

              {/* GitHub Profile Badge */}
              <motion.a
                href="https://github.com/Kishalll"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex items-center justify-between gap-4 shadow-xl group"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black border border-yellow/30 flex items-center justify-center shrink-0 text-yellow">
                    <Github size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Code Repository</span>
                    <span className="text-sm sm:text-base font-bold text-white group-hover:text-yellow transition-colors truncate block">
                      github.com/Kishalll
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-zinc-500 group-hover:text-yellow transition-colors shrink-0" />
              </motion.a>

              {/* LinkedIn Profile Badge */}
              <motion.a
                href="https://www.linkedin.com/in/kishal-p-0a13842b9/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex items-center justify-between gap-4 shadow-xl group"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black border border-chartreuse/30 flex items-center justify-center shrink-0 text-chartreuse">
                    <Linkedin size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Professional Network</span>
                    <span className="text-sm sm:text-base font-bold text-white group-hover:text-chartreuse transition-colors truncate block">
                      Kishal P on LinkedIn
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-zinc-500 group-hover:text-chartreuse transition-colors shrink-0" />
              </motion.a>

              {/* University Campus Badge */}
              <motion.div
                className="p-5 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex items-center gap-3 shadow-xl"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center shrink-0 text-white">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Academic Affiliation</span>
                  <p className="text-sm font-semibold text-white">VIT Chennai &bull; B.Tech Computer Science</p>
                  <span className="text-xs text-zinc-500 font-mono">3rd Year (Class of 2027)</span>
                </div>
              </motion.div>

              {/* Status Pill */}
              <motion.div 
                className="p-3.5 rounded-xl bg-black/60 border border-kiwi/30 flex items-center gap-2.5 text-xs font-mono text-kiwi"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <span className="w-2 h-2 rounded-full bg-kiwi animate-ping shrink-0" />
                <span>Status: Available for Q2/Q3 2026 Internships</span>
              </motion.div>
            </div>

            {/* RIGHT COLUMN (7 Cols): Collaborative Message Composer Card Built Step-by-Step */}
            <div className="lg:col-span-7">
              <div className="relative min-h-[460px]">
                
                {/* 1. CARD FRAME: Blank container drawn open diagonally */}
                <motion.div
                  className="relative p-6 sm:p-8 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border shadow-2xl origin-top-left overflow-hidden h-full flex flex-col justify-between gap-6"
                  initial={{ scaleX: 0.05, scaleY: 0.1, opacity: 0 }}
                  animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                >
                  {/* Step 1 Cursor: Dragging the blank frame open */}
                  {isBuildingComposer && composerStep === 1 && (
                    <motion.div
                      className="absolute pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap"
                      initial={{ left: '0%', top: '10%' }}
                      animate={{ left: '90%', top: '90%' }}
                      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                    >
                      <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                        <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-white border border-white/60 ml-2 mt-0.5">
                        Reviewer &bull; Draw Composer Frame
                      </span>
                    </motion.div>
                  )}

                  {/* 2. CARD HEADER: Dropped in Step 2 */}
                  {composerStep >= 2 && (
                    <div className="flex items-center justify-between pb-4 border-b border-kiwi-border/60">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-kiwi">Collaborative Dispatch</span>
                        <h3 className="text-xl font-bold text-white tracking-tight">Direct Message Composer</h3>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-black/80 border border-zinc-800 text-zinc-400">
                        P-256 Verified
                      </span>
                    </div>
                  )}

                  {/* 3. INPUT FORM FIELDS: Etched in Step 3 by QA_Audit */}
                  {composerStep >= 3 && (
                    <form onSubmit={handleSendMessage} className="space-y-4 relative">
                      {/* QA_Audit cursor etching form fields */}
                      {isBuildingComposer && composerStep === 3 && (
                        <div className="absolute -top-3 right-4 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                          <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                            <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFF00" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                          </svg>
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-yellow border border-yellow/60 ml-2 mt-0.5">
                            QA_Audit &bull; Etch Form Fields
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-zinc-300 block">Your Name / Handle</label>
                          <input 
                            type="text"
                            required
                            placeholder="Alex Vance"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-zinc-800 text-white placeholder-zinc-600 text-sm font-sans focus:outline-none focus:border-kiwi transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-zinc-300 block">Your Email Address</label>
                          <input 
                            type="email"
                            required
                            placeholder="alex@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-zinc-800 text-white placeholder-zinc-600 text-sm font-sans focus:outline-none focus:border-kiwi transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-zinc-300 block">Subject / Topic</label>
                        <input 
                          type="text"
                          placeholder="Project Inquiry / Engineering Role"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-zinc-800 text-white placeholder-zinc-600 text-sm font-sans focus:outline-none focus:border-kiwi transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-zinc-300 block">Message Details</label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="Tell me about your project, timeline, or engineering opportunity..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-zinc-800 text-white placeholder-zinc-600 text-sm font-sans focus:outline-none focus:border-kiwi transition-colors resize-none"
                        />
                      </div>

                      {/* 4. SEND DISPATCH BUTTON: Stamped in Step 4 by SecOps */}
                      {composerStep >= 4 && (
                        <div className="pt-2 flex items-center justify-between gap-4 relative">
                          {/* SecOps cursor stamping submit button */}
                          {isBuildingComposer && composerStep === 4 && (
                            <div className="absolute -top-6 left-1/3 pointer-events-none z-30 flex flex-col items-start select-none whitespace-nowrap">
                              <svg className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24" fill="none">
                                <path d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z" fill="#FFFF00" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
                              </svg>
                              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-xl bg-[#0A0B08] text-yellow border border-yellow/60 ml-2 mt-0.5">
                                SecOps &bull; Stamp Dispatch
                              </span>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-kiwi text-black font-semibold text-sm hover:bg-yellow transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-kiwi/20 cursor-pointer"
                          >
                            <span>Send Dispatch</span>
                            <Send size={15} />
                          </button>

                          {dispatched && (
                            <span className="text-xs font-mono text-kiwi flex items-center gap-1.5 animate-pulse">
                              <Check size={14} /> Dispatch Prepared!
                            </span>
                          )}
                        </div>
                      )}
                    </form>
                  )}

                  {/* Step 5: Construction complete snap glow */}
                  {composerStep === 5 && (
                    <motion.div 
                      className="absolute inset-0 rounded-2xl border-2 border-kiwi pointer-events-none"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </motion.div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

