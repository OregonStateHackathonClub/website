import { Suspense } from "react";
import { prisma } from "@repo/database";
import Link from "next/link";

async function Teams() {
  const teams = await prisma.team.findMany({
    where: { lookingForTeammates: true },
  });

  return (
    <div className="grid gap-4">
      {teams.map((team) => (
        <Link key={team.id} href={`team/${team.id}`}>
          <div className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200">
            <h3 className="text-lg font-semibold text-gray-800">{team.name}</h3>
            {team.description && (
              <p className="mt-1 text-gray-500 text-sm">
                {team.description.length > 100
                  ? team.description.slice(0, 100) + "..."
                  : team.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Find a Team
        </h1>

        <p className="text-lg text-gray-600 mb-8 text-center">
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
