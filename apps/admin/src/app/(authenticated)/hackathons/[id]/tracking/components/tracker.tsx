"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TrackingData } from "@/app/actions/tracking";
import { autoAssignJudges, activateRound, completeRound } from "@/app/actions/judging";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { StatsBar } from "./stats-bar";
import { ProjectCard } from "./project-card";
import { ProjectModal } from "./project-modal";

interface TrackerProps {
  hackathonId: string;
  data: TrackingData;
}

export function Tracker({ hackathonId, data }: TrackerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const selectedProject = selectedSubmissionId
    ? data.projects.find((p) => p.submissionId === selectedSubmissionId) ?? null
    : null;

  const paramTrackId = searchParams.get("track");
  const currentTrackId =
    paramTrackId && data.tracks.some((t) => t.id === paramTrackId)
      ? paramTrackId
      : data.tracks[0]?.id || "";
  const paramRoundId = searchParams.get("round");
  const currentRoundId =
    (paramRoundId && data.rounds.some((r) => r.id === paramRoundId)
      ? paramRoundId
      : undefined) ||
    data.rounds.find((r) => r.isActive)?.id ||
    data.rounds[0]?.id;
  const currentRound = data.rounds.find((r) => r.id === currentRoundId);

  // Poll every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  function setRound(roundId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("round", roundId);
    router.push(`/hackathons/${hackathonId}/tracking?${params.toString()}`);
  }

  function setTrack(trackId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("track", trackId);
    // Clear round so the server picks the first round of the new track.
    params.delete("round");
    router.push(`/hackathons/${hackathonId}/tracking?${params.toString()}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Judging Tracker</h2>
          <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mt-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-pulse" />
              Live · 15s
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Track selector */}
          <Select value={currentTrackId} onValueChange={setTrack}>
            <SelectTrigger className="w-[160px] bg-transparent border-neutral-800 text-neutral-400 text-xs font-mono rounded-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:border-neutral-600">
              <SelectValue placeholder="Select track" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-neutral-800 bg-neutral-900">
              {data.tracks.map((t) => (
                <SelectItem
                  key={t.id}
                  value={t.id}
                  className="rounded-none text-neutral-300 text-xs"
                >
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Round selector */}
          <div className="flex border border-neutral-800">
            {data.rounds.map((r) => (
              <button
                key={r.id}
                onClick={() => setRound(r.id)}
                className={`px-3 py-1.5 text-xs font-mono border-r border-neutral-800 last:border-r-0 transition-colors flex items-center gap-1.5 ${
                  r.id === currentRoundId
                    ? "bg-neutral-900 text-neutral-200"
                    : r.isComplete
                      ? "text-neutral-600 hover:text-neutral-400 hover:bg-neutral-950"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-950"
                }`}
              >
                {r.isComplete && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4a7a5a]" />
                )}
                R{r.roundNumber} {r.type.charAt(0) + r.type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Round lifecycle actions */}
          {currentRound && !currentRound.isComplete && (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!confirm("Re-run auto-assignment? This will clear all existing assignments and scores for this round.")) return;
                  const result = await autoAssignJudges(hackathonId, currentRound.trackId, currentRound.id);
                  if (result.success) {
                    toast.success(`Assigned ${result.assigned} judge slots`);
                    router.refresh();
                  } else {
                    toast.error(result.error);
                  }
                }}
                className="border border-neutral-800 text-neutral-500 px-3 py-1.5 text-xs font-mono hover:border-neutral-600 hover:text-white transition-colors"
              >
                Auto-Assign
              </button>
              {!currentRound.isActive ? (
                <button
                  onClick={async () => {
                    const result = await activateRound(hackathonId, currentRound.id);
                    if (result.success) {
                      toast.success("Round started");
                      router.refresh();
                    } else {
                      toast.error(result.error);
                    }
                  }}
                  className="border border-neutral-800 text-neutral-500 px-3 py-1.5 text-xs font-mono hover:border-neutral-600 hover:text-white transition-colors"
                >
                  Start Round
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (!confirm("Complete this round and calculate advancements?")) return;
                    const result = await completeRound(hackathonId, currentRound.id);
                    if (result.success) {
                      toast.success(`Round completed — ${result.advanced} submissions advanced`);
                      router.refresh();
                    } else {
                      toast.error(result.error);
                    }
                  }}
                  className="border border-neutral-800 text-neutral-500 px-3 py-1.5 text-xs font-mono hover:border-neutral-600 hover:text-white transition-colors"
                >
                  Complete Round
                </button>
              )}
            </div>
          )}

          {/* Export */}
          <a
            href={`/api/hackathons/${hackathonId}/export-tracking${currentRoundId ? `?round=${currentRoundId}` : ""}`}
            className="border border-neutral-800 text-neutral-600 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider hover:border-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ↓ Export
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <StatsBar stats={data.stats} />
      </div>

      {/* Project Grid */}
      {data.projects.length === 0 ? (
        <div className="text-center py-20 text-neutral-600 text-sm">
          No assignments for this round yet.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {data.projects.map((project) => (
            <ProjectCard
              key={project.submissionId}
              project={project}
              onClick={() => setSelectedSubmissionId(project.submissionId)}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 items-center mt-6 pt-3 border-t border-neutral-900">
        <span className="text-[10px] font-mono text-neutral-700 uppercase tracking-wider">
          Status
        </span>
        {[
          { color: "bg-[#4a7a5a]", label: "Scored" },
          { color: "bg-[#8a7a4a]", label: "In Progress" },
          { color: "bg-[#9a5555]", label: "Issue" },
          { color: "bg-neutral-900 border border-neutral-700", label: "Not Started" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
            <span className="text-xs text-neutral-600">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          hackathonId={hackathonId}
          project={selectedProject}
          roundId={currentRoundId || ""}
          roundType={currentRound?.type || "TRIAGE"}
          trackJudges={data.judgesByTrack[selectedProject.trackId] || []}
          onClose={() => setSelectedSubmissionId(null)}
        />
      )}
    </div>
  );
}
