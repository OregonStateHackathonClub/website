"use client"

import { useState, useEffect } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const Countdown = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    function calculateTimeLeft(): TimeLeft {
      const dt = +targetDate - +new Date()
  
      if (dt <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        }
      }
  
      return {
        days: Math.floor(dt / (1000 * 60 * 60 * 24)),
        hours: Math.floor((dt / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((dt / 1000 / 60) % 60),
        seconds: Math.floor((dt / 1000) % 60)
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) return null

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className="text-xl font-medium text-orange-500 uppercase tracking-widest">Countdown to Launch</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-square backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg max-w-[5rem]">
            <span className="font-bold text-2xl sm:text-3xl md:text-4xl">{String(timeLeft.days).padStart(2, '0')}</span>
          </div>
          <span className="text-xs sm:text-sm uppercase mt-2 font-medium tracking-wider opacity-80">Days</span>
        </div>
        
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-square backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg max-w-[5rem]">
            <span className="font-bold text-2xl sm:text-3xl md:text-4xl">{String(timeLeft.hours).padStart(2, '0')}</span>
          </div>
          <span className="text-xs sm:text-sm uppercase mt-2 font-medium tracking-wider opacity-80">Hours</span>
        </div>
        
        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-square backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg max-w-[5rem]">
            <span className="font-bold text-2xl sm:text-3xl md:text-4xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
          </div>
          <span className="text-xs sm:text-sm uppercase mt-2 font-medium tracking-wider opacity-80">Minutes</span>
        </div>
        
        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-square backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg max-w-[5rem]">
            <span className="font-bold text-2xl sm:text-3xl md:text-4xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
          <span className="text-xs sm:text-sm uppercase mt-2 font-medium tracking-wider opacity-80">Seconds</span>
        </div>
      </div>
    </div>
  )
}