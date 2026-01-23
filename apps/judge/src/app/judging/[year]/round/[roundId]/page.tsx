import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getRoundTimeline } from "@/app/actions/scoring";
import { Round } from "./round";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; roundId: string }>;
}) {
  const { year, roundId } = await params;
  const result = await getRoundTimeline(year, roundId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-neutral-400">{result.error}</p>
        <Link
          href={`/judging/${year}`}
          className="mt-4 text-sm text-neutral-500 hover:text-white flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <Round
      hackathonId={year}
      round={result.round!}
      assignments={result.assignments || []}
    />
  );
}
