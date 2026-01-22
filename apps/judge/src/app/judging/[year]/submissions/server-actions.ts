"use server"

import { prisma } from "@repo/database";

export async function getHackathonSubmissions(hackathonId: string) {
    const submissions = await prisma.submission.findMany({
        where: { hackathonId },
            select: {
                id: true,
                name: true,
                tracks: { select: { id: true, name: true }, }, },
            orderBy: { createdAt: "desc" },
    });
    return submissions;
}

export async function getHackathonJudges(hackathonId: string) {
    const judges = await prisma.judge.findMany({
        where: {
            role: "JUDGE",
            hackathon_participant: {
                hackathonId,
            },
        },
        select: {
            id: true,
            name: true,
        },
    });
    return judges;
}
