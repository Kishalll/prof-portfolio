import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Grid,
  RotateCcw,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';
import { gsap, waitForFontsAndLayout, getRelativeBounds, getRandomEdgePosition, addCurvedCursorTravel, addSelectionBoxBuild, addCursorIdleDrift } from '../../animation/motionUtils';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { SelectionBox, CursorAgent } from '../canvas/overlays';

interface CanvasHeaderProps {
  onToggleGrid?: () => void;
  isGridVisible?: boolean;
  onReplayBuild?: () => void;
  buildKey?: number;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  onToggleGrid,
  isGridVisible = true,
  onReplayBuild,
  buildKey = 0,
}) => {
  const { prefersReducedMotion, isMobile } = useChoreographer();

  const headerRef = useRef<HTMLElement>(null);
  const innerBarRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const initialStyle = prefersReducedMotion ? undefined : { opacity: 0, visibility: 'hidden' as const };

  // Hide header items before paint to prevent flashing
  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const ctx = gsap.context(() => {
      gsap.set(
        [brandRef.current, navRef.current, actionsRef.current].filter(Boolean),
        { autoAlpha: 0 }
      );
    }, headerEl);

    return () => ctx.revert();
  }, [buildKey, prefersReducedMotion]);

  useEffect(() => {
    const headerEl = headerRef.current;
    const innerBar = innerBarRef.current;
    if (!headerEl || !innerBar) return;

    let isCancelled = false;

    const ctx = gsap.context(() => {
      const runHeaderBuild = async () => {
        await waitForFontsAndLayout();
        if (isCancelled || !headerEl || !innerBar) return;

        const containerRect = headerEl.getBoundingClientRect();
        const containerW = containerRect.width || window.innerWidth;
        const containerH = containerRect.height || 64;

        if (prefersReducedMotion) {
          gsap.set([brandRef.current, navRef.current, actionsRef.current].filter(Boolean), { autoAlpha: 1 });
          if (boxRef.current) gsap.set(boxRef.current, { autoAlpha: 0 });
          if (cursorRef.current) gsap.set(cursorRef.current, { autoAlpha: 0 });
          return;
        }

        const bounds = getRelativeBounds(innerBar, headerEl);
        const start = getRandomEdgePosition(containerW, containerH);
        const targetPos = {
          x: bounds.x + Math.min(32, bounds.width * 0.1),
          y: bounds.y + bounds.height * 0.5,
        };

        if (cursorRef.current) {
          gsap.set(cursorRef.current, { x: start.x, y: start.y, autoAlpha: 1 });
        }

        ctx.add(() => {
          const tl = gsap.timeline();

          // 1. Cursor enters along curved path
          if (cursorRef.current) {
            addCurvedCursorTravel(tl, cursorRef.current, start, targetPos, {
              duration: 0.75,
              position: 0.05,
              ease: 'back.out(1.2)',
            });
          }

          // 2. Selection box resizes to header bar bounds via transforms
          if (boxRef.current) {
            addSelectionBoxBuild(tl, boxRef.current, bounds, targetPos, {
              delay: 0.22,
              duration: 0.55,
              fadeDelay: 0.95,
              ease: 'expo.out',
            });
          }

          // 3. Brand reveals
          if (brandRef.current) {
            tl.fromTo(
              brandRef.current,
              { autoAlpha: 0, x: -8 },
              { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power2.out' },
              0.45
            );
          }

          // 4. Nav items reveal sequentially with stagger (Item 20 & 27)
          if (navRef.current && navRef.current.children.length > 0) {
            const links = Array.from(navRef.current.children) as HTMLElement[];
            tl.fromTo(
              links,
              { autoAlpha: 0, y: -4 },
              { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' },
              0.55
            );
          }

          // 5. Actions reveal
          if (actionsRef.current) {
            tl.fromTo(
              actionsRef.current,
              { autoAlpha: 0, x: 8 },
              { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out' },
              0.65
            );
          }

          // 6. Cursor idles & drifts to edge
          if (cursorRef.current) {
            addCursorIdleDrift(
              tl,
              cursorRef.current,
              1, // right edge
              2,
              containerW,
              containerH,
              1.0
            );
          }
        });
      };

      runHeaderBuild();
    }, headerEl);

    return () => {
      isCancelled = true;
      ctx.revert();
    };
  }, [buildKey, prefersReducedMotion, isMobile]);

  return (
    <header 
      ref={headerRef} 
      className="sticky top-0 z-40 backdrop-blur-md bg-black/85 border-b border-kiwi-border px-6 py-3.5 relative overflow-hidden"
    >
      {/* Selection Box & Cursor for Header Intro */}
      <SelectionBox ref={boxRef} label="Canvas Header" />
      <CursorAgent
        ref={cursorRef}
        persona={{ id: 'ui', name: 'UI_Design', role: 'Header', color: '#CCFF00' }}
        actionLabel="Nav Layout"
      />

      <div ref={innerBarRef} className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
        {/* Left: Brand Identity */}
        <div ref={brandRef} style={initialStyle} className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-kiwi shadow-kiwi-glow-sm" />
          <span className="text-sm font-semibold tracking-tight text-white">Kishal P</span>
          <span className="text-zinc-600 font-mono text-xs">/</span>
          <span className="text-xs font-mono text-zinc-400">Full-Stack &amp; Systems</span>
        </div>

        {/* Center: Clean Navigation */}
        <nav ref={navRef} style={initialStyle} className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <a href="#hero" className="hover:text-kiwi transition-colors">Overview</a>
          <a href="#about" className="hover:text-kiwi transition-colors">About</a>
          <a href="#projects" className="hover:text-kiwi transition-colors">Projects</a>
          <a href="#skills" className="hover:text-kiwi transition-colors">Skills</a>
          <a href="#contact" className="hover:text-kiwi transition-colors">Contact</a>
        </nav>

        {/* Right: Actions */}
        <div ref={actionsRef} style={initialStyle} className="flex items-center gap-3">
          {onReplayBuild && (
            <button
              onClick={onReplayBuild}
              className="p-1.5 rounded-md border bg-black border-kiwi-border text-zinc-400 hover:text-kiwi hover:border-kiwi/40 transition-colors cursor-pointer"
              title="Replay Collaborative Assembly"
              aria-label="Replay Build"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                isGridVisible 
                  ? 'bg-kiwi-surface border-kiwi/40 text-kiwi' 
                  : 'bg-black border-kiwi-border text-zinc-400 hover:text-white'
              }`}
              title="Toggle Grid View"
              aria-label="Toggle Grid"
            >
              <Grid size={15} />
            </button>
          )}

          <a
            href="https://github.com/Kishalll"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-kiwi-surface rounded-md transition-colors"
            aria-label="GitHub Profile"
          >
            <Github size={16} />
          </a>
          <a
            href="https://www.linkedin.com/in/kishal-p-0a13842b9/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-kiwi-surface rounded-md transition-colors"
            aria-label="LinkedIn Profile"
          >
            <Linkedin size={16} />
          </a>
          <a
            href="mailto:kishal2007@gmail.com"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-kiwi rounded-md hover:bg-kiwi/90 transition-colors shadow-kiwi-glow-sm"
          >
            <Mail size={13} />
            <span>Contact</span>
          </a>
        </div>
      </div>
    </header>
  );
};
