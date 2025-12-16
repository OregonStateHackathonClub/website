"use client";

import { useState, useCallback } from "react";
import { Navbar, type Page } from "@/components/navbar";
import { Home } from "@/components/home";
import { Sponsors } from "@/components/sponsors";
import { Faq } from "@/components/faq";

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
    <main className="h-screen bg-screen-dark flex items-center justify-center p-4 md:p-8">
      <div className="crt-screen crt-scanlines crt-vignette w-full max-w-4xl max-h-full aspect-square flex flex-col border border-amber-muted/25 px-12 py-8">
        <Navbar active={currentPage} onNavigate={handleNavigate} />
        <div className="flex-1 min-h-0 pt-1">
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
      </div>
    </main>
  );
}
