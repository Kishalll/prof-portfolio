import { useState } from 'react';
import { useLenis } from './hooks/useLenis';
import { CanvasHeader } from './components/navigation/CanvasHeader';
import { HeroBuilderCanvas } from './components/hero/HeroBuilderCanvas';
import { AboutCanvas } from './components/about/AboutCanvas';
import { ProjectsCanvas } from './components/projects/ProjectsCanvas';
import { SkillsCanvas } from './components/skills/SkillsCanvas';
import { ContactCanvas } from './components/contact/ContactCanvas';
import { VisitorCursor } from './components/canvas/VisitorCursor';
import { SwarmLayer } from './components/canvas/SwarmLayer';
import { BackgroundField } from './components/canvas/BackgroundField';
import { ChoreographerProvider, useChoreographer } from './animation/ChoreographerContext';

function PortfolioAppContent() {
  useLenis();
  const [isGridVisible, setIsGridVisible] = useState(true);
  const { replayKey, triggerReplay } = useChoreographer();

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-kiwi selection:text-black">
      {/* Interactive Visitor Mouse Follower (Isolated from autonomous agents) */}
      <VisitorCursor />

      {/* Global flock of agent arrows: hovers around the visitor's mouse, leaves to build, returns */}
      <SwarmLayer />

      {/* Background Dot-Matrix Canvas Grid (Toggleable) */}
      {isGridVisible && (
        <div 
          className="fixed inset-0 pointer-events-none bg-dot-matrix bg-dot-grid opacity-60 z-0 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Animated background (waves or honeycomb): set VITE_BACKGROUND_STYLE in .env */}
      <BackgroundField />

      {/* Subtle Ambient Radial Lighting */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-kiwi/5 blur-[120px] pointer-events-none rounded-full z-0"
        aria-hidden="true"
      />

      {/* TOP NAVIGATION */}
      <CanvasHeader 
        buildKey={replayKey}
        isGridVisible={isGridVisible}
        onToggleGrid={() => setIsGridVisible(prev => !prev)}
        onReplayBuild={triggerReplay}
      />

      {/* MAIN CANVAS BODY */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-10 py-8">
        {/* HERO SECTION */}
        <HeroBuilderCanvas 
          key={`hero-${replayKey}`}
          buildKey={replayKey}
        />

        {/* ABOUT & ENGINEERING SPEC */}
        <AboutCanvas 
          key={`about-${replayKey}`}
          buildKey={replayKey}
        />

        {/* PROJECTS SHOWCASE */}
        <ProjectsCanvas 
          key={`projects-${replayKey}`}
          buildKey={replayKey}
        />

        {/* SKILLS AUTO-LAYOUT TRAYS */}
        <SkillsCanvas 
          key={`skills-${replayKey}`}
          buildKey={replayKey}
        />

        {/* COLLABORATIVE CONTACT BOARD */}
        <ContactCanvas 
          key={`contact-${replayKey}`}
          buildKey={replayKey}
        />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-kiwi-border/60 py-8 px-6 text-center text-xs font-mono text-zinc-500 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Kishal P</span>
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

export default function App() {
  return (
    <ChoreographerProvider>
      <PortfolioAppContent />
    </ChoreographerProvider>
  );
}
