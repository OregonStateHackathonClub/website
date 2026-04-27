"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentJudge(hackathonId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) return null;

  const judge = await prisma.judge.findUnique({
    where: {
      hackathonId_email: {
        hackathonId,
        email: session.user.email,
      },
    },
  });

  return judge;
}

// ============================================================================
// Judge Dashboard & Scoring
// ============================================================================

export async function getJudgeDashboard(hackathonId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email)
    return { success: false, error: "Not authenticated" };

  const judge = await prisma.judge.findUnique({
    where: {
      hackathonId_email: {
        hackathonId,
        email: session.user.email,
      },
    },
    include: {
      hackathon: { select: { name: true } },
    },
  });

  if (!judge) return { success: false, error: "Not a judge" };

  try {
    const trackAssignments = await prisma.judgeTrackAssignment.findMany({
      where: { judgeId: judge.id },
      include: {
        track: {
          include: {
            judgingPlan: {
              include: {
                rounds: {
                  orderBy: { roundNumber: "asc" },
                },
              },
            },
          },
        },
      },
    });

    const rounds = trackAssignments.flatMap(
      (ta) =>
        ta.track.judgingPlan?.rounds.map((round) => ({
          ...round,
          trackId: ta.track.id,
          trackName: ta.track.name,
        })) || [],
    );

    const roundsWithProgress = await Promise.all(
      rounds.map(async (round) => {
        const assignments = await prisma.roundJudgeAssignment.findMany({
          where: {
            roundId: round.id,
            judgeId: judge.id,
          },
          select: {
            completed: true,
          },
        });

        return {
          id: round.id,
          roundNumber: round.roundNumber,
          type: round.type,
          trackId: round.trackId,
          trackName: round.trackName,
          minutesPerProject: round.minutesPerProject,
          isActive: round.isActive,
          isComplete: round.isComplete,
          startedAt: round.startedAt,
          totalAssignments: assignments.length,
          completedAssignments: assignments.filter((a) => a.completed).length,
        };
      }),
    );

    return {
      success: true,
      hackathonName: judge.hackathon.name,
      judgeName: judge.name,
      rounds: roundsWithProgress,
    };
  } catch (error) {
    console.error("Failed to get judge dashboard:", error);
    return { success: false, error: "Failed to load dashboard" };
  }
}

export async function getRoundTimeline(hackathonId: string, roundId: string) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
      include: {
        plan: {
          include: {
            track: true,
          },
        },
        rubric: {
          include: {
            criteria: {
              orderBy: { weight: "desc" },
            },
          },
        },
      },
    });

    if (!round) {
      return { success: false, error: "Round not found" };
    }

    const assignments = await prisma.roundJudgeAssignment.findMany({
      where: {
        roundId,
        judgeId: judge.id,
      },
      include: {
        submission: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    participant: {
                      include: {
                        user: { select: { name: true, image: true } },
                      },
                    },
                  },
                },
              },
            },
            tracks: true,
          },
        },
        triageScore: true,
        rubricScores: true,
      },
      orderBy: [{ completed: "asc" }, { submission: { tableNumber: "asc" } }],
    });

    return {
      success: true,
      round,
      assignments,
    };
  } catch (error) {
    console.error("Failed to get round timeline:", error);
    return { success: false, error: "Failed to load round" };
  }
}

// ============================================================================
// Scoring Actions
// ============================================================================

export async function submitTriageScore(
  hackathonId: string,
  roundId: string,
  submissionId: string,
  stars: number,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  if (stars < 1 || stars > 5) {
    return { success: false, error: "Stars must be between 1 and 5" };
  }

  try {
    const assignment = await prisma.roundJudgeAssignment.findFirst({
      where: {
        roundId,
        judgeId: judge.id,
        submissionId,
      },
    });

    if (!assignment) {
      return { success: false, error: "Not assigned to this submission" };
    }

    await prisma.triageScore.upsert({
      where: { assignmentId: assignment.id },
      update: { stars },
      create: {
        assignmentId: assignment.id,
        stars,
      },
    });

    await prisma.roundJudgeAssignment.update({
      where: { id: assignment.id },
      data: { completed: true },
    });

    revalidatePath(`/judging`);
    return { success: true };
  } catch (error) {
    console.error("Failed to submit triage score:", error);
    return { success: false, error: "Failed to submit score" };
  }
}

export async function submitRubricScores(
  hackathonId: string,
  roundId: string,
  submissionId: string,
  scores: Record<string, number>,
  notes?: string,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    const assignment = await prisma.roundJudgeAssignment.findFirst({
      where: {
        roundId,
        judgeId: judge.id,
        submissionId,
      },
    });

    if (!assignment) {
      return { success: false, error: "Not assigned to this submission" };
    }

    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
      include: {
        rubric: {
          include: { criteria: true },
        },
      },
    });

    if (!round?.rubric) {
      return { success: false, error: "Round has no rubric" };
    }

    const criteriaIds = round.rubric.criteria.map((c) => c.id);
    for (const criteriaId of criteriaIds) {
      if (scores[criteriaId] === undefined) {
        return { success: false, error: "All criteria must be scored" };
      }
    }

    await prisma.score.deleteMany({
      where: { assignmentId: assignment.id },
    });

    await prisma.score.createMany({
      data: Object.entries(scores).map(([criteriaId, value]) => ({
        assignmentId: assignment.id,
        criteriaId,
        value,
        notes: notes || null,
      })),
    });

    await prisma.roundJudgeAssignment.update({
      where: { id: assignment.id },
      data: { completed: true },
    });

    revalidatePath(`/judging`);
    return { success: true };
  } catch (error) {
    console.error("Failed to submit rubric scores:", error);
    return { success: false, error: "Failed to submit scores" };
  }
}

export async function submitRankedVotes(
  hackathonId: string,
  roundId: string,
  rankedSubmissionIds: string[],
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
    });

    if (!round || round.type !== "RANKED") {
      return { success: false, error: "Invalid round" };
    }

    if (round.rankedSlots && rankedSubmissionIds.length !== round.rankedSlots) {
      return {
        success: false,
        error: `Must rank exactly ${round.rankedSlots} submissions`,
      };
    }

    const assignments = await prisma.roundJudgeAssignment.findMany({
      where: {
        roundId,
        judgeId: judge.id,
      },
    });

    const assignmentBySubmission = Object.fromEntries(
      assignments.map((a) => [a.submissionId, a]),
    );

    await prisma.rankedVote.deleteMany({
      where: {
        assignmentId: { in: assignments.map((a) => a.id) },
      },
    });

    await prisma.rankedVote.createMany({
      data: rankedSubmissionIds.map((submissionId, index) => ({
        assignmentId: assignmentBySubmission[submissionId].id,
        rank: index + 1,
      })),
    });

    await prisma.roundJudgeAssignment.updateMany({
      where: {
        roundId,
        judgeId: judge.id,
      },
      data: { completed: true },
    });

    revalidatePath(`/judging`);
    return { success: true };
  } catch (error) {
    console.error("Failed to submit ranked votes:", error);
    return { success: false, error: "Failed to submit votes" };
  }
}

export async function getRankedVotingSubmissions(
  hackathonId: string,
  roundId: string,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
      include: {
        plan: {
          include: { track: true },
        },
      },
    });

    if (!round || round.type !== "RANKED") {
      return { success: false, error: "Invalid round" };
    }

    const advancements = await prisma.roundAdvancement.findMany({
      where: {
        toRoundId: roundId,
      },
      include: {
        submission: {
          include: {
            team: true,
            tracks: true,
          },
        },
      },
    });

    const existingVotes = await prisma.rankedVote.findMany({
      where: {
        assignment: {
          roundId,
          judgeId: judge.id,
        },
      },
      orderBy: { rank: "asc" },
      include: { assignment: { select: { submissionId: true } } },
    });

    return {
      success: true,
      round,
      submissions: advancements.map((a) => ({
        id: a.submission.id,
        title: a.submission.title,
        tagline: a.submission.tagline,
        teamName: a.submission.team?.name,
        images: a.submission.images,
      })),
      existingRanking: existingVotes.map((v) => v.assignment.submissionId),
    };
  } catch (error) {
    console.error("Failed to get ranked voting submissions:", error);
    return { success: false, error: "Failed to load submissions" };
  }
}

export async function skipSubmission(
  hackathonId: string,
  roundId: string,
  submissionId: string,
  reason: "team_no_show" | "team_not_ready" | "technical" | "other",
  note?: string,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    const assignment = await prisma.roundJudgeAssignment.findFirst({
      where: {
        roundId,
        judgeId: judge.id,
        submissionId,
      },
    });

    if (!assignment) {
      return { success: false, error: "Not assigned to this submission" };
    }

    await prisma.roundJudgeAssignment.update({
      where: { id: assignment.id },
      data: {
        completed: true,
        skippedReason: reason,
        skippedNote: reason === "other" ? note : null,
      },
    });

    revalidatePath(`/judging`);
    return { success: true };
  } catch (error) {
    console.error("Failed to skip submission:", error);
    return { success: false, error: "Failed to skip submission" };
  }
}

export async function saveJudgeNotes(
  hackathonId: string,
  roundId: string,
  submissionId: string,
  notes: string,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    const assignment = await prisma.roundJudgeAssignment.findFirst({
      where: {
        roundId,
        judgeId: judge.id,
        submissionId,
      },
    });

    if (!assignment) {
      return { success: false, error: "Not assigned to this submission" };
    }

    await prisma.roundJudgeAssignment.update({
      where: { id: assignment.id },
      data: { notes },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save notes:", error);
    return { success: false, error: "Failed to save notes" };
  }
}
