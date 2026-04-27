"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CreateTeamModal } from "@/app/(participant)/[hackathonId]/components/create-team-modal";
import { AuthButton } from "./auth-button";

interface NavbarProps {
  currentHackathonId: string;
  userTeamId?: string | null;
  teamSubmissionId?: string | null;
  soloSubmissionId?: string | null;
  isParticipant?: boolean;
}

export const Navbar = ({
  currentHackathonId,
  userTeamId,
  teamSubmissionId,
  soloSubmissionId,
  isParticipant,
}: NavbarProps) => {
  const pathname = usePathname();
  const hackathonId = pathname.split("/")[1] || currentHackathonId;
  const isOnHackathonPage = pathname !== "/";
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  const submissionId = teamSubmissionId ?? soloSubmissionId ?? null;
  const showTeamActions = isOnHackathonPage && !!userTeamId;
  const showSoloActions =
    isOnHackathonPage && !userTeamId && !!isParticipant;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">BeaverHacks</span>
          <Badge className="rounded-none px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Judge
          </Badge>
        </Link>

        <div className="flex items-center gap-3">
          {showTeamActions && (
            <Link href={`/${hackathonId}/team/${userTeamId}`}>
              <Button
                variant="outline"
                className="hidden sm:flex rounded-none border-neutral-800 text-white hover:bg-neutral-900"
              >
                Your Team
              </Button>
            </Link>
          )}

          {showSoloActions && (
            <>
              <Button
                onClick={() => setCreateTeamOpen(true)}
                className="hidden sm:flex bg-white text-black hover:bg-neutral-200 rounded-none"
              >
                Create a Team
              </Button>
              <Link href={`/${hackathonId}/teams`}>
                <Button
                  variant="outline"
                  className="hidden sm:flex rounded-none border-neutral-800 text-white hover:bg-neutral-900"
                >
                  Find a Team
                </Button>
              </Link>
            </>
          )}

          {isOnHackathonPage && isParticipant && submissionId && (
            <Link href={`/${hackathonId}/projects/${submissionId}`}>
              <Button
                variant="outline"
                className="hidden sm:flex rounded-none border-neutral-800 text-white hover:bg-neutral-900"
              >
                View Submission
              </Button>
            </Link>
          )}

          {isOnHackathonPage && isParticipant && !submissionId && (
            <Link href={`/${hackathonId}/submission`}>
              <Button
                variant="outline"
                className="hidden sm:flex rounded-none border-neutral-800 text-white hover:bg-neutral-900"
              >
                Create Submission
              </Button>
            </Link>
          )}

          <AuthButton />
        </div>
      </div>

      {showSoloActions && (
        <CreateTeamModal
          hackathonId={hackathonId}
          open={createTeamOpen}
          onOpenChange={setCreateTeamOpen}
        />
      )}
    </nav>
  );
};
