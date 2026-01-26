"use client";

interface TrackSelectorProps {
  tracks: { id: string; name: string }[];
  selectedIds: string[];
  onToggle: (trackId: string) => void;
  error?: string;
}

export function TrackSelector({
  tracks,
  selectedIds,
  onToggle,
  error,
}: TrackSelectorProps) {
  return (
    <div className="border border-neutral-800 bg-neutral-950/80 p-6">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
        Tracks *
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Select the tracks you&apos;re competing in
      </p>

      <div className="flex flex-wrap gap-2">
        {tracks.map((track) => {
          const isSelected = selectedIds.includes(track.id);
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onToggle(track.id)}
              className={`border px-3 py-1.5 text-sm transition-colors ${
                isSelected
                  ? "border-white bg-white text-black"
                  : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {track.name}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
