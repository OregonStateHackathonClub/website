"use client";

import { Check, Loader2 } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveIndicatorProps {
  status: SaveStatus;
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <>
      {status === "saving" && (
        <span className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </span>
      )}
      {status === "saved" && (
        <span className="flex items-center gap-2 text-sm text-green-500">
          <Check className="h-4 w-4" />
          Saved
        </span>
      )}
      {status === "error" && (
        <span className="text-sm text-red-500">Save failed</span>
      )}
    </>
  );
}
