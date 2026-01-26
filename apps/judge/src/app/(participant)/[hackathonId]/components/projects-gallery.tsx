"use client";

import type { Prisma } from "@repo/database";
import { Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TrackFilter } from "./track-filter";
import { SubmissionCard } from "./submission-card";

type Hackathon = Prisma.HackathonGetPayload<{
  include: {
    tracks: true;
    submissions: { include: { tracks: true } };
    sponsors: true;
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
  const [filteredSubmissions, setFilteredSubmissions] = useState(
    hackathon.submissions,
  );
  const router = useRouter();

  useEffect(() => {
    if (selectedTracks.length === 0 || selectedTracks.includes("all")) {
      setFilteredSubmissions(hackathon.submissions);
    } else {
      const filtered = hackathon.submissions.filter((submission) =>
        selectedTracks.some((selected) =>
          submission.tracks?.some(
            (link) => String(link.id) === String(selected),
          ),
        ),
      );
      setFilteredSubmissions(filtered);
    }
  }, [selectedTracks, hackathon.submissions]);

  const handleProjectClick = (submissionId: string) => {
    router.push(`/${hackathonId}/projects/${submissionId}`);
  };

  return (
    <div className="min-h-screen text-neutral-200">
      {/* ====== HERO / TITLE BANNER ====== */}
      <div
        className="relative isolate overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,.00), rgba(10,10,10,.00)), url("/hero-dark-texture.jpg")`,
          // ${hackathon?.bannerImage || "/hero-dark-texture.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-8 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-neutral-300 text-s tracking-wide">
              Oregon State University
            </span>
            <h1 className="bg-linear-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-sm sm:text-5xl md:text-6xl">
              {hackathon.name}
            </h1>
            <p className="max-w-2xl text-neutral-300 text-sm sm:text-base">
              Explore projects, filter by track, and discover the builds.
            </p>
          </div>

          {/* Sponsors (per year) */}
          {hackathon.sponsors && hackathon.sponsors.length > 0 && (
            <div className="mt-12">
              <div className="mx-auto max-w-5xl">
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-6">
                  <p className="mb-4 text-center text-neutral-400 text-s tracking-wide">
                    Sponsors
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                    {hackathon.sponsors.map((sponsor) => (
                      <a
                        key={sponsor.id}
                        href={sponsor.websiteUrl || "#"}
                        target={sponsor.websiteUrl ? "_blank" : undefined}
                        rel={
                          sponsor.websiteUrl ? "noopener noreferrer" : undefined
                        }
                        className="flex items-center justify-center opacity-80 transition hover:scale-102 hover:opacity-100"
                      >
                        <Image
                          src={sponsor.logoUrl}
                          alt={sponsor.name}
                          width={150}
                          height={150}
                          className="object-contain"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Quick actions / filter */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          {/* Track Filter */}
          <div className="inline-flex items-center rounded-xl border border-neutral-700 bg-neutral-800/50 text-sm text-neutral-200">
            <div className="flex items-center gap-2 px-4 py-2">
              <Filter className="h-4 w-4" />
              <span className="whitespace-nowrap">Filter by track:</span>
            </div>
            <div className="h-5 w-px bg-neutral-700" />
            <TrackFilter
              tracks={tracks}
              selectedTracks={selectedTracks}
              onSelectionChange={setSelectedTracks}
            />
          </div>

          {/* Action Buttons */}
          {userTeamId ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${hackathonId}/team/${userTeamId}`}
                className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-sm text-white transition hover:bg-orange-300 hover:text-black"
              >
                Go to Your Team
              </Link>
              {!teamSubmission && (
                <Link
                  href={`/${hackathonId}/submission`}
                  className="rounded-xl border border-orange-500/40 bg-neutral-900/60 px-4 py-2 font-semibold text-orange-300 text-sm transition hover:border-orange-400 hover:text-white"
                >
                  Create Submission
                </Link>
              )}
              {teamSubmission && (
                <Link
                  href={`/${hackathonId}/submission`}
                  className="rounded-xl border border-orange-500/40 bg-neutral-900/60 px-4 py-2 font-semibold text-orange-300 text-sm transition hover:border-orange-400 hover:text-white"
                >
                  Edit
                </Link>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href={`/${hackathonId}/create-team`}
                className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-sm text-white transition hover:bg-orange-300 hover:text-black"
              >
                Create a Team
              </Link>
              <Link
                href={`/${hackathonId}/find-team`}
                className="rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-neutral-200 text-sm transition hover:border-neutral-600"
              >
                Find a Team
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
          <div className="py-24 text-center text-neutral-400">
            No submissions found for the selected track.
          </div>
        )}

        {/* Footer note / patterns hook */}
        <div className="mt-12 text-center text-neutral-500 text-xs">
          Interested in becoming a sponsor? Contact us at
          sponsor@beaverhacks.org
        </div>
      </div>
    </div>
  );
}
