"use client";

import { Button } from "@repo/ui/components/button";
import { SkipForward } from "lucide-react";
import type { JudgingRound } from "../../../types";
import { JudgingTimer } from "./judging-timer";
import { NotesInput } from "./notes-input";
import { RubricScoring } from "./rubric-scoring";
import { TriageScoring } from "./triage-scoring";

interface JudgingPanelProps {
  round: JudgingRound;
  timerSeconds: number;
  timerRunning: boolean;
  totalSeconds: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  triageScore: number | null;
  onTriageScoreChange: (score: number | null) => void;
  rubricScores: Record<string, number>;
  onRubricScoresChange: (scores: Record<string, number>) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onSkip: () => void;
}

export function JudgingPanel({
  round,
  timerSeconds,
  timerRunning,
  onToggleTimer,
  onResetTimer,
  triageScore,
  onTriageScoreChange,
  rubricScores,
  onRubricScoresChange,
  notes,
  onNotesChange,
  isSubmitting,
  onSubmit,
  onSkip,
}: JudgingPanelProps) {
  return (
    <div
      className="fixed right-0 w-80 bg-neutral-950 border-l border-neutral-800 z-20 overflow-y-auto p-6 flex flex-col"
      style={{ top: 48, bottom: 0 }}
    >
      <JudgingTimer
        seconds={timerSeconds}
        isRunning={timerRunning}
        onToggle={onToggleTimer}
        onReset={onResetTimer}
      />

      <div className="flex-1">
        {round.type === "TRIAGE" && (
          <TriageScoring score={triageScore} onChange={onTriageScoreChange} />
        )}

        {round.type === "RUBRIC" && round.rubric && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
              Criteria
            </h3>
            <RubricScoring
              criteria={round.rubric.criteria}
              scores={rubricScores}
              onChange={onRubricScoresChange}
              disabled={false}
            />
          </div>
        )}

        {round.type === "RANKED" && (
          <div className="mb-6 p-4 border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
            <p className="text-neutral-500 text-sm">
              Ranked voting is done after reviewing all finalists.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Notes
          </h3>
          <NotesInput value={notes} onChange={onNotesChange} disabled={false} />
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-800 space-y-2">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-11 bg-white text-black hover:bg-neutral-200 rounded-none"
        >
          {isSubmitting ? "Submitting..." : "Submit Score"}
        </Button>
        <Button
          variant="outline"
          onClick={onSkip}
          disabled={isSubmitting}
          className="w-full border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-none flex items-center justify-center gap-2"
        >
          <SkipForward className="h-4 w-4" />
          Skip
        </Button>
      </div>
    </div>
  );
}
