"use server";

import { ApplicationStatus, prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "./auth";
import { sendBulkStatusEmails, sendStatusEmail } from "./status-emails";

export async function createHackathon(data: {
  name: string;
  description?: string;
  startsAt?: Date | null;
  endsAt?: Date | null;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  await requireAdmin();

  if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) {
    return { success: false, error: "End time must be after start time" };
  }

  try {
    const hackathon = await prisma.hackathon.create({
      data: {
        name: data.name,
        description: data.description || null,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
      },
    });

    revalidatePath("/hackathons");
    return { success: true, id: hackathon.id };
  } catch {
    return { success: false, error: "Failed to create hackathon" };
  }
}

export async function updateHackathon(
  id: string,
  data: {
    name?: string;
    description?: string;
    startsAt?: Date | null;
    endsAt?: Date | null;
  },
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) {
    return { success: false, error: "End time must be after start time" };
  }

  try {
    await prisma.hackathon.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      },
    });

    revalidatePath(`/hackathons/${id}`);
    revalidatePath("/hackathons");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update hackathon" };
  }
}

export async function setWinnersReleased(
  id: string,
  released: boolean,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await prisma.hackathon.update({
      where: { id },
      data: { winnersReleasedAt: released ? new Date() : null },
    });

    revalidatePath(`/hackathons/${id}`);
    revalidatePath(`/hackathons`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update winner release" };
  }
}

export async function deleteHackathon(
  id: string,
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
  } catch {
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
  const participantMap = new Map(participants.map((p) => [p.userId, p]));

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
    },
    orderBy: { createdAt: "desc" },
  });
}

// Get hackathon judges
export async function getHackathonJudges(hackathonId: string) {
  await requireAdmin();

  return prisma.judge.findMany({
    where: { hackathonId },
    include: {
      trackAssignments: {
        include: { track: true },
      },
      _count: {
        select: {
          roundAssignments: true,
        },
      },
    },
    orderBy: { name: "asc" },
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

// Add a judge by email
export async function addJudgeByEmail(
  hackathonId: string,
  email: string,
  name: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    // Check if judge with this email already exists for this hackathon
    const existingJudge = await prisma.judge.findUnique({
      where: { hackathonId_email: { hackathonId, email } },
    });

    if (existingJudge) {
      return {
        success: false,
        error: "A judge with this email already exists for this hackathon",
      };
    }

    await prisma.judge.create({
      data: {
        hackathonId,
        email,
        name,
      },
    });

    revalidatePath(`/hackathons/${hackathonId}/judges`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add judge" };
  }
}

// Remove a judge
export async function removeJudge(
  hackathonId: string,
  judgeId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
    });

    if (!judge) {
      return { success: false, error: "Judge not found" };
    }

    if (judge.hackathonId !== hackathonId) {
      return { success: false, error: "Judge not in this hackathon" };
    }

    // Check if judge has any completed assignments (which would have scores)
    const completedAssignments = await prisma.roundJudgeAssignment.count({
      where: {
        judgeId,
        completed: true,
      },
    });

    if (completedAssignments > 0) {
      return {
        success: false,
        error: `Cannot remove judge with ${completedAssignments} completed assignments`,
      };
    }

    await prisma.judge.delete({ where: { id: judgeId } });

    revalidatePath(`/hackathons/${hackathonId}/judges`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove judge" };
  }
}

// Create a track with rubric
export async function createTrack(
  hackathonId: string,
  data: {
    name: string;
    description: string;
    prize?: string;
    isDefault?: boolean;
    rubric: {
      name: string;
      criteria: {
        name: string;
        weight: number;
        maxScore: number;
      }[];
    };
  },
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        // Only one default per hackathon — clear any existing default first.
        await tx.track.updateMany({
          where: { hackathonId, isDefault: true },
          data: { isDefault: false },
        });
      }
      await tx.track.create({
        data: {
          name: data.name,
          description: data.description,
          prize: data.prize || null,
          isDefault: data.isDefault ?? false,
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
    });

    revalidatePath(`/hackathons/${hackathonId}/tracks`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create track:", error);
    return { success: false, error: "Failed to create track" };
  }
}

// Update a track with rubric
export async function updateTrack(
  hackathonId: string,
  trackId: string,
  data: {
    name?: string;
    description?: string;
    prize?: string | null;
    isDefault?: boolean;
    rubric?: {
      name: string;
      criteria: {
        id?: string; // existing criterion id, undefined for new
        name: string;
        weight: number;
        maxScore: number;
      }[];
    };
  },
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { rubric: { include: { criteria: true } } },
    });

    if (!track || track.hackathonId !== hackathonId) {
      return { success: false, error: "Track not found" };
    }

    // If promoting this track to default, demote any existing default first.
    if (data.isDefault === true) {
      await prisma.track.updateMany({
        where: { hackathonId, isDefault: true, id: { not: trackId } },
        data: { isDefault: false },
      });
    }

    // Update track basic info
    await prisma.track.update({
      where: { id: trackId },
      data: {
        name: data.name,
        description: data.description,
        prize: data.prize,
        isDefault: data.isDefault,
      },
    });

    // Update rubric if provided
    if (data.rubric) {
      if (track.rubric) {
        // Update existing rubric
        await prisma.rubric.update({
          where: { id: track.rubric.id },
          data: { name: data.rubric.name },
        });

        // Get existing criteria IDs
        const existingIds = track.rubric.criteria.map((c) => c.id);
        const newCriteriaIds = data.rubric.criteria
          .filter((c) => c.id)
          .map((c) => c.id!);

        // Delete removed criteria
        const toDelete = existingIds.filter(
          (id) => !newCriteriaIds.includes(id),
        );
        if (toDelete.length > 0) {
          await prisma.rubricCriteria.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        // Update existing and create new criteria
        for (const criterion of data.rubric.criteria) {
          if (criterion.id) {
            // Update existing
            await prisma.rubricCriteria.update({
              where: { id: criterion.id },
              data: {
                name: criterion.name,
                weight: criterion.weight,
                maxScore: criterion.maxScore,
              },
            });
          } else {
            // Create new
            await prisma.rubricCriteria.create({
              data: {
                rubricId: track.rubric.id,
                name: criterion.name,
                weight: criterion.weight,
                maxScore: criterion.maxScore,
              },
            });
          }
        }
      } else {
        // Create new rubric for track
        await prisma.rubric.create({
          data: {
            trackId,
            name: data.rubric.name,
            criteria: {
              create: data.rubric.criteria.map((c) => ({
                name: c.name,
                weight: c.weight,
                maxScore: c.maxScore,
              })),
            },
          },
        });
      }
    }

    revalidatePath(`/hackathons/${hackathonId}/tracks`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update track:", error);
    return { success: false, error: "Failed to update track" };
  }
}

// Delete a track
export async function deleteTrack(
  hackathonId: string,
  trackId: string,
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
  } catch {
    return { success: false, error: "Failed to delete track" };
  }
}

// Update a single application status
export async function updateApplicationStatus(
  hackathonId: string,
  applicationId: string,
  status: "APPLIED" | "ACCEPTED" | "REJECTED" | "WAITLISTED" | "CHECKED_IN",
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        name: true,
        status: true,
        hackathonId: true,
        user: { select: { email: true } },
        hackathon: { select: { name: true } },
      },
    });

    if (!application || application.hackathonId !== hackathonId) {
      return { success: false, error: "Application not found" };
    }

    // Only allow check-in for accepted applications
    if (status === "CHECKED_IN" && application.status !== "ACCEPTED") {
      return {
        success: false,
        error: "Can only check in accepted applications",
      };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    if (status === "ACCEPTED" || status === "REJECTED" || status === "WAITLISTED") {
      after(
        sendStatusEmail(
          application.user.email,
          application.name,
          application.hackathon.name,
          status,
        ),
      );
    }

    revalidatePath(`/hackathons/${hackathonId}/applications`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update application status" };
  }
}

// Bulk update application status
export async function bulkUpdateApplicationStatus(
  hackathonId: string,
  applicationIds: string[],
  status: "ACCEPTED" | "REJECTED" | "WAITLISTED" | "CHECKED_IN",
): Promise<{ success: boolean; count?: number; error?: string }> {
  await requireAdmin();

  try {
    // For check-in, only update accepted applications
    const whereClause =
      status === "CHECKED_IN"
        ? {
            id: { in: applicationIds },
            hackathonId,
            status: ApplicationStatus.ACCEPTED,
          }
        : { id: { in: applicationIds }, hackathonId };

    // Fetch applicant info before updating so we can send emails
    const shouldEmail =
      status === "ACCEPTED" || status === "REJECTED" || status === "WAITLISTED";

    const applications = shouldEmail
      ? await prisma.application.findMany({
          where: whereClause,
          select: {
            name: true,
            user: { select: { email: true } },
            hackathon: { select: { name: true } },
          },
        })
      : [];

    const result = await prisma.application.updateMany({
      where: whereClause,
      data: { status },
    });

    if (shouldEmail && applications.length > 0) {
      const hackathonName = applications[0].hackathon.name;
      const recipients = applications.map((app) => ({
        email: app.user.email,
        name: app.name,
      }));
      after(sendBulkStatusEmails(recipients, hackathonName, status));
    }

    revalidatePath(`/hackathons/${hackathonId}/applications`);
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: "Failed to update applications" };
  }
}
