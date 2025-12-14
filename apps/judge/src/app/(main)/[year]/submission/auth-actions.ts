"use server"
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/database";

export async function verifySubmissionUserTeam(teamId: string){
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return false;
    }
    const participant = await prisma.hackathonParticipant.findFirst({
        where: { userId: session.user.id },
    });
    if (!participant) {
        return false;
    }
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

export async function verifySubmissionUserDraft(draftId: string){
    const session = await auth.api.getSession({ headers: await headers() });
		
	if (!session) {
		return false;
	}

	const participant = await prisma.hackathonParticipant.findFirst({
		where: { userId: session.user.id },
	});

	if (!participant) {
		return { success: false, error: "Not a participant" };
	}

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

export async function verifySubmissionUserSubmission(submissionId: string){
    const session = await auth.api.getSession({ headers: await headers() });
		
	if (!session) {
		return false;
	}

	const participant = await prisma.hackathonParticipant.findFirst({
		where: { userId: session.user.id },
	});

	if (!participant) {
		return { success: false, error: "Not a participant" };
	}

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