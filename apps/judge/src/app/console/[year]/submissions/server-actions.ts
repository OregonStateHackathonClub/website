"use server"

import { prisma } from "@repo/database"; 
import { headers } from "next/headers";
import { auth } from "@repo/auth";

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

export async function assignJudge({
    judgeId,
    submissionId,
}: {
    judgeId: string;
    submissionId: string;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, error: "Unauthorized session" };

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized user" };
    }

    try {
        const assignment = await prisma.judgeAssignment.upsert({
            where: { submissionId },
            update: { judgeId },
            create: { judgeId, submissionId },
        });

        return { success: true, data: assignment };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to assign judge." };
    }
}
