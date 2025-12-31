"use server"
import { JudgeRole, prisma } from "@repo/database";
import { isAdmin, isManager } from "./auth";

export type JudgeResult = {
  role: JudgeRole;
  id: string;
} | null;

export async function getJudge(userId: string, hackathonId: string): Promise<JudgeResult | false> {
  if (!isAdmin()) return false;

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
    
    return judge
  } catch {
    return false
  }
}

export async function getJudgeType(userId: string, hackathonId: string): Promise<JudgeRole | false> {
  if (!isAdmin()) return false;

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
  if (!isAdmin()) return false;

  try {
    const judge = await prisma.judge.update({
      where: {
        id: judgeId
      },
      data: {
        role: role
      }
    })

    return !!judge
  } catch {
    return false
  }
}

export async function createJudge(participantId: string, role: JudgeRole = JudgeRole.JUDGE) {
  if (!isAdmin()) return false;

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

export async function removeJudge(judgeId: string) {
  try {
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
      include: {
        hackathon_participant: true
      }
    })

    if (!judge) return false

    if (!(isManager(judge?.hackathon_participant.hackathonId) || isAdmin())) return false;

    await prisma.judge.delete({
      where: {
        id: judgeId
      }
    })

    return true
  } catch {
    return false
  }
}