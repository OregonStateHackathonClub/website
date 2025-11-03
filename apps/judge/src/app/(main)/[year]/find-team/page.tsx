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
					<div className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md">
						<h3 className="font-semibold text-gray-800 text-lg">{team.name}</h3>
						{team.description && (
							<p className="mt-1 text-gray-500 text-sm">
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
		<div className="min-h-screen bg-gray-50 py-10">
			<div className="mx-auto w-full max-w-3xl">
				<h1 className="mb-6 text-center font-bold text-4xl text-gray-900">
					Find a Team
				</h1>

				<p className="mb-8 text-center text-gray-600 text-lg">
					Browse groups searching for teammates and join a project!
				</p>

				<Suspense
					fallback={
						<p className="text-center text-gray-500">Loading teams...</p>
					}
				>
					<Teams />
				</Suspense>
			</div>
		</div>
	);
}
