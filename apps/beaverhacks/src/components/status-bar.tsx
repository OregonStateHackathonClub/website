"use client";

import { useState, useEffect } from "react";

const HACK_START = new Date("2026-04-17T17:00:00");

const getTimeUntilHack = () => {
  const now = new Date();
  const diff = HACK_START.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hacking: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, hacking: false };
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const StatusBar = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hacking: false,
  });
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCountdown(getTimeUntilHack());
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCountdown(getTimeUntilHack());
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="shrink-0 border-t border-amber-muted/30 mt-3 pt-2 font-secondary text-[10px] md:text-xs select-none">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mode */}
          <div className="flex items-center">
            <span className="bg-amber-bright/90 text-screen-dark px-2 py-0.5 font-bold font-primary text-[10px]">
              NORMAL
            </span>
            <span className="text-amber-bright/90"></span>
          </div>

          {/* Git branch */}
          <div className="hidden sm:flex items-center gap-1 text-amber-dim">
            <span className="text-amber-normal"></span>
            <span>main</span>
          </div>

          {/* Status */}
          <div className="hidden md:flex items-center gap-1 text-amber-dim">
            <span className="text-green-500 text-[8px]"></span>
            <span className="text-amber-normal">ONLINE</span>
          </div>
        </div>

        {/* Center - Countdown */}
        <div className="flex items-center gap-2">
          {countdown.hacking ? (
            <div className="flex items-center gap-2 text-green-500">
              <span className="animate-pulse"></span>
              <span className="font-primary tracking-wider text-glow-base text-sm">
                HACKING LIVE
              </span>
              <span className="animate-pulse"></span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-amber-dim hidden sm:inline"></span>
              <span className="text-amber-muted text-[10px]">
                HACK BEGINS IN
              </span>
              <span className="text-amber-bright text-glow-base font-primary tracking-wide text-sm md:text-base ml-1">
                {pad(countdown.days)}
                <span className="text-amber-dim">d</span> {pad(countdown.hours)}
                <span className="text-amber-dim">h</span>{" "}
                {pad(countdown.minutes)}
                <span className="text-amber-dim">m</span>{" "}
                {pad(countdown.seconds)}
                <span className="text-amber-dim">s</span>
              </span>
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Line/Col */}
          <div className="hidden md:flex items-center gap-2 text-amber-dim">
            <span>
              Ln <span className="text-amber-normal">1</span>
            </span>
            <span>
              Col <span className="text-amber-normal">1</span>
            </span>
          </div>

          {/* Encoding */}
          <span className="hidden lg:inline text-amber-muted">UTF-8</span>

          {/* Time */}
          <div className="flex items-center">
            <span className="text-amber-bright/90 rotate-180"></span>
            <span className="bg-amber-bright/90 text-screen-dark px-2 py-0.5 font-bold font-primary text-[10px]">
              {currentTime ? formatTime(currentTime) : "--:--:--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
