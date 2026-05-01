"use client";

import { CheckCircle2, Circle, Clock, Scale, Star, Trophy } from "lucide-react";
import Link from "next/link";
import type { DashboardRound } from "./dashboard";

const ROUND_CONFIG = {
  TRIAGE: {
    Icon: Star,
    label: "Triage",
    description: "Quick 1-5 star screening",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
  },
  RUBRIC: {
    Icon: Scale,
    label: "Rubric",
    description: "Detailed criteria-based scoring",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
  },
  RANKED: {
    Icon: Trophy,
    label: "Finals",
    description: "Ranked choice voting",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
  },
} as const;

function getStatusInfo(round: DashboardRound) {
  if (round.isComplete) {
    return {
      label: "Completed",
      className: "bg-neutral-800 text-neutral-400 border border-neutral-700",
    };
  }
  if (round.isActive) {
    return {
      label: "Active",
      className:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    };
  }
  return {
    label: "Not Started",
    className: "bg-neutral-800/50 text-neutral-500 border border-neutral-700",
  };
}

interface RoundCardProps {
  round: DashboardRound;
  hackathonId: string;
}

export function RoundCard({ round, hackathonId }: RoundCardProps) {
  const config = ROUND_CONFIG[round.type];
  const { Icon } = config;
  const status = getStatusInfo(round);
  const progress =
    round.totalAssignments > 0
      ? (round.completedAssignments / round.totalAssignments) * 100
      : 0;

  const canJudge =
    round.isActive && round.completedAssignments < round.totalAssignments;
  const isFullyComplete =
    round.completedAssignments === round.totalAssignments &&
    round.totalAssignments > 0;

  return (
    <div
      className={`border bg-neutral-950/80 backdrop-blur-sm p-4 transition-colors ${
        round.isActive
          ? "border-neutral-700 hover:border-neutral-600"
          : "border-neutral-800"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`shrink-0 w-10 h-10 flex items-center justify-center ${config.bgColor} ${config.borderColor} border`}
          >
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="font-medium text-white">
                Round {round.roundNumber}: {config.label}
              </h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium whitespace-nowrap ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5">
              {config.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-neutral-500">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-3 w-3 shrink-0" />
                {round.minutesPerProject} min/project
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                {isFullyComplete ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0" />
                )}
                {round.completedAssignments}/{round.totalAssignments} scored
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/judging/${hackathonId}/round/${round.id}`}
          className={`h-9 px-4 text-sm font-medium flex items-center justify-center transition-colors w-full sm:w-auto sm:shrink-0 ${
            canJudge
              ? "bg-white text-black hover:bg-neutral-200"
              : "border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600"
          }`}
        >
          {canJudge ? "Continue" : "View"}
        </Link>
      </div>

      {round.totalAssignments > 0 && (
        <div className="mt-4">
          <div className="h-1.5 bg-neutral-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFullyComplete ? "bg-emerald-500" : "bg-white"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {round.startedAt && (
        <p className="text-xs text-neutral-600 mt-2">
          Started at{" "}
          {new Date(round.startedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
      {!round.startedAt && round.totalAssignments > 0 && (
        <p className="text-xs text-neutral-600 mt-2">Start time TBD</p>
      )}
    </div>
  );
}
