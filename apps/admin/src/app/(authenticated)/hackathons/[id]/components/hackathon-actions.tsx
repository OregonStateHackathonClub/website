"use client";

import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteHackathon, updateHackathon } from "@/app/actions/hackathons";

interface HackathonActionsProps {
  hackathon: {
    id: string;
    name: string;
    description: string | null;
  };
  hasData: boolean;
}

export function HackathonActions({
  hackathon,
  hasData,
}: HackathonActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(hackathon.name);
  const [description, setDescription] = useState(hackathon.description || "");
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

        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsEditing(false);
              setName(hackathon.name);
              setDescription(hackathon.description || "");
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

  return (
    <div className="flex gap-3">
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 h-10 px-4 border border-neutral-800 text-white text-sm font-medium hover:bg-neutral-900 transition-colors"
      >
        <Pencil className="h-4 w-4" />
        Edit Hackathon
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
