import { prisma } from "@repo/database";
import { FileText, Layers, Trophy, UserCheck, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { StatsCard } from "@/components/stats-card";
import { HackathonActions } from "./components/hackathon-actions";

interface HackathonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HackathonDetailPage({
  params,
}: HackathonDetailPageProps) {
  const { id } = await params;

  const [hackathon, judgeCount] = await Promise.all([
    prisma.hackathon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
            submissions: true,
            tracks: true,
          },
        },
      },
    }),
    prisma.judge.count({
      where: { hackathonId: id },
    }),
  ]);

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Participants"
          value={hackathon._count.participants}
          icon={Users}
        />
        <StatsCard
          title="Teams"
          value={hackathon._count.teams}
          icon={FileText}
        />
        <StatsCard
          title="Submissions"
          value={hackathon._count.submissions}
          icon={Trophy}
        />
        <StatsCard title="Judges" value={judgeCount} icon={UserCheck} />
        <StatsCard
          title="Tracks"
          value={hackathon._count.tracks}
          icon={Layers}
        />
      </div>

      <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-6">
        <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-4">
          Hackathon Settings
        </h3>
        <HackathonActions
          hackathon={{
            id: hackathon.id,
            name: hackathon.name,
            description: hackathon.description,
          }}
          hasData={
            hackathon._count.participants > 0 ||
            hackathon._count.teams > 0 ||
            hackathon._count.submissions > 0
          }
        />
      </div>
    </div>
  );
}
