import { Suspense } from "react";
import TeamPageClient from "./TeamPageClient";
import { isTeamMember } from "@/app/actions";

async function TeamLoader({ year, teamId }: { year: string; teamId: string }) {
  const teamMember = await isTeamMember(teamId);
  return (
    <TeamPageClient year={year} teamId={teamId} isTeamMember={teamMember} />
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; teamId: string }>;
}) {
  const { year, teamId } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamLoader year={year} teamId={teamId} />
    </Suspense>
  );
}
