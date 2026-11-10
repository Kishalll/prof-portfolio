import { useEffect, useState } from 'react';

/**
 * Scroll-spy: returns the id of the section the visitor is currently in.
 * A section becomes active once its top passes a line just below the fixed header (plus a quarter
 * of the viewport); at the very bottom of the page the last section always wins.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0]);
  const key = ids.join('|');

  useEffect(() => {
    const list = key.split('|');
    let raf = 0;

    const update = () => {
      raf = 0;
      const header = document.querySelector('header');
      const line = (header ? header.getBoundingClientRect().height : 64) + window.innerHeight * 0.25;
      let current = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = list[list.length - 1];
      }
      setActive(current);
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
  }, [key]);

  return active;
}
