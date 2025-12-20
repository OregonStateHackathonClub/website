"use server";

import { prisma, JudgeRole, UserRole } from "@repo/database";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

export async function isAdmin(): Promise<boolean> {
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

  return user.role === UserRole.ADMIN
}

export async function isManager(hackathonId: string): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return false;
  }

  const hackathon_participant = await prisma.hackathonParticipant.findFirst({
    where: {
      userId: session.user.id,
      hackathonId,
    },
    select: {
      judge: {
        select: {
          role: true,
          id: true
        }
      }
    }
  });

  if (!hackathon_participant) {
    return false;
  }

  return hackathon_participant.judge?.role === JudgeRole.MANAGER
}

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