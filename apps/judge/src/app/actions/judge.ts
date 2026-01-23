"use server";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { isAdmin } from "./auth";

export type JudgeResult = {
  id: string;
} | null;

export async function getJudge(
  hackathonId: string,
  email?: string,
): Promise<JudgeResult | false> {
  if (!(await isAdmin())) return false;

  try {
    // If no email provided, use current user's email
    let judgeEmail = email;
    if (!judgeEmail) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user?.email) return false;
      judgeEmail = session.user.email;
    }

    const judge = await prisma.judge.findUnique({
      where: {
        hackathonId_email: { hackathonId, email: judgeEmail },
      },
    });

    if (!judge) return false;

    return judge;
  } catch {
    return false;
  }
}

export async function createJudge(
  hackathonId: string,
  email: string,
  name: string,
) {
  if (!(await isAdmin())) return false;

  try {
    // Check if judge already exists
    const existingJudge = await prisma.judge.findUnique({
      where: { hackathonId_email: { hackathonId, email } },
    });

    if (existingJudge) {
      return existingJudge;
    }

    const judge = await prisma.judge.create({
      data: {
        hackathonId,
        email,
        name,
      },
    });

    return judge;
  } catch {
    return false;
  }
}

export async function removeJudge(judgeId: string) {
  try {
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
    });

    if (!judge) return false;

    if (!(await isAdmin())) return false;

    await prisma.judge.delete({
      where: {
        id: judgeId,
      },
    });

    return true;
  } catch {
    return false;
  }
}
