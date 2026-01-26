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
import { Textarea } from "@repo/ui/components/textarea";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateTrack } from "@/app/actions/hackathons";
import type { CriterionInput } from "./add-track-modal";
import type { Track } from "./tracks-manager";

interface EditTrackModalProps {
  hackathonId: string;
  track: Track;
  onClose: () => void;
}

type CriterionWithId = CriterionInput & { id?: string };

export function EditTrackModal({
  hackathonId,
  track,
  onClose,
}: EditTrackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackName, setTrackName] = useState(track.name);
  const [trackDescription, setTrackDescription] = useState(track.description);
  const [trackPrize, setTrackPrize] = useState(track.prize || "");
  const [rubricName, setRubricName] = useState(track.rubric?.name || "");
  const [criteria, setCriteria] = useState<CriterionWithId[]>(
    track.rubric?.criteria.map((c) => ({
      id: c.id,
      name: c.name,
      weight: c.weight,
      maxScore: c.maxScore,
    })) || [{ name: "", weight: 25, maxScore: 10 }],
  );

  function handleOpenChange(open: boolean) {
    if (!open && !isSubmitting) {
      onClose();
    }
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
    value: string | number,
  ) {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  }

  async function handleSave() {
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
      toast.error(
        `Criteria weights must sum to 100% (currently ${totalWeight}%)`,
      );
      return;
    }

    setIsSubmitting(true);
    const result = await updateTrack(hackathonId, track.id, {
      name: trackName.trim(),
      description: trackDescription.trim(),
      prize: trackPrize.trim() || null,
      rubric: {
        name: rubricName.trim(),
        criteria: validCriteria.map((c) => ({
          id: c.id,
          name: c.name,
          weight: c.weight,
          maxScore: c.maxScore,
        })),
      },
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Track updated successfully");
      onClose();
    } else {
      toast.error(result.error || "Failed to update track");
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="bg-neutral-950 border-neutral-800 rounded-none max-w-lg max-h-[90vh] overflow-y-auto gap-0 [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none"
        onPointerDownOutside={(e: Event) => isSubmitting && e.preventDefault()}
        onEscapeKeyDown={(e: KeyboardEvent) =>
          isSubmitting && e.preventDefault()
        }
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="text-lg font-medium text-white">
            Edit Track
          </DialogTitle>
        </DialogHeader>

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
              <Input
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="e.g., Best Overall"
                className="bg-transparent dark:bg-transparent border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Description *
              </label>
              <Textarea
                value={trackDescription}
                onChange={(e) => setTrackDescription(e.target.value)}
                placeholder="Describe what this track is for..."
                rows={2}
                className="border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none resize-none focus-visible:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Prize (optional)
              </label>
              <Input
                type="text"
                value={trackPrize}
                onChange={(e) => setTrackPrize(e.target.value)}
                placeholder="e.g., $500 + Prizes"
                className="bg-transparent dark:bg-transparent border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
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
              <Input
                type="text"
                value={rubricName}
                onChange={(e) => setRubricName(e.target.value)}
                placeholder="e.g., General Judging Criteria"
                className="bg-transparent dark:bg-transparent border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
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
                  <div
                    key={criterion.id || index}
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="text"
                      value={criterion.name}
                      onChange={(e) =>
                        updateCriterion(index, "name", e.target.value)
                      }
                      placeholder="Criterion name"
                      className="flex-1 h-9 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
                    />
                    <Input
                      type="number"
                      value={criterion.weight}
                      onChange={(e) =>
                        updateCriterion(
                          index,
                          "weight",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="%"
                      className="w-16 h-9 border-neutral-800 text-white text-center placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
                    />
                    <span className="text-neutral-600 text-sm">%</span>
                    <Input
                      type="number"
                      value={criterion.maxScore}
                      onChange={(e) =>
                        updateCriterion(
                          index,
                          "maxScore",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="Max"
                      className="w-16 h-9 border-neutral-800 text-white text-center placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
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
                Total: {criteria.reduce((sum, c) => sum + (c.weight || 0), 0)}%
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-neutral-800 text-white hover:bg-neutral-900 rounded-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-white text-black hover:bg-neutral-200 rounded-none"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
