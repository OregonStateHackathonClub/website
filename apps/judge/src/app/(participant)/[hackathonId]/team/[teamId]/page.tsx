import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { isTeamMember } from "@/app/actions/participant";
import { TeamDetails } from "./team-details";

async function TeamLoader({ hackathonId, teamId }: { hackathonId: string; teamId: string }) {
  const teamMember = await isTeamMember(teamId);
  return <TeamDetails hackathonId={hackathonId} teamId={teamId} teamMember={teamMember} />;
}

export default async function Page({
  params,
}: {
  params: Promise<{ hackathonId: string; teamId: string }>;
}) {
  const { hackathonId, teamId } = await params;

  return (
    <div className="min-h-screen text-neutral-200">
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <Link
            href={`/${hackathonId}`}
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <Suspense
          fallback={
            <div className="text-center py-10 text-neutral-400">
              Loading Team...
            </div>
          }
        >
          <TeamLoader hackathonId={hackathonId} teamId={teamId} />
        </Suspense>
      </main>
    </div>
  );
}
