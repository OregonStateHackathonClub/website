import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTeamsLookingForMembers } from "@/app/actions/participant";
import { TeamsList } from "./teams-list";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = await params;
  const teams = await getTeamsLookingForMembers(hackathonId);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/${hackathonId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Find a Team</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {teams.length} team{teams.length === 1 ? "" : "s"} looking for
          teammates
        </p>
      </div>

      <TeamsList teams={teams} hackathonId={hackathonId} />
    </div>
  );
}
