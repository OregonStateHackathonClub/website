"use server";

import { auth } from "@repo/auth";
import { prisma, UserRole } from "@repo/database";
import { headers } from "next/headers";

// ============================================================================
// Session Helpers
// ============================================================================

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// ============================================================================
// Role Checks
// ============================================================================

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === UserRole.ADMIN;
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
            select: { userId: true },
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
// Participant Auth (for submissions)
// ============================================================================

export async function getParticipant() {
  const session = await getSession();
  if (!session) return null;

  const participant = await prisma.hackathonParticipant.findFirst({
    where: { userId: session.user.id },
    select: { id: true, hackathonId: true, userId: true },
  });

  return participant;
}

export async function verifySubmissionUserTeam(teamId: string): Promise<boolean> {
  const participant = await getParticipant();
  if (!participant) return false;

  const isMember = await prisma.teamMember.findFirst({
    where: {
      teamId: teamId,
      participantId: participant.id,
    },
    select: { id: true },
  });

  return !!isMember;
}

export async function verifySubmissionUserDraft(draftId: string): Promise<boolean> {
  const participant = await getParticipant();
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
    select: { id: true },
  });

  return !!draft;
}

export async function verifySubmissionUserSubmission(submissionId: string): Promise<boolean> {
  const participant = await getParticipant();
  if (!participant) return false;

  // FIXED: Query Submission model, not Draft
  const submission = await prisma.submission.findFirst({
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
    select: { id: true },
  });

  return !!submission;
}
