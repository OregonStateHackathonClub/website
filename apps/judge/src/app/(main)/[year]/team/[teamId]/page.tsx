import { Suspense } from "react";
import { isTeamMember } from "@/app/actions";
import TeamPageClient from "./TeamPageClient";

async function TeamLoader({ year, teamId }: { year: string; teamId: string }) {
	const teamMember = await isTeamMember(teamId);
	return <TeamPageClient year={year} teamId={teamId} teamMember={teamMember} />;
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
