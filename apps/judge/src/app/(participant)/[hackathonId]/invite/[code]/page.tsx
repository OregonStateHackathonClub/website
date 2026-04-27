import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSoloSubmissionForCurrentUser } from "@/app/actions/participant";
import { JoinButton } from "./join-button";

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
          description: true,
          hackathonId: true,
          _count: { select: { members: true } },
        },
      },
    },
  });

  const team = invite?.team;

  if (!team) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="border border-neutral-800 bg-neutral-950/80 p-8 text-center max-w-md">
          <h1 className="text-xl font-medium text-white">Invalid Invite</h1>
          <p className="mt-2 text-sm text-neutral-400">
            This invite link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (team._count.members >= 4) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="border border-neutral-800 bg-neutral-950/80 p-8 text-center max-w-md">
          <h1 className="text-xl font-medium text-white">Team Full</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {team.name} already has 4 members.
          </p>
        </div>
      </div>
    );
  }

  // Already a member of this hackathon's team? Send them to it.
  const existingMembership = await prisma.team.findFirst({
    where: {
      hackathonId: team.hackathonId,
      members: {
        some: { participant: { userId: session.user.id } },
      },
    },
    select: { id: true },
  });
  if (existingMembership) {
    redirect(`/${hackathonId}/team/${existingMembership.id}`);
  }

  const soloSubmission = await getSoloSubmissionForCurrentUser(team.hackathonId);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md border border-neutral-800 bg-neutral-950/80 p-8">
        <Link
          href={`/${hackathonId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>

        <h1 className="text-xl font-semibold text-white">
          Join {team.name}?
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {team._count.members}/4 members
        </p>

        {team.description && (
          <p className="mt-4 text-sm text-neutral-300">{team.description}</p>
        )}

        {soloSubmission && (
          <div className="mt-6 flex gap-3 border border-amber-900/50 bg-amber-950/30 p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-100">
                Your existing submission will be deleted.
              </p>
              <p className="mt-1 text-xs text-amber-200/80">
                You currently have a solo submission
                {soloSubmission.title ? ` ("${soloSubmission.title}")` : ""}.
                Joining this team will permanently delete it.
              </p>
            </div>
          </div>
        )}

        <JoinButton
          code={code}
          hackathonId={hackathonId}
          hasSoloSubmission={!!soloSubmission}
        />
      </div>
    </div>
  );
}
