import type { TrackingProject } from "@/app/actions/tracking";

interface ProjectCardProps {
  project: TrackingProject;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-neutral-900 border border-neutral-800 p-4 text-left transition-all hover:bg-neutral-900/80 hover:border-neutral-700 w-full"
    >
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
        <span className="text-xs font-mono text-neutral-600">
          {project.completedCount}/{project.totalCount}
        </span>
      </div>
    </button>
  );
}
