import { Suspense } from "react";
import { prisma } from "@repo/database";
import FormClient, { type InitialFormData } from "./FormClient";
import Loading from "./loading";

async function getHackathonTracks(hackathonId: string): Promise<{ id: string; name: string }[]> {
  if (!hackathonId) return [];

  const hackathon = await prisma.hackathon.findFirst({
    where: { id: hackathonId },
    include: {
      tracks: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return hackathon?.tracks ?? [];
}




async function getInitialData(searchParams: {
	teamId?: string | null;
	edit?: string | null;
}): Promise<InitialFormData> {
	const teamId = searchParams?.teamId ?? null;
	const editId = searchParams?.edit ?? null;

	// If editing an existing submission, load draft data if available, otherwise submission data
	if (editId) {
		const submission = await prisma.submission.findUnique({
			where: { id: editId },
			select: {
				id: true,
				teamId: true,
				name: true,
				tagline: true,
				description: true,
				githubUrl: true,
				videoUrl: true,
				images: true,
				tracks: true,
				team: {
					select: {
						drafts: {
							select: {
								id: true,
								name: true,
								tagline: true,
								description: true,
								githubUrl: true,
								videoUrl: true,
								images: true,
								tracks: true,
							},
						},
					},
				},
			},
		});
		
		if (submission) {
			// If there's a draft, use draft data; otherwise use submission data
			const draft = submission.team.drafts;
			if (draft) {
				return {
					submissionId: submission.id,
					draftId: draft.id,
					teamId: submission.teamId,
					name: draft.name || "",
					description: draft.tagline || "",
					mainDescription: draft.description || "",
					github: draft.githubUrl || "",
					youtube: draft.videoUrl || "",
					photos: draft.images || [],
					status: "draft",
					tracks: draft.tracks.map((t) => t.id),
				};
			} else {
				return {
					submissionId: submission.id,
					draftId: null,
					teamId: submission.teamId,
					name: submission.name || "",
					description: submission.tagline || "",
					mainDescription: submission.description || "",
					github: submission.githubUrl || "",
					youtube: submission.videoUrl || "",
					photos: submission.images || [],
					status: "draft",
					tracks: submission.tracks.map((t) => t.id),
				};
			}
		}
	}

	// If no edit ID or starting fresh, check if there's an existing draft for the team
	if (teamId) {
		const draft = await prisma.draft.findUnique({
			where: { teamId },
			select: {
				id: true,
				name: true,
				tagline: true,
				description: true,
				githubUrl: true,
				videoUrl: true,
				images: true,
				tracks: true,
			},
		});

		if (draft) {
			return {
				submissionId: null,
				draftId: draft.id,
				teamId,
				name: draft.name || "",
				description: draft.tagline || "",
				mainDescription: draft.description || "",
				github: draft.githubUrl || "",
				youtube: draft.videoUrl || "",
				photos: draft.images || [],
				status: "draft",
				tracks: draft.tracks.map((t) => t.id),
			};
		}
	}

	return {
		submissionId: null,
		draftId: null,
		teamId,
		name: "",
		description: "",
		mainDescription: "",
		github: "",
		youtube: "",
		photos: [],
		status: "draft",
		tracks: [],
	};
}

export default function DraftForm(props: {
	params: {year: string};
	searchParams: Promise<{ teamId?: string; edit?: string; hackathonId?: string }>;
}){
	const initialDataPromise: Promise<InitialFormData> = props.searchParams.then(
		(sp) => getInitialData(sp),
	);

	const hackathonId = props.params.year;
	const availableTracksPromise: Promise<{ id: string; name: string }[]> = getHackathonTracks(hackathonId);
	return (
		<Suspense fallback={<Loading />}>
			<FormClient initialData={initialDataPromise} availableTracks={availableTracksPromise}/>
		</Suspense>
	);
}