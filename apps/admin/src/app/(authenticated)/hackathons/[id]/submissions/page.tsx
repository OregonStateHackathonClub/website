import { getHackathonSubmissions } from "@/app/actions/hackathons";
import { Trophy, Github, Video, ExternalLink, Users, Star } from "lucide-react";
import Link from "next/link";

interface SubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { id } = await params;
  const submissions = await getHackathonSubmissions(id);

  const scoredCount = submissions.filter((s) => s._count.scores > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Submissions</h2>
          <p className="text-sm text-neutral-500">
            {submissions.length} submissions • {scoredCount} scored
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No submissions yet</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Submissions will appear here once teams submit their projects.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">
                    {submission.name}
                  </h3>
                  {submission.tagline && (
                    <p className="text-sm text-neutral-400 mt-1">
                      {submission.tagline}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                      <Users className="h-4 w-4" />
                      {submission.team.name}
                    </div>
                    {submission._count.scores > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                        <Star className="h-4 w-4" />
                        {submission._count.scores} score{submission._count.scores !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {submission.githubUrl && (
                    <a
                      href={submission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                      title="GitHub"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {submission.videoUrl && (
                    <a
                      href={submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                      title="Demo Video"
                    >
                      <Video className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {submission.description && (
                <p className="text-sm text-neutral-500 mt-4 line-clamp-2">
                  {submission.description}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-neutral-800">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Team Members
                </p>
                <div className="flex flex-wrap gap-2">
                  {submission.team.members.map((member) => (
                    <span
                      key={member.id}
                      className="px-2 py-1 text-xs bg-neutral-800/50 text-neutral-400 border border-neutral-700"
                    >
                      {member.participant.user.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
