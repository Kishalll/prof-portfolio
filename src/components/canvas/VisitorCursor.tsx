import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * The visitor's own cursor.
 *
 * On mouse devices the native pointer is hidden (see index.css) and this neon arrow takes its
 * place, so there is only ever one cursor. It glides after the mouse with a light spring, grows
 * over links/buttons, presses in on click, and steps aside over text fields (where the native
 * I-beam is shown). Touch devices keep their normal behaviour and never see it.
 */
const FIELD_SELECTOR = 'input, textarea, select, [contenteditable="true"]';
const CLICKABLE_SELECTOR = 'a, button, [role="button"], summary, label';

export const VisitorCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isOverField, setIsOverField] = useState(false);
  const visibleRef = useRef(false);

  const mouseX = useSpring(0, { damping: 30, stiffness: 400 });
  const mouseY = useSpring(0, { damping: 30, stiffness: 400 });

  useEffect(() => {
    // Only for real mouse / trackpad pointers
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let firstMove = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (firstMove) {
        // Start at the pointer instead of springing in from the corner
        mouseX.jump(e.clientX);
        mouseY.jump(e.clientY);
        firstMove = false;
      } else {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      const target = e.target as Element | null;
      if (target && target.closest) {
        setIsOverField(target.closest(FIELD_SELECTOR) !== null);
        setIsHovered(target.closest(CLICKABLE_SELECTOR) !== null);
      }
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };
    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 select-none"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: '-2px',
        translateY: '-2px',
        opacity: isOverField ? 0 : 1,
      }}
      aria-hidden="true"
    >
      <svg
        className={`w-5 h-5 origin-top-left transition-transform duration-150 drop-shadow-[0_2px_10px_rgba(204,255,0,0.6)] ${
          isPressed ? 'scale-90' : isHovered ? 'scale-125' : 'scale-100'
        }`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 1L21 13.5L13.5 15L9.5 23L6.5 21.5L10.5 14L3 1Z"
          fill="#CCFF00"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
};
