"use server";

import { prisma, ApplicationStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

export type HackathonWithStats = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  _count: {
    participants: number;
    teams: number;
    submissions: number;
    tracks: number;
  };
};

export async function getHackathons(): Promise<HackathonWithStats[]> {
  await requireAdmin();

  return prisma.hackathon.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          participants: true,
          teams: true,
          submissions: true,
          tracks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getHackathonById(id: string) {
  await requireAdmin();

  return prisma.hackathon.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          participants: true,
          teams: true,
          submissions: true,
          tracks: true,
        },
      },
    },
  });
}

export async function createHackathon(data: {
  name: string;
  description?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  await requireAdmin();

  try {
    const hackathon = await prisma.hackathon.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    revalidatePath("/hackathons");
    return { success: true, id: hackathon.id };
  } catch (error) {
    return { success: false, error: "Failed to create hackathon" };
  }
}

export async function updateHackathon(
  id: string,
  data: { name?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await prisma.hackathon.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    revalidatePath(`/hackathons/${id}`);
    revalidatePath("/hackathons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update hackathon" };
  }
}

export async function deleteHackathon(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    // Check if hackathon has any data
    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
            submissions: true,
          },
        },
      },
    });

    if (!hackathon) {
      return { success: false, error: "Hackathon not found" };
    }

    const totalData =
      hackathon._count.participants +
      hackathon._count.teams +
      hackathon._count.submissions;

    if (totalData > 0) {
      return {
        success: false,
        error: `Cannot delete hackathon with existing data (${hackathon._count.participants} participants, ${hackathon._count.teams} teams, ${hackathon._count.submissions} submissions)`,
      };
    }

    await prisma.hackathon.delete({ where: { id } });

    revalidatePath("/hackathons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete hackathon" };
  }
}

// Get hackathon applications
export async function getHackathonApplications(hackathonId: string) {
  await requireAdmin();

  // Query applications directly for this hackathon
  const applications = await prisma.application.findMany({
    where: { hackathonId },
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get team membership info for these users
  const userIds = applications.map((a) => a.userId);
  const participants = await prisma.hackathonParticipant.findMany({
    where: {
      hackathonId,
      userId: { in: userIds },
    },
    include: {
      teamMember: {
        include: {
          team: true,
        },
      },
    },
  });

  // Create a map for quick lookup
  const participantMap = new Map(
    participants.map((p) => [p.userId, p])
  );

  // Combine the data
  return applications.map((app) => ({
    ...app,
    participant: participantMap.get(app.userId),
  }));
}

// Get hackathon teams
export async function getHackathonTeams(hackathonId: string) {
  await requireAdmin();

  return prisma.team.findMany({
    where: { hackathonId },
    include: {
      members: {
        include: {
          participant: {
            include: {
              user: true,
            },
          },
        },
      },
      submission: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Get hackathon submissions
export async function getHackathonSubmissions(hackathonId: string) {
  await requireAdmin();

  return prisma.submission.findMany({
    where: { hackathonId },
    include: {
      team: {
        include: {
          members: {
            include: {
              participant: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
      scores: {
        include: {
          judge: true,
        },
      },
      _count: {
        select: {
          scores: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Get hackathon judges
export async function getHackathonJudges(hackathonId: string) {
  await requireAdmin();

  return prisma.judge.findMany({
    where: {
      hackathon_participant: {
        hackathonId,
      },
    },
    include: {
      hackathon_participant: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          assignments: true,
          scores: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Get hackathon tracks
export async function getHackathonTracks(hackathonId: string) {
  await requireAdmin();

  return prisma.track.findMany({
    where: { hackathonId },
    include: {
      rubric: {
        include: {
          criteria: true,
        },
      },
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Get participants who are not judges (for adding new judges)
export async function getAvailableParticipantsForJudge(hackathonId: string) {
  await requireAdmin();

  const participants = await prisma.hackathonParticipant.findMany({
    where: {
      hackathonId,
      judge: null, // Not already a judge
    },
    include: {
      user: true,
    },
    orderBy: { joinedAt: "desc" },
  });

  // Get applications for these users in this hackathon
  const userIds = participants.map((p) => p.userId);
  const applications = await prisma.application.findMany({
    where: {
      hackathonId,
      userId: { in: userIds },
    },
  });

  // Create a map for quick lookup
  const applicationMap = new Map(
    applications.map((a) => [a.userId, a])
  );

  // Combine the data
  return participants.map((p) => ({
    ...p,
    application: applicationMap.get(p.userId),
  }));
}

// Add a participant as a judge
export async function addJudge(
  hackathonId: string,
  participantId: string,
  role: "JUDGE" | "MANAGER" = "JUDGE"
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const participant = await prisma.hackathonParticipant.findUnique({
      where: { id: participantId },
      include: { user: true, judge: true },
    });

    if (!participant) {
      return { success: false, error: "Participant not found" };
    }

    if (participant.hackathonId !== hackathonId) {
      return { success: false, error: "Participant not in this hackathon" };
    }

    if (participant.judge) {
      return { success: false, error: "Participant is already a judge" };
    }

    await prisma.judge.create({
      data: {
        name: participant.user.name,
        email: participant.user.email,
        hackathon_participant_id: participantId,
        role,
      },
    });

    revalidatePath(`/hackathons/${hackathonId}/judges`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to add judge" };
  }
}

// Remove a judge
export async function removeJudge(
  hackathonId: string,
  judgeId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
      include: {
        hackathon_participant: true,
        _count: { select: { scores: true } },
      },
    });

    if (!judge) {
      return { success: false, error: "Judge not found" };
    }

    if (judge.hackathon_participant.hackathonId !== hackathonId) {
      return { success: false, error: "Judge not in this hackathon" };
    }

    if (judge._count.scores > 0) {
      return {
        success: false,
        error: `Cannot remove judge with ${judge._count.scores} existing scores`,
      };
    }

    await prisma.judge.delete({ where: { id: judgeId } });

    revalidatePath(`/hackathons/${hackathonId}/judges`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove judge" };
  }
}

// Update judge role
export async function updateJudgeRole(
  hackathonId: string,
  judgeId: string,
  role: "JUDGE" | "MANAGER"
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
      include: { hackathon_participant: true },
    });

    if (!judge) {
      return { success: false, error: "Judge not found" };
    }

    if (judge.hackathon_participant.hackathonId !== hackathonId) {
      return { success: false, error: "Judge not in this hackathon" };
    }

    await prisma.judge.update({
      where: { id: judgeId },
      data: { role },
    });

    revalidatePath(`/hackathons/${hackathonId}/judges`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update judge role" };
  }
}

// Create a track with rubric
export async function createTrack(
  hackathonId: string,
  data: {
    name: string;
    description: string;
    prize?: string;
    rubric: {
      name: string;
      criteria: {
        name: string;
        weight: number;
        maxScore: number;
      }[];
    };
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await prisma.track.create({
      data: {
        name: data.name,
        description: data.description,
        prize: data.prize || null,
        hackathonId,
        rubric: {
          create: {
            name: data.rubric.name,
            criteria: {
              create: data.rubric.criteria.map((c) => ({
                name: c.name,
                weight: c.weight,
                maxScore: c.maxScore,
              })),
            },
          },
        },
      },
    });

    revalidatePath(`/hackathons/${hackathonId}/tracks`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create track:", error);
    return { success: false, error: "Failed to create track" };
  }
}

// Update a track
export async function updateTrack(
  hackathonId: string,
  trackId: string,
  data: {
    name?: string;
    description?: string;
    prize?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track || track.hackathonId !== hackathonId) {
      return { success: false, error: "Track not found" };
    }

    await prisma.track.update({
      where: { id: trackId },
      data: {
        name: data.name,
        description: data.description,
        prize: data.prize,
      },
    });

    revalidatePath(`/hackathons/${hackathonId}/tracks`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update track" };
  }
}

// Delete a track
export async function deleteTrack(
  hackathonId: string,
  trackId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    if (!track || track.hackathonId !== hackathonId) {
      return { success: false, error: "Track not found" };
    }

    if (track._count.submissions > 0) {
      return {
        success: false,
        error: `Cannot delete track with ${track._count.submissions} submissions`,
      };
    }

    await prisma.track.delete({ where: { id: trackId } });

    revalidatePath(`/hackathons/${hackathonId}/tracks`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete track" };
  }
}

// Update a single application status
export async function updateApplicationStatus(
  hackathonId: string,
  applicationId: string,
  status: "APPLIED" | "ACCEPTED" | "REJECTED" | "WAITLISTED" | "CHECKED_IN"
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.hackathonId !== hackathonId) {
      return { success: false, error: "Application not found" };
    }

    // Only allow check-in for accepted applications
    if (status === "CHECKED_IN" && application.status !== "ACCEPTED") {
      return { success: false, error: "Can only check in accepted applications" };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    revalidatePath(`/hackathons/${hackathonId}/applications`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update application status" };
  }
}

// Bulk update application status
export async function bulkUpdateApplicationStatus(
  hackathonId: string,
  applicationIds: string[],
  status: "ACCEPTED" | "REJECTED" | "WAITLISTED" | "CHECKED_IN"
): Promise<{ success: boolean; count?: number; error?: string }> {
  await requireAdmin();

  try {
    // For check-in, only update accepted applications
    const whereClause = status === "CHECKED_IN"
      ? { id: { in: applicationIds }, hackathonId, status: ApplicationStatus.ACCEPTED }
      : { id: { in: applicationIds }, hackathonId };

    const result = await prisma.application.updateMany({
      where: whereClause,
      data: { status },
    });

    revalidatePath(`/hackathons/${hackathonId}/applications`);
    return { success: true, count: result.count };
  } catch (error) {
    return { success: false, error: "Failed to update applications" };
  }
}

