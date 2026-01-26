"use client";

import type { RubricCriteria } from "@repo/database";
import { Slider } from "@repo/ui/components/slider";

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
  const handleScoreChange = (criteriaId: string, value: number) => {
    if (!disabled) {
      onChange({ ...scores, [criteriaId]: value });
    }
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

          return (
            <div key={criterion.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-white truncate">
                      {criterion.name}
                    </span>
                    <span className="text-xs text-neutral-500 shrink-0">
                      ({weightPercent}%, max {criterion.maxScore})
                    </span>
                  </div>
                  {criterion.description && (
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">
                      {criterion.description}
                    </p>
                  )}
                </div>
                <span className="text-lg font-semibold text-white tabular-nums w-6 text-right shrink-0">
                  {currentValue ?? "–"}
                </span>
              </div>

              <Slider
                min={1}
                max={criterion.maxScore}
                step={1}
                value={[currentValue ?? defaultValue]}
                onValueChange={(values) =>
                  handleScoreChange(criterion.id, values[0])
                }
                disabled={disabled}
                className="`**:data-[slot=slider-track]:bg-neutral-800 **:data-[slot=slider-track]:h-2 **:data-[slot=slider-track]:rounded-none **:data-[slot=slider-range]:bg-white **:data-[slot=slider-thumb]:border-white **:data-[slot=slider-thumb]:bg-white **:data-[slot=slider-thumb]:rounded-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
