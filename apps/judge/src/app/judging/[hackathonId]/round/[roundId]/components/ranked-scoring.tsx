"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface RankedSubmission {
  id: string;
  title: string;
  tagline: string;
  teamName: string | null;
}

interface RankedScoringProps {
  submissions: RankedSubmission[];
  rankedOrder: string[];
  onChange: (newOrder: string[]) => void;
  disabled?: boolean;
}

const RANK_LABELS = ["1st", "2nd", "3rd", "4th", "5th"];

export function RankedScoring({
  submissions,
  rankedOrder,
  onChange,
  disabled = false,
}: RankedScoringProps) {
  const orderedSubmissions = rankedOrder
    .map((id) => submissions.find((s) => s.id === id))
    .filter(Boolean) as RankedSubmission[];

  const moveUp = (index: number) => {
    if (index === 0 || disabled) return;
    const newOrder = [...rankedOrder];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    onChange(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === rankedOrder.length - 1 || disabled) return;
    const newOrder = [...rankedOrder];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    onChange(newOrder);
  };

  return (
    <div className="mb-6">
      <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
        Your Rankings
      </h3>
      <p className="text-xs text-neutral-600 mb-3">
        Drag or use arrows to reorder
      </p>
      <div className="space-y-2">
        {orderedSubmissions.map((submission, index) => (
          <div
            key={submission.id}
            className="flex items-center gap-2 border border-neutral-800 bg-neutral-900/50 p-3"
          >
            <div className="flex flex-col items-center gap-0.5 mr-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0 || disabled}
                className="text-neutral-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedSubmissions.length - 1 || disabled}
                className="text-neutral-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <div
              className={`flex items-center justify-center w-7 h-7 text-xs font-bold shrink-0 ${
                index === 0
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : index === 1
                    ? "bg-neutral-400/20 text-neutral-300 border border-neutral-500/30"
                    : index === 2
                      ? "bg-amber-700/20 text-amber-500 border border-amber-600/30"
                      : "bg-neutral-800 text-neutral-500 border border-neutral-700"
              }`}
            >
              {RANK_LABELS[index] || `${index + 1}`}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {submission.title}
              </p>
              {submission.teamName && (
                <p className="text-xs text-neutral-500 truncate">
                  {submission.teamName}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
