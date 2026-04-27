export const dynamic = "force-dynamic";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { Navbar } from "@/components/navbar";
import { getCurrentHackathonId } from "@/app/actions/participant";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentHackathonId = await getCurrentHackathonId();

  let userTeamId: string | null = null;
  let teamSubmissionId: string | null = null;
  let soloSubmissionId: string | null = null;
  let isParticipant = false;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user && currentHackathonId) {
      const participant = await prisma.hackathonParticipant.findUnique({
        where: {
          userId_hackathonId: {
            userId: session.user.id,
            hackathonId: currentHackathonId,
          },
        },
        select: {
          id: true,
          teamMember: {
            select: {
              team: {
                select: {
                  id: true,
                  submission: { select: { id: true } },
                },
              },
            },
          },
          submission: { select: { id: true } },
        },
      });

      if (participant) {
        isParticipant = true;
        if (participant.teamMember) {
          userTeamId = participant.teamMember.team.id;
          teamSubmissionId =
            participant.teamMember.team.submission?.id ?? null;
        } else if (participant.submission) {
          soloSubmissionId = participant.submission.id;
        }
      }
    }
  } catch (e) {
    console.error("Layout session check failed", e);
  }

  return (
    <main className="flex min-h-dvh flex-col text-neutral-200 pt-14">
      <Navbar
        currentHackathonId={currentHackathonId || ""}
        userTeamId={userTeamId}
        teamSubmissionId={teamSubmissionId}
        soloSubmissionId={soloSubmissionId}
        isParticipant={isParticipant}
      />

      <div className="flex grow flex-col">{children}</div>
    </main>
  );
}
