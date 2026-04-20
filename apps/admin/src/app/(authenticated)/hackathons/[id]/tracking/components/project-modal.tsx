"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TrackingJudge, TrackingProject } from "@/app/actions/tracking";
import {
  skipJudgeAssignment,
  overrideTriageScore,
  overrideRankedVote,
  overrideRubricScore,
  assignJudgeToRound,
  deleteJudgeAssignment,
} from "@/app/actions/tracking";

interface ProjectModalProps {
  hackathonId: string;
  project: TrackingProject;
  roundId: string;
  roundType: string;
  trackJudges: TrackingJudge[];
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  scored: "Scored",
  in_progress: "In Progress",
  skipped: "Skipped",
  not_started: "Not Started",
};

const statusDot: Record<string, string> = {
  scored: "bg-[#4a7a5a]",
  in_progress: "bg-[#8a7a4a]",
  skipped: "bg-[#9a5555]",
  not_started: "bg-neutral-800 border border-neutral-700",
};

const skipReasons = [
  { value: "team_no_show", label: "Team no-show" },
  { value: "team_not_ready", label: "Team not ready" },
  { value: "technical", label: "Technical issue" },
  { value: "other", label: "Other" },
];

export function ProjectModal({
  hackathonId,
  project,
  roundId,
  roundType,
  trackJudges,
  onClose,
}: ProjectModalProps) {
  const router = useRouter();
  const [skipAssignmentId, setSkipAssignmentId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState("team_no_show");
  const [skipNote, setSkipNote] = useState("");
  const [scoreAssignmentId, setScoreAssignmentId] = useState<string | null>(null);
  const [scoreValue, setScoreValue] = useState(3);
  const [showAssign, setShowAssign] = useState(false);
  const [loading, setLoading] = useState(false);

  const unassignedJudges = trackJudges.filter(
    (j) => !project.assignments.some((a) => a.judgeId === j.id),
  );

  function refreshData() {
    router.refresh();
  }

  async function handleSkip() {
    if (!skipAssignmentId) return;
    setLoading(true);
    const result = await skipJudgeAssignment(
      hackathonId,
      skipAssignmentId,
      skipReason,
      skipNote || undefined,
    );
    setLoading(false);
    if (result.success) {
      toast.success("Assignment skipped");
      setSkipAssignmentId(null);
      setSkipNote("");
      refreshData();
    } else {
      toast.error(result.error);
    }
  }

  async function handleSetScore() {
    if (!scoreAssignmentId) return;
    setLoading(true);
    let result: { success: boolean; error?: string };

    if (roundType === "TRIAGE") {
      result = await overrideTriageScore(hackathonId, scoreAssignmentId, scoreValue);
    } else if (roundType === "RANKED") {
      result = await overrideRankedVote(hackathonId, scoreAssignmentId, scoreValue);
    } else {
      result = await overrideRubricScore(hackathonId, scoreAssignmentId, scoreValue);
    }

    setLoading(false);
    if (result.success) {
      toast.success("Score set");
      setScoreAssignmentId(null);
      refreshData();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteAssignment(assignmentId: string) {
    setLoading(true);
    const result = await deleteJudgeAssignment(hackathonId, assignmentId);
    setLoading(false);
    if (result.success) {
      toast.success("Judge removed");
      refreshData();
    } else {
      toast.error(result.error);
    }
  }

  async function handleAssignJudge(judgeId: string) {
    setLoading(true);
    const result = await assignJudgeToRound(hackathonId, roundId, project.submissionId, judgeId);
    setLoading(false);
    if (result.success) {
      toast.success("Judge assigned");
      setShowAssign(false);
      refreshData();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-neutral-950 border border-neutral-800 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-white">
              {project.teamName || project.title}
            </h3>
            <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mt-1">
              {project.trackName}
              {project.tableNumber && ` · Table ${project.tableNumber}`}
              {` · ${project.completedCount}/${project.totalCount} scored`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Judge Assignments */}
        <div className="p-5 space-y-3">
          <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-2">
            Judges
          </div>

          {project.assignments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between py-2 border-b border-neutral-900 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-sm ${statusDot[a.status]}`} />
                <div>
                  <div className="text-sm text-neutral-200">{a.judgeName}</div>
                  <div className="text-xs text-neutral-600">{a.judgeEmail}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">
                  {statusLabel[a.status]}
                  {a.skippedReason && ` (${a.skippedReason.replace("_", " ")})`}
                </span>

                <div className="flex gap-1">
                  {a.status !== "scored" && a.status !== "skipped" && (
                    <button
                      onClick={() => setSkipAssignmentId(a.id)}
                      disabled={loading}
                      className="text-[10px] font-mono text-neutral-500 hover:text-white border border-neutral-800 px-2 py-0.5 hover:border-neutral-600 transition-colors"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={() => setScoreAssignmentId(a.id)}
                    disabled={loading}
                    className="text-[10px] font-mono text-neutral-500 hover:text-white border border-neutral-800 px-2 py-0.5 hover:border-neutral-600 transition-colors"
                  >
                    {a.status === "scored" ? "Override" : "Score"}
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(a.id)}
                    disabled={loading}
                    className="text-[10px] font-mono text-neutral-500 hover:text-white border border-neutral-800 px-2 py-0.5 hover:border-neutral-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Judge */}
          {!showAssign ? (
            <button
              onClick={() => unassignedJudges.length > 0 && setShowAssign(true)}
              disabled={unassignedJudges.length === 0}
              className="text-xs font-mono text-neutral-500 hover:text-white transition-colors mt-2 disabled:text-neutral-700 disabled:cursor-default disabled:hover:text-neutral-700"
            >
              + Assign judge{unassignedJudges.length === 0 && " (no more judges available)"}
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                Available judges
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {unassignedJudges.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => handleAssignJudge(j.id)}
                    disabled={loading}
                    className="flex items-center justify-between w-full px-2 py-1.5 text-left text-sm text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
                  >
                    <span>{j.name}</span>
                    <span className="text-xs text-neutral-600">{j.email}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAssign(false)}
                className="text-xs text-neutral-600 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Skip Dialog (inline) */}
        {skipAssignmentId && (
          <div className="px-5 pb-5 border-t border-neutral-800 pt-4">
            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-3">
              Skip reason
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {skipReasons.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSkipReason(r.value)}
                  className={`text-xs px-2 py-1 border transition-colors ${
                    skipReason === r.value
                      ? "border-neutral-500 text-white"
                      : "border-neutral-800 text-neutral-500 hover:border-neutral-600"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {skipReason === "other" && (
              <input
                type="text"
                value={skipNote}
                onChange={(e) => setSkipNote(e.target.value)}
                placeholder="Note..."
                className="w-full bg-neutral-900 border border-neutral-800 text-sm text-white px-3 py-1.5 mb-3 focus:outline-none focus:border-neutral-600"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="text-xs font-mono bg-neutral-800 text-white px-3 py-1.5 hover:bg-neutral-700 transition-colors"
              >
                Confirm skip
              </button>
              <button
                onClick={() => setSkipAssignmentId(null)}
                className="text-xs font-mono text-neutral-500 px-3 py-1.5 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Score Override (inline) */}
        {scoreAssignmentId && (
          <div className="px-5 pb-5 border-t border-neutral-800 pt-4">
            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-3">
              {roundType === "TRIAGE"
                ? "Set triage score (1-5)"
                : roundType === "RANKED"
                  ? "Set rank position"
                  : "Set rubric total score"}
            </div>

            {roundType === "TRIAGE" ? (
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setScoreValue(v)}
                    className={`w-8 h-8 text-sm border transition-colors ${
                      scoreValue === v
                        ? "border-neutral-500 text-white bg-neutral-800"
                        : "border-neutral-800 text-neutral-500 hover:border-neutral-600"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="number"
                min={1}
                value={scoreValue}
                onChange={(e) => setScoreValue(Number(e.target.value))}
                className="w-24 bg-neutral-900 border border-neutral-800 text-sm text-white px-3 py-1.5 mb-3 focus:outline-none focus:border-neutral-600 tabular-nums"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSetScore}
                disabled={loading}
                className="text-xs font-mono bg-neutral-800 text-white px-3 py-1.5 hover:bg-neutral-700 transition-colors"
              >
                Set score
              </button>
              <button
                onClick={() => setScoreAssignmentId(null)}
                className="text-xs font-mono text-neutral-500 px-3 py-1.5 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
