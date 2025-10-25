"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Filter } from "lucide-react";
import SubmissionCard from "@/components/submissionCard";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@repo/database";

type Hackathon = Prisma.HackathonGetPayload<{
  include: {
    tracks: true;
    submissions: {
      include: {
        submissionTracks: {
          include: {
            track: true;
          };
        };
      };
    };
  };
}>;

type Track = Hackathon["tracks"][number];
type Submission = Hackathon["submissions"][number];

type SubmissionsClientProps = {
  hackathon: Hackathon;
  tracks: Track[];
  year: string;
  userTeamId?: string | null;
};

const sponsors = [
  {
    href: "https://acm.oregonstate.edu/",
    src: "https://beaverhacks.org/images/acmlogo.svg",
    alt: "ACM OSU",
  },
  {
    href: "https://www.osuappdev.club/",
    src: "https://beaverhacks.org/_next/image?url=%2Fimages%2Fappdev.png&w=256&q=75",
    alt: "App Development Club",
  },
  {
    href: "https://gdgc-osu.com/",
    src: "https://beaverhacks.org/_next/image?url=%2Fimages%2Fgdgc.png&w=256&q=75",
    alt: "Google Developer Group on Campus",
  },
  {
    href: "https://org.osu.edu/womenincyber/",
    src: "https://beaverhacks.org/_next/image?url=%2Fimages%2Fwicys.png&w=256&q=75",
    alt: "Women in Cybersecurity",
  },
];

export default function SubmissionsClient({
  hackathon,
  tracks,
  year,
  userTeamId = null,
}: SubmissionsClientProps) {
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    hackathon.submissions,
  );
  const router = useRouter();

  useEffect(() => {
    if (selectedTrack === "all") {
      setFilteredSubmissions(hackathon.submissions);
    } else {
      const filtered = hackathon.submissions.filter((submission) =>
        submission.submissionTracks?.some(
          (link) => String(link.track.id) === String(selectedTrack),
        ),
      );
      setFilteredSubmissions(filtered);
    }
  }, [selectedTrack, hackathon.submissions]);

  const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTrack(e.target.value);
  };

  const handleProjectClick = (submissionId: string) => {
    router.push(`/${year}/projects/${submissionId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {/* ====== HERO / TITLE BANNER ====== */}
      <div
        className="relative isolate overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(10,10,10,.65), rgba(10,10,10,.95)), url(/hero-dark-texture.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-8">
          <div className="flex flex-col items-center text-center gap-4">
            <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-s tracking-wide text-neutral-300">
              Oregon State University
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              BeaverHacks {year}
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-neutral-300">
              Explore projects, filter by track, and discover this year&apos;s
              builds.
            </p>
          </div>

          {/* Sponsors (per year) */}
          <div className="mt-12">
            <div className="mx-auto max-w-5xl">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-6">
                <p className="mb-4 text-center text-s tracking-wide text-neutral-400">
                  Sponsors
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center justify-center">
                  {sponsors.map((sponsor) => (
                    <a
                      key={sponsor.alt}
                      href={sponsor.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-102 transition"
                    >
                      <Image
                        src={sponsor.src}
                        alt={sponsor.alt}
                        width={100}
                        height={40}
                        className="object-contain"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Quick actions / filter */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center rounded-2xl border border-neutral-800 bg-neutral-900/70 text-sm text-neutral-300 transition-all focus-within:border-orange-500/70">
            <div className="inline-flex items-center gap-2 px-4 py-2">
              <Filter className="h-4 w-4" />
              <span>Filter by track:</span>
            </div>
            <div className="w-px self-stretch bg-neutral-800"></div>
            <div className="relative">
              <select
                className="appearance-none bg-transparent py-2 pl-4 pr-10 outline-none hover:cursor-pointer"
                value={selectedTrack}
                onChange={handleTrackChange}
              >
                <option value="all">All Tracks</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          {/* Conditional Team Buttons */}
          {userTeamId ? (
            <Link
              href={`/${year}/team/${userTeamId}`}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
            >
              Go to Your Team
            </Link>
          ) : (
            <>
              <Link
                href={`/${year}/create-team`}
                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                Create a Team
              </Link>
              <Link
                href={`/${year}/find-team`}
                className="rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-sm text-neutral-200 transition hover:border-neutral-600"
              >
                Find a Team
              </Link>
            </>
          )}
        </div>

        {/* Submissions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {filteredSubmissions.map((submission, index) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onClick={() => handleProjectClick(submission.id)}
              index={index}
            />
          ))}
        </div>

        {/* No results */}
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-24 text-neutral-400">
            No submissions found for the selected track.
          </div>
        )}

        {/* Footer note / patterns hook */}
        <div className="mt-12 text-center text-xs text-neutral-500">
          Interested in becoming a sponsor? Contact us at
          sponsor@beaverhacks.org
        </div>
      </div>
    </div>
  );
}
