import { Button } from "@repo/ui/components/button";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface CompletedStateProps {
  skippedReason?: string | null;
  selectedIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function CompletedState({
  skippedReason,
  selectedIndex,
  totalCount,
  onPrevious,
  onNext,
}: CompletedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] text-center p-8">
      <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
      <h3 className="text-xl font-medium text-white mb-1">
        {skippedReason ? "Skipped" : "Score Submitted"}
      </h3>
      {skippedReason && (
        <p className="text-neutral-500">Reason: {skippedReason}</p>
      )}
      <div className="flex gap-2 mt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={selectedIndex === 0}
          className="border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-none flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={selectedIndex === totalCount - 1}
          className="border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 rounded-none flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
