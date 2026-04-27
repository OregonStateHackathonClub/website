import type { TrackingProject } from "@/app/actions/tracking";

interface ProjectCardProps {
  project: TrackingProject;
  roundType: string;
  onClick: () => void;
}

const PLACE_LABELS: Record<number, string> = {
  1: "1ST PLACE",
  2: "2ND PLACE",
  3: "3RD PLACE",
};

const PLACE_STYLES: Record<number, string> = {
  1: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  2: "bg-neutral-400/20 text-neutral-200 border-neutral-400/40",
  3: "bg-orange-700/20 text-orange-300 border-orange-700/40",
};

function scoreSuffix(roundType: string): string {
  if (roundType === "TRIAGE") return " / 5";
  if (roundType === "RUBRIC") return " / 10";
  if (roundType === "RANKED") return " pts";
  return "";
}

export function ProjectCard({ project, roundType, onClick }: ProjectCardProps) {
  const place = project.place;
  const placeLabel = place ? PLACE_LABELS[place] : null;
  const placeStyle = place ? PLACE_STYLES[place] : "";

  const bannerClass = placeLabel
    ? `border-b ${placeStyle}`
    : project.advanced
      ? "border-b border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
      : "border-b border-transparent invisible";

  return (
    <button
      onClick={onClick}
      className="bg-neutral-900 border border-neutral-800 text-left transition-all hover:bg-neutral-900/80 hover:border-neutral-700 w-full"
    >
      <div
        className={`px-4 py-1 text-[10px] font-mono uppercase tracking-wider ${bannerClass}`}
      >
        {placeLabel ?? (project.advanced ? "Advanced" : "\u00A0")}
      </div>

      <div className="p-4">
        <div className="text-sm font-semibold text-neutral-200 truncate">
          {project.teamName || project.title}
        </div>
        <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mt-0.5">
          {project.trackName}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">
            {project.assignments.map((a) => (
              <div
                key={a.id}
                className={`w-3 h-3 rounded-sm ${
                  a.status === "scored"
                    ? "bg-[#4a7a5a]"
                    : a.status === "in_progress"
                      ? "bg-[#8a7a4a]"
                      : a.status === "skipped"
                        ? "bg-[#9a5555]"
                        : "bg-neutral-900 border border-neutral-700"
                }`}
                title={`${a.judgeName} — ${a.status.replace("_", " ")}`}
              />
            ))}
          </div>
          {project.score !== null && (
            <span className="font-mono text-sm font-semibold text-neutral-200">
              {project.score.toFixed(1)}
              <span className="font-normal text-neutral-500">
                {scoreSuffix(roundType)}
              </span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
