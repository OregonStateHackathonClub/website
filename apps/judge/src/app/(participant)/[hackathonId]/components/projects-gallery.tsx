"use client";

import type { Prisma } from "@repo/database";
import { Filter, Heart, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toggleLike } from "@/app/actions/participant";
import { TrackFilter } from "./track-filter";
import { SubmissionCard } from "./submission-card";

type Hackathon = Prisma.HackathonGetPayload<{
  include: {
    tracks: true;
    submissions: {
      include: {
        tracks: true;
        trackWins: true;
        _count: { select: { likes: true } };
      };
    };
  };
}>;

type Track = Hackathon["tracks"][number];

interface ProjectsGalleryProps {
  hackathon: Hackathon;
  tracks: Track[];
  hackathonId: string;
  likedSubmissionIds?: string[];
  canLike?: boolean;
}

export function ProjectsGallery({
  hackathon,
  tracks,
  hackathonId,
  likedSubmissionIds = [],
  canLike = false,
}: ProjectsGalleryProps) {
  const [selectedTracks, setSelectedTracks] = useState<string[]>(["all"]);
  const [winnersOnly, setWinnersOnly] = useState(false);
  const [sortByLikes, setSortByLikes] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(
    new Set(likedSubmissionIds),
  );
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const s of hackathon.submissions) {
      counts[s.id] = s._count.likes;
    }
    return counts;
  });
  const [filteredSubmissions, setFilteredSubmissions] = useState(
    hackathon.submissions,
  );
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    let filtered = hackathon.submissions;
    const hasTrackFilter =
      selectedTracks.length > 0 && !selectedTracks.includes("all");

    if (winnersOnly) {
      // Winners filter: when a track is selected, only include submissions
      // that won THAT track (not just submissions entered in it).
      filtered = filtered.filter((submission) => {
        if (submission.trackWins.length === 0) return false;
        if (!hasTrackFilter) return true;
        return submission.trackWins.some((win) =>
          selectedTracks.includes(win.trackId),
        );
      });
    } else if (hasTrackFilter) {
      filtered = filtered.filter((submission) =>
        selectedTracks.some((selected) =>
          submission.tracks?.some(
            (link) => String(link.id) === String(selected),
          ),
        ),
      );
    }

    if (sortByLikes) {
      filtered = [...filtered].sort(
        (a, b) => (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0),
      );
    }

    setFilteredSubmissions(filtered);
  }, [
    selectedTracks,
    winnersOnly,
    sortByLikes,
    likeCounts,
    hackathon.submissions,
  ]);

  const handleLike = (submissionId: string) => {
    const wasLiked = likedIds.has(submissionId);

    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) {
        next.delete(submissionId);
      } else {
        next.add(submissionId);
      }
      return next;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [submissionId]: (prev[submissionId] ?? 0) + (wasLiked ? -1 : 1),
    }));

    startTransition(async () => {
      const result = await toggleLike(hackathonId, submissionId);
      if (!result.success) {
        // Revert on error
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (wasLiked) {
            next.add(submissionId);
          } else {
            next.delete(submissionId);
          }
          return next;
        });
        setLikeCounts((prev) => ({
          ...prev,
          [submissionId]: (prev[submissionId] ?? 0) + (wasLiked ? 1 : -1),
        }));
      }
    });
  };

  const handleProjectClick = (submissionId: string) => {
    router.push(`/${hackathonId}/projects/${submissionId}`);
  };

  return (
    <div className="min-h-screen text-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">{hackathon.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Explore projects, filter by track, and discover the builds.
          </p>
        </div>

        {/* Filter & Actions */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          {/* Track Filter */}
          <div className="inline-flex items-center border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm text-sm text-neutral-200">
            <div className="flex items-center gap-2 px-4 py-2">
              <Filter className="h-4 w-4" />
              <span className="whitespace-nowrap">Filter by track:</span>
            </div>
            <div className="h-5 w-px bg-neutral-800" />
            <TrackFilter
              tracks={tracks}
              selectedTracks={selectedTracks}
              onSelectionChange={setSelectedTracks}
            />
          </div>

          <button
            type="button"
            onClick={() => setWinnersOnly((prev) => !prev)}
            className={`inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm transition-colors ${
              winnersOnly
                ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
                : "border-neutral-800 bg-neutral-950/80 text-neutral-200 hover:border-neutral-700"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Winners
          </button>

          <button
            type="button"
            onClick={() => setSortByLikes((prev) => !prev)}
            className={`inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm transition-colors ${
              sortByLikes
                ? "border-rose-500/30 bg-rose-500/20 text-rose-400"
                : "border-neutral-800 bg-neutral-950/80 text-neutral-200 hover:border-neutral-700"
            }`}
          >
            <Heart className="h-4 w-4" />
            Most Liked
          </button>
        </div>

        {/* Submissions grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
          {filteredSubmissions.map((submission, index) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              index={index}
              onClick={() => handleProjectClick(submission.id)}
              likeCount={likeCounts[submission.id] ?? 0}
              isLiked={likedIds.has(submission.id)}
              onLike={canLike ? handleLike : undefined}
            />
          ))}
        </div>

        {/* No results */}
        {filteredSubmissions.length === 0 && (
          <div className="py-24 text-center text-neutral-500">
            No submissions found for the selected track.
          </div>
        )}
      </div>
    </div>
  );
}
