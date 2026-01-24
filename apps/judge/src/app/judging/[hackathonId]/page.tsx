import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getJudgeDashboard } from "@/app/actions/judge";
import { Dashboard } from "./components/dashboard";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const result = await getJudgeDashboard(year);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-neutral-400">{result.error}</p>
        <Link
          href="/judging"
          className="mt-4 text-sm text-neutral-500 hover:text-white flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Hackathons
        </Link>
      </div>
    );
  }

  return (
    <Dashboard
      hackathonId={year}
      hackathonName={result.hackathonName || "Hackathon"}
      rounds={result.rounds || []}
    />
  );
}
