"use client";

import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Calendar, Pencil, Trash2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteHackathon,
  setWinnersReleased,
  updateHackathon,
} from "@/app/actions/hackathons";

interface HackathonActionsProps {
  hackathon: {
    id: string;
    name: string;
    description: string | null;
    startsAt: Date | null;
    endsAt: Date | null;
    winnersReleasedAt: Date | null;
  };
  hasData: boolean;
}

function toDatetimeLocal(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function HackathonActions({
  hackathon,
  hasData,
}: HackathonActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(hackathon.name);
  const [description, setDescription] = useState(hackathon.description || "");
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(hackathon.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(hackathon.endsAt));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    const result = await updateHackathon(hackathon.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Hackathon updated");
      setIsEditing(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update hackathon");
    }
  };

  const handleToggleWinners = async () => {
    const release = !hackathon.winnersReleasedAt;
    if (
      release &&
      !confirm(
        "Release winners publicly? Participants will see the track winners in the gallery.",
      )
    ) {
      return;
    }
    if (
      !release &&
      !confirm("Hide winners from participants? They'll disappear from the gallery.")
    ) {
      return;
    }

    setLoading(true);
    const result = await setWinnersReleased(hackathon.id, release);
    setLoading(false);

    if (result.success) {
      toast.success(release ? "Winners released" : "Winners hidden");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update winner release");
    }
  };

  const handleDelete = async () => {
    if (hasData) {
      toast.error(
        "Cannot delete hackathon with existing participants, teams, or submissions",
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${hackathon.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await deleteHackathon(hackathon.id);
    setLoading(false);

    if (result.success) {
      toast.success("Hackathon deleted");
      router.push("/hackathons");
    } else {
      toast.error(result.error || "Failed to delete hackathon");
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Name
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent dark:bg-transparent w-full h-10 pl-10 pr-4 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-transparent dark:bg-transparent w-full px-4 py-3 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none resize-none focus-visible:ring-0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Submissions Open
            </label>
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="bg-transparent dark:bg-transparent w-full h-10 px-4 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Submissions Close
            </label>
            <Input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="bg-transparent dark:bg-transparent w-full h-10 px-4 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsEditing(false);
              setName(hackathon.name);
              setDescription(hackathon.description || "");
              setStartsAt(toDatetimeLocal(hackathon.startsAt));
              setEndsAt(toDatetimeLocal(hackathon.endsAt));
            }}
            className="h-10 px-4 border border-neutral-800 bg-transparent text-white text-sm font-medium hover:bg-neutral-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="h-10 px-4 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  const released = !!hackathon.winnersReleasedAt;

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 h-10 px-4 border border-neutral-800 text-white text-sm font-medium hover:bg-neutral-900 transition-colors"
      >
        <Pencil className="h-4 w-4" />
        Edit Hackathon
      </button>
      <button
        onClick={handleToggleWinners}
        disabled={loading}
        className={`flex items-center gap-2 h-10 px-4 border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          released
            ? "border-neutral-800 text-white hover:bg-neutral-900"
            : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
        }`}
        title={
          released
            ? `Released ${hackathon.winnersReleasedAt?.toLocaleString()}`
            : "Publish winners to the public gallery"
        }
      >
        <Trophy className="h-4 w-4" />
        {released ? "Hide Winners" : "Release Winners"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading || hasData}
        className="flex items-center gap-2 h-10 px-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={hasData ? "Cannot delete hackathon with existing data" : ""}
      >
        <Trash2 className="h-4 w-4" />
        Delete Hackathon
      </button>
    </div>
  );
}
