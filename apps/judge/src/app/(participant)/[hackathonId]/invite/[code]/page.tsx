import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { joinTeam } from "@/app/actions/participant";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ hackathonId: string; code: string }>;
}) {
  const { hackathonId, code } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/login?callbackURL=/${hackathonId}/invite/${code}`);
  }

  const invite = await prisma.invite.findUnique({
    where: { code },
    select: {
      team: {
        select: {
          id: true,
          name: true,
          _count: { select: { members: true } },
        },
      },
    },
  });

  if (!invite?.team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="border border-neutral-800 bg-neutral-950/80 p-8 text-center">
          <h1 className="text-xl font-medium text-white">Invalid Invite</h1>
          <p className="mt-2 text-neutral-400">This invite link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (invite.team._count.members >= 4) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="border border-neutral-800 bg-neutral-950/80 p-8 text-center">
          <h1 className="text-xl font-medium text-white">Team Full</h1>
          <p className="mt-2 text-neutral-400">
            {invite.team.name} already has 4 members.
          </p>
        </div>
      </div>
    );
  }

  const result = await joinTeam(code);

  if (!result.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="border border-neutral-800 bg-neutral-950/80 p-8 text-center">
          <h1 className="text-xl font-medium text-white">Could Not Join</h1>
          <p className="mt-2 text-neutral-400">{result.error}</p>
        </div>
      </div>
    );
  }

  redirect(`/${hackathonId}/team/${result.teamId}`);
}
