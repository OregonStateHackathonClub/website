import { getHackathonTeams } from "@/app/actions/hackathons";
import { Users, Trophy, CheckCircle, XCircle } from "lucide-react";

interface TeamsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { id } = await params;
  const teams = await getHackathonTeams(id);

  const teamsWithSubmissions = teams.filter((t) => t.submission);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Teams</h2>
          <p className="text-sm text-neutral-500">
            {teams.length} teams • {teamsWithSubmissions.length} with submissions
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No teams yet</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Teams will appear here once participants create them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-medium text-white">
                    {team.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {team._count.members} member{team._count.members !== 1 ? "s" : ""}
                  </p>
                </div>
                {team.submission ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="h-3 w-3" />
                    Submitted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-neutral-800/50 text-neutral-400 border border-neutral-700">
                    <XCircle className="h-3 w-3" />
                    No submission
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Members
                </p>
                <div className="space-y-1">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="text-sm text-neutral-400"
                    >
                      {member.participant.user.name}
                    </div>
                  ))}
                </div>
              </div>

              {team.submission && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-neutral-600" />
                    <span className="text-white font-medium">
                      {team.submission.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
