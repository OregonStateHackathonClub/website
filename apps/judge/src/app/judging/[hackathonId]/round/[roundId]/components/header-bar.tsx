import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface HeaderBarProps {
  hackathonId: string;
  roundNumber: number;
  trackName: string;
  Icon: LucideIcon;
  completedCount: number;
  totalCount: number;
  behindCount: number;
}

export function HeaderBar({
  hackathonId,
  roundNumber,
  trackName,
  Icon,
  completedCount,
  totalCount,
  behindCount,
}: HeaderBarProps) {
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-neutral-950">
      <div className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 gap-3 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/judging/${hackathonId}`}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors whitespace-nowrap"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="hidden sm:block w-px h-5 bg-neutral-800" />
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 text-neutral-500 shrink-0" />
            <span className="text-sm text-white whitespace-nowrap">
              Round {roundNumber}
            </span>
            <span className="hidden md:inline text-sm text-neutral-600 truncate">
              {trackName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {behindCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-500 text-sm whitespace-nowrap">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{behindCount} behind</span>
            </div>
          )}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-white">{completedCount}</span>
            <span className="text-sm text-neutral-600">/ {totalCount}</span>
            <div className="hidden md:block w-20 h-1 bg-neutral-800">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
