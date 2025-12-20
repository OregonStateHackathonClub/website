import { prisma, Prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { isTeamMember } from "./auth";

export async function createTeam(
  teamData: Omit<Prisma.TeamCreateInput, "creatorId">,
  addSelf: boolean = false,
): Promise<string | false> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return false;
    }

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
    });

    if (existingTeam) {
      return false;
    }

    const newTeam = await prisma.team.create({
      data: {
        ...teamData,
        creatorId: userId,
      },
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
      });

      if (!participant) {
        participant = await prisma.hackathonParticipant.create({
          data: {
            userId: userId,
            hackathonId: newTeam.hackathonId,
          },
        });
      }

      await prisma.teamMember.create({
        data: {
          participantId: participant.id,
          teamId: newTeam.id,
        },
      });
    }

    return newTeam.id;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Return true if successful. Otherwise, return false
// Return false if user is not a member of the given team
export async function updateTeam(
  teamId: string,
  teamData: Prisma.TeamUpdateInput,
): Promise<boolean> {
  try {
    if (!(await isTeamMember(teamId))) {
      return false;
    }

    await prisma.team.update({
      data: teamData,
      where: { id: teamId },
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Return teamId if successful. Otherwise, return false
// Return false if user is not logged in
export async function joinTeam(inviteCode: string): Promise<string | false> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return false;
  }

  const team = await prisma.team.findFirst({
    where: {
      invites: {
        some: {
          code: inviteCode,
        },
      },
    },
    include: {
      members: true,
    },
  });

  if (!team) {
    return false;
  }
  if (team.members.length >= 4) {
    return false;
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
    });

    if (!participant) {
      participant = await prisma.hackathonParticipant.create({
        data: {
          userId: session.user.id,
          hackathonId: team.hackathonId,
        },
      });
    }

    const connection = await prisma.teamMember.create({
      data: {
        participantId: participant.id,
        teamId: team.id,
      },
    });

    if (connection) {
      return team.id;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Return partial team object if successful. Otherwise, return null
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
                },
              },
            },
          },
        },
      },
    },
  });

  if (!team) {
    return null;
  }

  return team;
}

export async function removeUserFromTeam(
    teamMemberId: string,
    teamId: string,
): Promise<boolean> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        
        const team = await prisma.team.findUnique({
            where: {
                id: teamId,
            }
        });
        
        const target_teamMember = await prisma.teamMember.findUnique({
            where: { id: teamMemberId },
            include: { participant: true }
        });

        const participant = await prisma.hackathonParticipant.findFirst({
            where: {
                userId: session?.user.id,
                hackathonId: team?.hackathonId
            },
        });

        if ( !team || !target_teamMember || !participant ||
            (team.creatorId !== participant.id &&
                target_teamMember?.participant.id !== participant.id)
        ) {
            // Cope
            console.error("Failed to remove user from team")
            return false;
        }
        await prisma.team.update({
            where: { id: teamId },
            data: {
                members: {
                    delete: { id: target_teamMember.id },
                },
            },
        });

        const newTeam = await prisma.team.findUnique({
            where: {
                id: teamId,
            },
            select: {
                members: true,
            },
        });

        if (newTeam == null) {
            // Cry like a baby
            return false;
        }

        // Delete team if no members left
        if (newTeam.members.length === 0) {
            await prisma.invite.deleteMany({
                where: {
                    teamId: teamId,
                },
            });

            await prisma.team.delete({
                where: {
                    id: teamId,
                },
            });
            // Replace leader if necessary
        }
        else if (team.creatorId === target_teamMember.id) {
            await prisma.team.update({
                data: {
                    creatorId: newTeam.members[0].id,
                },
                where: {
                    id: teamId,
                },
            });
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getInviteCode(teamId: string): Promise<string | false> {
  if (!(await isTeamMember(teamId))) {
    return false;
  }

  let invite = await prisma.invite.findFirst({
    where: {
      teamId: teamId,
    },
  });

  if (!invite) {
    invite = await prisma.invite.create({
      data: {
        teamId: teamId,
      },
    });
  }
  return invite.code;
}

export async function getTeamIdFromInvite(
  inviteCode: string,
): Promise<string | false> {
  const team = await prisma.team.findFirst({
    where: {
      invites: {
        some: {
          code: inviteCode,
        },
      },
    },
  });

  if (team) {
    return team.id;
  }

  return false;
}

export async function resetInviteCode(inviteCode: string): Promise<boolean> {
  const teamId = await getTeamIdFromInvite(inviteCode);

  if (!teamId) return false;
  if (!(await isTeamMember(teamId))) return false;

  try {
    await prisma.invite.delete({
      where: {
        code: inviteCode,
      },
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}