"use server";

import { auth } from "@repo/auth";
import { JudgingRoundType, prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "./auth";

// Slice the top N from a score-sorted list, randomizing within any tie that
// spans the cutoff so ties at the boundary are broken by coin flip.
function sliceWithRandomTiebreak<T extends { score: number }>(
  sorted: T[],
  advanceCount: number,
): T[] {
  if (sorted.length <= advanceCount) return [...sorted];
  const cutoff = sorted[advanceCount - 1].score;
  if (sorted[advanceCount].score !== cutoff) {
    return sorted.slice(0, advanceCount);
  }
  const clear = sorted.filter((s) => s.score > cutoff);
  const tied = sorted.filter((s) => s.score === cutoff);
  for (let i = tied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tied[i], tied[j]] = [tied[j], tied[i]];
  }
  return [...clear, ...tied.slice(0, advanceCount - clear.length)];
}

// Get all data needed for judging configuration
export async function getJudgingData(hackathonId: string) {
  await requireAdmin();

  const [tracks, judges] = await Promise.all([
    prisma.track.findMany({
      where: { hackathonId },
      include: {
        judgingPlan: {
          include: {
            rounds: {
              orderBy: { roundNumber: "asc" },
              include: {
                _count: { select: { judgeAssignments: true } },
              },
            },
          },
        },
        judgeAssignments: {
          include: {
            judge: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.judge.findMany({
      where: { hackathonId },
      include: {
        trackAssignments: true,
        _count: {
          select: {
            roundAssignments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return { tracks, judges };
}

// Assign a judge to a track
export async function assignJudgeToTrack(
  hackathonId: string,
  judgeId: string,
  trackId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    // Verify judge belongs to this hackathon
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
    });

    if (!judge || judge.hackathonId !== hackathonId) {
      return { success: false, error: "Judge not found in this hackathon" };
    }

    // Verify track belongs to this hackathon
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track || track.hackathonId !== hackathonId) {
      return { success: false, error: "Track not found in this hackathon" };
    }

    // Check if already assigned
    const existing = await prisma.judgeTrackAssignment.findUnique({
      where: {
        judgeId_trackId: { judgeId, trackId },
      },
    });

    if (existing) {
      return { success: false, error: "Judge already assigned to this track" };
    }

    await prisma.judgeTrackAssignment.create({
      data: { judgeId, trackId },
    });

    revalidatePath(`/hackathons/${hackathonId}/judging`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to assign judge to track" };
  }
}

// Remove a judge from a track
export async function removeJudgeFromTrack(
  hackathonId: string,
  judgeId: string,
  trackId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await prisma.judgeTrackAssignment.delete({
      where: {
        judgeId_trackId: { judgeId, trackId },
      },
    });

    revalidatePath(`/hackathons/${hackathonId}/judging`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove judge from track" };
  }
}

// Create or update a judging plan for a track
export async function saveJudgingPlan(
  hackathonId: string,
  trackId: string,
  rounds: {
    type: "TRIAGE" | "RUBRIC" | "RANKED";
    advanceCount?: number;
    advancePercent?: number;
    judgesPerProject: number;
    minutesPerProject: number;
    rubricId?: string;
    rankedSlots?: number;
  }[],
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    // Verify track belongs to this hackathon and get its rubric
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        judgingPlan: {
          include: { rounds: { orderBy: { roundNumber: "asc" } } },
        },
        rubric: true,
      },
    });

    if (!track || track.hackathonId !== hackathonId) {
      return { success: false, error: "Track not found in this hackathon" };
    }

    // Check if any round is RUBRIC type but track has no rubric
    const hasRubricRound = rounds.some((r) => r.type === "RUBRIC");
    if (hasRubricRound && !track.rubric) {
      return {
        success: false,
        error: "Track has no rubric. Add a rubric to use RUBRIC rounds.",
      };
    }

    const judgeCount = await prisma.judgeTrackAssignment.count({
      where: { trackId },
    });

    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];

      // judgesPerProject can't exceed judges available on the track
      if (judgeCount > 0 && round.judgesPerProject > judgeCount) {
        return {
          success: false,
          error: `Round ${i + 1}: judgesPerProject (${round.judgesPerProject}) exceeds judges assigned to this track (${judgeCount}). Add more judges or reduce judgesPerProject.`,
        };
      }

      if (round.type === "RANKED") {
        const slots = round.rankedSlots ?? 3;
        const winners = round.advanceCount ?? 3;
        if (winners > slots) {
          return {
            success: false,
            error: `Round ${i + 1}: winner count (${winners}) cannot exceed ranked slots (${slots})`,
          };
        }
        // rankedSlots shouldn't exceed the previous round's advanceCount
        // (i.e., the finalists actually entering this round)
        const prev = rounds[i - 1];
        if (prev && prev.advanceCount && slots > prev.advanceCount) {
          return {
            success: false,
            error: `Round ${i + 1}: rankedSlots (${slots}) exceeds projects advancing from round ${i} (${prev.advanceCount})`,
          };
        }
      }
    }

    const existingPlan = track.judgingPlan;
    const existingRounds = existingPlan?.rounds ?? [];

    // Detect structural change: round count differs or any type differs position-by-position
    const isStructural =
      !existingPlan ||
      existingRounds.length !== rounds.length ||
      existingRounds.some((r, i) => r.type !== rounds[i]?.type);

    if (isStructural) {
      // Delete + recreate (destroys all scores via cascade)
      if (existingPlan) {
        await prisma.judgingPlan.delete({ where: { id: existingPlan.id } });
      }

      await prisma.judgingPlan.create({
        data: {
          trackId,
          rounds: {
            create: rounds.map((round, index) => ({
              roundNumber: index + 1,
              type: round.type as JudgingRoundType,
              advanceCount: round.advanceCount,
              advancePercent: round.advancePercent,
              judgesPerProject: round.judgesPerProject,
              minutesPerProject: round.minutesPerProject,
              rubricId: round.type === "RUBRIC" ? track.rubric?.id : undefined,
              rankedSlots: round.rankedSlots,
            })),
          },
        },
      });
    } else {
      // Metadata-only: update each round in place, preserving scores
      await prisma.$transaction(
        existingRounds.map((existing, i) => {
          const incoming = rounds[i];
          return prisma.judgingRound.update({
            where: { id: existing.id },
            data: {
              advanceCount: incoming.advanceCount ?? null,
              advancePercent: incoming.advancePercent ?? null,
              judgesPerProject: incoming.judgesPerProject,
              minutesPerProject: incoming.minutesPerProject,
              rubricId:
                incoming.type === "RUBRIC" ? (track.rubric?.id ?? null) : null,
              rankedSlots: incoming.rankedSlots ?? null,
            },
          });
        }),
      );
    }

    revalidatePath(`/hackathons/${hackathonId}/judging`);
    return { success: true };
  } catch (error) {
    console.error("Failed to save judging plan:", error);
    return { success: false, error: "Failed to save judging plan" };
  }
}

// Delete a judging plan
export async function deleteJudgingPlan(
  hackathonId: string,
  trackId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { judgingPlan: true },
    });

    if (!track || track.hackathonId !== hackathonId) {
      return { success: false, error: "Track not found" };
    }

    if (!track.judgingPlan) {
      return { success: false, error: "No judging plan exists" };
    }

    await prisma.judgingPlan.delete({
      where: { id: track.judgingPlan.id },
    });

    revalidatePath(`/hackathons/${hackathonId}/judging`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete judging plan" };
  }
}

// Auto-assign judges to submissions for a specific round
export async function autoAssignJudges(
  hackathonId: string,
  trackId: string,
  roundId: string,
): Promise<{ success: boolean; assigned?: number; error?: string }> {
  await requireAdmin();

  try {
    // Get round details
    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
      include: {
        plan: {
          include: {
            track: true,
          },
        },
      },
    });

    if (!round || round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Round not found" };
    }

    if (round.plan.trackId !== trackId) {
      return { success: false, error: "Round does not belong to this track" };
    }

    // Get judges assigned to this track
    const trackJudges = await prisma.judgeTrackAssignment.findMany({
      where: { trackId },
      include: { judge: true },
    });

    if (trackJudges.length === 0) {
      return { success: false, error: "No judges assigned to this track" };
    }

    if (round.type !== "RANKED" && round.judgesPerProject > trackJudges.length) {
      return {
        success: false,
        error: `judgesPerProject (${round.judgesPerProject}) exceeds available judges (${trackJudges.length}). Add more judges or reduce judgesPerProject.`,
      };
    }

    // Get submissions to judge
    // For round 1: all submissions in track
    // For later rounds: submissions that advanced from previous round
    let submissionIds: string[];

    if (round.roundNumber === 1) {
      const submissions = await prisma.submission.findMany({
        where: {
          hackathonId,
          tracks: { some: { id: trackId } },
        },
        select: { id: true },
      });
      submissionIds = submissions.map((s) => s.id);
    } else {
      // Get submissions that advanced from previous round
      const previousRound = await prisma.judgingRound.findFirst({
        where: {
          planId: round.planId,
          roundNumber: round.roundNumber - 1,
        },
      });

      if (!previousRound) {
        return { success: false, error: "Previous round not found" };
      }

      const advancements = await prisma.roundAdvancement.findMany({
        where: { roundId: previousRound.id },
        select: { submissionId: true },
      });
      submissionIds = advancements.map((a) => a.submissionId);
    }

    if (submissionIds.length === 0) {
      return { success: false, error: "No submissions to judge" };
    }

    // Clear existing assignments for this round
    await prisma.roundJudgeAssignment.deleteMany({
      where: { roundId },
    });

    const judges = trackJudges.map((tj) => tj.judge);
    const assignments: {
      roundId: string;
      judgeId: string;
      submissionId: string;
    }[] = [];

    if (round.type === "RANKED") {
      // All judges see all submissions
      for (const judge of judges) {
        for (const submissionId of submissionIds) {
          assignments.push({
            roundId,
            judgeId: judge.id,
            submissionId,
          });
        }
      }
    } else {
      // TRIAGE or RUBRIC: distribute based on judgesPerProject
      const judgesPerProject = round.judgesPerProject;

      // Create assignment pools
      const judgeWorkload = new Map<string, number>();
      judges.forEach((j) => judgeWorkload.set(j.id, 0));

      for (const submissionId of submissionIds) {
        // Get judges with least workload
        const sortedJudges = [...judges].sort(
          (a, b) =>
            (judgeWorkload.get(a.id) || 0) - (judgeWorkload.get(b.id) || 0),
        );

        // Assign required number of judges
        const assignedJudges = sortedJudges.slice(0, judgesPerProject);
        for (const judge of assignedJudges) {
          assignments.push({
            roundId,
            judgeId: judge.id,
            submissionId,
          });
          judgeWorkload.set(judge.id, (judgeWorkload.get(judge.id) || 0) + 1);
        }
      }
    }

    // Bulk create assignments
    await prisma.roundJudgeAssignment.createMany({
      data: assignments,
    });

    revalidatePath(`/hackathons/${hackathonId}/judging`);
    return { success: true, assigned: assignments.length };
  } catch (error) {
    console.error("Failed to auto-assign judges:", error);
    return { success: false, error: "Failed to auto-assign judges" };
  }
}

// Activate a round (start judging)
export async function activateRound(
  hackathonId: string,
  roundId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
      include: {
        plan: {
          include: {
            track: true,
            rounds: true,
          },
        },
        _count: {
          select: { judgeAssignments: true },
        },
      },
    });

    if (!round || round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Round not found" };
    }

    if (round._count.judgeAssignments === 0) {
      return {
        success: false,
        error: "No judge assignments. Run auto-assign first.",
      };
    }

    // Count submissions entering this round for cap validations.
    let submissionsEntering: number;
    if (round.roundNumber === 1) {
      submissionsEntering = await prisma.submission.count({
        where: {
          hackathonId: round.plan.track.hackathonId,
          tracks: { some: { id: round.plan.trackId } },
        },
      });
    } else {
      const previous = round.plan.rounds.find(
        (r) => r.roundNumber === round.roundNumber - 1,
      );
      if (!previous) {
        return { success: false, error: "Previous round not found" };
      }
      submissionsEntering = await prisma.roundAdvancement.count({
        where: { roundId: previous.id },
      });
    }

    if (round.advanceCount && round.advanceCount > submissionsEntering) {
      return {
        success: false,
        error: `advanceCount (${round.advanceCount}) exceeds submissions entering this round (${submissionsEntering})`,
      };
    }

    if (
      round.type === "RANKED" &&
      round.rankedSlots &&
      round.rankedSlots > submissionsEntering
    ) {
      return {
        success: false,
        error: `rankedSlots (${round.rankedSlots}) exceeds submissions entering this round (${submissionsEntering})`,
      };
    }

    // Deactivate other rounds in this plan
    await prisma.judgingRound.updateMany({
      where: { planId: round.planId },
      data: { isActive: false },
    });

    // Activate this round and set startedAt
    await prisma.judgingRound.update({
      where: { id: roundId },
      data: { isActive: true, startedAt: new Date() },
    });

    revalidatePath(`/hackathons/${hackathonId}/judging`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to activate round" };
  }
}

// Complete a round and determine advancements
export async function completeRound(
  hackathonId: string,
  roundId: string,
): Promise<{ success: boolean; advanced?: number; error?: string }> {
  await requireAdmin();

  try {
    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
      include: {
        plan: {
          include: {
            track: true,
          },
        },
        judgeAssignments: true,
        rubric: {
          include: {
            criteria: { select: { id: true, weight: true } },
          },
        },
      },
    });

    if (!round || round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Round not found" };
    }

    if (round.judgeAssignments.length === 0) {
      return {
        success: false,
        error: "No judge assignments exist for this round",
      };
    }

    // Check all assignments are completed
    const incompleteCount = round.judgeAssignments.filter(
      (a) => !a.completed,
    ).length;
    if (incompleteCount > 0) {
      return {
        success: false,
        error: `${incompleteCount} assignments not yet completed`,
      };
    }

    // Calculate advancements based on round type
    let advancingSubmissions: { submissionId: string; rank: number }[] = [];

    if (round.type === "TRIAGE") {
      // Average star ratings and take top N
      const assignments = await prisma.roundJudgeAssignment.findMany({
        where: { roundId },
        include: { triageScore: true },
      });

      // Group by submission and calculate average
      const submissionScores = new Map<string, number[]>();
      for (const a of assignments) {
        if (a.triageScore) {
          const scores = submissionScores.get(a.submissionId) || [];
          scores.push(a.triageScore.stars);
          submissionScores.set(a.submissionId, scores);
        }
      }

      const sorted = [...submissionScores.entries()]
        .map(([submissionId, scores]) => ({
          submissionId,
          score: scores.reduce((a, b) => a + b, 0) / scores.length,
        }))
        .sort((a, b) => b.score - a.score);

      const advanceCount =
        round.advanceCount ||
        Math.ceil(sorted.length * (round.advancePercent || 0.3));

      advancingSubmissions = sliceWithRandomTiebreak(sorted, advanceCount).map(
        (s, i) => ({
          submissionId: s.submissionId,
          rank: i + 1,
        }),
      );
    } else if (round.type === "RUBRIC") {
      const assignments = await prisma.roundJudgeAssignment.findMany({
        where: { roundId },
        include: { rubricScores: true },
      });

      const weightById = new Map(
        (round.rubric?.criteria ?? []).map((c) => [c.id, c.weight]),
      );

      // Weighted sum per judge, then average across non-skipped judges.
      // Summing would penalize submissions whose judges were skipped.
      const submissionScores = new Map<
        string,
        { total: number; count: number }
      >();
      for (const a of assignments) {
        if (a.skippedReason !== null) continue;
        const perJudgeTotal = a.rubricScores.reduce(
          (sum, s) => sum + s.value * (weightById.get(s.criteriaId) ?? 1),
          0,
        );
        const existing = submissionScores.get(a.submissionId);
        if (existing) {
          existing.total += perJudgeTotal;
          existing.count += 1;
        } else {
          submissionScores.set(a.submissionId, {
            total: perJudgeTotal,
            count: 1,
          });
        }
      }

      const sorted = [...submissionScores.entries()]
        .map(([submissionId, { total, count }]) => ({
          submissionId,
          score: total / count,
        }))
        .sort((a, b) => b.score - a.score);

      const advanceCount =
        round.advanceCount ||
        Math.ceil(sorted.length * (round.advancePercent || 0.3));

      advancingSubmissions = sliceWithRandomTiebreak(sorted, advanceCount).map(
        (s, i) => ({
          submissionId: s.submissionId,
          rank: i + 1,
        }),
      );
    } else if (round.type === "RANKED") {
      // Borda count from ranked votes
      const assignments = await prisma.roundJudgeAssignment.findMany({
        where: { roundId },
        include: { rankedVote: true },
      });

      const rankedSlots = round.rankedSlots || 3;
      const pointsMap = new Map<string, number>();

      for (const a of assignments) {
        if (a.rankedVote) {
          // Points: 1st gets rankedSlots points, 2nd gets rankedSlots-1, etc.
          // Clamp to 0 so any out-of-bounds rank can't subtract points.
          const points = Math.max(0, rankedSlots - a.rankedVote.rank + 1);
          pointsMap.set(
            a.submissionId,
            (pointsMap.get(a.submissionId) || 0) + points,
          );
        }
      }

      const sorted = [...pointsMap.entries()]
        .map(([submissionId, points]) => ({ submissionId, score: points }))
        .sort((a, b) => b.score - a.score);

      // For finals, advance count is the number of winners
      const advanceCount = round.advanceCount || 3;

      advancingSubmissions = sliceWithRandomTiebreak(sorted, advanceCount).map(
        (s, i) => ({
          submissionId: s.submissionId,
          rank: i + 1,
        }),
      );
    }

    await prisma.$transaction(async (tx) => {
      // Clear existing advancements (in case of re-completing)
      await tx.roundAdvancement.deleteMany({ where: { roundId } });

      // For RANKED re-completion, clear prior track winners so we don't orphan
      // entries when the top picks shift between runs.
      if (round.type === "RANKED") {
        await tx.trackWinner.deleteMany({
          where: { trackId: round.plan.trackId },
        });
      }

      // Save advancements
      await tx.roundAdvancement.createMany({
        data: advancingSubmissions.map((a) => ({
          roundId,
          submissionId: a.submissionId,
          rank: a.rank,
        })),
      });

      // Mark round as complete and inactive
      await tx.judgingRound.update({
        where: { id: roundId },
        data: { isComplete: true, isActive: false },
      });

      // If this is the last round (RANKED), create TrackWinners and force
      // admin to re-release — new winners are private until greenlit.
      if (round.type === "RANKED") {
        await tx.trackWinner.createMany({
          data: advancingSubmissions.map((a) => ({
            trackId: round.plan.trackId,
            submissionId: a.submissionId,
            place: a.rank,
          })),
        });
        await tx.hackathon.updateMany({
          where: {
            id: round.plan.track.hackathonId,
            winnersReleasedAt: { not: null },
          },
          data: { winnersReleasedAt: null },
        });
      }
    });

    revalidatePath(`/hackathons/${hackathonId}/judging`);
    return { success: true, advanced: advancingSubmissions.length };
  } catch (error) {
    console.error("Failed to complete round:", error);
    return { success: false, error: "Failed to complete round" };
  }
}

// Send magic link to a single judge
export async function sendJudgeMagicLink(
  hackathonId: string,
  judgeEmail: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    // Verify judge exists for this hackathon
    const judge = await prisma.judge.findUnique({
      where: { hackathonId_email: { hackathonId, email: judgeEmail } },
    });

    if (!judge) {
      return { success: false, error: "Judge not found in this hackathon" };
    }

    await auth.api.signInMagicLink({
      body: {
        email: judgeEmail,
        callbackURL: `${process.env.NEXT_PUBLIC_JUDGE_URL || "http://localhost:3002"}/judging/${hackathonId}`,
      },
      headers: await headers(),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send magic link:", error);
    return { success: false, error: "Failed to send magic link" };
  }
}

// Send magic links to all judges with assignments
export async function sendAllJudgeMagicLinks(hackathonId: string): Promise<{
  success: boolean;
  sent?: number;
  total?: number;
  error?: string;
}> {
  await requireAdmin();

  try {
    // Get all judges with track assignments for this hackathon
    const judges = await prisma.judge.findMany({
      where: {
        hackathonId,
        trackAssignments: { some: {} },
      },
    });

    if (judges.length === 0) {
      return {
        success: false,
        error: "No judges with track assignments found",
      };
    }

    const reqHeaders = await headers();
    let sent = 0;

    for (const judge of judges) {
      try {
        await auth.api.signInMagicLink({
          body: {
            email: judge.email,
            callbackURL: `${process.env.NEXT_PUBLIC_JUDGE_URL || "http://localhost:3002"}/judging/${hackathonId}`,
          },
          headers: reqHeaders,
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send magic link to ${judge.email}:`, error);
      }
    }

    return { success: true, sent, total: judges.length };
  } catch (error) {
    console.error("Failed to send magic links:", error);
    return { success: false, error: "Failed to send magic links" };
  }
}
