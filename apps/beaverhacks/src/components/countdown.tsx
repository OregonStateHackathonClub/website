"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const Countdown = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    function calculateTimeLeft(): TimeLeft {
      const dt = +targetDate - +new Date();

      if (dt <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(dt / (1000 * 60 * 60 * 24)),
        hours: Math.floor((dt / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((dt / 1000 / 60) % 60),
        seconds: Math.floor((dt / 1000) % 60),
      };
    }

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className="text-xl font-medium text-orange-500 uppercase">
        Countdown to Hacking
      </h2>
      <div className="flex flex-nowrap gap-3 sm:gap-3 md:gap-6 w-full justify-center">
        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 md:w-20 aspect-square backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg">
            <span className="font-bold text-lg sm:text-2xl md:text-4xl">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs md:text-sm uppercase mt-1 md:mt-2 font-medium tracking-wider opacity-80">
            Days
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 md:w-20 aspect-square backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg">
            <span className="font-bold text-lg sm:text-2xl md:text-4xl">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs md:text-sm uppercase mt-1 md:mt-2 font-medium tracking-wider opacity-80">
            Hours
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 md:w-20 aspect-square backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg">
            <span className="font-bold text-lg sm:text-2xl md:text-4xl">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs md:text-sm uppercase mt-1 md:mt-2 font-medium tracking-wider opacity-80">
            Mins
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 md:w-20 aspect-square backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg">
            <span className="font-bold text-lg sm:text-2xl md:text-4xl">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs md:text-sm uppercase mt-1 md:mt-2 font-medium tracking-wider opacity-80">
            Secs
          </span>
        </div>
      </div>
    </div>
  );
};
