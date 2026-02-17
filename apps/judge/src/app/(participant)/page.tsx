import { prisma } from "@repo/database";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function RootPage() {
  const hackathons = await prisma.hackathon.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          submissions: true,
          participants: true,
        },
      },
    },
  });

  if (hackathons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-neutral-400">
        <h1 className="font-bold text-2xl text-white">No Hackathons Found</h1>
        <p className="mt-2">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-white">BeaverHacks</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Select a hackathon to view projects and submissions.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {hackathons.map((hackathon) => (
          <Link
            key={hackathon.id}
            href={`/${hackathon.id}`}
            className="group flex items-center justify-between border border-neutral-800 bg-neutral-950/80 px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-900/80"
          >
            <div>
              <h2 className="font-medium text-white group-hover:text-white">
                {hackathon.name}
              </h2>
              {hackathon.description && (
                <p className="mt-0.5 text-sm text-neutral-500">
                  {hackathon.description}
                </p>
              )}
              <div className="mt-2 flex gap-4 text-xs text-neutral-600">
                <span>{hackathon._count.participants} participants</span>
                <span>{hackathon._count.submissions} submissions</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-600 transition-colors group-hover:text-white" />
          </Link>
        ))}
      </div>
    </div>
  );
}
