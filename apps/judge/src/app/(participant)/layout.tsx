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

  // --- Fetch User Team Data (Copied logic) ---
  let userTeamId: string | null = null;
  let teamSubmissionId: string | null = null;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user) {
      const teamMembership = await prisma.team.findFirst({
        where: {
          hackathonId: currentHackathonId,
          members: {
            some: {
              participant: {
                userId: session.user.id,
              },
            },
          },
        },
        select: {
          id: true,
          submission: {
            select: { id: true },
          },
        },
      });

      if (teamMembership) {
        userTeamId = teamMembership.id;
        if (teamMembership.submission) {
          teamSubmissionId = teamMembership.submission.id;
        }
      }
    }
  } catch (e) {
    console.error("Layout session check failed", e);
  }
  // -------------------------------------------

  return (
    <main className="flex min-h-dvh flex-col text-neutral-200 pt-14">
      <Navbar
        currentHackathonId={currentHackathonId || ""}
        userTeamId={userTeamId}
        teamSubmissionId={teamSubmissionId}
      />

      <div className="flex grow flex-col">{children}</div>
    </main>
  );
}
