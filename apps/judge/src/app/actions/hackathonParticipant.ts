"use server"
import { prisma } from "@repo/database";
import { isAdmin, isManager } from "./auth";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

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

export async function removeHackathonParticipant(id: string) {
  try {
    const hackathon_participant = await prisma.hackathonParticipant.findUnique({ where: { id } })

    if (!hackathon_participant) return false

    if (!(isManager(hackathon_participant.hackathonId) || isAdmin())) return false;

    await prisma.hackathonParticipant.delete({ where: { id } })

    return true
  } catch {
    return false
  }
}