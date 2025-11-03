"use server";
import { sendData, updateData } from "./action";
import { actionClient } from "./safeAction";
import { formSchema } from "./schema";

export const serverAction = actionClient
	.inputSchema(formSchema)
	.action(async ({ parsedInput }) => {
		try {
			const mapData: {
				projectTitle: string;
				miniDescription: string;
				projectDescription: string;
				githubLink: string;
				youtubeLink: string;
				uploadPhotos: string[];
				status: string;
				teamId: string | null;
			} = {
				projectTitle: parsedInput.name,
				miniDescription: parsedInput.description,
				projectDescription: parsedInput.mainDescription || "",
				githubLink: parsedInput.github || "",
				youtubeLink: parsedInput.youtube || "",
				uploadPhotos: parsedInput.photos || [],
				status: parsedInput.status || "draft",
				teamId: parsedInput.teamId || null,
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
