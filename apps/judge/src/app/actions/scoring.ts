"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Get current judge from session
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

// Get dashboard data for a judge (all rounds with progress)
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
    // Get all tracks this judge is assigned to with their judging plans
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

    // Get all rounds for this judge
    const rounds = trackAssignments.flatMap(
      (ta) =>
        ta.track.judgingPlan?.rounds.map((round) => ({
          ...round,
          trackId: ta.track.id,
          trackName: ta.track.name,
        })) || [],
    );

    // Get assignment counts for each round
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

// Get round data for timeline view
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

    // Get all assignments for this judge in this round
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

    // Get existing scores
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
      // Group by submission, then by criteria
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
          name: a.submission.name,
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

// Get all assignments for a judge in a specific round
export async function getJudgeAssignments(
  hackathonId: string,
  roundId?: string,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    // Get active rounds for tracks this judge is assigned to
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

    // Get round assignments for this judge
    const rounds = trackAssignments.flatMap(
      (ta) =>
        ta.track.judgingPlan?.rounds.map((round) => ({
          ...round,
          trackId: ta.track.id,
          trackName: ta.track.name,
        })) || [],
    );

    // Get submission assignments for each round
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

        // Get existing scores for this round
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
          // Group scores by submission
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
              name: a.submission.name,
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

// Get submission details for scoring
export async function getSubmissionForScoring(
  hackathonId: string,
  submissionId: string,
  roundId: string,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    // Verify judge is assigned to this submission in this round
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

    // Get existing scores
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
        name: submission.name,
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

// Submit a triage score (1-5 stars)
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
    // Verify assignment exists
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

    // Upsert the triage score
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

    // Mark assignment as completed
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

// Submit rubric scores
export async function submitRubricScores(
  hackathonId: string,
  roundId: string,
  submissionId: string,
  scores: Record<string, number>, // criteriaId -> score
  notes?: string,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    // Verify assignment exists
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

    // Get the rubric to validate criteria
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

    // Validate all criteria are scored
    const criteriaIds = round.rubric.criteria.map((c) => c.id);
    for (const criteriaId of criteriaIds) {
      if (scores[criteriaId] === undefined) {
        return { success: false, error: "All criteria must be scored" };
      }
    }

    // Delete existing scores and create new ones
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

    // Mark assignment as completed
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

// Submit ranked votes
export async function submitRankedVotes(
  hackathonId: string,
  roundId: string,
  rankedSubmissionIds: string[], // Ordered from 1st to last
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

    // Delete existing votes and create new ones
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

    // Mark all assignments for this round as completed
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

// Get all submissions for ranked voting (finalists)
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

    // Get submissions that advanced to this round
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

    // Get existing votes
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
        name: a.submission.name,
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

// Skip a submission with a reason
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
    // Verify assignment exists
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

    // Update assignment with skip info and mark as completed
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

// Save private judge notes for an assignment
export async function saveJudgeNotes(
  hackathonId: string,
  roundId: string,
  submissionId: string,
  notes: string,
) {
  const judge = await getCurrentJudge(hackathonId);
  if (!judge) return { success: false, error: "Not a judge" };

  try {
    // Verify assignment exists
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

    // Update assignment with notes
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

// Get assignment notes
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
