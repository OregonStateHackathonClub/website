"use server";

import { JudgeRole, Prisma, prisma, UserRole } from "@repo/database";
import { auth } from "@repo/auth";
import { headers } from "next/headers";


export async function isSuperadmin(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return false;
  }

  return user.role == UserRole.SUPERADMIN
}

// Return true if user is logged in and a part of the given team. Otherwise, returns false
export async function isTeamMember(teamId: string): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return false;
  }

  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
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
  });

  if (!team) {
    return false;
  }

  return team.members.some(
    (member) => member.participant.user.id === session.user.id,
  );
}

export async function createHackathonParticipant(): Promise<boolean> {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return false;
		}

		const userId = session.user.id;

		const hackathon = await prisma.hackathon.findFirst({
			select: { id: true },
		});

		if (!hackathon) {
			return false;
		}

		await prisma.hackathonParticipant.create({
			data: {
				user: { connect: { id: userId } },
				hackathon: { connect: { id: hackathon.id } },
			},
		});

		return true;
	} catch (error) {
		console.error("Error creating hackathon participant:", error);
		return false;
	}
}

// Return teamId if successful. false if unsucessful
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

// Returns true if successful. Otherwise, return false
// Return false if user is not a member of the given team
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

// Return invite code if successful. Otherwise, return false
// Return false if user is not a member of the given team
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

// Return teamId if successful. Otherwise, return false
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

export async function setSuperadmin(
  superadminValue: boolean,
	userId: string,
): Promise<boolean> {

  if (!isSuperadmin())
    return false

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      role: superadminValue ? UserRole.SUPERADMIN : UserRole.USER
    }
  })

  return false
}


export async function removeUser(
	id: string,
): Promise<boolean> {
	// Require superadmin
	return false;
}

export type UserSearchResult = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hackathonParticipants: {
    id: string;
    hackathonId: string;
    judge: {
      role: JudgeRole;
      id: string;
    } | null;
  }[];
};

export async function userSearch(search: string, hackathonId: string = "", role: UserRole | JudgeRole | null = null): Promise <UserSearchResult[] | false> {
	if (!isSuperadmin()) return false;
  const users = await prisma.user.findMany({
    where: {
      AND: [
        // Filter by hackathon
        ...(hackathonId ? [
          {
            hackathonParticipants: {
              some: {
                hackathonId: hackathonId,
              },
            },
          },
        ] : []),
        // Filter by User/Superadmin
        ...(role && Object.values(UserRole).includes(role as UserRole)
          ? [{ role: role as UserRole }]
          : []),

        // Filter by Judge/Admin
        ...(role && Object.values(JudgeRole).includes(role as JudgeRole)
          ? [{
            hackathonParticipants: {
              some: {
                judge: {
                  is: {
                    role: role as JudgeRole
                  }
                }
              }
            }
          }]
          : []),

        // Search by name, id, email
        {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              id: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      ],
    },
    select: {
      name: true,
      id: true,
      email: true,
      role: true,
      hackathonParticipants: {
        select: {
          id: true,
          hackathonId: true,
          judge: {
            select: {
              role: true,
              id: true
            }
          }
        }
      }
    },
  });

	if (!users) {
		return false;
	}

	return users;
}

export async function getJudgeType(userId: string, hackathonId: string): Promise<JudgeRole | false> {
  if (!isSuperadmin()) return false;

  try {
    const judge = await prisma.judge.findFirst({
      where: {
        hackathon_participant: {
          userId: userId,
          hackathonId: hackathonId
        }
      }
    })

    if (!judge) return false
    
    return judge.role
  } catch {
    return false
  }
}

export async function setJudgeType(judgeId: string, role: JudgeRole) {
  if (!isSuperadmin()) return false;

  try {
    const judge = await prisma.judge.update({
      where: {
        id: judgeId
      },
      data: {
        role: role
      }
    })

    return true
  } catch {
    return false
  }
}

export async function createJudge(participantId: string, role: JudgeRole = JudgeRole.JUDGE) {
  if (!isSuperadmin()) return false;

  try {

    const participant = await prisma.hackathonParticipant.findUnique({
      where: { id: participantId },
      include: { user: true, judge: true }
    })

    if (!participant) return false

    if (participant.judge) {
      return participant.judge;
    }

    const judge = await prisma.judge.create({
      data: {
        name: participant.user.name,
        email: participant.user.email,
        hackathon_participant_id: participant.id,
        role: role
      },
    })

    return judge
  } catch {
    return false
  }
}