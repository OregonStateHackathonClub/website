import { prisma } from "@repo/database";
import InvitePageClient from "./inviteCodeClient";
import { getTeamIdFromInvite } from "@/app/actions";
import { toast } from "sonner";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; code: string }>;
}) {
  const { year, code } = await params;

  const teamId = await getTeamIdFromInvite(code);

  if (!teamId) {
    toast.error("Failed to get id from invite code");
    return <div>Invite Failed</div>;
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          participant: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    return <div>Team Does Not Exist</div>;
  } else if (team.members.length >= 4) {
    return <div>Team Is Full.</div>;
  } else {
    return <InvitePageClient year={year} code={code} />;
  }
}
