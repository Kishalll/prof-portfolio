import React, { useEffect, useState } from 'react';
import { Home, User, FolderGit2, Cpu, Mail } from 'lucide-react';
import { useActiveSection } from '../../hooks/useActiveSection';

const TABS = [
  { id: 'hero', label: 'Overview', Icon: Home },
  { id: 'about', label: 'About', Icon: User },
  { id: 'projects', label: 'Projects', Icon: FolderGit2 },
  { id: 'skills', label: 'Skills', Icon: Cpu },
  { id: 'contact', label: 'Contact', Icon: Mail },
] as const;

const TAB_IDS = TABS.map((t) => t.id);

/**
 * Phone navigation: a fixed bar at the bottom of the screen (hidden from tablet width up, where the
 * top bar has the links). The current section is highlighted in neon. It steps out of the way while
 * a form field is focused so the on-screen keyboard never leaves it floating over the input.
 */
export const BottomTabBar: React.FC = () => {
  const active = useActiveSection(TAB_IDS);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const isField = (el: Element | null) =>
      !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
    const onIn = (e: FocusEvent) => setTyping(isField(e.target as Element));
    const onOut = () => setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  return (
    <nav
      aria-label="Sections"
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-black/90 backdrop-blur-md border-t border-kiwi-border transition-transform duration-200 ${
        typing ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <li key={id} className="flex-1">
              <a
                href={`#${id}`}
                aria-current={on ? 'true' : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-medium transition-colors ${
                  on ? 'text-kiwi' : 'text-zinc-400 active:text-white'
                }`}
              >
                <span
                  className={`absolute top-0 h-[2px] rounded-full bg-kiwi transition-all duration-300 ${
                    on ? 'w-8 opacity-100' : 'w-0 opacity-0'
                  }`}
                />
                <Icon size={21} className={on ? 'drop-shadow-[0_0_6px_rgba(204,255,0,0.6)]' : ''} />
                <span>{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
