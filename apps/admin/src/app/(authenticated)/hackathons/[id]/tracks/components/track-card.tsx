"use client";

import { Award, ListChecks, Edit, Trash2, Trophy } from "lucide-react";
import type { Track } from "./tracks-manager";

interface TrackCardProps {
  track: Track;
  onEdit: (track: Track) => void;
  onDelete: (trackId: string, trackName: string) => void;
}

export function TrackCard({ track, onEdit, onDelete }: TrackCardProps) {
  return (
    <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-white">{track.name}</h3>
          {track.description && (
            <p className="text-sm text-neutral-500 mt-1">{track.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-neutral-500">
            <Trophy className="h-4 w-4" />
            {track._count.submissions}
          </div>
          <button
            onClick={() => onEdit(track)}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors"
            title="Edit track"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(track.id, track.name)}
            disabled={track._count.submissions > 0}
            className="p-1.5 text-neutral-500 hover:text-red-400 disabled:text-neutral-700 disabled:cursor-not-allowed transition-colors"
            title={
              track._count.submissions > 0
                ? "Cannot delete track with submissions"
                : "Delete track"
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {track.prize && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/30">
          <Award className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-amber-400">{track.prize}</span>
        </div>
      )}

      {track.rubric && (
        <div className="border-t border-neutral-800 pt-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="h-4 w-4 text-neutral-600" />
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Rubric: {track.rubric.name}
            </span>
          </div>
          <div className="space-y-2">
            {track.rubric.criteria.map((criterion) => (
              <div
                key={criterion.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-neutral-400">{criterion.name}</span>
                <span className="text-neutral-600">
                  {criterion.weight}% - max {criterion.maxScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
