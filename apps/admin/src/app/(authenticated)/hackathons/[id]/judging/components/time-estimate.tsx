"use client";

import type { JudgingRound } from "@repo/database";
import { Clock } from "lucide-react";

interface TimeEstimateProps {
  rounds: JudgingRound[];
  submissions: number;
  judges: number;
}

export function TimeEstimate({
  rounds,
  submissions,
  judges,
}: TimeEstimateProps) {
  let currentSubmissions = submissions;
  let totalTime = 0;

  const roundTimes = rounds.map((round) => {
    let time = 0;

    if (round.type === "RANKED") {
      // All judges see all submissions
      time = currentSubmissions * round.minutesPerProject;
    } else {
      // Distribute among judges
      const projectsPerJudge = Math.ceil(
        (currentSubmissions * round.judgesPerProject) / judges,
      );
      time = projectsPerJudge * round.minutesPerProject;
    }

    totalTime += time;

    // Calculate how many advance
    const advanceCount =
      round.advanceCount ||
      (round.advancePercent
        ? Math.ceil(currentSubmissions * round.advancePercent)
        : currentSubmissions);

    const prevSubmissions = currentSubmissions;
    currentSubmissions = advanceCount;

    return {
      round: round.roundNumber,
      type: round.type,
      time,
      advancing: advanceCount,
      from: prevSubmissions,
    };
  });

  return (
    <div className="p-3 bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-neutral-500" />
        <span className="text-sm font-medium text-neutral-400">
          Time Estimate
        </span>
      </div>
      <div className="space-y-1 text-xs text-neutral-500">
        {roundTimes.map((rt) => (
          <div key={rt.round} className="flex justify-between">
            <span>
              Round {rt.round} ({rt.type}): {rt.from} → {rt.advancing}{" "}
              submissions
            </span>
            <span className="text-neutral-400">~{rt.time} min</span>
          </div>
        ))}
        <div className="flex justify-between pt-1 border-t border-neutral-800 font-medium text-neutral-300">
          <span>Total</span>
          <span>~{totalTime} min</span>
        </div>
      </div>
    </div>
  );
}
