"use client";

import { useState } from "react";
import {
  Layers,
  Trophy,
  Award,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createTrack, deleteTrack } from "@/app/actions/hackathons";

type Track = {
  id: string;
  name: string;
  description: string;
  prize: string | null;
  rubric: {
    id: string;
    name: string;
    criteria: {
      id: string;
      name: string;
      weight: number;
      maxScore: number;
    }[];
  } | null;
  _count: {
    submissions: number;
  };
};

interface TracksClientProps {
  hackathonId: string;
  tracks: Track[];
}

type CriterionInput = {
  name: string;
  weight: number;
  maxScore: number;
};

export function TracksClient({ hackathonId, tracks }: TracksClientProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [trackName, setTrackName] = useState("");
  const [trackDescription, setTrackDescription] = useState("");
  const [trackPrize, setTrackPrize] = useState("");
  const [rubricName, setRubricName] = useState("");
  const [criteria, setCriteria] = useState<CriterionInput[]>([
    { name: "", weight: 25, maxScore: 10 },
  ]);

  function resetForm() {
    setTrackName("");
    setTrackDescription("");
    setTrackPrize("");
    setRubricName("");
    setCriteria([{ name: "", weight: 25, maxScore: 10 }]);
  }

  function addCriterion() {
    setCriteria([...criteria, { name: "", weight: 0, maxScore: 10 }]);
  }

  function removeCriterion(index: number) {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  }

  function updateCriterion(
    index: number,
    field: keyof CriterionInput,
    value: string | number
  ) {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  }

  async function handleCreateTrack() {
    if (!trackName.trim()) {
      toast.error("Track name is required");
      return;
    }
    if (!trackDescription.trim()) {
      toast.error("Track description is required");
      return;
    }
    if (!rubricName.trim()) {
      toast.error("Rubric name is required");
      return;
    }

    const validCriteria = criteria.filter((c) => c.name.trim());
    if (validCriteria.length === 0) {
      toast.error("At least one criterion is required");
      return;
    }

    const totalWeight = validCriteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      toast.error(`Criteria weights must sum to 100% (currently ${totalWeight}%)`);
      return;
    }

    setIsSubmitting(true);
    const result = await createTrack(hackathonId, {
      name: trackName.trim(),
      description: trackDescription.trim(),
      prize: trackPrize.trim() || undefined,
      rubric: {
        name: rubricName.trim(),
        criteria: validCriteria,
      },
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Track created successfully");
      setIsAddDialogOpen(false);
      resetForm();
    } else {
      toast.error(result.error || "Failed to create track");
    }
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Tracks</h2>
          <p className="text-sm text-neutral-500">
            {tracks.length} track{tracks.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="h-10 px-4 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Track
        </button>
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
            <div
              key={track.id}
              className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-white">
                    {track.name}
                  </h3>
                  {track.description && (
                    <p className="text-sm text-neutral-500 mt-1">
                      {track.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Trophy className="h-4 w-4" />
                    {track._count.submissions}
                  </div>
                  <button
                    onClick={() => handleDeleteTrack(track.id, track.name)}
                    disabled={track._count.submissions > 0}
                    className="p-1.5 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          ))}
        </div>
      )}

      {/* Add Track Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}
          />
          <div className="relative bg-neutral-950 border border-neutral-800 p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">Add Track</h3>
              <button
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
                className="p-1 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Track Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Track Information
                </h4>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="e.g., Best Overall"
                    className="w-full h-10 px-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={trackDescription}
                    onChange={(e) => setTrackDescription(e.target.value)}
                    placeholder="Describe what this track is for..."
                    rows={2}
                    className="w-full px-3 py-2 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    Prize (optional)
                  </label>
                  <input
                    type="text"
                    value={trackPrize}
                    onChange={(e) => setTrackPrize(e.target.value)}
                    placeholder="e.g., $500 + Prizes"
                    className="w-full h-10 px-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              {/* Rubric */}
              <div className="space-y-4">
                <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Rubric
                </h4>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    Rubric Name *
                  </label>
                  <input
                    type="text"
                    value={rubricName}
                    onChange={(e) => setRubricName(e.target.value)}
                    placeholder="e.g., General Judging Criteria"
                    className="w-full h-10 px-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-neutral-400">
                      Criteria * (weights must sum to 100%)
                    </label>
                    <button
                      type="button"
                      onClick={addCriterion}
                      className="text-xs text-neutral-500 hover:text-white transition-colors"
                    >
                      + Add Criterion
                    </button>
                  </div>
                  <div className="space-y-2">
                    {criteria.map((criterion, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) =>
                            updateCriterion(index, "name", e.target.value)
                          }
                          placeholder="Criterion name"
                          className="flex-1 h-9 px-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                        />
                        <input
                          type="number"
                          value={criterion.weight}
                          onChange={(e) =>
                            updateCriterion(
                              index,
                              "weight",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="%"
                          className="w-16 h-9 px-2 bg-transparent border border-neutral-800 text-white text-sm text-center focus:outline-none focus:border-neutral-600"
                        />
                        <span className="text-neutral-600 text-sm">%</span>
                        <input
                          type="number"
                          value={criterion.maxScore}
                          onChange={(e) =>
                            updateCriterion(
                              index,
                              "maxScore",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="Max"
                          className="w-16 h-9 px-2 bg-transparent border border-neutral-800 text-white text-sm text-center focus:outline-none focus:border-neutral-600"
                        />
                        <span className="text-neutral-600 text-sm">max</span>
                        {criteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCriterion(index)}
                            className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">
                    Total:{" "}
                    {criteria.reduce((sum, c) => sum + (c.weight || 0), 0)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
              <button
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
                className="h-10 px-4 border border-neutral-800 text-white text-sm font-medium hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrack}
                disabled={isSubmitting}
                className="h-10 px-4 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Creating..." : "Create Track"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
