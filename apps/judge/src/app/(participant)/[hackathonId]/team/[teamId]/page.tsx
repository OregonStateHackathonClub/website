import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { isTeamMember } from "@/app/actions/participant";
import { TeamDetails } from "./team-details";

async function TeamLoader({
  hackathonId,
  teamId,
}: {
  hackathonId: string;
  teamId: string;
}) {
  const teamMember = await isTeamMember(teamId);
  return (
    <TeamDetails
      hackathonId={hackathonId}
      teamId={teamId}
      teamMember={teamMember}
    />
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ hackathonId: string; teamId: string }>;
}) {
  const { hackathonId, teamId } = await params;

  return (
    <div className="min-h-screen text-neutral-200">
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href={`/${hackathonId}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>

        <Suspense>
          <TeamLoader hackathonId={hackathonId} teamId={teamId} />
        </Suspense>
      </main>
    </div>
  );
}
