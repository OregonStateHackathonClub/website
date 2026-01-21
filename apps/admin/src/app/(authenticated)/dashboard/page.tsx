import { prisma } from "@repo/database";
import { StatsCard } from "@/components/stats-card";
import { Users, Calendar, FileText, Users2, Trophy, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
  const [
    userCount,
    adminCount,
    hackathonCount,
    applicationStats,
    teamCount,
    submissionCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.hackathon.count(),
    prisma.application.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.team.count(),
    prisma.submission.count(),
  ]);

  const totalApplications = applicationStats.reduce((acc, s) => acc + s._count, 0);
  const checkedIn = applicationStats.find((s) => s.status === "CHECKED_IN")?._count ?? 0;

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Overview of all BeaverHacks applications
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Users"
          value={userCount}
          icon={Users}
        />
        <StatsCard
          title="Admins"
          value={adminCount}
          icon={ShieldCheck}
        />
        <StatsCard
          title="Hackathons"
          value={hackathonCount}
          icon={Calendar}
        />
        <StatsCard
          title="Applications"
          value={totalApplications}
          description={`${checkedIn} checked in`}
          icon={FileText}
        />
        <StatsCard
          title="Teams"
          value={teamCount}
          icon={Users2}
        />
        <StatsCard
          title="Submissions"
          value={submissionCount}
          icon={Trophy}
        />
      </div>
    </div>
  );
}
