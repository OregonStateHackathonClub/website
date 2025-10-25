import { prisma } from "@repo/database";
import SubmissionsClient from "./components/submissionClient";
import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

export default async function Page(props: {
  params: Promise<{ year: string }>;
}) {
  const params = await props.params;
  const yearParam = params.year;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let userTeamId: string | null = null;
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
      },
    });
    if (teamMembership) {
      userTeamId = teamMembership.id;
    }
  }

  const hackathon = await prisma.hackathon.findFirst({
    where: { id: yearParam },
    include: {
      tracks: true,
      submissions: {
        include: {
          submissionTracks: {
            include: {
              track: true,
            },
          },
        },
      },
    },
  });

  // Use a guard clause for the "not found" case
  if (!hackathon) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-neutral-900 p-4 text-center">
        <div className="max-w-md">
          <SearchX
            className="mx-auto h-16 w-16 text-neutral-600"
            aria-hidden="true"
          />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Hackathon Not Found
          </h1>
          <p className="mt-3 text-base text-neutral-400">
            Sorry, we could not find any hackathon data for the year{" "}
            <strong>{yearParam}</strong>. It might not exist or may be archived.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-orange-500/50 hover:text-orange-400"
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
    />
  );
}
