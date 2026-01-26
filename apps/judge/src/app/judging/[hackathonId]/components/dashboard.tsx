"use client";

import { ChevronLeft, Scale } from "lucide-react";
import Link from "next/link";
import { RoundCard } from "./round-card";

// Dashboard-specific round type (includes progress info from server action)
export type DashboardRound = {
  id: string;
  roundNumber: number;
  type: "TRIAGE" | "RUBRIC" | "RANKED";
  trackId: string;
  trackName: string;
  minutesPerProject: number;
  isActive: boolean;
  isComplete: boolean;
  startedAt: Date | null;
  totalAssignments: number;
  completedAssignments: number;
};

interface DashboardProps {
  hackathonId: string;
  hackathonName: string;
  rounds: DashboardRound[];
}

export function Dashboard({
  hackathonId,
  hackathonName,
  rounds,
}: DashboardProps) {
  const trackRounds = rounds.reduce(
    (acc, round) => {
      if (!acc[round.trackId]) {
        acc[round.trackId] = {
          trackName: round.trackName,
          rounds: [],
        };
      }
      acc[round.trackId].rounds.push(round);
      return acc;
    },
    {} as Record<string, { trackName: string; rounds: DashboardRound[] }>,
  );

  const totalAssignments = rounds.reduce(
    (sum, r) => sum + r.totalAssignments,
    0,
  );
  const totalCompleted = rounds.reduce(
    (sum, r) => sum + r.completedAssignments,
    0,
  );
  const activeRound = rounds.find((r) => r.isActive);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/judging"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          All Hackathons
        </Link>
        <h1 className="text-xl font-semibold text-white">{hackathonName}</h1>
        <p className="text-sm text-neutral-400 mt-1">
          {totalCompleted}/{totalAssignments} submissions scored
          {activeRound && (
            <span className="ml-2 text-emerald-400">
              · Round {activeRound.roundNumber} active
            </span>
          )}
        </p>
      </div>

      {/* Progress */}
      {totalAssignments > 0 && (
        <div className="mb-8 p-4 border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Your Progress
            </span>
            <span className="text-sm font-medium text-white">
              {Math.round((totalCompleted / totalAssignments) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{
                width: `${(totalCompleted / totalAssignments) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Rounds by Track */}
      {Object.entries(trackRounds).length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Scale className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No Rounds Assigned</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Check back when judging begins.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(trackRounds).map(
            ([trackId, { trackName, rounds: trackRoundList }]) => (
              <div key={trackId}>
                <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                  {trackName}
                </h2>
                <div className="grid gap-3">
                  {trackRoundList.map((round) => (
                    <RoundCard
                      key={round.id}
                      round={round}
                      hackathonId={hackathonId}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
