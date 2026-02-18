"use client";

import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Description" },
  { number: 3, label: "Media" },
  { number: 4, label: "Links" },
  { number: 5, label: "Review" },
] as const;

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="mb-6 border border-neutral-800 bg-neutral-950/80">
      <div className="flex">
        {STEPS.map((step, i) => {
          const isActive = step.number === currentStep;
          const isPast = step.number < currentStep;

          return (
            <button
              key={step.number}
              type="button"
              onClick={() => onStepClick(step.number)}
              className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-sm transition-colors ${
                i > 0 ? "border-l border-neutral-800" : ""
              } ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : isPast
                    ? "text-emerald-400 hover:bg-neutral-900/50"
                    : "text-neutral-600 hover:bg-neutral-900/50"
              }`}
            >
              {isPast ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <span
                  className={`flex h-5 w-5 items-center justify-center text-xs ${
                    isActive
                      ? "bg-white text-black"
                      : "border border-neutral-700 text-neutral-600"
                  }`}
                >
                  {step.number}
                </span>
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
