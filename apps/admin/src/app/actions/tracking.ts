"use server";

import { prisma } from "@repo/database";
import { requireAdmin } from "./auth";

export type JudgeAssignmentStatus = "scored" | "in_progress" | "skipped" | "not_started";

export type TrackingJudgeAssignment = {
  id: string;
  judgeId: string;
  judgeName: string;
  judgeEmail: string;
  status: JudgeAssignmentStatus;
  skippedReason: string | null;
  skippedNote: string | null;
  notes: string | null;
};

export type TrackingProject = {
  submissionId: string;
  title: string;
  teamName: string | null;
  trackName: string;
  trackId: string;
  tableNumber: number | null;
  assignments: TrackingJudgeAssignment[];
  completedCount: number;
  totalCount: number;
};

export type TrackingRound = {
  id: string;
  roundNumber: number;
  type: string;
  isActive: boolean;
  isComplete: boolean;
  trackName: string;
  trackId: string;
  planId: string;
};

export type TrackingStats = {
  total: number;
  complete: number;
  inProgress: number;
  issues: number;
  notStarted: number;
};

export type TrackingData = {
  rounds: TrackingRound[];
  projects: TrackingProject[];
  stats: TrackingStats;
  tracks: { id: string; name: string }[];
};

function deriveStatus(assignment: {
  completed: boolean;
  skippedReason: string | null;
  hasScore: boolean;
}): JudgeAssignmentStatus {
  if (assignment.completed && assignment.skippedReason) return "skipped";
  if (assignment.completed) return "scored";
  if (assignment.hasScore) return "in_progress";
  return "not_started";
}

export async function getTrackingData(
  hackathonId: string,
  roundId?: string,
  trackId?: string,
): Promise<TrackingData> {
  await requireAdmin();

  // Fetch all rounds for this hackathon (for the round selector)
  const allRounds = await prisma.judgingRound.findMany({
    where: {
      plan: { track: { hackathonId } },
    },
    include: {
      plan: { include: { track: { select: { id: true, name: true } } } },
    },
    orderBy: [{ plan: { track: { name: "asc" } } }, { roundNumber: "asc" }],
  });

  const rounds: TrackingRound[] = allRounds.map((r) => ({
    id: r.id,
    roundNumber: r.roundNumber,
    type: r.type,
    isActive: r.isActive,
    isComplete: r.isComplete,
    trackName: r.plan.track.name,
    trackId: r.plan.track.id,
    planId: r.planId,
  }));

  // Determine which round to show
  const selectedRoundId =
    roundId || rounds.find((r) => r.isActive)?.id || rounds[0]?.id;

  if (!selectedRoundId) {
    const tracks = await prisma.track.findMany({
      where: { hackathonId },
      select: { id: true, name: true },
    });
    return {
      rounds: [],
      projects: [],
      stats: { total: 0, complete: 0, inProgress: 0, issues: 0, notStarted: 0 },
      tracks,
    };
  }

  // Fetch assignments for the selected round with scores
  const assignments = await prisma.roundJudgeAssignment.findMany({
    where: {
      roundId: selectedRoundId,
      ...(trackId ? { submission: { tracks: { some: { id: trackId } } } } : {}),
    },
    select: {
      id: true,
      judgeId: true,
      submissionId: true,
      completed: true,
      skippedReason: true,
      skippedNote: true,
      notes: true,
      judge: { select: { id: true, name: true, email: true } },
      submission: {
        select: {
          id: true,
          title: true,
          tableNumber: true,
          team: { select: { name: true } },
          tracks: { select: { id: true, name: true } },
        },
      },
      triageScore: { select: { id: true } },
      rubricScores: { select: { id: true } },
      rankedVote: { select: { id: true } },
    },
  });

  // Group by submission
  const projectMap = new Map<string, TrackingProject>();

  for (const a of assignments) {
    const hasScore =
      a.triageScore !== null ||
      a.rubricScores.length > 0 ||
      a.rankedVote !== null;

    const status = deriveStatus({
      completed: a.completed,
      skippedReason: a.skippedReason,
      hasScore,
    });

    const judgeAssignment: TrackingJudgeAssignment = {
      id: a.id,
      judgeId: a.judgeId,
      judgeName: a.judge.name,
      judgeEmail: a.judge.email,
      status,
      skippedReason: a.skippedReason,
      skippedNote: a.skippedNote,
      notes: a.notes,
    };

    const existing = projectMap.get(a.submissionId);
    if (existing) {
      existing.assignments.push(judgeAssignment);
      if (status === "scored") existing.completedCount++;
      existing.totalCount++;
    } else {
      projectMap.set(a.submissionId, {
        submissionId: a.submissionId,
        title: a.submission.title,
        teamName: a.submission.team?.name ?? null,
        trackName: a.submission.tracks[0]?.name ?? "Unknown",
        trackId: a.submission.tracks[0]?.id ?? "",
        tableNumber: a.submission.tableNumber,
        assignments: [judgeAssignment],
        completedCount: status === "scored" ? 1 : 0,
        totalCount: 1,
      });
    }
  }

  const projects = [...projectMap.values()];

  // Compute stats
  const stats: TrackingStats = {
    total: projects.length,
    complete: 0,
    inProgress: 0,
    issues: 0,
    notStarted: 0,
  };

  for (const p of projects) {
    const hasSkip = p.assignments.some((a) => a.status === "skipped");
    const allDone = p.assignments.every(
      (a) => a.status === "scored" || a.status === "skipped",
    );
    const anyStarted = p.assignments.some(
      (a) => a.status === "scored" || a.status === "in_progress",
    );

    if (hasSkip) stats.issues++;
    else if (allDone) stats.complete++;
    else if (anyStarted) stats.inProgress++;
    else stats.notStarted++;
  }

  const tracks = await prisma.track.findMany({
    where: { hackathonId },
    select: { id: true, name: true },
  });

  return { rounds, projects, stats, tracks };
}
