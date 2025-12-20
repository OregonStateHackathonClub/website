"use server";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { headers } from "next/headers";

export async function getPaticipant() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }
  const participant = await prisma.hackathonParticipant.findFirst({
    where: { userId: session.user.id },
  });
  if (!participant) {
    return null;
  }
  return participant;
}

export async function verifySubmissionUserTeam(teamId: string) {
  const participant = await getPaticipant();
  if (!participant) return false;
  const isMember = await prisma.teamMember.findFirst({
    where: {
      teamId: teamId,
      participantId: participant.id,
    },
  });
  if (!isMember) {
    return false;
  }
  return true;
}

export async function verifySubmissionUserDraft(draftId: string) {
  const participant = await getPaticipant();
  if (!participant) return false;

  const draft = await prisma.draft.findFirst({
    where: {
      id: draftId,
      team: {
        members: {
          some: {
            participantId: participant.id,
          },
        },
      },
    },
    select: {
      id: true,
      teamId: true,
    },
  });

  if (!draft) {
    return false;
  }
  return true;
}

export async function verifySubmissionUserSubmission(submissionId: string) {
  const participant = await getPaticipant();
  if (!participant) return false;

  const draft = await prisma.draft.findFirst({
    where: {
      id: submissionId,
      team: {
        members: {
          some: {
            participantId: participant.id,
          },
        },
      },
    },
    select: {
      id: true,
      teamId: true,
    },
  });

  if (!draft) {
    return false;
  }
  return true;
}
