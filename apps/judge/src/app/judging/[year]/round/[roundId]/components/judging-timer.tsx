"use client";

import { Pause, Play, RotateCcw } from "lucide-react";

interface JudgingTimerProps {
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

function formatCountdown(seconds: number): string {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${isNegative ? "-" : ""}${mins}:${secs.toString().padStart(2, "0")}`;
}

export function JudgingTimer({
  seconds,
  isRunning,
  onToggle,
  onReset,
}: JudgingTimerProps) {
  const isOvertime = seconds < 0;

  return (
    <div className="mb-6 pb-6 border-b border-neutral-800">
      <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">
        Time Remaining
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="p-2 border border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <div
          className={`font-mono text-4xl font-medium tabular-nums ${
            isOvertime ? "text-red-500" : "text-white"
          }`}
        >
          {formatCountdown(seconds)}
        </div>
        <button
          onClick={onToggle}
          className={`p-2 border transition-colors ${
            isRunning
              ? "border-neutral-600 bg-neutral-800 text-white"
              : "border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-600"
          }`}
          title={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
