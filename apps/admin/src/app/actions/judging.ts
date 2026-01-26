"use server";

import { auth } from "@repo/auth";
import { JudgingRoundType, prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "./auth";

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
      include: { judgingPlan: true, rubric: true },
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

    // Delete existing plan if exists
    if (track.judgingPlan) {
      await prisma.judgingPlan.delete({
        where: { id: track.judgingPlan.id },
      });
    }

    // Create new plan with rounds
    // For RUBRIC rounds, automatically use the track's rubric
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
      },
    });

    if (!round || round.plan.track.hackathonId !== hackathonId) {
      return { success: false, error: "Round not found" };
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

      advancingSubmissions = sorted.slice(0, advanceCount).map((s, i) => ({
        submissionId: s.submissionId,
        rank: i + 1,
      }));
    } else if (round.type === "RUBRIC") {
      // Sum up all criteria scores per submission
      const assignments = await prisma.roundJudgeAssignment.findMany({
        where: { roundId },
        include: { rubricScores: true },
      });

      // Group by submission and sum scores
      const submissionScores = new Map<string, number>();
      for (const a of assignments) {
        const total = a.rubricScores.reduce((sum, s) => sum + s.value, 0);
        submissionScores.set(
          a.submissionId,
          (submissionScores.get(a.submissionId) || 0) + total,
        );
      }

      const sorted = [...submissionScores.entries()]
        .map(([submissionId, score]) => ({ submissionId, score }))
        .sort((a, b) => b.score - a.score);

      const advanceCount =
        round.advanceCount ||
        Math.ceil(sorted.length * (round.advancePercent || 0.3));

      advancingSubmissions = sorted.slice(0, advanceCount).map((s, i) => ({
        submissionId: s.submissionId,
        rank: i + 1,
      }));
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
          const points = rankedSlots - a.rankedVote.rank + 1;
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

      advancingSubmissions = sorted.slice(0, advanceCount).map((s, i) => ({
        submissionId: s.submissionId,
        rank: i + 1,
      }));
    }

    // Save advancements
    await prisma.roundAdvancement.createMany({
      data: advancingSubmissions.map((a) => ({
        roundId,
        submissionId: a.submissionId,
        rank: a.rank,
      })),
    });

    // Mark round as complete and inactive
    await prisma.judgingRound.update({
      where: { id: roundId },
      data: { isComplete: true, isActive: false },
    });

    // If this is the last round (RANKED), create TrackWinners
    if (round.type === "RANKED") {
      await prisma.trackWinner.createMany({
        data: advancingSubmissions.map((a) => ({
          trackId: round.plan.trackId,
          submissionId: a.submissionId,
          place: a.rank,
        })),
        skipDuplicates: true,
      });
    }

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
            callbackURL: `${JUDGE_APP_URL}/judging/${hackathonId}`,
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
