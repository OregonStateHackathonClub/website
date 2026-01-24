import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  hackathonId: string;
  Icon: LucideIcon;
}

export function EmptyState({ hackathonId, Icon }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 border border-neutral-800 bg-neutral-900 flex items-center justify-center mx-auto mb-6">
          <Icon className="h-8 w-8 text-neutral-600" />
        </div>
        <h1 className="text-xl font-medium text-white mb-2">No Assignments</h1>
        <p className="text-neutral-500 mb-6">
          You don&apos;t have any submissions assigned for this round yet. Check
          back once the organizers have set up the judging schedule.
        </p>
        <Link
          href={`/judging/${hackathonId}`}
          className="inline-flex items-center gap-2 h-10 px-4 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
