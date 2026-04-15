import type { TrackingStats } from "@/app/actions/tracking";

interface StatsBarProps {
  stats: TrackingStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "Projects", value: stats.total },
    { label: "Complete", value: stats.complete },
    { label: "In Progress", value: stats.inProgress },
    { label: "Issues", value: stats.issues },
    { label: "Not Started", value: stats.notStarted },
  ];

  return (
    <div className="grid grid-cols-5 border border-neutral-800">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`bg-neutral-950/80 px-4 py-3 ${
            i < items.length - 1 ? "border-r border-neutral-800" : ""
          }`}
        >
          <div className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider font-mono">
            {item.label}
          </div>
          <div className="text-2xl font-bold text-neutral-200 tabular-nums mt-1">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
