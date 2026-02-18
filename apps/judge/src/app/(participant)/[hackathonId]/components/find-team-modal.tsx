"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getTeamsLookingForMembers } from "@/app/actions/participant";

type Team = Awaited<ReturnType<typeof getTeamsLookingForMembers>>[number];

interface FindTeamModalProps {
  hackathonId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FindTeamModal({
  hackathonId,
  open,
  onOpenChange,
}: FindTeamModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getTeamsLookingForMembers(hackathonId)
      .then(setTeams)
      .finally(() => setLoading(false));
  }, [open, hackathonId]);

  const handleTeamClick = (teamId: string) => {
    onOpenChange(false);
    router.push(`/${hackathonId}/team/${teamId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-neutral-800 bg-neutral-950 sm:max-w-lg [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Find a Team
          </DialogTitle>
          <DialogDescription className="text-neutral-500">
            Browse groups searching for teammates and join a project!
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-neutral-800 bg-neutral-950/80 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-40 animate-pulse bg-neutral-800" />
                    <div className="h-4 w-24 animate-pulse bg-neutral-800" />
                  </div>
                  <div className="mt-2 h-4 w-3/4 animate-pulse bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : teams.length === 0 ? (
            <div className="border border-neutral-800 bg-neutral-950/80 p-12 text-center">
              <p className="text-neutral-500">
                No teams are currently looking for teammates.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleTeamClick(team.id)}
                  className="w-full text-left cursor-pointer border border-neutral-800 bg-neutral-950/80 p-4 transition-colors hover:border-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-lg">
                      {team.name}
                    </h3>
                    <span className="text-neutral-500 text-sm">
                      {team._count.members}/4 members
                    </span>
                  </div>
                  {team.description && (
                    <p className="mt-1 text-neutral-400 text-sm">
                      {team.description.length > 100
                        ? `${team.description.slice(0, 100)}...`
                        : team.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
