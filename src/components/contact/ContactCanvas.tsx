import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { gsap, ScrollTrigger, waitForFontsAndLayout } from '../../animation/motionUtils';
import { buildText, buildBlock, createTargetTrigger } from '../../animation/builders';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { useSectionChoreographer, ChoreographerLayer } from '../../animation/CursorChoreographer';
import { GuideLines } from '../canvas/overlays';

interface ContactCanvasProps {
  buildKey?: number;
}

export const ContactCanvas: React.FC<ContactCanvasProps> = ({ buildKey = 0 }) => {
  const containerRef = useRef<HTMLElement>(null);
  const { isMobile, prefersReducedMotion, rebuildOnReentry } = useChoreographer();

  // Header Elements
  const headerBadgeRef = useRef<HTMLDivElement>(null);
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerDescRef = useRef<HTMLParagraphElement>(null);

  // Column Targets
  const leftColRef = useRef<HTMLDivElement>(null);
  const composerCardRef = useRef<HTMLDivElement>(null);

  // Stat / Label Scramble Target Refs
  const academicYearRef = useRef<HTMLSpanElement>(null);
  const statusPillRef = useRef<HTMLSpanElement>(null);
  const verifiedBadgeRef = useRef<HTMLSpanElement>(null);

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
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          leftColRef.current,
          composerCardRef.current,
        ].filter(Boolean),
        { autoAlpha: 0 }
      );
    }, container);

    return () => ctx.revert();
  }, [buildKey, prefersReducedMotion]);

  // Interactive Form State
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isCancelled = false;

    const ctx = gsap.context(() => {
      const initScrollBuild = async () => {
        await waitForFontsAndLayout();
        if (isCancelled || !container) return;

        const allContentElements = [
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          leftColRef.current,
          composerCardRef.current,
        ].filter(Boolean) as HTMLElement[];

        if (prefersReducedMotion) {
          gsap.set(allContentElements, { autoAlpha: 1, y: 0, scale: 1 });
          return;
        }

        ctx.add(() => {
          // 0. Red Ruler onToggle
          const rulerEl = container.querySelector('.bg-\\[\\#FF3B30\\]');
          if (rulerEl) {
            gsap.set(rulerEl, { scaleY: 0, transformOrigin: 'top center', autoAlpha: 0 });
            ScrollTrigger.create({
              trigger: container,
              start: 'top bottom',
              end: 'bottom top',
              onToggle: (self) => {
                gsap.to(rulerEl, {
                  scaleY: self.isActive ? 1 : 0,
                  autoAlpha: self.isActive ? 0.85 : 0,
                  duration: 0.6,
                  ease: 'power2.out',
                });
              },
            });
          }

          // 1. Target: Header Badge
          if (headerBadgeRef.current) {
            const agent = assign({ target: headerBadgeRef.current, label: 'Select Badge' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: headerBadgeRef.current,
              agent,
              agentIndex: 0,
              totalAgents: 6,
              isMobile,
            });
            createTargetTrigger(headerBadgeRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.0,
            });
          }

          // 2. Target: Header Title (SplitText typing)
          if (headerTitleRef.current) {
            const agent = assign({ target: headerTitleRef.current, label: 'Type Contact Title', isHeadline: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: headerTitleRef.current,
              agent,
              agentIndex: 1,
              totalAgents: 6,
              isHeadline: true,
              isMobile,
            });
            createTargetTrigger(headerTitleRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.08,
            });
          }

          // 3. Target: Header Desc (SplitText typing)
          if (headerDescRef.current) {
            const agent = assign({ target: headerDescRef.current, label: 'Format Description', isParagraph: true, isIBeam: true });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildText(tl, {
              containerEl: container,
              targetEl: headerDescRef.current,
              agent,
              agentIndex: 2,
              totalAgents: 6,
              isParagraph: true,
              isMobile,
            });
            createTargetTrigger(headerDescRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.14,
            });
          }

          // 4. Target: Left Column (Direct Channels + ScrambleText)
          if (leftColRef.current) {
            const agent = assign({ target: leftColRef.current, label: 'Mount Channels' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: leftColRef.current,
              agent,
              agentIndex: 3,
              totalAgents: 6,
              isMobile,
            });

            if (verifiedBadgeRef.current) {
              tl.to(
                verifiedBadgeRef.current,
                {
                  scrambleText: {
                    text: 'P-256 Verified',
                    chars: '0123456789ABCDEF!<>-_/[]{}',
                    speed: 0.5,
                  },
                  duration: 0.65,
                  ease: 'none',
                },
                '-=0.2'
              );
            }

            if (statusPillRef.current) {
              tl.to(
                statusPillRef.current,
                {
                  scrambleText: {
                    text: 'Status: Available for Q2/Q3 2026 Internships',
                    chars: '0123456789ABCDEF!<>-_/[]{}',
                    speed: 0.5,
                  },
                  duration: 0.75,
                  ease: 'none',
                },
                '-=0.15'
              );
            }

            if (academicYearRef.current) {
              tl.to(
                academicYearRef.current,
                {
                  scrambleText: {
                    text: '3rd Year (Class of 2027)',
                    chars: '0123456789ABCDEF!<>-_/[]{}',
                    speed: 0.5,
                  },
                  duration: 0.65,
                  ease: 'none',
                },
                '-=0.15'
              );
            }

            const fullReset = () => {
              reset();
              if (verifiedBadgeRef.current) verifiedBadgeRef.current.textContent = 'P-256 Verified';
              if (statusPillRef.current) statusPillRef.current.textContent = 'Status: Available for Q2/Q3 2026 Internships';
              if (academicYearRef.current) academicYearRef.current.textContent = '3rd Year (Class of 2027)';
            };

            createTargetTrigger(leftColRef.current, tl, fullReset, {
              rebuildOnReentry,
              staggerDelay: 0.06,
            });
          }

          // 5. Target: Composer Card (Message Board)
          if (composerCardRef.current) {
            const agent = assign({ target: composerCardRef.current, label: 'Mount Composer' });
            const tl = gsap.timeline({ paused: true });
            const { reset } = buildBlock(tl, {
              containerEl: container,
              targetEl: composerCardRef.current,
              agent,
              agentIndex: 4,
              totalAgents: 6,
              isMobile,
            });
            createTargetTrigger(composerCardRef.current, tl, reset, {
              rebuildOnReentry,
              staggerDelay: 0.12,
            });
          }
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

  return (
    <section 
      ref={containerRef}
      className="relative pt-8 pb-20 sm:pt-12 sm:pb-24 min-h-[600px] w-full" 
      id="contact"
    >
      {/* 1. GUIDELINES OVERLAY LAYER */}
      <GuideLines
        showRuler={!isMobile}
        rulerOffset={isMobile ? 12 : 28}
      />

      {/* 2. POOL-MANAGED AUTONOMOUS CURSOR & SELECTION BOX OVERLAYS */}
      <ChoreographerLayer agents={agents} />

      {/* 4. MAIN CONTENT DOM (Kept in layout; measured then revealed) */}
      <div className="flex flex-col gap-10 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="space-y-3 max-w-3xl min-h-[100px]">
          <div ref={headerBadgeRef} style={initialStyle} className="inline-flex items-center gap-2 text-xs font-mono text-kiwi">
            <MessageSquareCode size={14} />
            <span>Direct Coordinates &bull; Collaborative Inquiries</span>
          </div>

          <h2 
            ref={headerTitleRef}
            style={initialStyle}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight font-sans inline-block"
          >
            Initiate Collaboration &amp; Direct Inquiries
          </h2>

          <p 
            ref={headerDescRef}
            style={initialStyle}
            className="text-zinc-300 text-sm sm:text-base leading-relaxed"
          >
            Available for full-stack engineering roles, applied AI/RAG system architecture, security research, and direct technical consultations.
          </p>
        </div>

        {/* 2-COLUMN COLLABORATIVE CONTACT CANVAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (5 Cols): Direct Connection Badges */}
          <div ref={leftColRef} style={initialStyle} className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Email Connection Badge */}
            <div className="p-5 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex items-center justify-between gap-4 shadow-xl group">
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
                className="p-2 rounded-lg bg-black/80 border border-zinc-800 hover:border-kiwi text-zinc-400 hover:text-white transition-all shrink-0 cursor-pointer"
                title="Copy email to clipboard"
                aria-label="Copy email"
              >
                {copiedEmail ? <Check size={16} className="text-kiwi" /> : <Copy size={16} />}
              </button>
            </div>

            {/* GitHub Profile Badge */}
            <a
              href="https://github.com/Kishalll"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex items-center justify-between gap-4 shadow-xl group"
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
            </a>

            {/* LinkedIn Profile Badge */}
            <a
              href="https://www.linkedin.com/in/kishal-p-0a13842b9/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex items-center justify-between gap-4 shadow-xl group"
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
            </a>

            {/* Academic Affiliation */}
            <div className="p-5 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border hover:border-kiwi/50 transition-all duration-300 flex items-center gap-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center shrink-0 text-white">
                <GraduationCap size={18} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Academic Affiliation</span>
                <p className="text-sm font-semibold text-white">VIT Chennai &bull; B.Tech Computer Science</p>
                <span ref={academicYearRef} className="text-xs text-zinc-500 font-mono">3rd Year (Class of 2027)</span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-kiwi/30 flex items-center gap-2.5 text-xs font-mono text-kiwi">
              <span className="w-2 h-2 rounded-full bg-kiwi animate-ping shrink-0" />
              <span ref={statusPillRef}>Status: Available for Q2/Q3 2026 Internships</span>
            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): Collaborative Message Composer Card */}
          <div ref={composerCardRef} style={initialStyle} className="lg:col-span-7">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-kiwi-surface/85 border border-kiwi-border shadow-2xl overflow-hidden h-full flex flex-col justify-between gap-6">
              
              {/* CARD HEADER */}
              <div className="flex items-center justify-between pb-4 border-b border-kiwi-border/60">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-kiwi">Collaborative Dispatch</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Direct Message Composer</h3>
                </div>
                <span ref={verifiedBadgeRef} className="px-2 py-0.5 text-[10px] font-mono rounded bg-black/80 border border-zinc-800 text-zinc-400">
                  P-256 Verified
                </span>
              </div>

              {/* INPUT FORM FIELDS */}
              <form onSubmit={handleSendMessage} className="space-y-4 relative">
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

                {/* SEND DISPATCH BUTTON */}
                <div className="pt-2 flex items-center justify-between gap-4 relative">
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
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
