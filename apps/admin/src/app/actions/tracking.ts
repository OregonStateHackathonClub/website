"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@repo/database";
import { requireAdmin } from "./auth";

// Reset the public winner release flag. Call after any mutation that could
// change which submissions win a track; admin must re-run completeRound and
// re-release winners before participants see the updated results.
async function invalidateWinnerRelease(hackathonId: string) {
  await prisma.hackathon.updateMany({
    where: { id: hackathonId, winnersReleasedAt: { not: null } },
    data: { winnersReleasedAt: null },
  });
}

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
  score: number | null;
  advanced: boolean;
  place: number | null;
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

export type TrackingJudge = {
  id: string;
  name: string;
  email: string;
};

export type TrackingData = {
  rounds: TrackingRound[];
  projects: TrackingProject[];
  stats: TrackingStats;
  tracks: { id: string; name: string }[];
  judgesByTrack: Record<string, TrackingJudge[]>;
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

  // Tracks drive the selector; one is always picked.
  const tracks = await prisma.track.findMany({
    where: { hackathonId },
    select: {
      id: true,
      name: true,
      judgeAssignments: {
        select: {
          judge: { select: { id: true, name: true, email: true } },
        },
        orderBy: { judge: { name: "asc" } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const judgesByTrack: Record<string, TrackingJudge[]> = {};
  for (const t of tracks) {
    judgesByTrack[t.id] = t.judgeAssignments.map((a) => a.judge);
  }
  const tracksLite = tracks.map((t) => ({ id: t.id, name: t.name }));

  const selectedTrackId =
    (trackId && tracks.some((t) => t.id === trackId) ? trackId : undefined) ??
    tracks[0]?.id;

  if (!selectedTrackId) {
    return {
      rounds: [],
      projects: [],
      stats: { total: 0, complete: 0, inProgress: 0, issues: 0, notStarted: 0 },
      tracks: tracksLite,
      judgesByTrack,
    };
  }

  // Rounds for the selected track only
  const allRounds = await prisma.judgingRound.findMany({
    where: {
      plan: { trackId: selectedTrackId },
    },
    include: {
      plan: { include: { track: { select: { id: true, name: true } } } },
    },
    orderBy: { roundNumber: "asc" },
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

  // Round selection: honor `roundId` only if it belongs to this track
  const selectedRoundId =
    (roundId && rounds.some((r) => r.id === roundId) ? roundId : undefined) ??
    rounds.find((r) => r.isActive)?.id ??
    rounds[0]?.id;

  if (!selectedRoundId) {
    return {
      rounds,
      projects: [],
      stats: { total: 0, complete: 0, inProgress: 0, issues: 0, notStarted: 0 },
      tracks: tracksLite,
      judgesByTrack,
    };
  }

  const selectedRoundData = await prisma.judgingRound.findUnique({
    where: { id: selectedRoundId },
    select: {
      type: true,
      rankedSlots: true,
      rubric: {
        select: {
          criteria: {
            select: { id: true, weight: true, maxScore: true },
          },
        },
      },
    },
  });
  const roundType = selectedRoundData?.type;
  const rankedSlots = selectedRoundData?.rankedSlots ?? 0;
  const rubricCriteria = selectedRoundData?.rubric?.criteria ?? [];

  // Fetch assignments for the selected round with scores
  const assignments = await prisma.roundJudgeAssignment.findMany({
    where: {
      roundId: selectedRoundId,
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
      triageScore: { select: { stars: true } },
      rubricScores: { select: { criteriaId: true, value: true } },
      rankedVote: { select: { rank: true } },
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
        score: null,
        advanced: false,
        place: null,
      });
    }
  }

  // Compute aggregate scores per submission based on round type. Mirrors
  // completeRound's math but read-only and tolerates partial data so admins
  // can see the leaderboard form during the round.
  const weightById = new Map(
    rubricCriteria.map((c) => [c.id, c.weight] as const),
  );
  const rubricMaxPerJudge = rubricCriteria.reduce(
    (acc, c) => acc + c.maxScore * c.weight,
    0,
  );

  for (const project of projectMap.values()) {
    const projectAssignments = assignments.filter(
      (a) => a.submissionId === project.submissionId,
    );

    if (roundType === "TRIAGE") {
      const stars = projectAssignments
        .filter((a) => a.skippedReason === null && a.triageScore !== null)
        .map((a) => a.triageScore!.stars);
      project.score = stars.length
        ? stars.reduce((a, b) => a + b, 0) / stars.length
        : null;
    } else if (roundType === "RUBRIC") {
      const judgeTotals: number[] = [];
      for (const a of projectAssignments) {
        if (a.skippedReason !== null) continue;
        if (a.rubricScores.length === 0) continue;
        const weighted = a.rubricScores.reduce(
          (sum, s) => sum + s.value * (weightById.get(s.criteriaId) ?? 1),
          0,
        );
        judgeTotals.push(weighted);
      }
      if (judgeTotals.length && rubricMaxPerJudge > 0) {
        const avg =
          judgeTotals.reduce((a, b) => a + b, 0) / judgeTotals.length;
        // Normalize per-judge weighted total to a 0–10 display scale.
        project.score = (avg / rubricMaxPerJudge) * 10;
      } else {
        project.score = null;
      }
    } else if (roundType === "RANKED") {
      let bordaPoints = 0;
      let voted = false;
      for (const a of projectAssignments) {
        if (a.rankedVote === null) continue;
        voted = true;
        bordaPoints += Math.max(0, rankedSlots - a.rankedVote.rank + 1);
      }
      project.score = voted ? bordaPoints : null;
    }
  }

  // Mark advancement + winner placements (only meaningful after the round
  // completes, but the queries are cheap so always run them).
  const advancements = await prisma.roundAdvancement.findMany({
    where: { roundId: selectedRoundId },
    select: { submissionId: true },
  });
  const advancedSet = new Set(advancements.map((a) => a.submissionId));

  // Place banners only on the final round of the plan, regardless of type.
  // Earlier rounds just show the "Advanced" banner.
  const maxRoundNumber = allRounds.length
    ? Math.max(...allRounds.map((r) => r.roundNumber))
    : 0;
  const selectedRoundNumber = allRounds.find(
    (r) => r.id === selectedRoundId,
  )?.roundNumber;
  const isFinalRound =
    selectedRoundNumber !== undefined && selectedRoundNumber === maxRoundNumber;

  const winners = isFinalRound
    ? await prisma.trackWinner.findMany({
        where: { trackId: selectedTrackId },
        select: { submissionId: true, place: true },
      })
    : [];
  const winnerByName = new Map(winners.map((w) => [w.submissionId, w.place]));

  for (const project of projectMap.values()) {
    project.advanced = advancedSet.has(project.submissionId);
    project.place = winnerByName.get(project.submissionId) ?? null;
  }

  const projects = [...projectMap.values()].sort((a, b) => {
    // Sort by score descending; nulls (no scores yet) go last.
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });

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

    // "Complete" means every assignment has resolved (scored or skipped).
    // Skips only surface as "issues" when work is still pending.
    if (allDone) stats.complete++;
    else if (hasSkip) stats.issues++;
    else if (anyStarted) stats.inProgress++;
    else stats.notStarted++;
  }

  return { rounds, projects, stats, tracks: tracksLite, judgesByTrack };
}

// Override: assign an additional judge to a project for a round
export async function assignJudgeToRound(
  hackathonId: string,
  roundId: string,
  submissionId: string,
  judgeId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
      include: { plan: { include: { track: true } } },
    });

    if (!round || round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Round not found" };
    }

    const existing = await prisma.roundJudgeAssignment.findUnique({
      where: { roundId_judgeId_submissionId: { roundId, judgeId, submissionId } },
    });

    if (existing) {
      return { success: false, error: "Judge already assigned to this project" };
    }

    await prisma.roundJudgeAssignment.create({
      data: { roundId, judgeId, submissionId },
    });

    // New incomplete assignment means round is no longer complete
    if (round.isComplete) {
      await prisma.judgingRound.update({
        where: { id: roundId },
        data: { isComplete: false },
      });
    }
    await invalidateWinnerRelease(hackathonId);

    revalidatePath(`/hackathons/${hackathonId}/tracking`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to assign judge" };
  }
}

// Override: skip a judge's assignment
export async function skipJudgeAssignment(
  hackathonId: string,
  assignmentId: string,
  reason: string,
  note?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const assignment = await prisma.roundJudgeAssignment.findUnique({
      where: { id: assignmentId },
      include: { round: { include: { plan: { include: { track: true } } } } },
    });

    if (!assignment || assignment.round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Assignment not found" };
    }

    await prisma.roundJudgeAssignment.update({
      where: { id: assignmentId },
      data: { completed: true, skippedReason: reason, skippedNote: note || null },
    });

    if (assignment.round.isComplete) {
      await prisma.judgingRound.update({
        where: { id: assignment.round.id },
        data: { isComplete: false },
      });
    }
    await invalidateWinnerRelease(hackathonId);

    revalidatePath(`/hackathons/${hackathonId}/tracking`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to skip assignment" };
  }
}

// Override: set a triage score for an assignment
export async function overrideTriageScore(
  hackathonId: string,
  assignmentId: string,
  stars: number,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const assignment = await prisma.roundJudgeAssignment.findUnique({
      where: { id: assignmentId },
      include: { round: { include: { plan: { include: { track: true } } } } },
    });

    if (!assignment || assignment.round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Assignment not found" };
    }

    await prisma.triageScore.upsert({
      where: { assignmentId },
      create: { assignmentId, stars },
      update: { stars },
    });

    await prisma.roundJudgeAssignment.update({
      where: { id: assignmentId },
      data: { completed: true },
    });

    if (assignment.round.isComplete) {
      await prisma.judgingRound.update({
        where: { id: assignment.round.id },
        data: { isComplete: false },
      });
    }
    await invalidateWinnerRelease(hackathonId);

    revalidatePath(`/hackathons/${hackathonId}/tracking`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to override score" };
  }
}

// Delete a judge assignment and its scores entirely
export async function deleteJudgeAssignment(
  hackathonId: string,
  assignmentId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const assignment = await prisma.roundJudgeAssignment.findUnique({
      where: { id: assignmentId },
      include: { round: { include: { plan: { include: { track: true } } } } },
    });

    if (!assignment || assignment.round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Assignment not found" };
    }

    // Cascade delete handles scores — just delete the assignment
    await prisma.roundJudgeAssignment.delete({
      where: { id: assignmentId },
    });

    if (assignment.round.isComplete) {
      await prisma.judgingRound.update({
        where: { id: assignment.round.id },
        data: { isComplete: false },
      });
    }
    await invalidateWinnerRelease(hackathonId);

    revalidatePath(`/hackathons/${hackathonId}/tracking`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete assignment" };
  }
}

// Override: set a ranked vote for an assignment
export async function overrideRankedVote(
  hackathonId: string,
  assignmentId: string,
  rank: number,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const assignment = await prisma.roundJudgeAssignment.findUnique({
      where: { id: assignmentId },
      include: { round: { include: { plan: { include: { track: true } } } } },
    });

    if (!assignment || assignment.round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Assignment not found" };
    }

    const maxRank = assignment.round.rankedSlots ?? 3;
    if (!Number.isInteger(rank) || rank < 1 || rank > maxRank) {
      return {
        success: false,
        error: `Rank must be between 1 and ${maxRank}`,
      };
    }

    await prisma.rankedVote.upsert({
      where: { assignmentId },
      create: { assignmentId, rank },
      update: { rank },
    });

    await prisma.roundJudgeAssignment.update({
      where: { id: assignmentId },
      data: { completed: true },
    });

    if (assignment.round.isComplete) {
      await prisma.judgingRound.update({
        where: { id: assignment.round.id },
        data: { isComplete: false },
      });
    }
    await invalidateWinnerRelease(hackathonId);

    revalidatePath(`/hackathons/${hackathonId}/tracking`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to override rank" };
  }
}

// Override: set rubric scores for an assignment (distributes total across criteria)
export async function overrideRubricScore(
  hackathonId: string,
  assignmentId: string,
  total: number,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const assignment = await prisma.roundJudgeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        round: {
          include: {
            plan: { include: { track: true } },
            rubric: { include: { criteria: { select: { id: true } } } },
          },
        },
      },
    });

    if (!assignment || assignment.round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Assignment not found" };
    }

    const criteria = assignment.round.rubric?.criteria || [];
    if (criteria.length === 0) {
      return { success: false, error: "No rubric criteria found for this round" };
    }

    // Distribute total across criteria with the remainder spread to the first
    // `remainder` items so per-criteria scores sum to `total` exactly.
    const base = Math.floor(total / criteria.length);
    const remainder = total - base * criteria.length;

    // Delete existing scores
    await prisma.score.deleteMany({ where: { assignmentId } });

    // Create new scores
    await prisma.score.createMany({
      data: criteria.map((c, i) => ({
        assignmentId,
        criteriaId: c.id,
        value: base + (i < remainder ? 1 : 0),
      })),
    });

    await prisma.roundJudgeAssignment.update({
      where: { id: assignmentId },
      data: { completed: true },
    });

    if (assignment.round.isComplete) {
      await prisma.judgingRound.update({
        where: { id: assignment.round.id },
        data: { isComplete: false },
      });
    }
    await invalidateWinnerRelease(hackathonId);

    revalidatePath(`/hackathons/${hackathonId}/tracking`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to override rubric score" };
  }
}

