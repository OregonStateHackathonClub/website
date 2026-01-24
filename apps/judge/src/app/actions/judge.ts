"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isAdmin } from "./auth";

// ============================================================================
// Types
// ============================================================================

export type JudgeResult = {
  id: string;
} | null;

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
// Admin Judge Management
// ============================================================================

export async function getJudge(
  hackathonId: string,
  email?: string,
): Promise<{ success: true; judge: JudgeResult } | { success: false; error: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "Not authorized" };
  }

  try {
    let judgeEmail = email;
    if (!judgeEmail) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user?.email) {
        return { success: false, error: "No email found" };
      }
      judgeEmail = session.user.email;
    }

    const judge = await prisma.judge.findUnique({
      where: {
        hackathonId_email: { hackathonId, email: judgeEmail },
      },
    });

    return { success: true, judge };
  } catch {
    return { success: false, error: "Failed to get judge" };
  }
}

export async function createJudge(
  hackathonId: string,
  email: string,
  name: string,
): Promise<{ success: true; judge: { id: string } } | { success: false; error: string }> {
  if (!(await isAdmin())) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const existingJudge = await prisma.judge.findUnique({
      where: { hackathonId_email: { hackathonId, email } },
    });

    if (existingJudge) {
      return { success: true, judge: existingJudge };
    }

    const judge = await prisma.judge.create({
      data: {
        hackathonId,
        email,
        name,
      },
    });

    return { success: true, judge };
  } catch {
    return { success: false, error: "Failed to create judge" };
  }
}

export async function removeJudge(
  judgeId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  // Check auth BEFORE fetching data
  if (!(await isAdmin())) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
    });

    if (!judge) {
      return { success: false, error: "Judge not found" };
    }

    await prisma.judge.delete({
      where: { id: judgeId },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove judge" };
  }
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
      },
      orderBy: [{ completed: "asc" }, { submission: { tableNumber: "asc" } }],
    });

    let scores: Record<string, number | Record<string, number>> = {};
    if (round.type === "TRIAGE") {
      const triageScores = await prisma.triageScore.findMany({
        where: { roundId, judgeId: judge.id },
      });
      scores = Object.fromEntries(
        triageScores.map((s) => [s.submissionId, s.stars]),
      );
    } else if (round.type === "RUBRIC") {
      const rubricScores = await prisma.score.findMany({
        where: { roundId, judgeId: judge.id },
      });
      for (const score of rubricScores) {
        if (!scores[score.submissionId]) {
          scores[score.submissionId] = {};
        }
        (scores[score.submissionId] as Record<string, number>)[
          score.criteriaId
        ] = score.value;
      }
    }

    return {
      success: true,
      round: {
        id: round.id,
        roundNumber: round.roundNumber,
        type: round.type,
        trackName: round.plan.track.name,
        minutesPerProject: round.minutesPerProject,
        isActive: round.isActive,
        isComplete: round.isComplete,
        startedAt: round.startedAt,
        rankedSlots: round.rankedSlots,
        rubric: round.rubric,
      },
      assignments: assignments.map((a) => ({
        id: a.id,
        submissionId: a.submissionId,
        completed: a.completed,
        skippedReason: a.skippedReason,
        notes: a.notes,
        submission: {
          id: a.submission.id,
          title: a.submission.title,
          tagline: a.submission.tagline,
          description: a.submission.description,
          tableNumber: a.submission.tableNumber,
          teamName: a.submission.team?.name || "No team",
          tracks: a.submission.tracks.map((t) => ({ id: t.id, name: t.name })),
          images: a.submission.images,
          videoUrl: a.submission.videoUrl,
          githubUrl: a.submission.githubUrl,
          members:
            a.submission.team?.members.map((m) => ({
              name: m.participant.user.name,
              image: m.participant.user.image,
            })) || [],
        },
        score: scores[a.submissionId],
      })),
    };
  } catch (error) {
    console.error("Failed to get round timeline:", error);
    return { success: false, error: "Failed to load round" };
  }
}

export async function getJudgeAssignments(
  hackathonId: string,
  roundId?: string,
) {
  const judge = await getCurrentJudge(hackathonId);
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
                  where: roundId ? { id: roundId } : { isActive: true },
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

    const assignments = await Promise.all(
      rounds.map(async (round) => {
        const roundAssignments = await prisma.roundJudgeAssignment.findMany({
          where: {
            roundId: round.id,
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
          },
          orderBy: [
            { submission: { tableNumber: "asc" } },
            { completed: "asc" },
          ],
        });

        let scores: Record<string, number> = {};
        if (round.type === "TRIAGE") {
          const triageScores = await prisma.triageScore.findMany({
            where: {
              roundId: round.id,
              judgeId: judge.id,
            },
          });
          scores = Object.fromEntries(
            triageScores.map((s) => [s.submissionId, s.stars]),
          );
        } else if (round.type === "RUBRIC") {
          const rubricScores = await prisma.score.findMany({
            where: {
              roundId: round.id,
              judgeId: judge.id,
            },
          });
          for (const score of rubricScores) {
            scores[score.submissionId] =
              (scores[score.submissionId] || 0) + score.value;
          }
        }

        return {
          round: {
            id: round.id,
            roundNumber: round.roundNumber,
            type: round.type,
            trackId: round.trackId,
            trackName: round.trackName,
            minutesPerProject: round.minutesPerProject,
            rubricId: round.rubricId,
            rankedSlots: round.rankedSlots,
            startedAt: round.startedAt,
          },
          assignments: roundAssignments.map((a) => ({
            id: a.id,
            submissionId: a.submissionId,
            completed: a.completed,
            skippedReason: a.skippedReason,
            notes: a.notes,
            submission: {
              id: a.submission.id,
              title: a.submission.title,
              tagline: a.submission.tagline,
              description: a.submission.description,
              tableNumber: a.submission.tableNumber,
              teamName: a.submission.team?.name || "No team",
              tracks: a.submission.tracks.map((t) => ({
                id: t.id,
                name: t.name,
              })),
              images: a.submission.images,
              videoUrl: a.submission.videoUrl,
              githubUrl: a.submission.githubUrl,
              members:
                a.submission.team?.members.map((m) => ({
                  name: m.participant.user.name,
                  image: m.participant.user.image,
                })) || [],
            },
            score: scores[a.submissionId],
          })),
          totalCount: roundAssignments.length,
          completedCount: roundAssignments.filter((a) => a.completed).length,
        };
      }),
    );

    return { success: true, assignments };
  } catch (error) {
    console.error("Failed to get judge assignments:", error);
    return { success: false, error: "Failed to load assignments" };
  }
}

export async function getSubmissionForScoring(
  hackathonId: string,
  submissionId: string,
  roundId: string,
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

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: {
          include: {
            members: {
              include: {
                participant: {
                  include: { user: true },
                },
              },
            },
          },
        },
        tracks: true,
      },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    let existingScore: number | Record<string, number> | string[] | null = null;

    if (round.type === "TRIAGE") {
      const triageScore = await prisma.triageScore.findUnique({
        where: {
          roundId_judgeId_submissionId: {
            roundId,
            judgeId: judge.id,
            submissionId,
          },
        },
      });
      existingScore = triageScore?.stars || null;
    } else if (round.type === "RUBRIC" && round.rubric) {
      const scores = await prisma.score.findMany({
        where: {
          roundId,
          judgeId: judge.id,
          submissionId,
        },
      });
      existingScore = Object.fromEntries(
        scores.map((s) => [s.criteriaId, s.value]),
      );
    } else if (round.type === "RANKED") {
      const votes = await prisma.rankedVote.findMany({
        where: {
          roundId,
          judgeId: judge.id,
        },
        orderBy: { rank: "asc" },
      });
      existingScore = votes.map((v) => v.submissionId);
    }

    return {
      success: true,
      submission: {
        id: submission.id,
        title: submission.title,
        tagline: submission.tagline,
        description: submission.description,
        images: submission.images,
        videoUrl: submission.videoUrl,
        githubUrl: submission.githubUrl,
        teamName: submission.team?.name,
        members: submission.team?.members.map((m) => ({
          name: m.participant.user.name,
          image: m.participant.user.image,
        })),
        tracks: submission.tracks.map((t) => ({ id: t.id, name: t.name })),
      },
      round: {
        id: round.id,
        type: round.type,
        roundNumber: round.roundNumber,
        minutesPerProject: round.minutesPerProject,
        rubric: round.rubric,
        rankedSlots: round.rankedSlots,
      },
      existingScore,
      assignmentId: assignment.id,
    };
  } catch (error) {
    console.error("Failed to get submission for scoring:", error);
    return { success: false, error: "Failed to load submission" };
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
      where: {
        roundId_judgeId_submissionId: {
          roundId,
          judgeId: judge.id,
          submissionId,
        },
      },
      update: { stars },
      create: {
        roundId,
        judgeId: judge.id,
        submissionId,
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
      where: {
        roundId,
        judgeId: judge.id,
        submissionId,
      },
    });

    await prisma.score.createMany({
      data: Object.entries(scores).map(([criteriaId, value]) => ({
        roundId,
        judgeId: judge.id,
        submissionId,
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

    await prisma.rankedVote.deleteMany({
      where: {
        roundId,
        judgeId: judge.id,
      },
    });

    await prisma.rankedVote.createMany({
      data: rankedSubmissionIds.map((submissionId, index) => ({
        roundId,
        judgeId: judge.id,
        submissionId,
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
        roundId,
        judgeId: judge.id,
      },
      orderBy: { rank: "asc" },
    });

    return {
      success: true,
      round: {
        id: round.id,
        trackName: round.plan.track.name,
        rankedSlots: round.rankedSlots,
      },
      submissions: advancements.map((a) => ({
        id: a.submission.id,
        title: a.submission.title,
        tagline: a.submission.tagline,
        teamName: a.submission.team?.name,
        images: a.submission.images,
      })),
      existingRanking: existingVotes.map((v) => v.submissionId),
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

export async function getAssignmentNotes(
  hackathonId: string,
  roundId: string,
  submissionId: string,
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
      select: { notes: true, skippedReason: true, skippedNote: true },
    });

    if (!assignment) {
      return { success: false, error: "Not assigned to this submission" };
    }

    return {
      success: true,
      notes: assignment.notes,
      skipped: assignment.skippedReason
        ? { reason: assignment.skippedReason, note: assignment.skippedNote }
        : null,
    };
  } catch (error) {
    console.error("Failed to get notes:", error);
    return { success: false, error: "Failed to get notes" };
  }
}
