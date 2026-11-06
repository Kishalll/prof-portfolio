import React from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Grid,
  RotateCcw
} from 'lucide-react';

interface CanvasHeaderProps {
  onToggleGrid?: () => void;
  isGridVisible?: boolean;
  onReplayBuild?: () => void;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  onToggleGrid,
  isGridVisible = true,
  onReplayBuild,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-black/85 border-b border-kiwi-border px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-kiwi shadow-kiwi-glow-sm" />
          <span className="text-sm font-semibold tracking-tight text-white">Kishal P</span>
          <span className="text-zinc-600 font-mono text-xs">/</span>
          <span className="text-xs font-mono text-zinc-400">Full-Stack &amp; Systems</span>
        </div>

        {/* Center: Clean Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <a href="#hero" className="hover:text-kiwi transition-colors">Overview</a>
          <a href="#about" className="hover:text-kiwi transition-colors">About</a>
          <a href="#projects" className="hover:text-kiwi transition-colors">Projects</a>
          <a href="#skills" className="hover:text-kiwi transition-colors">Skills</a>
          <a href="#contact" className="hover:text-kiwi transition-colors">Contact</a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {onReplayBuild && (
            <button
              onClick={onReplayBuild}
              className="p-1.5 rounded-md border bg-black border-kiwi-border text-zinc-400 hover:text-kiwi hover:border-kiwi/40 transition-colors"
              title="Replay Collaborative Assembly"
              aria-label="Replay Build"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={`p-1.5 rounded-md border transition-colors ${
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
