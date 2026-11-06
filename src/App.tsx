import { useLenis } from './hooks/useLenis';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ArrowUpRight, 
  ShieldCheck, 
  Cpu, 
  Terminal,
  Activity
} from 'lucide-react';
import { CursorSwarmEngine } from './components/canvas/CursorSwarmEngine';
import { VisitorCursor } from './components/canvas/VisitorCursor';

export default function App() {
  useLenis();

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-kiwi selection:text-black">
      {/* Interactive Visitor Mouse Follower */}
      <VisitorCursor />

      {/* Background Dot-Matrix Canvas Grid */}
      <div 
        className="fixed inset-0 pointer-events-none bg-dot-matrix bg-dot-grid opacity-60 z-0"
        aria-hidden="true"
      />

      {/* Subtle Ambient Radial Lighting */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-kiwi/5 blur-[120px] pointer-events-none rounded-full z-0"
        aria-hidden="true"
      />

      {/* Dynamic Multi-Cursor Swarm Canvas Layer */}
      <CursorSwarmEngine />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/80 border-b border-kiwi-border px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-kiwi shadow-kiwi-glow-sm" />
            <span className="text-sm font-semibold tracking-tight text-white">Kishal P</span>
            <span className="text-zinc-600 font-mono text-xs">/</span>
            <span className="text-xs font-mono text-zinc-400">Full-Stack &amp; Systems</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#work" className="hover:text-kiwi transition-colors">Projects</a>
            <a href="#about" className="hover:text-kiwi transition-colors">About</a>
            <a href="#skills" className="hover:text-kiwi transition-colors">Skills</a>
            <a href="#contact" className="hover:text-kiwi transition-colors">Contact</a>
          </nav>

          {/* Right Status & Direct Action Links */}
          <div className="flex items-center gap-3">
            {/* Live Swarm Status Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-kiwi-surface border border-kiwi-border text-xs font-mono text-kiwi">
              <Activity size={12} className="animate-pulse" />
              <span>7 Swarm Cursors Active</span>
            </div>

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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-black bg-kiwi rounded-md hover:bg-kiwi/90 transition-colors shadow-kiwi-glow-sm"
            >
              <Mail size={13} />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="relative flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-kiwi-surface border border-kiwi-border text-kiwi text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-kiwi" />
              VIT Chennai &bull; Computer Science
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
              Available for Opportunities
            </span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              Full-Stack Developer &amp; <br />
              <span className="text-kiwi">Systems Engineer</span>
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              Third-year Computer Science student specializing in full-stack architecture, 
              cybersecurity workflows, and applied AI/RAG systems. Focused on building software 
              with technical precision and thoughtful user experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#work"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-kiwi text-black font-semibold text-xs transition-colors hover:bg-kiwi/90 shadow-kiwi-glow-sm"
            >
              <span>Explore Selected Works</span>
              <ArrowUpRight size={14} />
            </a>
            <a
              href="https://github.com/Kishalll"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-kiwi-surface border border-kiwi-border text-white text-xs font-medium hover:border-kiwi/40 transition-colors"
            >
              <Github size={14} className="text-zinc-400" />
              <span>GitHub Profile</span>
            </a>
          </div>
        </section>

        {/* Phase 2: Multi-Cursor Swarm Showcase & Design Architecture */}
        <section className="border border-kiwi-border bg-kiwi-surface/60 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-kiwi-border/80 pb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                Phase 2 Engine &bull; Dynamic Multi-Cursor Swarm
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                7 collaborative cursors working in dynamic squads across scroll coordinates.
              </p>
            </div>
            <span className="text-xs font-mono text-kiwi border border-kiwi/30 bg-kiwi/10 px-2 py-0.5 rounded">
              Active Swarm
            </span>
          </div>

          {/* Color Tokens */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-black border border-kiwi-border flex flex-col gap-2">
              <div className="w-full h-8 rounded bg-kiwi flex items-center justify-center font-bold text-black text-xs">
                #CCFF00
              </div>
              <div>
                <div className="text-white font-semibold">Dev &amp; Layout</div>
                <div className="text-[11px] text-zinc-500">Electric Kiwi</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black border border-kiwi-border flex flex-col gap-2">
              <div className="w-full h-8 rounded bg-kiwi-yellow flex items-center justify-center font-bold text-black text-xs">
                #FFFF00
              </div>
              <div>
                <div className="text-white font-semibold">SecOps &amp; Audit</div>
                <div className="text-[11px] text-zinc-500">Electric Yellow</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black border border-kiwi-border flex flex-col gap-2">
              <div className="w-full h-8 rounded bg-kiwi-chartreuse flex items-center justify-center font-bold text-black text-xs">
                #DFFF00
              </div>
              <div>
                <div className="text-white font-semibold">AI_Agent &amp; Kernel</div>
                <div className="text-[11px] text-zinc-500">Chartreuse</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black border border-kiwi-border flex flex-col gap-2">
              <div className="w-full h-8 rounded bg-black border border-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                #000000
              </div>
              <div>
                <div className="text-white font-semibold">Base Canvas</div>
                <div className="text-[11px] text-zinc-500">Pure Black</div>
              </div>
            </div>
          </div>

          {/* Technical Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-black/40 border border-kiwi-border flex items-start gap-3">
              <Terminal className="text-kiwi shrink-0 mt-0.5" size={16} />
              <div>
                <h3 className="text-xs font-semibold text-white">Full-Stack Architecture</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  React, TypeScript, Next.js, Node.js/Express, FastAPI, and responsive mobile interfaces.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-black/40 border border-kiwi-border flex items-start gap-3">
              <ShieldCheck className="text-kiwi-yellow shrink-0 mt-0.5" size={16} />
              <div>
                <h3 className="text-xs font-semibold text-white">Security &amp; Verification</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Cryptographic watermarking (P-256 ECDSA), phishing detection, and breach intelligence.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-black/40 border border-kiwi-border flex items-start gap-3">
              <Cpu className="text-kiwi-chartreuse shrink-0 mt-0.5" size={16} />
              <div>
                <h3 className="text-xs font-semibold text-white">Applied AI &amp; Systems</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Dense-vector RAG pipelines, local LLM integrations (Ollama, NVIDIA NIM), and Linux tooling.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-kiwi-border/60 py-6 px-6 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Kishal P &bull; Built with precision</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Kishalll" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/kishal-p-0a13842b9/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="mailto:kishal2007@gmail.com" className="hover:text-white transition-colors">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
