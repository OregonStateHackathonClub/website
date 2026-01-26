import type { Prisma } from "@repo/database";
import { useCallback, useEffect, useState } from "react";

type Assignment = Prisma.RoundJudgeAssignmentGetPayload<{
  include: {
    submission: {
      include: {
        team: {
          include: {
            members: {
              include: {
                participant: {
                  include: { user: { select: { name: true; image: true } } };
                };
              };
            };
          };
        };
        tracks: true;
      };
    };
    triageScore: true;
    rubricScores: true;
  };
}>;

export interface TimeSlot {
  assignment: Assignment;
  index: number;
  relativeStart: number;
  relativeEnd: number;
  absoluteStart: Date | null;
  absoluteEnd: Date | null;
  isOverdue: boolean | null;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function calculateTimeSlots(
  assignments: Assignment[],
  startedAt: Date | null,
  minutesPerProject: number,
): TimeSlot[] {
  const baseTime = startedAt ? new Date(startedAt) : null;

  return assignments.map((assignment, index) => {
    const relativeStart = index * minutesPerProject;
    const relativeEnd = (index + 1) * minutesPerProject;

    return {
      assignment,
      index,
      relativeStart,
      relativeEnd,
      absoluteStart: baseTime ? addMinutes(baseTime, relativeStart) : null,
      absoluteEnd: baseTime ? addMinutes(baseTime, relativeEnd) : null,
      isOverdue:
        baseTime &&
        !assignment.completed &&
        new Date() > addMinutes(baseTime, relativeEnd),
    };
  });
}

interface UseJudgingStateOptions {
  initialAssignments: Assignment[];
  roundType: "TRIAGE" | "RUBRIC" | "RANKED";
  minutesPerProject: number;
}

export function useJudgingState({
  initialAssignments,
  roundType,
  minutesPerProject,
}: UseJudgingStateOptions) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const firstIncomplete = initialAssignments.findIndex((a) => !a.completed);
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const [triageScore, setTriageScore] = useState<number | null>(null);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const totalSeconds = minutesPerProject * 60;
  const [timerSeconds, setTimerSeconds] = useState(totalSeconds);
  const [timerRunning, setTimerRunning] = useState(false);

  const selectedAssignment = assignments[selectedIndex];

  // Reset state when selection changes
  useEffect(() => {
    if (selectedAssignment) {
      setNotes(selectedAssignment.notes || "");
      setTimerSeconds(totalSeconds);
      setTimerRunning(false);
      setSelectedImage(0);

      if (roundType === "TRIAGE") {
        setTriageScore(selectedAssignment.triageScore?.stars ?? null);
      } else if (roundType === "RUBRIC") {
        setRubricScores(
          selectedAssignment.rubricScores.length > 0
            ? Object.fromEntries(
                selectedAssignment.rubricScores.map((s) => [s.criteriaId, s.value]),
              )
            : {},
        );
      }
    }
  }, [selectedIndex, selectedAssignment, roundType, totalSeconds]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const moveToNextIncomplete = useCallback(() => {
    const nextIncomplete = assignments.findIndex(
      (a, i) => i > selectedIndex && !a.completed,
    );
    if (nextIncomplete >= 0) {
      setSelectedIndex(nextIncomplete);
    }
  }, [assignments, selectedIndex]);

  const markCompleted = useCallback(
    (assignmentId: string, skippedReason?: string | null) => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? { ...a, completed: true, skippedReason: skippedReason ?? null }
            : a,
        ),
      );
    },
    [],
  );

  return {
    assignments,
    selectedIndex,
    setSelectedIndex,
    selectedAssignment,
    isSubmitting,
    setIsSubmitting,
    showSkipDialog,
    setShowSkipDialog,
    selectedImage,
    setSelectedImage,
    triageScore,
    setTriageScore,
    rubricScores,
    setRubricScores,
    notes,
    setNotes,
    timerSeconds,
    setTimerSeconds,
    timerRunning,
    setTimerRunning,
    totalSeconds,
    moveToNextIncomplete,
    markCompleted,
  };
}
