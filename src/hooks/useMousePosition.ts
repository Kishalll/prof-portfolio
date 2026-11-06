import { useState, useEffect } from 'react';

export function useMousePosition() {
  const [mousePos, setMousePos] = useState<{
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    hasMoved: boolean;
  }>({
    clientX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    clientY: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
    pageX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    pageY: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
    hasMoved: true,
  });

  useEffect(() => {
    const handleMove = (e: MouseEvent | PointerEvent) => {
      setMousePos({
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        hasMoved: true,
      });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('pointermove', handleMove);
    };
  }, []);

  return mousePos;
}
