"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createHackathon } from "@/app/actions/hackathons";

export default function CreateHackathonPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    const result = await createHackathon({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setLoading(false);

    if (result.success && result.id) {
      toast.success("Hackathon created");
      router.push(`/hackathons/${result.id}`);
    } else {
      toast.error(result.error || "Failed to create hackathon");
    }
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/hackathons"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hackathons
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Create Hackathon</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Create a new hackathon event
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-6 space-y-6">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="BeaverHacks Winter 2025"
                className="w-full h-10 pl-10 pr-4 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for the hackathon..."
              rows={4}
              className="w-full px-4 py-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            href="/hackathons"
            className="h-10 px-4 border border-neutral-800 bg-transparent text-white text-sm font-medium flex items-center justify-center hover:bg-neutral-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-10 px-6 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Hackathon"}
          </button>
        </div>
      </form>
    </div>
  );
}
