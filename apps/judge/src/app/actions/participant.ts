"use server";

import { auth } from "@repo/auth";
import { type Prisma, prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// ============================================================================
// Hackathon Queries
// ============================================================================

export async function getCurrentHackathonId() {
  const currentHackathon = await prisma.hackathon.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });
  return currentHackathon?.id;
}

// ============================================================================
// Auth Helpers
// ============================================================================

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { success: false as const, error: "Not authenticated" };
  }
  return { success: true as const, session };
}

export async function isTeamMember(teamId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      members: {
        select: {
          participant: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!team) return false;

  return team.members.some(
    (member) => member.participant.userId === session.user.id,
  );
}

// ============================================================================
// Team Actions
// ============================================================================

export async function createTeam(
  teamData: Omit<Prisma.TeamCreateInput, "creatorId">,
  addSelf: boolean = false,
): Promise<
  { success: true; teamId: string } | { success: false; error: string }
> {
  const authResult = await requireSession();
  if (!authResult.success) return authResult;
  const { session } = authResult;

  try {
    const userId = session.user.id;

    // Check if user already has a team in this hackathon
    const existingTeam = await prisma.team.findFirst({
      where: {
        members: {
          some: {
            participant: {
              userId: userId,
            },
          },
        },
      },
      select: { id: true },
    });

    if (existingTeam) {
      return {
        success: false,
        error: "You already have a team in this hackathon",
      };
    }

    const newTeam = await prisma.team.create({
      data: {
        ...teamData,
        creatorId: userId,
      },
      select: { id: true, hackathonId: true },
    });

    if (addSelf) {
      // Find or create HackathonParticipant
      let participant = await prisma.hackathonParticipant.findUnique({
        where: {
          userId_hackathonId: {
            userId: userId,
            hackathonId: newTeam.hackathonId,
          },
        },
        select: { id: true },
      });

      if (!participant) {
        participant = await prisma.hackathonParticipant.create({
          data: {
            userId: userId,
            hackathonId: newTeam.hackathonId,
          },
          select: { id: true },
        });
      }

      await prisma.teamMember.create({
        data: {
          participantId: participant.id,
          teamId: newTeam.id,
        },
      });
    }

    revalidatePath("/");
    return { success: true, teamId: newTeam.id };
  } catch (error) {
    console.error("Team creation error:", error);
    return { success: false, error: "Failed to create team" };
  }
}

export async function updateTeam(
  teamId: string,
  teamData: Prisma.TeamUpdateInput,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!(await isTeamMember(teamId))) {
    return { success: false, error: "Not a team member" };
  }

  try {
    await prisma.team.update({
      data: teamData,
      where: { id: teamId },
    });

    revalidatePath(`/`);
    return { success: true };
  } catch (error) {
    console.error("Team update error:", error);
    return { success: false, error: "Failed to update team" };
  }
}

export async function joinTeam(
  inviteCode: string,
): Promise<
  { success: true; teamId: string } | { success: false; error: string }
> {
  const authResult = await requireSession();
  if (!authResult.success) return authResult;
  const { session } = authResult;

  const team = await prisma.team.findFirst({
    where: {
      invites: {
        some: {
          code: inviteCode,
        },
      },
    },
    select: {
      id: true,
      hackathonId: true,
      members: { select: { id: true } },
    },
  });

  if (!team) {
    return { success: false, error: "Invalid invite code" };
  }

  if (team.members.length >= 4) {
    return { success: false, error: "Team is full" };
  }

  try {
    // Find or create HackathonParticipant
    let participant = await prisma.hackathonParticipant.findUnique({
      where: {
        userId_hackathonId: {
          userId: session.user.id,
          hackathonId: team.hackathonId,
        },
      },
      select: { id: true },
    });

    if (!participant) {
      participant = await prisma.hackathonParticipant.create({
        data: {
          userId: session.user.id,
          hackathonId: team.hackathonId,
        },
        select: { id: true },
      });
    }

    await prisma.teamMember.create({
      data: {
        participantId: participant.id,
        teamId: team.id,
      },
    });

    revalidatePath("/");
    return { success: true, teamId: team.id };
  } catch (error) {
    console.error("Join team error:", error);
    return { success: false, error: "Failed to join team" };
  }
}

export async function getTeamsLookingForMembers(hackathonId: string) {
  return prisma.team.findMany({
    where: { hackathonId, lookingForTeammates: true },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { members: true } },
    },
  });
}

export async function getTeamInfo(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      description: true,
      contact: true,
      lookingForTeammates: true,
      creatorId: true,
      members: {
        select: {
          id: true,
          participant: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return team;
}

export async function removeUserFromTeam(
  teamMemberId: string,
  teamId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const authResult = await requireSession();
  if (!authResult.success) return authResult;
  const { session } = authResult;

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, creatorId: true, hackathonId: true },
    });

    const targetTeamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      select: { id: true, participant: { select: { id: true } } },
    });

    const participant = await prisma.hackathonParticipant.findFirst({
      where: {
        userId: session.user.id,
        hackathonId: team?.hackathonId,
      },
      select: { id: true },
    });

    if (!team || !targetTeamMember || !participant) {
      return { success: false, error: "Team or member not found" };
    }

    // Only team creator or the member themselves can remove
    const isCreator = team.creatorId === participant.id;
    const isSelf = targetTeamMember.participant.id === participant.id;

    if (!isCreator && !isSelf) {
      return { success: false, error: "Not authorized to remove this member" };
    }

    await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          delete: { id: targetTeamMember.id },
        },
      },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      select: { members: { select: { id: true } } },
    });

    if (!updatedTeam) {
      return { success: false, error: "Team not found after update" };
    }

    // Delete team if no members left
    if (updatedTeam.members.length === 0) {
      await prisma.invite.deleteMany({
        where: { teamId: teamId },
      });

      await prisma.team.delete({
        where: { id: teamId },
      });
    } else if (team.creatorId === targetTeamMember.id) {
      // Replace leader if necessary
      await prisma.team.update({
        data: {
          creatorId: updatedTeam.members[0].id,
        },
        where: { id: teamId },
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Remove user error:", error);
    return { success: false, error: "Failed to remove user from team" };
  }
}

export async function getInviteCode(
  teamId: string,
): Promise<
  { success: true; code: string } | { success: false; error: string }
> {
  if (!(await isTeamMember(teamId))) {
    return { success: false, error: "Not a team member" };
  }

  let invite = await prisma.invite.findFirst({
    where: { teamId: teamId },
    select: { code: true },
  });

  if (!invite) {
    invite = await prisma.invite.create({
      data: { teamId: teamId },
      select: { code: true },
    });
  }

  return { success: true, code: invite.code };
}

export async function getTeamIdFromInvite(
  inviteCode: string,
): Promise<
  { success: true; teamId: string } | { success: false; error: string }
> {
  const team = await prisma.team.findFirst({
    where: {
      invites: {
        some: {
          code: inviteCode,
        },
      },
    },
    select: { id: true },
  });

  if (!team) {
    return { success: false, error: "Invalid invite code" };
  }

  return { success: true, teamId: team.id };
}

// ============================================================================
// Likes
// ============================================================================

export async function toggleLike(
  hackathonId: string,
  submissionId: string,
): Promise<
  { success: true; liked: boolean } | { success: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const participant = await prisma.hackathonParticipant.findFirst({
    where: { userId: session.user.id, hackathonId },
    select: { id: true },
  });

  if (!participant) {
    return { success: false, error: "Not a participant" };
  }

  const existing = await prisma.like.findUnique({
    where: {
      submissionId_participantId: {
        submissionId,
        participantId: participant.id,
      },
    },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    revalidatePath(`/${hackathonId}`);
    return { success: true, liked: false };
  }

  await prisma.like.create({
    data: {
      submissionId,
      participantId: participant.id,
    },
  });

  revalidatePath(`/${hackathonId}`);
  return { success: true, liked: true };
}

export async function resetInviteCode(
  inviteCode: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const result = await getTeamIdFromInvite(inviteCode);
  if (!result.success) return result;

  if (!(await isTeamMember(result.teamId))) {
    return { success: false, error: "Not a team member" };
  }

  try {
    await prisma.invite.delete({
      where: { code: inviteCode },
    });
    return { success: true };
  } catch (error) {
    console.error("Reset invite error:", error);
    return { success: false, error: "Failed to reset invite code" };
  }
}
