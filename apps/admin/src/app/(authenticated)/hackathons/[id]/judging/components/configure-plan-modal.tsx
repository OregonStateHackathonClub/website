"use client";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Clock,
  GripVertical,
  Plus,
  Scale,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteJudgingPlan, saveJudgingPlan } from "@/app/actions/judging";
import type { JudgingRoundType } from "@repo/database";
import type { Track } from "./config";

type RoundInput = {
  type: JudgingRoundType;
  advanceCount?: number;
  advancePercent?: number;
  judgesPerProject: number;
  minutesPerProject: number;
  rubricId?: string;
  rankedSlots?: number;
};

const ROUND_TYPE_ICONS = {
  TRIAGE: Star,
  RUBRIC: Scale,
  RANKED: Trophy,
} as const;

interface ConfigurePlanModalProps {
  hackathonId: string;
  track: Track;
  onClose: () => void;
}

export function ConfigurePlanModal({
  hackathonId,
  track,
  onClose,
}: ConfigurePlanModalProps) {
  const [rounds, setRounds] = useState<RoundInput[]>(
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
    ],
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
    round: RoundInput,
    submissions: number,
    judges: number,
  ): number {
    if (judges === 0) return submissions * round.minutesPerProject;

    if (round.type === "RANKED") {
      // All judges see all submissions together
      return submissions * round.minutesPerProject;
    } else {
      // Distribute among judges
      const projectsPerJudge = Math.ceil(
        (submissions * round.judgesPerProject) / judges,
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

  function updateRound(index: number, updates: Partial<RoundInput>) {
    setRounds(rounds.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDragEnd() {
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
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

  function handleOpenChange(open: boolean) {
    if (!open && !isSaving) {
      onClose();
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="bg-neutral-950 border-neutral-800 rounded-none max-w-2xl max-h-[90vh] overflow-y-auto gap-0 [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none"
        onPointerDownOutside={(e: Event) => isSaving && e.preventDefault()}
        onEscapeKeyDown={(e: KeyboardEvent) => isSaving && e.preventDefault()}
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="text-lg font-medium text-white">
            Configure Judging Plan
          </DialogTitle>
          <p className="text-sm text-neutral-500">{track.name}</p>
        </DialogHeader>

        <div className="space-y-2 mb-6">
          {rounds.map((round, index) => {
            const Icon = ROUND_TYPE_ICONS[round.type];
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
                      <Select
                        value={round.type}
                        onValueChange={(value) =>
                          updateRound(index, {
                            type: value as JudgingRoundType,
                            rankedSlots: value === "RANKED" ? 3 : undefined,
                          })
                        }
                      >
                        <SelectTrigger className="w-full h-9 bg-transparent border-neutral-700 text-white rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-950 border-neutral-800 rounded-none">
                          <SelectItem value="TRIAGE">
                            Triage (Star Rating)
                          </SelectItem>
                          <SelectItem value="RUBRIC">
                            Rubric (Full Scoring)
                          </SelectItem>
                          <SelectItem value="RANKED">
                            Ranked (Final Voting)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Minutes per Project
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={round.minutesPerProject}
                        onChange={(e) =>
                          updateRound(index, {
                            minutesPerProject: parseInt(e.target.value) || 5,
                          })
                        }
                        className="bg-transparent dark:bg-transparent border-neutral-700 text-white placeholder:text-neutral-600 focus:border-neutral-500 rounded-none focus-visible:ring-0"
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
                            {" "}
                            / {maxJudges}
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
                      const submissionsForRound =
                        calculateSubmissionsForRound(index);
                      const time = calculateRoundTime(
                        round,
                        submissionsForRound,
                        maxJudges,
                      );
                      return (
                        <p className="text-xs text-neutral-500 mt-2">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {submissionsForRound} project
                          {submissionsForRound !== 1 ? "s" : ""} ×{" "}
                          {round.minutesPerProject} min
                          {round.type !== "RANKED" && maxJudges > 0 && (
                            <>
                              {" "}
                              ÷ {maxJudges} judges × {round.judgesPerProject}
                            </>
                          )}{" "}
                          ={" "}
                          <span className="text-white font-medium">
                            ~{time} min
                          </span>
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
                        <Input
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
                          className="bg-transparent dark:bg-transparent border-neutral-700 text-white placeholder:text-neutral-600 focus:border-neutral-500 rounded-none focus-visible:ring-0"
                        />
                      </div>
                    )}

                    {round.type !== "RANKED" && !round.advanceCount && (
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                          Advance Percent
                        </label>
                        <Input
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
                          className="bg-transparent dark:bg-transparent border-neutral-700 text-white placeholder:text-neutral-600 focus:border-neutral-500 rounded-none focus-visible:ring-0"
                        />
                      </div>
                    )}

                    {round.type === "RANKED" && (
                      <>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">
                            Ranked Slots (top N)
                          </label>
                          <Input
                            type="number"
                            min={1}
                            value={round.rankedSlots || 3}
                            onChange={(e) =>
                              updateRound(index, {
                                rankedSlots: parseInt(e.target.value) || 3,
                              })
                            }
                            className="bg-transparent dark:bg-transparent border-neutral-700 text-white placeholder:text-neutral-600 focus:border-neutral-500 rounded-none focus-visible:ring-0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">
                            Winner Count
                          </label>
                          <Input
                            type="number"
                            min={1}
                            value={round.advanceCount || 3}
                            onChange={(e) =>
                              updateRound(index, {
                                advanceCount: parseInt(e.target.value) || 3,
                              })
                            }
                            className="bg-transparent dark:bg-transparent border-neutral-700 text-white placeholder:text-neutral-600 focus:border-neutral-500 rounded-none focus-visible:ring-0"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            onClick={addRound}
            className="w-full py-3 border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500 rounded-none flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Round
          </Button>

          {/* Total time summary */}
          {rounds.length > 0 && (
            <div className="p-3 bg-neutral-900/50 border border-neutral-800 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Total Estimated Time</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  ~
                  {rounds.reduce((total, round, index) => {
                    const subs = calculateSubmissionsForRound(index);
                    return total + calculateRoundTime(round, subs, maxJudges);
                  }, 0)}{" "}
                  min
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {totalSubmissions} submissions, {maxJudges} judges assigned
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between pt-4 border-t border-neutral-800">
          {track.judgingPlan ? (
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="text-neutral-500 hover:text-white rounded-none"
            >
              Delete Plan
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-neutral-800 text-white hover:bg-neutral-900 rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || rounds.length === 0}
              className="bg-white text-black hover:bg-neutral-200 rounded-none"
            >
              {isSaving ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
