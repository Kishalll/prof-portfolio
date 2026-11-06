import { useState } from 'react';
import { useLenis } from './hooks/useLenis';
import { 
  ShieldCheck, 
  Cpu, 
  Terminal,
  Layers
} from 'lucide-react';
import { CanvasHeader } from './components/navigation/CanvasHeader';
import { HeroBuilderCanvas } from './components/hero/HeroBuilderCanvas';
import { CursorSwarmEngine } from './components/canvas/CursorSwarmEngine';
import { VisitorCursor } from './components/canvas/VisitorCursor';

export default function App() {
  useLenis();
  const [isGridVisible, setIsGridVisible] = useState(true);

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-kiwi selection:text-black">
      {/* Interactive Visitor Mouse Follower */}
      <VisitorCursor />

      {/* Background Dot-Matrix Canvas Grid (Toggleable) */}
      {isGridVisible && (
        <div 
          className="fixed inset-0 pointer-events-none bg-dot-matrix bg-dot-grid opacity-60 z-0 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Subtle Ambient Radial Lighting */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-kiwi/5 blur-[120px] pointer-events-none rounded-full z-0"
        aria-hidden="true"
      />

      {/* Dynamic Multi-Cursor Swarm Canvas Layer */}
      <CursorSwarmEngine />

      {/* TOP NAVIGATION & CANVAS TOOLBAR */}
      <CanvasHeader 
        isGridVisible={isGridVisible}
        onToggleGrid={() => setIsGridVisible(prev => !prev)}
      />

      {/* MAIN CANVAS BODY */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-12">
        {/* PHASE 3: LIVE ACTIVE MULTI-CURSOR CONSTRUCTION */}
        <HeroBuilderCanvas />

        {/* Phase Verification & Color Architecture */}
        <section className="border border-kiwi-border bg-kiwi-surface/60 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-kiwi-border/80 pb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2">
                <Layers size={14} className="text-kiwi" />
                <span>Design System &bull; Electric Kiwi Architecture</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Baseline palette and canvas layout tokens established for Phase 3.
              </p>
            </div>
            <span className="text-xs font-mono text-kiwi border border-kiwi/30 bg-kiwi/10 px-2 py-0.5 rounded">
              WCAG AA Compliant
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
      <footer className="border-t border-kiwi-border/60 py-6 px-6 text-center text-xs font-mono text-zinc-500 mt-16">
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
