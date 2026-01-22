import { getJudgeAssignments } from "@/app/actions/scoring";
import { JudgeClient } from "./judge-client";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const result = await getJudgeAssignments(year);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-neutral-400">{result.error}</p>
      </div>
    );
  }

  return (
    <JudgeClient
      hackathonId={year}
      year={year}
      assignments={result.assignments || []}
    />
  );
}
