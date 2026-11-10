import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { gsap, waitForFontsAndLayout, getRelativeBounds, addCurvedCursorTravel, addSelectionBoxBuild, addSwarmReturn } from '../../animation/motionUtils';
import { swarm } from '../../animation/swarm';
import { useChoreographer } from '../../animation/ChoreographerContext';
import { SelectionBox, CursorAgent } from '../canvas/overlays';

interface CanvasHeaderProps {
  buildKey?: number;
}

const NAV_ITEMS = [
  { id: 'hero', label: 'Overview' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const;

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({ buildKey = 0 }) => {
  const { prefersReducedMotion, isMobile } = useChoreographer();

  const headerRef = useRef<HTMLElement>(null);
  const innerBarRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: which section the visitor is currently in (highlighted in the nav)
  const [activeId, setActiveId] = useState<string>('hero');
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = (headerRef.current?.getBoundingClientRect().height ?? 72) + window.innerHeight * 0.25;
      let current: string = NAV_ITEMS[0].id;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      // At the very bottom of the page the last section is always the active one
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = NAV_ITEMS[NAV_ITEMS.length - 1].id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const initialStyle = prefersReducedMotion ? undefined : { opacity: 0, visibility: 'hidden' as const };

  // Hide header items before paint to prevent flashing
  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const ctx = gsap.context(() => {
      gsap.set(
        [brandRef.current, actionsRef.current].filter(Boolean),
        { autoAlpha: 0 }
      );
      if (navRef.current) {
        gsap.set(Array.from(navRef.current.children), { autoAlpha: 0 });
      }
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

        if (prefersReducedMotion) {
          gsap.set([brandRef.current, navRef.current, actionsRef.current].filter(Boolean), { autoAlpha: 1 });
          if (boxRef.current) gsap.set(boxRef.current, { autoAlpha: 0 });
          if (cursorRef.current) gsap.set(cursorRef.current, { autoAlpha: 0 });
          return;
        }

        const bounds = getRelativeBounds(innerBar, headerEl);
        const targetPos = {
          x: bounds.x + Math.min(32, bounds.width * 0.1),
          y: bounds.y + bounds.height * 0.5,
        };

        ctx.add(() => {
          const tl = gsap.timeline();

          // 1. A swarm agent leaves the flock and flies in along a curved path
          if (cursorRef.current) {
            addCurvedCursorTravel(tl, cursorRef.current, targetPos, targetPos, {
              duration: 0.75,
              position: 0.05,
              ease: 'back.out(1.2)',
              depart: { owner: tl, containerEl: headerEl, index: 1 },
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
          if (navRef.current) {
            tl.set(navRef.current, { autoAlpha: 1, visibility: 'visible' }, 0.5);
            if (navRef.current.children.length > 0) {
              const links = Array.from(navRef.current.children) as HTMLElement[];
              tl.fromTo(
                links,
                { autoAlpha: 0, y: -4 },
                { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' },
                0.55
              );
            }
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

          // 6. Cursor rejoins the swarm around the visitor's mouse
          if (cursorRef.current) {
            addSwarmReturn(tl, tl, 1.0);
          }

          tl.eventCallback('onComplete', () => {
            swarm.handBack(tl);
            gsap.set([brandRef.current, navRef.current, actionsRef.current].filter(Boolean), {
              autoAlpha: 1,
              visibility: 'visible',
            });
            if (navRef.current) {
              gsap.set(Array.from(navRef.current.children), { autoAlpha: 1, visibility: 'visible' });
            }
          });
        });
      };

      runHeaderBuild();
    }, headerEl);

    return () => {
      isCancelled = true;
      swarm.handBackByCursorEls([cursorRef.current]);
      ctx.revert();
    };
  }, [buildKey, prefersReducedMotion, isMobile]);

  return (
    <header 
      ref={headerRef} 
      className="sticky top-0 z-40 backdrop-blur-md bg-black/85 border-b border-kiwi-border px-6 py-5 relative"
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
        <div ref={brandRef} style={initialStyle} className="flex items-center gap-3.5">
          <span className="w-2.5 h-2.5 rounded-full bg-kiwi shadow-kiwi-glow-sm" />
          <span className="text-lg font-semibold tracking-tight text-white">Kishal P</span>
          <span className="text-zinc-600 font-mono text-sm">/</span>
          <span className="text-sm font-mono text-zinc-400">Systems &amp; Applied AI</span>
        </div>

        {/* Center: Clean Navigation */}
        <nav ref={navRef} className="hidden md:flex items-center gap-9 text-sm font-medium text-zinc-400">
          {NAV_ITEMS.map((item) => {
            const active = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                className={`relative py-1 transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:rounded-full after:bg-kiwi after:origin-left after:transition-transform after:duration-300 ${
                  active
                    ? 'text-kiwi after:scale-x-100 [text-shadow:0_0_14px_rgba(204,255,0,0.45)]'
                    : 'hover:text-white after:scale-x-0'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div ref={actionsRef} style={initialStyle} className="flex items-center gap-3.5">
          <a
            href="https://github.com/Kishalll"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-white hover:bg-kiwi-surface rounded-md transition-colors"
            aria-label="GitHub Profile"
          >
            <Github size={19} />
          </a>
          <a
            href="https://www.linkedin.com/in/kishal-p-0a13842b9/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-white hover:bg-kiwi-surface rounded-md transition-colors"
            aria-label="LinkedIn Profile"
          >
            <Linkedin size={19} />
          </a>
          <a
            href="mailto:kishal2007@gmail.com"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-black bg-kiwi rounded-md hover:bg-kiwi/90 transition-colors shadow-kiwi-glow-sm"
          >
            <Mail size={15} />
            <span>Contact</span>
          </a>
        </div>
      </div>
    </header>
  );
};
