"use client";

import type { RubricCriteria } from "@repo/database";
import { Minus, Plus } from "lucide-react";

interface RubricScoringProps {
  criteria: RubricCriteria[];
  scores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  disabled?: boolean;
}

export function RubricScoring({
  criteria,
  scores,
  onChange,
  disabled,
}: RubricScoringProps) {
  const setScore = (criteriaId: string, value: number, max: number) => {
    if (disabled) return;
    const clamped = Math.min(max, Math.max(1, Math.round(value)));
    onChange({ ...scores, [criteriaId]: clamped });
  };

  const isComplete = criteria.every((c) => scores[c.id] !== undefined);
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium ${isComplete ? "text-emerald-400" : "text-neutral-500"}`}
        >
          {Object.keys(scores).length} / {criteria.length} scored
        </span>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion) => {
          const weightPercent = Math.round(
            (criterion.weight / totalWeight) * 100,
          );
          const currentValue = scores[criterion.id];
          const defaultValue = Math.ceil(criterion.maxScore / 2);
          const value = currentValue ?? defaultValue;

          return (
            <div key={criterion.id} className="space-y-2">
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-white">
                    {criterion.name}
                  </span>
                  <span className="text-xs text-neutral-500">
                    ({weightPercent}%, max {criterion.maxScore})
                  </span>
                </div>
                {criterion.description && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {criterion.description}
                  </p>
                )}
              </div>

              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setScore(criterion.id, value - 1, criterion.maxScore)
                  }
                  disabled={disabled || value <= 1}
                  className="w-10 h-10 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-40 disabled:hover:text-neutral-400 disabled:hover:border-neutral-800 flex items-center justify-center transition-colors"
                  aria-label="Decrease score"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={criterion.maxScore}
                  step={1}
                  value={value}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    if (!Number.isNaN(parsed)) {
                      setScore(criterion.id, parsed, criterion.maxScore);
                    }
                  }}
                  disabled={disabled}
                  className="flex-1 h-10 bg-neutral-900 border border-neutral-800 text-white text-lg font-semibold tabular-nums text-center focus:outline-none focus:border-neutral-600 disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setScore(criterion.id, value + 1, criterion.maxScore)
                  }
                  disabled={disabled || value >= criterion.maxScore}
                  className="w-10 h-10 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-40 disabled:hover:text-neutral-400 disabled:hover:border-neutral-800 flex items-center justify-center transition-colors"
                  aria-label="Increase score"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
