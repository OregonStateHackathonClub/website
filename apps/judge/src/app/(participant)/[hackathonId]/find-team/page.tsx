import { prisma } from "@repo/database";
import Link from "next/link";

export default async function FindTeamPage(props: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = await props.params;

  const teams = await prisma.team.findMany({
    where: {
      hackathonId,
      lookingForTeammates: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { members: true } },
    },
  });

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h1 className="mb-6 text-center font-bold text-4xl text-neutral-50">
          Find a Team
        </h1>

        <p className="mb-8 text-center text-neutral-400 text-lg">
          Browse groups searching for teammates and join a project!
        </p>

        {teams.length === 0 ? (
          <p className="text-center text-neutral-500">
            No teams are currently looking for teammates.
          </p>
        ) : (
          <div className="grid gap-4">
            {teams.map((team) => (
              <Link key={team.id} href={`/${hackathonId}/team/${team.id}`}>
                <div className="cursor-pointer rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-sm transition-all duration-200 hover:bg-neutral-800/50 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-200 text-lg">
                      {team.name}
                    </h3>
                    <span className="text-neutral-500 text-sm">
                      {team._count.members}/4 members
                    </span>
                  </div>
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
        )}
      </div>
    </div>
  );
}
