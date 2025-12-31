"use server"
import { prisma } from "@repo/database";
import { isAdmin, isManager } from "./auth";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

// TODO: TEMPORARY - FIND HACKATHON IN A BETTER WAY
async function findHackathonId() {
  const hackathon = await prisma.hackathon.findFirst({
    select: { id: true },
  });
  return hackathon?.id
}

export type HackathonParticipant = {
    id: string;
    userId: string;
    hackathonId: string;
    joinedAt: Date;
}

export async function createHackathonParticipant(userId: string = "", hackathonId: string = ""): Promise<HackathonParticipant | false> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return false;
    }

    if (hackathonId === "") {
      const foundHackathon = await findHackathonId()
      if (!foundHackathon) return false
      hackathonId = foundHackathon
    }

    if (userId === "") {
      userId = session.user.id;
    } else if (!(isManager(hackathonId) || isAdmin())) {
      return false
    }

    const hackathonParticipant = await prisma.hackathonParticipant.create({
      data: {
        user: { connect: { id: userId } },
        hackathon: { connect: { id: hackathonId } },
      },
    });

    return hackathonParticipant;
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