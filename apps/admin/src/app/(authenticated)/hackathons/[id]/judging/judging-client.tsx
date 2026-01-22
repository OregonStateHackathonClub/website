"use client";

import { useState } from "react";
import {
  Users,
  Scale,
  Star,
  Trophy,
  Plus,
  X,
  Play,
  CheckCircle2,
  Clock,
  Settings,
  ChevronDown,
  ChevronRight,
  Shuffle,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  assignJudgeToTrack,
  removeJudgeFromTrack,
  saveJudgingPlan,
  deleteJudgingPlan,
  autoAssignJudges,
  activateRound,
  completeRound,
} from "@/app/actions/judging";

type JudgingRoundType = "TRIAGE" | "RUBRIC" | "RANKED";

type Round = {
  id: string;
  roundNumber: number;
  type: JudgingRoundType;
  advanceCount: number | null;
  advancePercent: number | null;
  judgesPerProject: number;
  minutesPerProject: number;
  rubricId: string | null;
  rankedSlots: number | null;
  isActive: boolean;
  isComplete: boolean;
};

type JudgingPlan = {
  id: string;
  rounds: Round[];
};

type Track = {
  id: string;
  name: string;
  judgingPlan: JudgingPlan | null;
  judgeAssignments: {
    judge: {
      id: string;
      name: string;
    };
  }[];
  _count: {
    submissions: number;
  };
};

type Judge = {
  id: string;
  name: string;
  email: string;
  trackAssignments: {
    trackId: string;
  }[];
  _count: {
    roundAssignments: number;
  };
};

interface JudgingClientProps {
  hackathonId: string;
  tracks: Track[];
  judges: Judge[];
}

const ROUND_TYPE_CONFIG = {
  TRIAGE: {
    label: "Triage",
    description: "Quick 1-5 star screening",
    icon: Star,
  },
  RUBRIC: {
    label: "Rubric",
    description: "Full rubric-based scoring",
    icon: Scale,
  },
  RANKED: {
    label: "Ranked",
    description: "Final ranked choice voting",
    icon: Trophy,
  },
};

export function JudgingClient({
  hackathonId,
  tracks,
  judges,
}: JudgingClientProps) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(
    tracks[0]?.id || null
  );
  const [configureTrackId, setConfigureTrackId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-white">Judging Configuration</h2>
        <p className="text-sm text-neutral-500">
          Assign judges to tracks and configure judging rounds
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-neutral-800 bg-neutral-950/80 p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Judges</span>
          </div>
          <p className="text-2xl font-semibold text-white">{judges.length}</p>
        </div>
        <div className="border border-neutral-800 bg-neutral-950/80 p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-1">
            <Scale className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Tracks</span>
          </div>
          <p className="text-2xl font-semibold text-white">{tracks.length}</p>
        </div>
        <div className="border border-neutral-800 bg-neutral-950/80 p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-1">
            <Settings className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Configured</span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {tracks.filter((t) => t.judgingPlan).length}/{tracks.length}
          </p>
        </div>
      </div>

      {/* Tracks */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
          Tracks
        </h3>

        {tracks.length === 0 ? (
          <div className="border border-neutral-800 bg-neutral-950/80 p-8 text-center">
            <p className="text-neutral-500">
              No tracks created yet. Create tracks first.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                judges={judges}
                hackathonId={hackathonId}
                isExpanded={expandedTrack === track.id}
                onToggle={() =>
                  setExpandedTrack(
                    expandedTrack === track.id ? null : track.id
                  )
                }
                onConfigure={() => setConfigureTrackId(track.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Configure Plan Modal */}
      {configureTrackId && (
        <ConfigurePlanModal
          hackathonId={hackathonId}
          track={tracks.find((t) => t.id === configureTrackId)!}
          onClose={() => setConfigureTrackId(null)}
        />
      )}
    </div>
  );
}

function TrackCard({
  track,
  judges,
  hackathonId,
  isExpanded,
  onToggle,
  onConfigure,
}: {
  track: Track;
  judges: Judge[];
  hackathonId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onConfigure: () => void;
}) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState("");

  const assignedJudgeIds = track.judgeAssignments.map((a) => a.judge.id);
  const availableJudges = judges.filter((j) => !assignedJudgeIds.includes(j.id));

  async function handleAssignJudge() {
    if (!selectedJudge) return;

    setIsAssigning(true);
    const result = await assignJudgeToTrack(hackathonId, selectedJudge, track.id);
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
      toast.success(`Round completed. ${result.advanced} submissions advanced.`);
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
                <button
                  onClick={handleAssignJudge}
                  disabled={!selectedJudge || isAssigning}
                  className="h-8 px-3 text-sm bg-white text-black font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
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
              <button
                onClick={onConfigure}
                className="h-8 px-3 text-sm border border-neutral-800 text-white hover:bg-neutral-900 transition-colors flex items-center gap-1"
              >
                <Settings className="h-3 w-3" />
                Configure
              </button>
            </div>

            {!track.judgingPlan ? (
              <p className="text-sm text-neutral-600">
                No judging plan configured. Click Configure to set up rounds.
              </p>
            ) : (
              <div className="space-y-2">
                {track.judgingPlan.rounds.map((round) => {
                  const config = ROUND_TYPE_CONFIG[round.type];
                  const Icon = config.icon;

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
                              {round.judgesPerProject !== 1 ? "s" : ""}/project •{" "}
                              {round.minutesPerProject} min •{" "}
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
                              <button
                                onClick={() => handleAutoAssign(round.id)}
                                className="h-7 px-2 text-xs border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1"
                                title="Auto-assign judges"
                              >
                                <Shuffle className="h-3 w-3" />
                                Assign
                              </button>
                              {!round.isActive ? (
                                <button
                                  onClick={() => handleActivateRound(round.id)}
                                  className="h-7 px-2 text-xs border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1"
                                >
                                  <Play className="h-3 w-3" />
                                  Start
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCompleteRound(round.id)}
                                  className="h-7 px-2 text-xs border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Complete
                                </button>
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

function TimeEstimate({
  rounds,
  submissions,
  judges,
}: {
  rounds: Round[];
  submissions: number;
  judges: number;
}) {
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
        (currentSubmissions * round.judgesPerProject) / judges
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

function ConfigurePlanModal({
  hackathonId,
  track,
  onClose,
}: {
  hackathonId: string;
  track: Track;
  onClose: () => void;
}) {
  const [rounds, setRounds] = useState<
    {
      type: JudgingRoundType;
      advanceCount?: number;
      advancePercent?: number;
      judgesPerProject: number;
      minutesPerProject: number;
      rubricId?: string;
      rankedSlots?: number;
    }[]
  >(
    track.judgingPlan?.rounds.map((r) => ({
      type: r.type,
      advanceCount: r.advanceCount || undefined,
      advancePercent: r.advancePercent || undefined,
      judgesPerProject: r.judgesPerProject,
      minutesPerProject: r.minutesPerProject,
      rubricId: r.rubricId || undefined,
      rankedSlots: r.rankedSlots || undefined,
    })) || [
      {
        type: "TRIAGE",
        advancePercent: 0.3,
        judgesPerProject: 1,
        minutesPerProject: 5,
      },
    ]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const maxJudges = track.judgeAssignments.length;
  const totalSubmissions = track._count.submissions;

  // Calculate how many submissions will be in a given round
  function calculateSubmissionsForRound(roundIndex: number): number {
    let subs = totalSubmissions;
    for (let i = 0; i < roundIndex; i++) {
      const r = rounds[i];
      if (r.advanceCount) {
        subs = Math.min(subs, r.advanceCount);
      } else if (r.advancePercent) {
        subs = Math.ceil(subs * r.advancePercent);
      }
    }
    return subs;
  }

  // Calculate time for a round
  function calculateRoundTime(
    round: typeof rounds[0],
    submissions: number,
    judges: number
  ): number {
    if (judges === 0) return submissions * round.minutesPerProject;

    if (round.type === "RANKED") {
      // All judges see all submissions together
      return submissions * round.minutesPerProject;
    } else {
      // Distribute among judges
      const projectsPerJudge = Math.ceil(
        (submissions * round.judgesPerProject) / judges
      );
      return projectsPerJudge * round.minutesPerProject;
    }
  }

  function addRound() {
    setRounds([
      ...rounds,
      {
        type: "TRIAGE",
        advancePercent: 0.3,
        judgesPerProject: 1,
        minutesPerProject: 5,
      },
    ]);
  }

  function removeRound(index: number) {
    setRounds(rounds.filter((_, i) => i !== index));
  }

  function updateRound(
    index: number,
    updates: Partial<(typeof rounds)[0]>
  ) {
    setRounds(
      rounds.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDragEnd() {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newRounds = [...rounds];
      const [draggedItem] = newRounds.splice(draggedIndex, 1);
      newRounds.splice(dragOverIndex, 0, draggedItem);
      setRounds(newRounds);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  async function handleSave() {
    if (rounds.length === 0) {
      toast.error("Add at least one round");
      return;
    }

    setIsSaving(true);
    const result = await saveJudgingPlan(hackathonId, track.id, rounds);
    setIsSaving(false);

    if (result.success) {
      toast.success("Judging plan saved");
      onClose();
    } else {
      toast.error(result.error || "Failed to save plan");
    }
  }

  async function handleDelete() {
    if (!track.judgingPlan) return;
    if (!confirm("Delete this judging plan?")) return;

    const result = await deleteJudgingPlan(hackathonId, track.id);
    if (result.success) {
      toast.success("Judging plan deleted");
      onClose();
    } else {
      toast.error(result.error || "Failed to delete plan");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-neutral-950 border border-neutral-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-white">
              Configure Judging Plan
            </h3>
            <p className="text-sm text-neutral-500">{track.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {rounds.map((round, index) => {
            const config = ROUND_TYPE_CONFIG[round.type];
            const Icon = config.icon;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={index}
                onDragOver={(e) => handleDragOver(e, index)}
                className={`p-4 border border-neutral-800 bg-neutral-900/50 transition-all ${
                  isDragging ? "opacity-50" : ""
                } ${isDragOver ? "border-neutral-600" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-neutral-600 hover:text-neutral-400"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center bg-neutral-800 border border-neutral-700">
                      <Icon className="h-3 w-3 text-neutral-400" />
                    </div>
                    <span className="font-medium text-white">
                      Round {index + 1}
                    </span>
                  </div>
                  {rounds.length > 1 && (
                    <button
                      onClick={() => removeRound(index)}
                      className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Type
                      </label>
                      <div className="relative">
                        <select
                          value={round.type}
                          onChange={(e) =>
                            updateRound(index, {
                              type: e.target.value as JudgingRoundType,
                              rankedSlots:
                                e.target.value === "RANKED" ? 3 : undefined,
                            })
                          }
                          className="w-full h-9 pl-3 pr-8 appearance-none bg-transparent border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 cursor-pointer"
                        >
                          <option value="TRIAGE">Triage (Star Rating)</option>
                          <option value="RUBRIC">Rubric (Full Scoring)</option>
                          <option value="RANKED">Ranked (Final Voting)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Minutes per Project
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={round.minutesPerProject}
                        onChange={(e) =>
                          updateRound(index, {
                            minutesPerProject: parseInt(e.target.value) || 5,
                          })
                        }
                        className="w-full h-9 px-3 bg-transparent border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>

                  {/* Judges per project slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-neutral-500">
                        Judges per Project
                      </label>
                      <span className="text-sm font-medium text-white">
                        {round.judgesPerProject}
                        {maxJudges > 0 && (
                          <span className="text-neutral-500 font-normal">
                            {" "}/ {maxJudges}
                          </span>
                        )}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={Math.max(maxJudges, round.judgesPerProject, 1)}
                      value={round.judgesPerProject}
                      onChange={(e) =>
                        updateRound(index, {
                          judgesPerProject: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    {/* Time estimate for this round */}
                    {(() => {
                      const submissionsForRound = calculateSubmissionsForRound(index);
                      const time = calculateRoundTime(round, submissionsForRound, maxJudges);
                      return (
                        <p className="text-xs text-neutral-500 mt-2">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {submissionsForRound} project{submissionsForRound !== 1 ? "s" : ""} × {round.minutesPerProject} min
                          {round.type !== "RANKED" && maxJudges > 0 && (
                            <> ÷ {maxJudges} judges × {round.judgesPerProject}</>
                          )}
                          {" "}= <span className="text-white font-medium">~{time} min</span>
                        </p>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {round.type !== "RANKED" && (
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                          Advance Count
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={round.advanceCount || ""}
                          placeholder="Or use %"
                          onChange={(e) =>
                            updateRound(index, {
                              advanceCount: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                              advancePercent: e.target.value
                                ? undefined
                                : round.advancePercent,
                            })
                          }
                          className="w-full h-9 px-3 bg-transparent border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
                        />
                      </div>
                    )}

                    {round.type !== "RANKED" && !round.advanceCount && (
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                          Advance Percent
                        </label>
                        <input
                          type="number"
                          min={0.1}
                          max={1}
                          step={0.1}
                          value={round.advancePercent || ""}
                          placeholder="e.g., 0.3 = 30%"
                          onChange={(e) =>
                            updateRound(index, {
                              advancePercent: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                          className="w-full h-9 px-3 bg-transparent border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
                        />
                      </div>
                    )}

                    {round.type === "RANKED" && (
                      <>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">
                            Ranked Slots (top N)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={round.rankedSlots || 3}
                            onChange={(e) =>
                              updateRound(index, {
                                rankedSlots: parseInt(e.target.value) || 3,
                              })
                            }
                            className="w-full h-9 px-3 bg-transparent border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">
                            Winner Count
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={round.advanceCount || 3}
                            onChange={(e) =>
                              updateRound(index, {
                                advanceCount: parseInt(e.target.value) || 3,
                              })
                            }
                            className="w-full h-9 px-3 bg-transparent border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={addRound}
            className="w-full py-3 border border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Round
          </button>

          {/* Total time summary */}
          {rounds.length > 0 && (
            <div className="p-3 bg-neutral-900/50 border border-neutral-800 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Total Estimated Time</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  ~{rounds.reduce((total, round, index) => {
                    const subs = calculateSubmissionsForRound(index);
                    return total + calculateRoundTime(round, subs, maxJudges);
                  }, 0)} min
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {totalSubmissions} submissions, {maxJudges} judges assigned
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          {track.judgingPlan ? (
            <button
              onClick={handleDelete}
              className="h-10 px-4 text-neutral-500 hover:text-white text-sm transition-colors"
            >
              Delete Plan
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="h-10 px-4 border border-neutral-800 text-white text-sm font-medium hover:bg-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || rounds.length === 0}
              className="h-10 px-4 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
