"use client";

import { Button } from "@repo/ui/components/button";
import { Loader2, Mail, Scale, Settings, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { sendAllJudgeMagicLinks } from "@/app/actions/judging";
import { ConfigurePlanModal } from "./configure-plan-modal";
import { TrackCard } from "./track-card";
import type { Judge, Track } from "./types";

interface JudgingConfigProps {
  hackathonId: string;
  tracks: Track[];
  judges: Judge[];
}

export function JudgingConfig({
  hackathonId,
  tracks,
  judges,
}: JudgingConfigProps) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(
    tracks[0]?.id || null,
  );
  const [configureTrackId, setConfigureTrackId] = useState<string | null>(null);
  const [isSendingEmails, setIsSendingEmails] = useState(false);

  async function handleEmailAllJudges() {
    if (
      !confirm("Send magic link emails to all judges with track assignments?")
    ) {
      return;
    }

    setIsSendingEmails(true);
    const result = await sendAllJudgeMagicLinks(hackathonId);
    setIsSendingEmails(false);

    if (result.success) {
      toast.success(`Sent ${result.sent}/${result.total} magic links`);
    } else {
      toast.error(result.error || "Failed to send emails");
    }
  }

  const judgesWithAssignments = judges.filter(
    (j) => j.trackAssignments.length > 0,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">
            Judging Configuration
          </h2>
          <p className="text-sm text-neutral-500">
            Assign judges to tracks and configure judging rounds
          </p>
        </div>
        <Button
          onClick={handleEmailAllJudges}
          disabled={isSendingEmails || judgesWithAssignments.length === 0}
          className="bg-white text-black hover:bg-neutral-200 rounded-none flex items-center gap-2"
        >
          {isSendingEmails ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {isSendingEmails
            ? "Sending..."
            : `Email All Judges (${judgesWithAssignments.length})`}
        </Button>
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
                  setExpandedTrack(expandedTrack === track.id ? null : track.id)
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
