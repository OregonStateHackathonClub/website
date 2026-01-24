"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Track {
  id: string;
  name: string;
}

interface TrackFilterProps {
  tracks: Track[];
  selectedTracks: string[];
  onSelectionChange: (tracks: string[]) => void;
}

export function TrackFilter({
  tracks,
  selectedTracks,
  onSelectionChange,
}: TrackFilterProps) {
  const isAllSelected =
    selectedTracks.includes("all") || selectedTracks.length === 0;

  const handleToggle = (trackId: string) => {
    if (trackId === "all") {
      onSelectionChange(["all"]);
      return;
    }

    // Remove "all" if selecting specific track
    let newSelection = selectedTracks.filter((id) => id !== "all");

    if (newSelection.includes(trackId)) {
      newSelection = newSelection.filter((id) => id !== trackId);
    } else {
      newSelection = [...newSelection, trackId];
    }

    // If nothing selected, default to "all"
    if (newSelection.length === 0) {
      onSelectionChange(["all"]);
    } else {
      onSelectionChange(newSelection);
    }
  };

  const getDisplayText = () => {
    if (isAllSelected) return "All Tracks";
    if (selectedTracks.length === 1) {
      const track = tracks.find((t) => t.id === selectedTracks[0]);
      return track?.name || "Select...";
    }
    return `${selectedTracks.length} tracks`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200 hover:text-white focus:outline-none">
        <span>{getDisplayText()}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="border-neutral-700 bg-neutral-800"
      >
        <DropdownMenuCheckboxItem
          checked={isAllSelected}
          onCheckedChange={() => handleToggle("all")}
          className="text-neutral-200 focus:bg-neutral-700 focus:text-white"
        >
          All Tracks
        </DropdownMenuCheckboxItem>
        {tracks.map((track) => (
          <DropdownMenuCheckboxItem
            key={track.id}
            checked={!isAllSelected && selectedTracks.includes(track.id)}
            onCheckedChange={() => handleToggle(track.id)}
            className="text-neutral-200 focus:bg-neutral-700 focus:text-white"
          >
            {track.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
