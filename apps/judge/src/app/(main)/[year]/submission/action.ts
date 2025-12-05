"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@repo/database";

export async function createDraft(
	teamId: string,
	hackathonId: string,
	data: {
		projectTitle?: string;
		miniDescription?: string;
		projectDescription?: string;
		githubLink?: string;
		youtubeLink?: string;
		uploadPhotos?: string[];
		tracks?: { id: string }[];
	},
) {
	try {
		const draft = await prisma.draft.create({
			data: {
				id: randomUUID(),
				teamId,
				hackathonId,
				name: data.projectTitle || "",
				tagline: data.miniDescription || "",
				description: data.projectDescription || "",
				githubUrl: data.githubLink || "",
				videoUrl: data.youtubeLink || "",
				images: Array.isArray(data.uploadPhotos) ? data.uploadPhotos : [],
				tracks: data.tracks ? { connect: data.tracks.map((t) => ({ id: t.id })) } : undefined,
			},
		});
		return { success: true, draft };
	} catch (error) {
		console.error("Draft creation error", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return { success: false, error: `Draft creation failed: ${message}` };
	}
}

export async function updateDraft(
	draftId: string,
	data: {
		projectTitle?: string;
		miniDescription?: string;
		projectDescription?: string;
		githubLink?: string;
		youtubeLink?: string;
		uploadPhotos?: string[];
		tracks?: { id: string }[]
	},
) {
	try {
		const updatedDraft = await prisma.draft.update({
			where: { id: draftId },
			data: {
				name: data.projectTitle || "",
				tagline: data.miniDescription || "",
				description: data.projectDescription || "",
				githubUrl: data.githubLink || "",
				videoUrl: data.youtubeLink || "",
				images: Array.isArray(data.uploadPhotos) ? data.uploadPhotos : [],
				tracks: data.tracks?.length
					? { set: data.tracks.map((t) => ({ id: t.id })) }
					: { set: [] },
			},
		});
		return { success: true, draft: updatedDraft };
	} catch (error) {
		console.error("Draft update error", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return { success: false, error: `Draft update failed: ${message}` };
	}
}

export async function createSubmissionFromDraft(
	draftId: string,
) {
	try {
		const draft = await prisma.draft.findUnique({
			where: { id: draftId },
			include: { tracks: {select: { id: true, name: true },
    },
 },
		});

		if (!draft) {
			return { success: false, error: "Draft not found" };
		}

		// Upsert submission: create if doesn't exist, update if it does
		const submission = await prisma.submission.upsert({
			where: { teamId: draft.teamId },
			create: {
				id: randomUUID(),
				teamId: draft.teamId,
				hackathonId: draft.hackathonId,
				name: draft.name || "",
				tagline: draft.tagline || "",
				description: draft.description || "",
				githubUrl: draft.githubUrl || "",
				videoUrl: draft.videoUrl || "",
				images: draft.images || [],
				tracks: draft.tracks
					? { connect: draft.tracks.map((t) => ({ id: t.id })) }
					: undefined,

			},
			update: {
				name: draft.name || "",
				tagline: draft.tagline || "",
				description: draft.description || "",
				githubUrl: draft.githubUrl || "",
				videoUrl: draft.videoUrl || "",
				images: draft.images || [],
				tracks: draft.tracks
					? { set: draft.tracks.map((t) => ({ id: t.id })) }
					: { set: [] },
			},
		});

		// Ensure team is linked to submission
		await prisma.team.update({
			where: { id: draft.teamId },
			data: {
				submission: {
					connect: { id: submission.id },
				},
			},
		});

		return { success: true, submission };
	} catch (error) {
		console.error("Submission from draft error", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return { success: false, error: `Submission creation failed: ${message}` };
	}
}

export async function updateData(
	submissionId: string,
	data: {
		projectTitle: string;
		miniDescription: string;
		projectDescription: string;
		githubLink: string;
		youtubeLink: string;
		uploadPhotos: string[];
		//status: string;
		teamId?: string | null;
		tracks?: { id: string }[];
	},
) {
	try {
		const updateSubmission = await prisma.submission.update({
			where: { id: submissionId },
			data: {
				name: data.projectTitle,
				tagline: data.miniDescription,
				description: data.projectDescription,
				githubUrl: data.githubLink,
				videoUrl: data.youtubeLink,
				images: Array.isArray(data.uploadPhotos) ? data.uploadPhotos : [],
				tracks: data.tracks ? { connect: data.tracks.map((t) => ({ id: t.id })) } : undefined,
				//status: data.status, This is not in the new database
			},
		});
		// Optionally ensure team is linked if provided and not already pointing
		if (data.teamId) {
			await prisma.team.update({
				where: { id: data.teamId, submission: null },
				data: {
  					submission: {
						connect: { id: submissionId },
					},
				},
			});
		}
		return { success: true, submission: updateSubmission };
	} catch (error) {
		console.error("Update error", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return { success: false, error: `Update failed: ${message}` };
	}
}

// Declare a post function to handle post requests
export async function sendData(data: {
	projectTitle: string;
	miniDescription: string;
	projectDescription: string;
	githubLink: string;
	youtubeLink: string;
	uploadPhotos: string[];
	status: string;
	teamId?: string | null;
	tracks?: { id: string }[];
}) {
	// Read JSON data from the submission form
	try {
		// Determine hackathonId from the team when possible
		let hackathonId = "2026";
		if (data.teamId) {
			const team = await prisma.team.findUnique({
				where: { id: data.teamId },
				select: { hackathonId: true },
			});
			if (team?.hackathonId) {
				hackathonId = team.hackathonId;
			}
		}
		const submission = await prisma.submission.create({
			data: {
				id: randomUUID(),
				//status: data.status,
				name: data.projectTitle,
				tagline: data.miniDescription,
				description: data.projectDescription,
				githubUrl: data.githubLink,
				videoUrl: data.youtubeLink,
				images: Array.isArray(data.uploadPhotos) ? data.uploadPhotos : [],
				tracks: data.tracks ? { connect: data.tracks.map((t) => ({ id: t.id })) } : undefined,
				//comments: "",
				//rubric: {},
				//score: 0,
				hackathonId,
				teamId: data.teamId!
			},
		});
		console.log("Created submission", submission);
		if (data.teamId) {
			await prisma.team.update({
				where: { id: data.teamId },
				data: {
      				submission: {
        			connect: { id: submission.id },
     				},
    			},
			});
		}
		// Return if the submission is successful
		return { success: true, submission };
	} catch (error) {
		// Catch an error if anything goes wrong
		console.error("Submission error", error);
		const message = error instanceof Error ? error.message : "Unknown error";
		return { success: false, error: `Submission failed: ${message}` };
	}
}
