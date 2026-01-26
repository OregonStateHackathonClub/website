import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Code, Eye } from "lucide-react";
import type { Hackathon } from "./types";
import { STATUS_OPTIONS } from "./types";

interface ControlsProps {
  hackathons: Hackathon[];
  selectedHackathon: Hackathon | null;
  onHackathonChange: (hackathon: Hackathon) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  showPreview: boolean;
  onShowPreviewChange: (show: boolean) => void;
}

export function Controls({
  hackathons,
  selectedHackathon,
  onHackathonChange,
  statusFilter,
  onStatusFilterChange,
  showPreview,
  onShowPreviewChange,
}: ControlsProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b border-neutral-800 bg-neutral-950/50">
      {/* Hackathon Selector */}
      <Select
        value={selectedHackathon?.id || ""}
        onValueChange={(value) => {
          const hackathon = hackathons.find((h) => h.id === value);
          if (hackathon) onHackathonChange(hackathon);
        }}
      >
        <SelectTrigger className="w-[200px] bg-transparent border-neutral-700 text-white rounded-none">
          <SelectValue placeholder="Select Hackathon" />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border-neutral-700 rounded-none">
          {hackathons.map((h) => (
            <SelectItem key={h.id} value={h.id}>
              {h.name} ({h._count.applications})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-40] bg-transparent border-neutral-700 text-white rounded-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border-neutral-700 rounded-none">
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1" />

      {/* Preview Toggle */}
      <div className="flex items-center border border-neutral-700">
        <button
          onClick={() => onShowPreviewChange(false)}
          className={`flex items-center gap-2 px-3 py-2 text-sm ${
            !showPreview
              ? "bg-neutral-800 text-white"
              : "text-neutral-500 hover:text-white"
          }`}
        >
          <Code className="h-4 w-4" />
          Code
        </button>
        <button
          onClick={() => onShowPreviewChange(true)}
          className={`flex items-center gap-2 px-3 py-2 text-sm ${
            showPreview
              ? "bg-neutral-800 text-white"
              : "text-neutral-500 hover:text-white"
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>
    </div>
  );
}
