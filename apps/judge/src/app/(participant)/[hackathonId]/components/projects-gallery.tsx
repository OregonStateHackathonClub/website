"use client";

import type { Prisma } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { Filter, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TrackFilter } from "./track-filter";
import { SubmissionCard } from "./submission-card";

type Hackathon = Prisma.HackathonGetPayload<{
  include: {
    tracks: true;
    submissions: { include: { tracks: true; trackWins: true } };
  };
}>;

type Track = Hackathon["tracks"][number];

interface ProjectsGalleryProps {
  hackathon: Hackathon;
  tracks: Track[];
  hackathonId: string;
  userTeamId?: string | null;
  teamSubmission?: { id: string } | null;
}

export function ProjectsGallery({
  hackathon,
  tracks,
  hackathonId,
  userTeamId = null,
  teamSubmission = null,
}: ProjectsGalleryProps) {
  const [selectedTracks, setSelectedTracks] = useState<string[]>(["all"]);
  const [winnersOnly, setWinnersOnly] = useState(false);
  const [filteredSubmissions, setFilteredSubmissions] = useState(
    hackathon.submissions,
  );
  const router = useRouter();

  useEffect(() => {
    let filtered = hackathon.submissions;

    if (selectedTracks.length > 0 && !selectedTracks.includes("all")) {
      filtered = filtered.filter((submission) =>
        selectedTracks.some((selected) =>
          submission.tracks?.some(
            (link) => String(link.id) === String(selected),
          ),
        ),
      );
    }

    if (winnersOnly) {
      filtered = filtered.filter(
        (submission) => submission.trackWins.length > 0,
      );
    }

    setFilteredSubmissions(filtered);
  }, [selectedTracks, winnersOnly, hackathon.submissions]);

  const handleProjectClick = (submissionId: string) => {
    router.push(`/${hackathonId}/projects/${submissionId}`);
  };

  return (
    <div className="min-h-screen text-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">
            {hackathon.name}
          </h1>
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

          {/* Action Buttons */}
          {userTeamId ? (
            <div className="flex flex-wrap gap-3">
              {!teamSubmission && (
                <Link href={`/${hackathonId}/submission`}>
                  <Button
                    variant="outline"
                    className="rounded-none border-neutral-800 text-white hover:bg-neutral-900"
                  >
                    Create Submission
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href={`/${hackathonId}/create-team`}>
                <Button className="bg-white text-black hover:bg-neutral-200 rounded-none">
                  Create a Team
                </Button>
              </Link>
              <Link href={`/${hackathonId}/find-team`}>
                <Button
                  variant="outline"
                  className="rounded-none border-neutral-800 text-white hover:bg-neutral-900"
                >
                  Find a Team
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Submissions grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
          {filteredSubmissions.map((submission, index) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              index={index}
              showOpenButton={true}
              onClick={() => handleProjectClick(submission.id)}
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
