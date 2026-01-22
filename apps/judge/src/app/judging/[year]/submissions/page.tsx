import { getHackathonSubmissions } from "./server-actions";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const submissions = await getHackathonSubmissions(year);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">All Submissions</h1>
      <p className="text-neutral-400 mb-6">
        {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {submissions.map((submission) => (
          <Link
            key={submission.id}
            href={`/${year}/projects/${submission.id}`}
            className="block border border-neutral-800 bg-neutral-900/50 p-4 hover:border-neutral-700 transition-colors"
          >
            <h3 className="font-medium text-white">{submission.name}</h3>
            {submission.tracks.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {submission.tracks.map((track) => (
                  <span
                    key={track.id}
                    className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400"
                  >
                    {track.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
        {submissions.length === 0 && (
          <p className="text-neutral-500 text-center py-8">
            No submissions yet.
          </p>
        )}
      </div>
    </div>
  );
}
