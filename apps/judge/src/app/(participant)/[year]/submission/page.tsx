import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SubmissionForm } from "./form";

export type InitialData = {
  title: string;
  tagline: string;
  description: string;
  videoUrl: string;
  images: string[];
  githubUrl: string;
  deploymentUrl: string;
  otherLinks: string[];
  trackIds: string[];
} | null;

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: hackathonId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/login?callbackURL=/${hackathonId}/submission`);
  }

  const participant = await prisma.hackathonParticipant.findFirst({
    where: { userId: session.user.id, hackathonId },
    select: {
      id: true,
      teamMember: { select: { teamId: true } },
    },
  });

  if (!participant) {
    redirect(`/${hackathonId}`);
  }

  const teamId = participant.teamMember?.teamId ?? null;
  const whereClause = teamId ? { teamId } : { participantId: participant.id };

  const [draft, submission, tracks, hasSubmission] = await Promise.all([
    prisma.draft.findFirst({
      where: whereClause,
      select: {
        title: true,
        tagline: true,
        description: true,
        videoUrl: true,
        images: true,
        githubUrl: true,
        deploymentUrl: true,
        otherLinks: true,
        tracks: { select: { id: true } },
      },
    }),
    prisma.submission.findFirst({
      where: whereClause,
      select: {
        title: true,
        tagline: true,
        description: true,
        videoUrl: true,
        images: true,
        githubUrl: true,
        deploymentUrl: true,
        otherLinks: true,
        tracks: { select: { id: true } },
      },
    }),
    prisma.track.findMany({
      where: { hackathonId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.submission.findFirst({
      where: whereClause,
      select: { id: true },
    }),
  ]);

  const source = draft ?? submission;
  const initialData: InitialData = source
    ? {
        title: source.title ?? "",
        tagline: source.tagline ?? "",
        description: source.description ?? "",
        videoUrl: source.videoUrl ?? "",
        images: source.images ?? [],
        githubUrl: source.githubUrl ?? "",
        deploymentUrl: source.deploymentUrl ?? "",
        otherLinks: source.otherLinks ?? [],
        trackIds: source.tracks.map((t) => t.id),
      }
    : null;

  return (
    <SubmissionForm
      hackathonId={hackathonId}
      initialData={initialData}
      tracks={tracks}
      hasSubmission={!!hasSubmission}
    />
  );
}
