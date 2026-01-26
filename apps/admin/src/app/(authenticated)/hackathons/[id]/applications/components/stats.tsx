"use client";

import { Badge } from "@repo/ui/components/badge";
import type { ApplicationWithParticipant } from "./table";

interface StatsProps {
  applications: ApplicationWithParticipant[];
}

export function Stats({ applications }: StatsProps) {
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
    waitlisted: applications.filter((a) => a.status === "WAITLISTED").length,
    checkedIn: applications.filter((a) => a.status === "CHECKED_IN").length,
  };

  return (
    <div className="flex gap-2">
      <Badge
        variant="outline"
        className="rounded-none border-neutral-800 text-neutral-400"
      >
        Total: {stats.total}
      </Badge>
      <Badge
        variant="outline"
        className="rounded-none border-neutral-800 text-neutral-400"
      >
        Applied: {stats.applied}
      </Badge>
      <Badge
        variant="outline"
        className="rounded-none border-neutral-800 text-neutral-400"
      >
        Accepted: {stats.accepted}
      </Badge>
      <Badge
        variant="outline"
        className="rounded-none border-neutral-800 text-neutral-400"
      >
        Waitlisted: {stats.waitlisted}
      </Badge>
      <Badge
        variant="outline"
        className="rounded-none border-neutral-800 text-neutral-400"
      >
        Rejected: {stats.rejected}
      </Badge>
      <Badge
        variant="outline"
        className="rounded-none border-neutral-800 text-neutral-400"
      >
        Checked In: {stats.checkedIn}
      </Badge>
    </div>
  );
}
