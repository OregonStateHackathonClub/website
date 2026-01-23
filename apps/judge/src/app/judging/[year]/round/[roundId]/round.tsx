"use client";

import { Scale, Star, Trophy } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  saveJudgeNotes,
  skipSubmission,
  submitRubricScores,
  submitTriageScore,
} from "@/app/actions/scoring";
import type { Assignment, JudgingRound } from "../../types";
import { CompletedState } from "./components/completed-state";
import { EmptyState } from "./components/empty-state";
import { HeaderBar } from "./components/header-bar";
import { JudgingPanel } from "./components/judging-panel";
import { ProjectInfo } from "./components/project-info";
import { ScheduleSidebar } from "./components/schedule-sidebar";
import { SkipDialog } from "./components/skip-dialog";
import { calculateTimeSlots, useJudgingState } from "./hooks";

const ROUND_ICONS = {
  TRIAGE: Star,
  RUBRIC: Scale,
  RANKED: Trophy,
} as const;

interface RoundProps {
  hackathonId: string;
  round: JudgingRound;
  assignments: Assignment[];
}

export function Round({
  hackathonId,
  round,
  assignments: initialAssignments,
}: RoundProps) {
  const state = useJudgingState({
    initialAssignments,
    roundType: round.type,
    minutesPerProject: round.minutesPerProject,
  });

  const timeSlots = calculateTimeSlots(
    state.assignments,
    round.startedAt,
    round.minutesPerProject,
  );

  const completedCount = state.assignments.filter((a) => a.completed).length;
  const totalCount = state.assignments.length;
  const behindCount = timeSlots.filter(
    (slot) => slot.isOverdue && !slot.assignment.completed,
  ).length;

  const handleSubmitScore = useCallback(async () => {
    if (!state.selectedAssignment) return;

    if (state.notes !== (state.selectedAssignment.notes || "")) {
      await saveJudgeNotes(
        hackathonId,
        round.id,
        state.selectedAssignment.submissionId,
        state.notes,
      );
    }

    state.setIsSubmitting(true);

    try {
      let result;

      if (round.type === "TRIAGE") {
        if (state.triageScore === null) {
          toast.error("Please select a rating");
          state.setIsSubmitting(false);
          return;
        }
        result = await submitTriageScore(
          hackathonId,
          round.id,
          state.selectedAssignment.submissionId,
          state.triageScore,
        );
      } else if (round.type === "RUBRIC") {
        const criteria = round.rubric?.criteria || [];
        if (Object.keys(state.rubricScores).length !== criteria.length) {
          toast.error("Please score all criteria");
          state.setIsSubmitting(false);
          return;
        }
        result = await submitRubricScores(
          hackathonId,
          round.id,
          state.selectedAssignment.submissionId,
          state.rubricScores,
        );
      }

      if (result?.success) {
        toast.success("Score submitted");
        state.markCompleted(state.selectedAssignment.id);
        state.moveToNextIncomplete();
      } else {
        toast.error(result?.error || "Failed to submit score");
      }
    } finally {
      state.setIsSubmitting(false);
    }
  }, [state, hackathonId, round]);

  const handleSkip = async (reason: string, skipNote?: string) => {
    if (!state.selectedAssignment) return;

    state.setIsSubmitting(true);
    const result = await skipSubmission(
      hackathonId,
      round.id,
      state.selectedAssignment.submissionId,
      reason as "team_no_show" | "team_not_ready" | "technical" | "other",
      skipNote,
    );
    state.setIsSubmitting(false);
    state.setShowSkipDialog(false);

    if (result.success) {
      toast.success("Submission skipped");
      state.markCompleted(state.selectedAssignment.id, reason);
      state.moveToNextIncomplete();
    } else {
      toast.error(result.error || "Failed to skip");
    }
  };

  const Icon = ROUND_ICONS[round.type];

  if (state.assignments.length === 0) {
    return <EmptyState hackathonId={hackathonId} Icon={Icon} />;
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950">
      <HeaderBar
        hackathonId={hackathonId}
        roundNumber={round.roundNumber}
        trackName={round.trackName}
        Icon={Icon}
        completedCount={completedCount}
        totalCount={totalCount}
        behindCount={behindCount}
      />

      <ScheduleSidebar
        timeSlots={timeSlots}
        selectedIndex={state.selectedIndex}
        onSelect={state.setSelectedIndex}
        roundStarted={!!round.startedAt}
      />

      {state.selectedAssignment && state.selectedAssignment.completed && (
        <div className="ml-56 bg-neutral-950 pt-12">
          <CompletedState
            skippedReason={state.selectedAssignment.skippedReason}
            selectedIndex={state.selectedIndex}
            totalCount={totalCount}
            onPrevious={() => state.setSelectedIndex(state.selectedIndex - 1)}
            onNext={() => state.setSelectedIndex(state.selectedIndex + 1)}
          />
        </div>
      )}

      {state.selectedAssignment && !state.selectedAssignment.completed && (
        <>
          <div className="ml-56 mr-80 bg-neutral-950 pt-12">
            <div className="min-h-[calc(100vh-48px)]">
              <ProjectInfo
                submission={state.selectedAssignment.submission}
                currentIndex={state.selectedIndex}
                totalCount={totalCount}
                selectedImage={state.selectedImage}
                onSelectImage={state.setSelectedImage}
              />
            </div>
          </div>

          <JudgingPanel
            round={round}
            timerSeconds={state.timerSeconds}
            timerRunning={state.timerRunning}
            totalSeconds={state.totalSeconds}
            onToggleTimer={() => state.setTimerRunning(!state.timerRunning)}
            onResetTimer={() => {
              state.setTimerSeconds(state.totalSeconds);
              state.setTimerRunning(false);
            }}
            triageScore={state.triageScore}
            onTriageScoreChange={state.setTriageScore}
            rubricScores={state.rubricScores}
            onRubricScoresChange={state.setRubricScores}
            notes={state.notes}
            onNotesChange={state.setNotes}
            isSubmitting={state.isSubmitting}
            onSubmit={handleSubmitScore}
            onSkip={() => state.setShowSkipDialog(true)}
          />
        </>
      )}

      {state.showSkipDialog && (
        <SkipDialog
          onClose={() => state.setShowSkipDialog(false)}
          onSkip={handleSkip}
          isSubmitting={state.isSubmitting}
        />
      )}
    </div>
  );
}
