"use server";

import { auth } from "@repo/auth";
import { prisma, UserRole } from "@repo/database";
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

  return user.role === UserRole.ADMIN;
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
