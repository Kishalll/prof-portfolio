import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ChoreographerAgent } from './CursorChoreographer';
import { 
  getRelativeBounds, 
  getVisibleViewportSpawn, 
  addCurvedCursorTravel, 
  addSelectionBoxBuild, 
  addCursorIdleDrift 
} from './motionUtils';

/**
 * Creates ScrollTrigger hooks for a single leaf target:
 * - Entry trigger: start 'top 90%', end 'bottom top', calls tl.restart() on enter & enterBack
 * - Reset trigger: start 'top bottom', end 'bottom top', onLeave & onLeaveBack kill tl and reset target
 */
export function createTargetTrigger(
  targetEl: HTMLElement,
  buildTl: gsap.core.Timeline,
  onReset: () => void,
  options: {
    rebuildOnReentry?: boolean;
    staggerDelay?: number;
  } = {}
): () => void {
  const rebuildOnReentry = options.rebuildOnReentry ?? true;
  const staggerDelay = options.staggerDelay ?? 0;

  const entryTrigger = ScrollTrigger.create({
    trigger: targetEl,
    start: 'top 90%',
    end: 'bottom top',
    onEnter: () => {
      if (staggerDelay > 0) {
        gsap.delayedCall(staggerDelay, () => buildTl.restart());
      } else {
        buildTl.restart();
      }
    },
    onEnterBack: () => {
      if (rebuildOnReentry) {
        if (staggerDelay > 0) {
          gsap.delayedCall(staggerDelay, () => buildTl.restart());
        } else {
          buildTl.restart();
        }
      }
    },
  });

  let resetTrigger: ScrollTrigger | null = null;
  if (rebuildOnReentry) {
    resetTrigger = ScrollTrigger.create({
      trigger: targetEl,
      start: 'top bottom',
      end: 'bottom top',
      onLeave: () => {
        buildTl.pause(0);
        onReset();
      },
      onLeaveBack: () => {
        buildTl.pause(0);
        onReset();
      },
    });
  }

  return () => {
    entryTrigger.kill();
    resetTrigger?.kill();
  };
}

/**
 * Creates short-lived horizontal and vertical guide lines tied to real target edges.
 * Horizontal lines span full viewport width using left: calc(50% - 50vw), 100vw.
 * Placed directly inside the section container so Lenis scrolling cannot desync them.
 */
export function createTargetGuideLines(
  tl: gsap.core.Timeline,
  containerEl: HTMLElement,
  bounds: { x: number; y: number; width: number; height: number },
  options: { delay?: number; isMobile?: boolean } = {}
): () => void {
  if (options.isMobile || typeof document === 'undefined') return () => {};

  const delay = options.delay ?? 0.1;
  const lines: HTMLElement[] = [];

  // Horizontal guide line spanning full viewport width
  const hLine = document.createElement('div');
  hLine.className = 'absolute pointer-events-none select-none z-20 h-[1px] bg-[#0D99FF]';
  hLine.style.left = 'calc(50% - 50vw)';
  hLine.style.width = '100vw';
  gsap.set(hLine, {
    y: bounds.y,
    scaleX: 0,
    transformOrigin: 'left center',
    autoAlpha: 0.75,
  });
  containerEl.appendChild(hLine);
  lines.push(hLine);

  tl.to(hLine, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, delay);
  tl.to(hLine, { autoAlpha: 0, duration: 0.25, ease: 'power1.out' }, delay + 0.4);

  // Vertical guide line along element left edge
  const vLine = document.createElement('div');
  vLine.className = 'absolute top-0 bottom-0 pointer-events-none select-none z-20 w-[1px] bg-[#0D99FF]';
  gsap.set(vLine, {
    x: bounds.x,
    scaleY: 0,
    transformOrigin: 'top center',
    autoAlpha: 0.75,
  });
  containerEl.appendChild(vLine);
  lines.push(vLine);

  tl.to(vLine, { scaleY: 1, duration: 0.35, ease: 'power2.out' }, delay);
  tl.to(vLine, { autoAlpha: 0, duration: 0.25, ease: 'power1.out' }, delay + 0.4);

  const cleanup = () => {
    lines.forEach((l) => {
      if (l.parentNode) l.parentNode.removeChild(l);
    });
  };

  tl.eventCallback('onComplete', cleanup);
  return cleanup;
}

export interface BuildTextOptions {
  containerEl: HTMLElement;
  targetEl: HTMLElement;
  agent: ChoreographerAgent;
  agentIndex: number;
  totalAgents: number;
  isHeadline?: boolean;
  isParagraph?: boolean;
  isMobile?: boolean;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Text builder:
 * - Cursor (I-beam) arrives at element top-left
 * - 1px blue box appears at ~28x16
 * - Text typed char-by-char with blinking caret after last revealed char (no fade/blur)
 * - Box hugs text revealed so far; dimension label updates live via DOM text
 * - Headline only: box & text start at 0.35 scale and grow to 1 with expo.out
 * - Caret fades, box holds 0.3s, fades, cursor leaves
 * - Reverts SplitText after completion and on reset
 */
export function buildText(
  tl: gsap.core.Timeline,
  options: BuildTextOptions
): { reset: () => void } {
  const {
    containerEl,
    targetEl,
    agent,
    agentIndex,
    totalAgents,
    isHeadline = false,
    isParagraph = false,
    isMobile = false,
    delay = 0,
    onComplete,
  } = options;

  const cursorEl = agent.cursorRef.current;
  const boxEl = agent.boxRef.current;
  const cRect = containerEl.getBoundingClientRect();
  const containerW = cRect.width || window.innerWidth;
  const containerH = cRect.height || 600;

  let split: SplitText | null = null;
  let caretEl: HTMLElement | null = null;
  let blinkTween: gsap.core.Tween | null = null;

  const reset = () => {
    if (blinkTween) {
      blinkTween.kill();
      blinkTween = null;
    }
    if (caretEl && caretEl.parentNode) {
      caretEl.parentNode.removeChild(caretEl);
      caretEl = null;
    }
    if (split) {
      try {
        split.revert();
      } catch {
        // Fallback
      }
      split = null;
    }
    if (boxEl) {
      gsap.set(boxEl, { autoAlpha: 0, scale: 1 });
    }
    if (cursorEl) {
      gsap.set(cursorEl, { autoAlpha: 0, rotation: 0 });
    }
    gsap.set(targetEl, { autoAlpha: 0, scale: 1 });
    targetEl.style.visibility = 'hidden';
    targetEl.style.opacity = '0';
  };

  if (!cursorEl || !boxEl) {
    gsap.set(targetEl, { autoAlpha: 1 });
    return { reset };
  }

  // Pre-reveal container for measurement while keeping content invisible
  targetEl.style.visibility = 'visible';
  targetEl.style.opacity = '1';

  split = new SplitText(targetEl, {
    type: 'chars,lines',
    linesClass: 'split-line',
    charsClass: 'split-char',
  });

  gsap.set(split.chars, { autoAlpha: 0 });
  gsap.set(targetEl, { autoAlpha: 1 });

  const bounds = getRelativeBounds(targetEl, containerEl);
  const startPos = getVisibleViewportSpawn(containerEl);
  const cursorArrival = { x: bounds.x, y: bounds.y };

  // Setup Caret element
  caretEl = document.createElement('div');
  caretEl.className = 'absolute pointer-events-none select-none z-30 w-[2px] bg-[#0D99FF]';
  const charH = Math.min(32, Math.max(14, bounds.height / Math.max(1, split.lines.length)));
  caretEl.style.height = `${charH}px`;
  caretEl.style.visibility = 'hidden';
  containerEl.appendChild(caretEl);

  blinkTween = gsap.to(caretEl, {
    autoAlpha: 0,
    repeat: -1,
    yoyo: true,
    duration: 0.35,
    ease: 'steps(1)',
  });

  // 1. Cursor travels to top-left of element along curved path
  addCurvedCursorTravel(tl, cursorEl, startPos, cursorArrival, {
    duration: 0.95,
    position: delay,
    ease: 'back.out(1.2)',
  });

  const typingStart = delay + 0.65;

  // 2. Selection box appears at 28x16
  tl.set(
    boxEl,
    {
      x: cursorArrival.x,
      y: cursorArrival.y,
      width: 28,
      height: 16,
      scaleX: 1,
      scaleY: 1,
      autoAlpha: 1,
    },
    typingStart
  );

  const dimTextEl = boxEl.querySelector('.dimension-text');
  if (dimTextEl) dimTextEl.textContent = '28 \u00D7 16';

  // 3. Headline only: scale up from 0.35 to 1 with expo.out (skip on mobile)
  if (isHeadline && !isMobile) {
    tl.set([targetEl, boxEl], { scale: 0.35, transformOrigin: 'top left' }, typingStart);
  }

  // 4. Stagger type characters
  const charSpeed = isHeadline
    ? 0.03
    : isParagraph
    ? Math.max(0.008, Math.min(0.013, 1.1 / Math.max(1, split.chars.length)))
    : 0.018;

  const activeSplit = split;
  const activeCaret = caretEl;

  tl.to(
    split.chars,
    {
      autoAlpha: 1,
      stagger: charSpeed,
      duration: 0.001,
      ease: 'none',
      onUpdate: () => {
        if (!activeSplit || !activeCaret) return;
        const revealed = activeSplit.chars.filter(
          (c) => Number(gsap.getProperty(c, 'autoAlpha')) > 0.5
        );
        if (revealed.length === 0) return;

        const currentCRect = containerEl.getBoundingClientRect();
        const lastChar = revealed[revealed.length - 1];
        const lastRect = lastChar.getBoundingClientRect();

        // Update Caret position directly after last revealed character
        const caretX = lastRect.right - currentCRect.left + 1;
        const caretY = lastRect.top - currentCRect.top;
        gsap.set(activeCaret, {
          x: caretX,
          y: caretY,
          height: lastRect.height,
          autoAlpha: 1,
        });

        // Update hugging selection box dimensions
        let maxR = bounds.x + 28;
        let maxB = bounds.y + 16;
        for (let i = 0; i < revealed.length; i++) {
          const r = revealed[i].getBoundingClientRect();
          const rRel = r.right - currentCRect.left;
          const bRel = r.bottom - currentCRect.top;
          if (rRel > maxR) maxR = rRel;
          if (bRel > maxB) maxB = bRel;
        }

        const curW = Math.max(28, maxR - bounds.x + 8);
        const curH = Math.max(16, maxB - bounds.y + 4);
        boxEl.style.width = `${curW}px`;
        boxEl.style.height = `${curH}px`;
        if (dimTextEl) {
          dimTextEl.textContent = `${Math.round(curW)} \u00D7 ${Math.round(curH)}`;
        }
      },
    },
    typingStart
  );

  // Animate headline scale to 1 towards completion
  if (isHeadline && !isMobile) {
    tl.to(
      [targetEl, boxEl],
      {
        scale: 1,
        duration: 0.5,
        ease: 'expo.out',
      },
      `-=${Math.min(0.5, split.chars.length * charSpeed * 0.5)}`
    );
  }

  // 5. Finish sequence: Caret fades, box holds 0.3s then fades, cursor idles
  tl.to(
    caretEl,
    {
      autoAlpha: 0,
      duration: 0.15,
      onComplete: () => {
        if (blinkTween) blinkTween.kill();
        if (activeCaret && activeCaret.parentNode) {
          activeCaret.parentNode.removeChild(activeCaret);
        }
      },
    },
    '+=0.05'
  );

  tl.to({}, { duration: 0.3 }); // hold box 0.3s

  tl.to(boxEl, {
    autoAlpha: 0,
    duration: 0.35,
    ease: 'power2.inOut',
  });

  // Cursor parks in 24px margin with slow yoyo drift
  addCursorIdleDrift(tl, cursorEl, agentIndex, totalAgents, containerW, containerH, '-=0.2');

  tl.eventCallback('onComplete', () => {
    if (activeSplit) {
      activeSplit.revert();
    }
    onComplete?.();
  });

  return { reset };
}

export interface BuildBlockOptions {
  containerEl: HTMLElement;
  targetEl: HTMLElement;
  agent: ChoreographerAgent;
  agentIndex: number;
  totalAgents: number;
  isMobile?: boolean;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Non-text block builder (buttons, badges, cards, graphics):
 * - Cursor arrives along curved path
 * - Box grows from cursor point to element bounds via transforms
 * - Element reveals with autoAlpha & subtle y
 * - Box fades out
 * - Cursor parks in 24px edge margin with yoyo drift
 */
export function buildBlock(
  tl: gsap.core.Timeline,
  options: BuildBlockOptions
): { reset: () => void } {
  const {
    containerEl,
    targetEl,
    agent,
    agentIndex,
    totalAgents,
    isMobile = false,
    delay = 0,
    onComplete,
  } = options;

  const cursorEl = agent.cursorRef.current;
  const boxEl = agent.boxRef.current;
  const cRect = containerEl.getBoundingClientRect();
  const containerW = cRect.width || window.innerWidth;
  const containerH = cRect.height || 600;

  const reset = () => {
    if (boxEl) gsap.set(boxEl, { autoAlpha: 0, scale: 1 });
    if (cursorEl) gsap.set(cursorEl, { autoAlpha: 0, rotation: 0 });
    gsap.set(targetEl, { autoAlpha: 0, y: 8 });
    targetEl.style.visibility = 'hidden';
    targetEl.style.opacity = '0';
  };

  if (!cursorEl || !boxEl) {
    gsap.set(targetEl, { autoAlpha: 1, y: 0 });
    return { reset };
  }

  // Pre-reveal container to calculate bounds accurately
  targetEl.style.visibility = 'visible';
  targetEl.style.opacity = '1';

  const bounds = getRelativeBounds(targetEl, containerEl);
  const startPos = getVisibleViewportSpawn(containerEl);
  const targetPos = {
    x: bounds.x + Math.min(24, bounds.width * 0.15),
    y: bounds.y + Math.min(20, bounds.height * 0.25),
  };

  // Re-hide target before animation begins
  gsap.set(targetEl, { autoAlpha: 0, y: 8 });

  // 1. Cursor travels along curved path
  addCurvedCursorTravel(tl, cursorEl, startPos, targetPos, {
    duration: 0.9,
    position: delay,
    ease: 'back.out(1.2)',
  });

  // 2. Selection box resizes to bounds via transforms
  addSelectionBoxBuild(tl, boxEl, bounds, targetPos, {
    delay: delay + 0.3,
    duration: 0.55,
    fadeDelay: delay + 1.0,
    ease: 'expo.out',
  });

  // 3. Guide lines appear on target edges
  if (!isMobile) {
    createTargetGuideLines(tl, containerEl, bounds, {
      delay: delay + 0.35,
      isMobile,
    });
  }

  // 4. Element reveals with autoAlpha & y
  tl.fromTo(
    targetEl,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
    delay + 0.6
  );

  // 5. Cursor drifts to deterministic idle spot
  addCursorIdleDrift(tl, cursorEl, agentIndex, totalAgents, containerW, containerH, delay + 1.1);

  tl.eventCallback('onComplete', () => {
    onComplete?.();
  });

  return { reset };
}

export interface BuildNavOptions {
  containerEl: HTMLElement;
  navLinks: HTMLElement[];
  agent: ChoreographerAgent;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Nav builder:
 * - Cursor visits each nav link sequentially from left to right with short stagger
 * - Small selection box hugs each link as it reveals
 * - All links remain fully clickable once built
 */
export function buildNav(
  tl: gsap.core.Timeline,
  options: BuildNavOptions
): { reset: () => void } {
  const { containerEl, navLinks, agent, delay = 0, onComplete } = options;

  const cursorEl = agent.cursorRef.current;
  const boxEl = agent.boxRef.current;
  const cRect = containerEl.getBoundingClientRect();
  const containerW = cRect.width || window.innerWidth;
  const containerH = cRect.height || 64;

  const reset = () => {
    if (boxEl) gsap.set(boxEl, { autoAlpha: 0, scale: 1 });
    if (cursorEl) gsap.set(cursorEl, { autoAlpha: 0 });
    navLinks.forEach((link) => {
      gsap.set(link, { autoAlpha: 0, y: -4 });
      link.style.visibility = 'hidden';
      link.style.opacity = '0';
    });
  };

  if (!cursorEl || !boxEl || navLinks.length === 0) {
    navLinks.forEach((link) => gsap.set(link, { autoAlpha: 1, y: 0 }));
    return { reset };
  }

  // Pre-reveal links for measurement
  navLinks.forEach((link) => {
    link.style.visibility = 'visible';
    link.style.opacity = '1';
  });

  const linkBounds = navLinks.map((l) => getRelativeBounds(l, containerEl));
  navLinks.forEach((link) => gsap.set(link, { autoAlpha: 0, y: -4 }));

  let prevPos = getVisibleViewportSpawn(containerEl);

  navLinks.forEach((link, idx) => {
    const bounds = linkBounds[idx];
    const targetPos = { x: bounds.x, y: bounds.y + bounds.height * 0.5 };
    const stepDelay = delay + idx * 0.28;

    // Move cursor to link
    addCurvedCursorTravel(tl, cursorEl, prevPos, targetPos, {
      duration: 0.45,
      position: stepDelay,
      ease: 'power2.out',
    });

    // Small selection box around link
    tl.set(
      boxEl,
      {
        x: bounds.x - 4,
        y: bounds.y - 2,
        width: bounds.width + 8,
        height: bounds.height + 4,
        scaleX: 1,
        scaleY: 1,
        autoAlpha: 1,
      },
      stepDelay + 0.2
    );

    // Reveal link
    tl.fromTo(
      link,
      { autoAlpha: 0, y: -4 },
      { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' },
      stepDelay + 0.25
    );

    // Fade box
    tl.to(boxEl, { autoAlpha: 0, duration: 0.2 }, stepDelay + 0.45);

    prevPos = targetPos;
  });

  // Cursor idles to right edge after visiting all links
  addCursorIdleDrift(tl, cursorEl, 1, 2, containerW, containerH, delay + navLinks.length * 0.28 + 0.4);

  tl.eventCallback('onComplete', () => {
    onComplete?.();
  });

  return { reset };
}

