"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@repo/database";

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
