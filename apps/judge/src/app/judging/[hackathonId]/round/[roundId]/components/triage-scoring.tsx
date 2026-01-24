"use client";

interface TriageScoringProps {
  score: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
}

export function TriageScoring({
  score,
  onChange,
  disabled = false,
}: TriageScoringProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
        Rating
      </h3>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => !disabled && onChange(value)}
            disabled={disabled}
            className={`flex-1 h-12 text-lg font-medium border transition-all ${
              score === value
                ? "border-white bg-white text-black"
                : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-600 mt-2">1 = Poor, 5 = Excellent</p>
    </div>
  );
}
