"use cache";

// all queries in this file will be cached for 15 mins (as of writing)
// see docs for up to date info: https://nextjs.org/docs/app/api-reference/directives/use-cache

import { prisma } from "@repo/database";

export const getCurrentHackathonId = async () => {
	const currentHackathon = await prisma.hackathon.findFirst({
		orderBy: {
			id: "desc",
		},
		select: {
			id: true, // We only need the ID for the redirect
		},
		// TODO: query for active hackathon instead
	});

	return currentHackathon?.id;
};
