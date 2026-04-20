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
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = await params;

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

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    select: { startsAt: true, endsAt: true },
  });
  const now = Date.now();
  const notYetOpen =
    hackathon?.startsAt && now < hackathon.startsAt.getTime();
  const closed = hackathon?.endsAt && now >= hackathon.endsAt.getTime();

  if (notYetOpen || closed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-xl font-medium text-white">
          {closed ? "Submissions are closed" : "Submissions are not yet open"}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {closed
            ? "The submission window has ended. You can view all submitted projects in the gallery."
            : hackathon?.startsAt
              ? `Submissions open ${hackathon.startsAt.toLocaleString()}.`
              : ""}
        </p>
      </div>
    );
  }

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
      select: { id: true, name: true, isDefault: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
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
      endsAt={hackathon?.endsAt ?? null}
    />
  );
}
