"use client";

import { AlertTriangle, CheckCircle2, Circle, Clock } from "lucide-react";
import type { Assignment } from "../../../types";

interface TimeSlot {
  assignment: Assignment;
  index: number;
  relativeStart: number;
  relativeEnd: number;
  absoluteStart: Date | null;
  absoluteEnd: Date | null;
  isOverdue: boolean | Date | null;
}

interface ScheduleSidebarProps {
  timeSlots: TimeSlot[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  roundStarted: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ScheduleSidebar({
  timeSlots,
  selectedIndex,
  onSelect,
  roundStarted,
}: ScheduleSidebarProps) {
  return (
    <div
      className="fixed left-0 w-56 bg-neutral-950 border-r border-neutral-800 z-20 overflow-y-auto"
      style={{ top: 48, bottom: 0 }}
    >
      {!roundStarted && (
        <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-amber-500">Round has not started</span>
        </div>
      )}
      <div className="px-3 py-2 border-b border-neutral-800 sticky top-0 bg-neutral-950">
        <span className="text-xs text-neutral-600 uppercase tracking-wider">
          Schedule
        </span>
      </div>
      <div>
        {timeSlots.map((slot) => {
          const isSelected = slot.index === selectedIndex;
          const isComplete = slot.assignment.completed;
          const wasSkipped = !!slot.assignment.skippedReason;

          return (
            <button
              key={slot.assignment.id}
              onClick={() => onSelect(slot.index)}
              className={`w-full text-left px-3 py-2.5 border-b border-neutral-800/50 transition-colors ${
                isSelected ? "bg-neutral-900" : "hover:bg-neutral-900/50"
              } ${slot.isOverdue && !isComplete ? "bg-red-500/5" : ""}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-neutral-600 font-mono">
                  {slot.absoluteStart
                    ? formatTime(slot.absoluteStart)
                    : `+${slot.relativeStart}m`}
                </span>
                {isComplete ? (
                  <CheckCircle2
                    className={`h-3 w-3 ${
                      wasSkipped ? "text-neutral-600" : "text-emerald-500"
                    }`}
                  />
                ) : slot.isOverdue ? (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                ) : (
                  <Circle className="h-3 w-3 text-neutral-700" />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {slot.assignment.submission.tableNumber && (
                  <span className="text-[11px] font-mono text-neutral-600">
                    #{slot.assignment.submission.tableNumber}
                  </span>
                )}
                <span
                  className={`text-sm truncate ${
                    isComplete ? "text-neutral-600" : "text-white"
                  }`}
                >
                  {slot.assignment.submission.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
