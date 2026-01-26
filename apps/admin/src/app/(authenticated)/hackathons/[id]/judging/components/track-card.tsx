"use client";

import { Button } from "@repo/ui/components/button";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Play,
  Plus,
  Scale,
  Settings,
  Shuffle,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  activateRound,
  assignJudgeToTrack,
  autoAssignJudges,
  completeRound,
  removeJudgeFromTrack,
} from "@/app/actions/judging";
import type { Judge, Track } from "./config";
import { TimeEstimate } from "./time-estimate";

const ROUND_TYPE_CONFIG = {
  TRIAGE: {
    label: "Triage",
    description: "Quick 1-5 star screening",
  },
  RUBRIC: {
    label: "Rubric",
    description: "Full rubric-based scoring",
  },
  RANKED: {
    label: "Ranked",
    description: "Final ranked choice voting",
  },
} as const;

const ROUND_TYPE_ICONS = {
  TRIAGE: Star,
  RUBRIC: Scale,
  RANKED: Trophy,
} as const;

interface TrackCardProps {
  track: Track;
  judges: Judge[];
  hackathonId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onConfigure: () => void;
}

export function TrackCard({
  track,
  judges,
  hackathonId,
  isExpanded,
  onToggle,
  onConfigure,
}: TrackCardProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState("");

  const assignedJudgeIds = track.judgeAssignments.map((a) => a.judge.id);
  const availableJudges = judges.filter(
    (j) => !assignedJudgeIds.includes(j.id),
  );

  async function handleAssignJudge() {
    if (!selectedJudge) return;

    setIsAssigning(true);
    const result = await assignJudgeToTrack(
      hackathonId,
      selectedJudge,
      track.id,
    );
    setIsAssigning(false);

    if (result.success) {
      toast.success("Judge assigned to track");
      setSelectedJudge("");
    } else {
      toast.error(result.error || "Failed to assign judge");
    }
  }

  async function handleRemoveJudge(judgeId: string) {
    const result = await removeJudgeFromTrack(hackathonId, judgeId, track.id);
    if (result.success) {
      toast.success("Judge removed from track");
    } else {
      toast.error(result.error || "Failed to remove judge");
    }
  }

  async function handleAutoAssign(roundId: string) {
    const result = await autoAssignJudges(hackathonId, track.id, roundId);
    if (result.success) {
      toast.success(`Assigned ${result.assigned} judge-submission pairs`);
    } else {
      toast.error(result.error || "Failed to auto-assign");
    }
  }

  async function handleActivateRound(roundId: string) {
    const result = await activateRound(hackathonId, roundId);
    if (result.success) {
      toast.success("Round activated");
    } else {
      toast.error(result.error || "Failed to activate round");
    }
  }

  async function handleCompleteRound(roundId: string) {
    if (!confirm("Complete this round and calculate advancements?")) return;

    const result = await completeRound(hackathonId, roundId);
    if (result.success) {
      toast.success(
        `Round completed. ${result.advanced} submissions advanced.`,
      );
    } else {
      toast.error(result.error || "Failed to complete round");
    }
  }

  return (
    <div className="border border-neutral-800 bg-neutral-950/80">
      {/* Track Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-500" />
          )}
          <div className="text-left">
            <h4 className="font-medium text-white">{track.name}</h4>
            <p className="text-xs text-neutral-500">
              {track._count.submissions} submissions •{" "}
              {track.judgeAssignments.length} judges
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {track.judgingPlan ? (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
              {track.judgingPlan.rounds.length} rounds configured
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-medium bg-neutral-800 text-neutral-500">
              Not configured
            </span>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-800 p-4 space-y-6">
          {/* Assigned Judges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-neutral-400">
                Assigned Judges
              </h5>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedJudge}
                    onChange={(e) => setSelectedJudge(e.target.value)}
                    className="h-8 pl-3 pr-8 text-sm appearance-none bg-transparent border border-neutral-800 text-white focus:outline-none focus:border-neutral-600 cursor-pointer"
                    disabled={availableJudges.length === 0}
                  >
                    <option value="">
                      {availableJudges.length === 0
                        ? "All judges assigned"
                        : "Select judge..."}
                    </option>
                    {availableJudges.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                </div>
                <Button
                  onClick={handleAssignJudge}
                  disabled={!selectedJudge || isAssigning}
                  className="h-8 px-3 text-sm bg-white text-black hover:bg-neutral-200 rounded-none flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
            </div>

            {track.judgeAssignments.length === 0 ? (
              <p className="text-sm text-neutral-600">
                No judges assigned to this track
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {track.judgeAssignments.map((assignment) => (
                  <div
                    key={assignment.judge.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-sm"
                  >
                    <span className="text-white">{assignment.judge.name}</span>
                    <button
                      onClick={() => handleRemoveJudge(assignment.judge.id)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Judging Plan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-neutral-400">
                Judging Plan
              </h5>
              <Button
                variant="outline"
                onClick={onConfigure}
                className="h-8 px-3 text-sm border-neutral-800 text-white hover:bg-neutral-900 rounded-none flex items-center gap-1"
              >
                <Settings className="h-3 w-3" />
                Configure
              </Button>
            </div>

            {!track.judgingPlan ? (
              <p className="text-sm text-neutral-600">
                No judging plan configured. Click Configure to set up rounds.
              </p>
            ) : (
              <div className="space-y-2">
                {track.judgingPlan.rounds.map((round) => {
                  const config = ROUND_TYPE_CONFIG[round.type];
                  const Icon = ROUND_TYPE_ICONS[round.type];

                  return (
                    <div
                      key={round.id}
                      className="p-3 border border-neutral-800 bg-neutral-900/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 flex items-center justify-center bg-neutral-800 border border-neutral-700">
                            <Icon className="h-3 w-3 text-neutral-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                Round {round.roundNumber}: {config.label}
                              </span>
                              {round.isComplete && (
                                <span className="px-1.5 py-0.5 text-xs bg-neutral-800 text-neutral-400 border border-neutral-700">
                                  Complete
                                </span>
                              )}
                              {round.isActive && (
                                <span className="px-1.5 py-0.5 text-xs bg-white/10 text-white border border-neutral-700">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500">
                              {round.judgesPerProject} judge
                              {round.judgesPerProject !== 1 ? "s" : ""}/project
                              • {round.minutesPerProject} min •{" "}
                              {round.advanceCount
                                ? `Top ${round.advanceCount} advance`
                                : round.advancePercent
                                  ? `Top ${round.advancePercent * 100}% advance`
                                  : "Finals"}
                              {round.type === "RANKED" &&
                                round.rankedSlots &&
                                ` • Rank top ${round.rankedSlots}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!round.isComplete && (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => handleAutoAssign(round.id)}
                                className="h-7 px-2 text-xs border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-none flex items-center gap-1"
                                title="Auto-assign judges"
                              >
                                <Shuffle className="h-3 w-3" />
                                Assign
                              </Button>
                              {!round.isActive ? (
                                <Button
                                  variant="outline"
                                  onClick={() => handleActivateRound(round.id)}
                                  className="h-7 px-2 text-xs border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-none flex items-center gap-1"
                                >
                                  <Play className="h-3 w-3" />
                                  Start
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() => handleCompleteRound(round.id)}
                                  className="h-7 px-2 text-xs border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-none flex items-center gap-1"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Complete
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time Estimate */}
          {track.judgingPlan && track.judgeAssignments.length > 0 && (
            <TimeEstimate
              rounds={track.judgingPlan.rounds}
              submissions={track._count.submissions}
              judges={track.judgeAssignments.length}
            />
          )}
        </div>
      )}
    </div>
  );
}
