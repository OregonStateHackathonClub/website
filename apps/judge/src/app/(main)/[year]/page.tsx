import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { ArrowLeft, SearchX } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import SubmissionsClient from "./components/submission_client";

export default async function Page(props: {
  params: Promise<{ year: string }>;
}) {
  const params = await props.params;
  const yearParam = params.year;

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
  // Status does not exist
  let teamSubmission: { id: string /*status: string*/ } | null = null;
  if (session?.user) {
    const teamMembership = await prisma.team.findFirst({
      where: {
        hackathonId: yearParam,
        members: {
          some: {
            participant: {
              userId: session.user.id,
            },
          },
        },
      },
      select: {
        id: true,
        submission: {
          select: { id: true /*status: true*/ },
        },
      },
    });
    if (teamMembership) {
      userTeamId = teamMembership.id;
      if (teamMembership.submission) {
        teamSubmission = {
          id: teamMembership.submission.id,
        };
      }
    }
  }

  const hackathon = await prisma.hackathon.findFirst({
    where: { id: yearParam },
    include: {
      tracks: true,
      submissions: {
        include: {
          tracks: true,
        },
      },
      sponsors: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  // Use a guard clause for the "not found" case
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
            Sorry, we could not find any hackathon data for the year{" "}
            <strong>{yearParam}</strong>. It might not exist or may be archived.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 font-medium text-neutral-200 text-sm transition hover:border-orange-500/50 hover:text-orange-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Pass the fetched data to the client component for rendering
  return (
    <SubmissionsClient
      hackathon={hackathon}
      tracks={hackathon.tracks}
      year={yearParam}
      userTeamId={userTeamId}
      teamSubmission={teamSubmission}
    />
  );
}
