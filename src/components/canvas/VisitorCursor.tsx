import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const VisitorCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useSpring(0, { damping: 30, stiffness: 400 });
  const mouseY = useSpring(0, { damping: 30, stiffness: 400 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = 
          target.tagName === 'A' || 
          target.tagName === 'BUTTON' || 
          target.closest('a') !== null || 
          target.closest('button') !== null ||
          target.getAttribute('role') === 'button';
        setIsHovered(isClickable);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 flex flex-col items-start select-none"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: '-2px',
        translateY: '-2px',
      }}
    >
      {/* Precision Arrow Pointer */}
      <svg
        className={`w-4 h-4 transition-transform duration-150 drop-shadow-[0_2px_10px_rgba(204,255,0,0.6)] ${
          isHovered ? 'scale-125' : 'scale-100'
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

      {/* Collaborator Badge Pill */}
      <div className="flex items-center gap-1.5 ml-2 mt-0.5">
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded shadow-xl bg-black/95 text-kiwi border border-kiwi/40">
          You [Collaborator]
        </span>
      </div>
    </motion.div>
  );
};
