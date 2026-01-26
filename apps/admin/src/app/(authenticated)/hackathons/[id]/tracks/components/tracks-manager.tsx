"use client";

import type { Prisma } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { Layers, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteTrack } from "@/app/actions/hackathons";
import { AddTrackModal } from "./add-track-modal";
import { EditTrackModal } from "./edit-track-modal";
import { TrackCard } from "./track-card";

export type Track = Prisma.TrackGetPayload<{
  include: {
    rubric: { include: { criteria: true } };
    _count: { select: { submissions: true } };
  };
}>;

interface TracksManagerProps {
  hackathonId: string;
  tracks: Track[];
}

export function TracksManager({ hackathonId, tracks }: TracksManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  async function handleDeleteTrack(trackId: string, trackName: string) {
    if (!confirm(`Delete track "${trackName}"? This cannot be undone.`)) return;

    const result = await deleteTrack(hackathonId, trackId);
    if (result.success) {
      toast.success("Track deleted");
    } else {
      toast.error(result.error || "Failed to delete track");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Tracks</h2>
          <p className="text-sm text-neutral-500">
            {tracks.length} track{tracks.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-white text-black hover:bg-neutral-200 rounded-none flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Track
        </Button>
      </div>

      {tracks.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Layers className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No tracks yet</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Add tracks to organize submissions and prizes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onEdit={setEditingTrack}
              onDelete={handleDeleteTrack}
            />
          ))}
        </div>
      )}

      <AddTrackModal
        hackathonId={hackathonId}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      {editingTrack && (
        <EditTrackModal
          hackathonId={hackathonId}
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
        />
      )}
    </div>
  );
}
