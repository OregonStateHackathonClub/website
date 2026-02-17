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
        <h1 className="mb-2 text-xl font-semibold text-white">Find a Team</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Browse groups searching for teammates and join a project!
        </p>

        {teams.length === 0 ? (
          <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
            <p className="text-neutral-500">
              No teams are currently looking for teammates.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {teams.map((team) => (
              <Link key={team.id} href={`/${hackathonId}/team/${team.id}`}>
                <div className="cursor-pointer border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-4 transition-colors hover:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-lg">
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
