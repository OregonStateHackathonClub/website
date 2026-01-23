"use client";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Textarea } from "@repo/ui/components/textarea";
import { SkipForward } from "lucide-react";
import { useState } from "react";

type SkipReason = "team_no_show" | "team_not_ready" | "technical" | "other";

const SKIP_REASONS: { value: SkipReason; label: string }[] = [
  { value: "team_no_show", label: "Team didn't show up" },
  { value: "team_not_ready", label: "Team not ready" },
  { value: "technical", label: "Technical difficulties" },
  { value: "other", label: "Other" },
];

interface SkipDialogProps {
  onClose: () => void;
  onSkip: (reason: string, note?: string) => void;
  isSubmitting?: boolean;
}

export function SkipDialog({
  onClose,
  onSkip,
  isSubmitting = false,
}: SkipDialogProps) {
  const [selectedReason, setSelectedReason] = useState<SkipReason | null>(null);
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    if (!selectedReason) return;
    onSkip(selectedReason, selectedReason === "other" ? note : undefined);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        className="bg-neutral-950 border-neutral-800 rounded-none max-w-md gap-0 [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none"
        onPointerDownOutside={(e: Event) => isSubmitting && e.preventDefault()}
        onEscapeKeyDown={(e: KeyboardEvent) =>
          isSubmitting && e.preventDefault()
        }
      >
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <SkipForward className="w-4 h-4 text-neutral-400" />
            </div>
            <DialogTitle className="text-lg font-medium text-white">
              Skip Submission
            </DialogTitle>
          </div>
          <DialogDescription className="text-neutral-500 mt-3">
            Select a reason for skipping. This will be recorded for organizers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          {SKIP_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              className={`w-full text-left px-4 py-3 border transition-colors ${
                selectedReason === reason.value
                  ? "border-neutral-600 bg-neutral-900 text-white"
                  : "border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              }`}
            >
              {reason.label}
            </button>
          ))}
        </div>

        {selectedReason === "other" && (
          <div className="mb-4">
            <label className="block text-sm text-neutral-400 mb-2">
              Please explain (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="bg-transparent border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none resize-none focus-visible:ring-0"
              placeholder="Enter details..."
            />
          </div>
        )}

        <DialogFooter className="flex-row justify-end gap-3 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-neutral-800 text-white hover:bg-neutral-900 rounded-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedReason || isSubmitting}
            className="bg-white text-black hover:bg-neutral-200 rounded-none"
          >
            {isSubmitting ? "Skipping..." : "Skip & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
