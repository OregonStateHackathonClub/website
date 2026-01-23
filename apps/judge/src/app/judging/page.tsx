import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HackathonSelector } from "./components/hackathon-selector";

async function getJudgeHackathons() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) return null;

  const judges = await prisma.judge.findMany({
    where: {
      email: session.user.email,
    },
    include: {
      hackathon: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      trackAssignments: {
        include: {
          track: {
            include: {
              judgingPlan: {
                include: {
                  rounds: {
                    where: { isActive: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
      roundAssignments: {
        select: {
          completed: true,
        },
      },
    },
    orderBy: {
      hackathon: {
        createdAt: "desc",
      },
    },
  });

  return judges.map((judge) => {
    const totalAssignments = judge.roundAssignments.length;
    const completedAssignments = judge.roundAssignments.filter(
      (a) => a.completed,
    ).length;

    // Check if any track has an active round
    const hasActiveRound = judge.trackAssignments.some((ta) =>
      ta.track.judgingPlan?.rounds.some((r) => r.isActive),
    );

    return {
      hackathon: judge.hackathon,
      tracksAssigned: judge.trackAssignments.length,
      totalAssignments,
      completedAssignments,
      hasActiveRound: !!hasActiveRound,
    };
  });
}

export default async function JudgingPage() {
  const hackathons = await getJudgeHackathons();

  if (!hackathons) {
    redirect("/login?callbackURL=/judging");
  }

  return <HackathonSelector hackathons={hackathons} />;
}
