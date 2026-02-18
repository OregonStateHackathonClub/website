import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { ArrowLeft, SearchX } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { ProjectsGallery } from "./projects-gallery";

export async function GalleryContent({
  hackathonId,
}: {
  hackathonId: string;
}) {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (e) {
    console.error("Session retrieval failed", e);
    session = null;
  }

  let userTeamId: string | null = null;
  if (session?.user) {
    const teamMembership = await prisma.team.findFirst({
      where: {
        hackathonId,
        members: {
          some: {
            participant: {
              userId: session.user.id,
            },
          },
        },
      },
      select: { id: true },
    });
    if (teamMembership) {
      userTeamId = teamMembership.id;
    }
  }

  const hackathon = await prisma.hackathon.findFirst({
    where: { id: hackathonId },
    include: {
      tracks: true,
      submissions: {
        include: {
          tracks: true,
          trackWins: true,
          _count: { select: { likes: true } },
        },
      },
    },
  });

  let likedSubmissionIds: string[] = [];
  let canLike = false;
  if (session?.user) {
    const participant = await prisma.hackathonParticipant.findFirst({
      where: { userId: session.user.id, hackathonId },
      select: { id: true },
    });
    if (participant) {
      canLike = true;
      const likes = await prisma.like.findMany({
        where: { participantId: participant.id },
        select: { submissionId: true },
      });
      likedSubmissionIds = likes.map((l) => l.submissionId);
    }
  }

  if (!hackathon) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <SearchX
            className="mx-auto h-16 w-16 text-neutral-600"
            aria-hidden="true"
          />
          <h1 className="mt-6 font-bold text-3xl text-white tracking-tight">
            Hackathon Not Found
          </h1>
          <p className="mt-3 text-base text-neutral-400">
            Sorry, we could not find any hackathon data for{" "}
            <strong>{hackathonId}</strong>. It might not exist or may be
            archived.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center border border-neutral-800 bg-neutral-950/80 px-4 py-2 font-medium text-neutral-200 text-sm transition hover:border-neutral-700 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProjectsGallery
      hackathon={hackathon}
      tracks={hackathon.tracks}
      hackathonId={hackathonId}
      userTeamId={userTeamId}
      likedSubmissionIds={likedSubmissionIds}
      canLike={canLike}
    />
  );
}
