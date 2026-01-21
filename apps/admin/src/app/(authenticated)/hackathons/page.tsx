import { prisma } from "@repo/database";
import { Calendar, Users, Trophy, FileText, Plus } from "lucide-react";
import Link from "next/link";

export default async function HackathonsPage() {
  const hackathons = await prisma.hackathon.findMany({
    include: {
      _count: {
        select: {
          participants: true,
          teams: true,
          submissions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Hackathons</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage hackathon events and participants
          </p>
        </div>
        <Link
          href="/hackathons/create"
          className="h-10 px-4 bg-white text-black text-sm font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Hackathon
        </Link>
      </div>

      {hackathons.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No hackathons yet</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Create your first hackathon to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hackathon) => (
            <Link key={hackathon.id} href={`/hackathons/${hackathon.id}`}>
              <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-6 hover:border-neutral-700 transition-colors">
                <h3 className="text-lg font-medium text-white mb-1">
                  {hackathon.name}
                </h3>
                {hackathon.description && (
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                    {hackathon.description}
                  </p>
                )}
                <div className="flex gap-4 text-sm text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-neutral-600" />
                    {hackathon._count.participants}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-neutral-600" />
                    {hackathon._count.teams}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-neutral-600" />
                    {hackathon._count.submissions}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
