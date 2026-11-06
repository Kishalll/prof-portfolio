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
import { gsap, ScrollTrigger, waitForFontsAndLayout, getRelativeBounds, getRandomEdgePosition, addCurvedCursorTravel, addSelectionBoxBuild, createFixedGuideLinesOverlay, addCursorIdleDrift, headingReveal } from '../../animation/motionUtils';
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

        const containerRect = container.getBoundingClientRect();
        const containerW = containerRect.width || window.innerWidth;
        const containerH = containerRect.height || 600;

        const allContentElements = [
          headerBadgeRef.current,
          headerTitleRef.current,
          headerDescRef.current,
          leftColRef.current,
          composerCardRef.current,
        ].filter(Boolean) as HTMLElement[];

        const allBoxes = agents.map((a) => a.boxRef.current).filter(Boolean) as HTMLElement[];
        const allCursors = agents.map((a) => a.cursorRef.current).filter(Boolean) as HTMLElement[];

        if (prefersReducedMotion) {
          gsap.set(allContentElements, { autoAlpha: 1, y: 0, filter: 'none', clipPath: 'none' });
          gsap.set(allBoxes, { autoAlpha: 0 });
          gsap.set(allCursors, { autoAlpha: 0 });
          return;
        }

        // Hide content initially in layout
        gsap.set(allContentElements, { autoAlpha: 0 });
        gsap.set(allBoxes, { autoAlpha: 0 });

        const targets = [
          { key: 'header', el: headerTitleRef.current, label: 'Select Contact', delay: 0.0, isHeadline: true },
          { key: 'leftCol', el: leftColRef.current, label: 'Direct Channels', delay: 0.18, isHeadline: false },
          { key: 'composer', el: composerCardRef.current, label: 'Message Board', delay: 0.32, isHeadline: false },
        ];

        const measured = targets.map((t) => {
          if (!t.el) return null;
          const bounds = getRelativeBounds(t.el, container);
          const start = getRandomEdgePosition(containerW, containerH);
          const agent = assign({ target: t.el, label: t.label, isHeadline: t.isHeadline });
          return {
            ...t,
            bounds,
            start,
            agent,
            box: agent.boxRef.current,
            cursor: agent.cursorRef.current,
          };
        }).filter(Boolean) as (typeof targets[0] & {
          bounds: { x: number; y: number; width: number; height: number };
          start: { x: number; y: number };
          box: HTMLDivElement | null;
          cursor: HTMLDivElement | null;
        })[];

        // Position cursors at initial off-screen edges
        measured.forEach((t) => {
          if (t.cursor) {
            gsap.set(t.cursor, { x: t.start.x, y: t.start.y, autoAlpha: 1 });
          }
        });

        // Master ScrollTrigger Timeline
        ctx.add(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
              once: !rebuildOnReentry,
            },
          });

        // Fixed viewport guide lines overlay (2-4 H & V lines spanning viewport + red ruler)
        const cleanupGuideLines = createFixedGuideLinesOverlay(
          tl,
          [headerTitleRef.current, leftColRef.current, composerCardRef.current].filter(Boolean) as HTMLElement[],
          {
            showRuler: !isMobile,
            rulerOffset: isMobile ? 12 : 28,
            delay: 0.05,
          }
        );

        // Header badge & desc
        if (headerBadgeRef.current) {
          tl.fromTo(headerBadgeRef.current, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.0);
        }
        if (headerDescRef.current) {
          tl.fromTo(headerDescRef.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.2);
        }

        // Stat Scramble: Verified tag, status, academic year
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
            0.3
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
            0.35
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
            0.4
          );
        }

        // Concurrently build targets
        measured.forEach((t, i) => {
          const { el, box, cursor, bounds, delay, isHeadline } = t;
          const targetPos = {
            x: bounds.x + Math.min(16, bounds.width * 0.1),
            y: bounds.y + Math.min(16, bounds.height * 0.2),
          };

          // 1. Cursor enters along curved path with overshoot and banking
          if (cursor) {
            addCurvedCursorTravel(tl, cursor, t.start, targetPos, {
              duration: 0.75,
              position: delay,
              ease: 'back.out(1.2)',
            });
          }

          // 2. Selection Box expands with 8 handles via transforms
          if (box) {
            addSelectionBoxBuild(tl, box, bounds, targetPos, {
              delay: delay + 0.2,
              duration: 0.52,
              fadeDelay: delay + 0.8,
              ease: 'expo.out',
            });
          }

          // 3. Target reveals inside box
          if (el) {
            if (isHeadline) {
              headingReveal(tl, el, {
                duration: 0.7,
                position: delay + 0.35,
              });
            } else {
              tl.fromTo(
                el,
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
                delay + 0.35
              );
            }
          }

          // 4. Cursor idles & drifts to edge
          if (cursor) {
            addCursorIdleDrift(
              tl,
              cursor,
              i,
              measured.length,
              containerW,
              containerH,
              delay + 1.0
            );
          }
        });

        return () => {
          cleanupGuideLines?.();
        };
      });

      // Ensure ScrollTrigger updates trigger metrics after DOM calculations
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
