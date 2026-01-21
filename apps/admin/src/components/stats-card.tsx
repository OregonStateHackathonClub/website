import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
}

export function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
  return (
    <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          {title}
        </p>
        <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <Icon className="h-4 w-4 text-neutral-500" />
        </div>
      </div>
      <div className="text-3xl font-semibold text-white">{value}</div>
      {description && (
        <p className="text-sm text-neutral-500 mt-1">{description}</p>
      )}
    </div>
  );
}
