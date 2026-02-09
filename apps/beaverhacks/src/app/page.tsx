"use client";

import { useState, useCallback } from "react";
import { Navbar, type Page } from "@/components/navbar";
import { Home } from "@/components/home";
import { Sponsors } from "@/components/sponsors";
import { Faq } from "@/components/faq";
import { StatusBar } from "@/components/status-bar";
import { SystemStats } from "@/components/system-stats";
import { Panel } from "@/components/panel";
import { Ascii } from "@/components/ascii";

export default function Page() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [displayedPage, setDisplayedPage] = useState<Page>("home");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "out" | "blank" | "in"
  >("idle");

  const handleNavigate = useCallback(
    (page: Page) => {
      if (page === currentPage || isAnimating) return;

      setIsAnimating(true);
      setAnimationPhase("out");

      // flicker out
      setTimeout(() => {
        setAnimationPhase("blank");

        // blank moment
        setTimeout(() => {
          setDisplayedPage(page);
          setCurrentPage(page);
          setAnimationPhase("in");

          // fade in
          setTimeout(() => {
            setAnimationPhase("idle");
            setIsAnimating(false);
          }, 100);
        }, 100);
      }, 150);
    },
    [currentPage, isAnimating],
  );

  const renderContent = () => {
    switch (displayedPage) {
      case "home":
        return <Home onNavigateAction={handleNavigate} />;
      case "sponsors":
        return <Sponsors />;
      case "faq":
        return <Faq />;
    }
  };

  return (
    <main className="h-screen bg-screen-dark flex items-center justify-center p-2 md:p-4 lg:p-6">
      <div className="crt-screen crt-scanlines crt-vignette w-full max-w-7xl h-full max-h-[900px] flex flex-col border border-amber-muted/25 p-3 md:p-4">
        {/* Header bar */}
        <div className="shrink-0 flex items-center justify-between border-b border-amber-muted/30 pb-2 mb-3">
          <div className="flex items-center gap-3">
            <Ascii
              fontSize="text-[1.5px] md:text-[2px]"
              leading="leading-[1px] md:leading-[1.25px]"
            />
            <div className="flex flex-col justify-center">
              <span className="text-amber-bright text-glow-base font-primary text-sm md:text-base tracking-wide">
                BEAVERHACKS
              </span>
              <span className="text-amber-muted text-[9px] md:text-[10px]">
                Oregon State Hackathon
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-amber-dim hidden md:inline">
              <span className="text-amber-muted">PID:</span> 2026
            </span>
            <span className="text-amber-dim hidden md:inline">
              <span className="text-amber-muted">TTY:</span> pts/0
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500/80" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
              <span className="w-2 h-2 rounded-full bg-green-500/80" />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-h-0 flex gap-3">
          {/* Left sidebar - System Stats */}
          <div className="hidden lg:block w-56 xl:w-64 shrink-0 overflow-y-auto scrollbar-hide">
            <SystemStats />
          </div>

          {/* Main terminal area */}
          <div className="flex-1 min-w-0 flex flex-col">
            <Panel
              title="Terminal"
              icon=">"
              className="flex-1 min-h-0"
              contentClassName="flex flex-col overflow-hidden"
            >
              <Navbar active={currentPage} onNavigate={handleNavigate} />
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                <div
                  className={`h-full ${
                    animationPhase === "out"
                      ? "animate-flicker-out"
                      : animationPhase === "in"
                        ? "animate-fade-in"
                        : ""
                  }`}
                >
                  {renderContent()}
                </div>
              </div>
            </Panel>
          </div>

          {/* Right sidebar - Event info */}
          <div className="hidden xl:flex w-52 shrink-0 flex-col gap-2">
            <Panel title="Event Info" icon="󰃭">
              <div className="space-y-2 text-[10px] md:text-xs font-secondary">
                <div className="flex justify-between">
                  <span className="text-amber-dim">Date</span>
                  <span className="text-amber-normal">Apr 18-19, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-dim">Duration</span>
                  <span className="text-amber-normal">24 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-dim">Location</span>
                  <span className="text-amber-normal">TBD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-dim">Hackers</span>
                  <span className="text-amber-bright">500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-dim">Prizes</span>
                  <span className="text-amber-bright">$10,000+</span>
                </div>
              </div>
            </Panel>

            <Panel title="Sponsors" icon="">
              <div className="space-y-1 text-[10px] font-secondary text-amber-muted">
                <div className="text-amber-dim">Loading sponsors...</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {["░░░░", "░░░", "░░░░░", "░░░"].map((s, i) => (
                    <span key={i} className="text-amber-muted/50">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="Quick Links" icon="">
              <div className="space-y-1 text-[10px] font-secondary">
                <a
                  href="/apply"
                  className="block text-amber-normal hover:text-amber-bright hover:text-glow-base transition-all"
                >
                  → Register Now
                </a>
                <a
                  href="https://discord.gg/hQaF72fwAr"
                  className="block text-amber-dim hover:text-amber-normal transition-all"
                >
                  → Discord Server
                </a>
                <a
                  href="https://instagram.com/beaverhacks"
                  className="block text-amber-dim hover:text-amber-normal transition-all"
                >
                  → Instagram
                </a>
                <a
                  href="https://github.com/OregonStateHackathonClub"
                  className="block text-amber-dim hover:text-amber-normal transition-all"
                >
                  → GitHub
                </a>
              </div>
            </Panel>

            <Panel title="Logs" icon="" className="flex-1 min-h-0">
              <div className="text-[9px] font-secondary text-amber-muted space-y-0.5">
                <div>
                  <span className="text-amber-dim">[INFO]</span> System
                  initialized
                </div>
                <div>
                  <span className="text-green-500">[OK]</span> Connection
                  established
                </div>
                <div>
                  <span className="text-amber-dim">[INFO]</span> Loading
                  assets...
                </div>
                <div>
                  <span className="text-green-500">[OK]</span> Ready
                </div>
                <div className="animate-pulse">
                  <span className="text-amber-bright">[WAIT]</span> Awaiting
                  hackers...
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar />
      </div>
    </main>
  );
}
