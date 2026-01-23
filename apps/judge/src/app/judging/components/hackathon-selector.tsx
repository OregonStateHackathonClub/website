"use client";

import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Layers,
  Scale,
  Zap,
} from "lucide-react";
import Link from "next/link";

type HackathonData = {
  hackathon: {
    id: string;
    name: string;
    description: string | null;
  };
  tracksAssigned: number;
  totalAssignments: number;
  completedAssignments: number;
  hasActiveRound: boolean;
};

interface HackathonSelectorProps {
  hackathons: HackathonData[];
}

export function HackathonSelector({ hackathons }: HackathonSelectorProps) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Scale className="h-7 w-7 text-neutral-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Judging Portal
          </h1>
          <p className="text-neutral-500">
            Select a hackathon to view your assignments and start judging
          </p>
        </div>

        {/* Hackathon Cards */}
        {hackathons.length === 0 ? (
          <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
              <Scale className="h-6 w-6 text-neutral-600" />
            </div>
            <h3 className="text-lg font-medium text-white">
              No Hackathons Assigned
            </h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
              You haven&apos;t been assigned as a judge to any hackathons yet.
              Contact an organizer if you believe this is an error.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hackathons.map((data) => (
              <HackathonCard key={data.hackathon.id} data={data} />
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-neutral-600 mt-8">
          Need help? Contact your hackathon organizer
        </p>
      </div>
    </div>
  );
}

function HackathonCard({ data }: { data: HackathonData }) {
  const {
    hackathon,
    tracksAssigned,
    totalAssignments,
    completedAssignments,
    hasActiveRound,
  } = data;

  const progress =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;
  const isComplete =
    completedAssignments === totalAssignments && totalAssignments > 0;

  return (
    <Link
      href={`/judging/${hackathon.id}`}
      className="block border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm hover:border-neutral-700 transition-all group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-medium text-white truncate">
                {hackathon.name}
              </h3>
              {hasActiveRound && (
                <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                  <Zap className="h-3 w-3" />
                  Live
                </span>
              )}
            </div>
            {hackathon.description && (
              <p className="text-sm text-neutral-500 line-clamp-1 mb-3">
                {hackathon.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Layers className="h-4 w-4 text-neutral-600" />
                <span>
                  {tracksAssigned} track{tracksAssigned !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-neutral-600" />
                )}
                <span>
                  {completedAssignments}/{totalAssignments} scored
                </span>
              </div>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-neutral-600 group-hover:text-neutral-400 transition-colors mt-1 shrink-0" />
        </div>
      </div>

      {/* Progress Bar */}
      {totalAssignments > 0 && (
        <div className="h-1 bg-neutral-800">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete ? "bg-emerald-500" : "bg-white"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Link>
  );
}
