import { Suspense } from "react";
import { PrismaClient } from "@repo/database";
import Link from "next/link";
import { getCurrentHackathonId } from "@/lib/queries";

async function Teams() {
	const data = await GetTeams();
	const hackathonId = await getCurrentHackathonId();

	return (
		<div className="grid gap-4">
			{data.map((team) => (
				<Link key={team.id} href={`/${hackathonId}/team/${team.id}`}>
					<div className="cursor-pointer rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-sm transition-all duration-200 hover:bg-neutral-800/50 hover:shadow-md">
						<h3 className="font-semibold text-neutral-200 text-lg">{team.name}</h3>
						{team.description && (
							<p className="mt-1 text-neutral-400 text-sm">
								{team.description.length > 100
									? `${team.description.slice(0, 100)}...`
									: team.description}
							</p>
						)}
					</div>
				</Link>
			))}
		</div>
	);
}

async function GetTeams() {
	const prisma = new PrismaClient();
	const teams = await prisma.team.findMany({
		where: { lookingForTeammates: true },
	});
	return teams;
}

export default function Home() {
	return (
		<div className="min-h-screen py-10">
			<div className="mx-auto w-full max-w-3xl px-4">
				<h1 className="mb-6 text-center font-bold text-4xl text-neutral-50">
					Find a Team
				</h1>

				<p className="mb-8 text-center text-neutral-400 text-lg">
					Browse groups searching for teammates and join a project!
				</p>

				<Suspense
					fallback={
						<p className="text-center text-neutral-500">Loading teams...</p>
					}
				>
					<Teams />
				</Suspense>
			</div>
		</div>
	);
}
