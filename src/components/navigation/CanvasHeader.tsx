import React from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Activity,
  Grid
} from 'lucide-react';

interface CanvasHeaderProps {
  onToggleGrid?: () => void;
  isGridVisible?: boolean;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  onToggleGrid,
  isGridVisible = true,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-black/85 border-b border-kiwi-border px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Document Identity & Canvas Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-kiwi shadow-kiwi-glow-sm" />
            <span className="text-sm font-semibold tracking-tight text-white">Kishal P</span>
            <span className="text-zinc-600 font-mono text-xs">/</span>
            <span className="text-xs font-mono text-kiwi">portfolio.canvas</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-kiwi-border text-[11px] font-mono text-zinc-400">
            <span>Frame: HeroAssembly</span>
            <span className="text-zinc-600">&bull;</span>
            <span>Scale: 100%</span>
          </div>
        </div>

        {/* Center: Canvas Controls & Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <a href="#projects" className="hover:text-kiwi transition-colors">Projects</a>
          <a href="#about" className="hover:text-kiwi transition-colors">About</a>
          <a href="#skills" className="hover:text-kiwi transition-colors">Skills</a>
          <a href="#contact" className="hover:text-kiwi transition-colors">Contact</a>
        </nav>

        {/* Right: Live Swarm Avatars & Actions */}
        <div className="flex items-center gap-3">
          {/* Swarm Presence Stack */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-kiwi-surface border border-kiwi-border text-xs font-mono">
            <div className="flex items-center -space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-kiwi text-black font-bold flex items-center justify-center text-[9px] ring-2 ring-black" title="Dev [Kishal]">
                K
              </span>
              <span className="w-5 h-5 rounded-full bg-kiwi-yellow text-black font-bold flex items-center justify-center text-[9px] ring-2 ring-black" title="SecOps">
                S
              </span>
              <span className="w-5 h-5 rounded-full bg-kiwi-chartreuse text-black font-bold flex items-center justify-center text-[9px] ring-2 ring-black" title="AI Agent">
                AI
              </span>
              <span className="w-5 h-5 rounded-full bg-white text-black font-bold flex items-center justify-center text-[9px] ring-2 ring-black" title="Reviewer">
                R
              </span>
            </div>
            <div className="flex items-center gap-1 pl-1.5 border-l border-kiwi-border text-[11px] text-kiwi">
              <Activity size={12} className="animate-pulse" />
              <span>7 Swarm</span>
            </div>
          </div>

          {/* Grid View Toggle */}
          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={`p-1.5 rounded-md border transition-colors ${
                isGridVisible 
                  ? 'bg-kiwi-surface border-kiwi/40 text-kiwi' 
                  : 'bg-black border-kiwi-border text-zinc-400 hover:text-white'
              }`}
              title="Toggle Canvas Grid [G]"
              aria-label="Toggle Grid"
            >
              <Grid size={15} />
            </button>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-kiwi-border">
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
      </div>
    </header>
  );
};
