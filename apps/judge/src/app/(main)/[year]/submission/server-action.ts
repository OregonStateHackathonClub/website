"use server";
import { createDraft, createSubmissionFromDraft, sendData, updateData, updateDraft } from "./action";
import { actionClient } from "./safeAction";
import { formSchema } from "./schema";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/database";

// Action for saving drafts (used during form editing)
export const saveDraftAction = actionClient
	.inputSchema(formSchema)
	.action(async ({ parsedInput }) => {
		const session = await auth.api.getSession({ headers: await headers() });
		
		if (!session) {
			return { success: false, error: "Unauthorized" };
		}
		try {
			const mapData = {
				projectTitle: parsedInput.name,
				miniDescription: parsedInput.description,
				projectDescription: parsedInput.mainDescription || "",
				githubLink: parsedInput.github || "",
				youtubeLink: parsedInput.youtube || "",
				uploadPhotos: parsedInput.photos || [],
				tracks: parsedInput.tracks?.map((id) => ({ id })) || [],
			};

			if (!parsedInput.teamId) {
				return { success: false, error: "Team ID is required" };
			}

			const isMember = await prisma.teamMember.findFirst({
				where: {
					teamId: parsedInput.teamId,
					participantId: session.user.id,
				},
			});

			if (!isMember) {
				return { success: false, error: "Unauthorized" };
			}

			let result;
			if (parsedInput.draftId) {
				// Update existing draft
				const draft = await prisma.draft.findUnique({
					where: { id: parsedInput.draftId },
					select: { teamId: true },
				});

				if (!draft || draft.teamId !== parsedInput.teamId) {
					return { success: false, error: "Unauthorized" };
				}

				result = await updateDraft(parsedInput.draftId, mapData);
			} else {
				// Create new draft - we need to get hackathonId from team
				const { prisma } = await import("@repo/database");
				const team = await prisma.team.findUnique({
					where: { id: parsedInput.teamId },
					select: { hackathonId: true },
				});
				
				if (!team) {
					return { success: false, error: "Team not found" };
				}

				result = await createDraft(parsedInput.teamId, team.hackathonId, mapData);
			}

			if (!result.success) {
				return { success: false, error: result.error };
			}

			return { success: true, draft: result };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "An unknown error occurred";
			return { success: false, error: message };
		}
	});

// Action for final submission (creates submission from draft)
export const submitProjectAction = actionClient
	.inputSchema(formSchema)
	.action(async ({ parsedInput }) => {
		try {
			const session = await auth.api.getSession({ headers: await headers() });
		
			if (!session) {
				return { success: false, error: "Unauthorized" };
			}

			if (!parsedInput.teamId) {
				return { success: false, error: "Team ID is required" };
			}

			const isMember = await prisma.teamMember.findFirst({
				where: {
					teamId: parsedInput.teamId,
					participantId: session.user.id,
				},
			});

			if (!isMember) {
				return { success: false, error: "Unauthorized" };
			}

			if (!parsedInput.draftId) {
				return { success: false, error: "Draft ID is required for submission" };
			}

			const draft = await prisma.draft.findUnique({
				where: { id: parsedInput.draftId },
				select: { teamId: true },
			});

			if (!draft || draft.teamId !== parsedInput.teamId) {
				return { success: false, error: "Unauthorized" };
			}

			const result = await createSubmissionFromDraft(parsedInput.draftId);

			if (!result.success) {
				return { success: false, error: result.error };
			}

			return { success: true, submission: result };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "An unknown error occurred";
			return { success: false, error: message };
		}
	});

// Legacy action for backward compatibility (now only used for direct submission updates)
export const serverAction = actionClient
	.inputSchema(formSchema)
	.action(async ({ parsedInput }) => {
		try {

			const session = await auth.api.getSession({ headers: await headers() });
		
			if (!session) {
				return { success: false, error: "Unauthorized" };
			}

			if (!parsedInput.teamId) {
				return { success: false, error: "Team ID is required" };
			}

			const isMember = await prisma.teamMember.findFirst({
				where: {
					teamId: parsedInput.teamId,
					participantId: session.user.id,
				},
			});

			if (!isMember) {
				return { success: false, error: "Unauthorized" };
			}

			const mapData: {
				projectTitle: string;
				miniDescription: string;
				projectDescription: string;
				githubLink: string;
				youtubeLink: string;
				uploadPhotos: string[];
				status: string;
				teamId: string | null;
				tracks: { id: string }[];
			} = {
				projectTitle: parsedInput.name,
				miniDescription: parsedInput.description,
				projectDescription: parsedInput.mainDescription || "",
				githubLink: parsedInput.github || "",
				youtubeLink: parsedInput.youtube || "",
				uploadPhotos: parsedInput.photos || [],
				status: parsedInput.status || "draft",
				teamId: parsedInput.teamId || null,
				tracks: parsedInput.tracks?.map((id) => ({ id })) || [],
			};
			const result = parsedInput.submissionId
				? await updateData(parsedInput.submissionId, mapData)
				: await sendData(mapData);

			if (!result.success) {
				return { success: false, error: result.error };
			}

			return { success: true, submission: result };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "An unknown error occurred";
			return { success: false, error: message };
		}
	});
