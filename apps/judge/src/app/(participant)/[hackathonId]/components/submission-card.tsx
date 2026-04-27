"use client";

import type { Prisma } from "@repo/database";
import { Badge } from "@repo/ui/components/badge";
import { Heart, Tag, Trophy } from "lucide-react";
import Image from "next/image";
import { ProjectLinks } from "../components/project-links";

type Submission = Prisma.SubmissionGetPayload<{
  include: { tracks: true; trackWins: true };
}>;

interface SubmissionCardProps {
  submission: Submission;
  index: number;
  onClick: () => void;
  likeCount?: number;
  isLiked?: boolean;
  onLike?: (submissionId: string) => void;
}

const PLACE_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const PLACE_STYLE: Record<number, string> = {
  1: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  2: "border-neutral-400/40 bg-neutral-400/15 text-neutral-200",
  3: "border-orange-700/40 bg-orange-700/15 text-orange-300",
};

function placeLabel(place: number): string {
  return PLACE_LABEL[place] ?? `${place}th`;
}

export function SubmissionCard({
  submission,
  onClick,
  index,
  likeCount = 0,
  isLiked = false,
  onLike,
}: SubmissionCardProps) {
  const img = submission.images?.[0] || "/placeholder_project.png";

  return (
    <div
      className="group flex h-full cursor-pointer flex-col overflow-hidden border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm transition-colors hover:border-neutral-700"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <Image
          src={img}
          alt={`${submission.title} cover`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition duration-500 group-hover:scale-[1.03]"
          priority={index < 7}
        />
      </div>

      {/* Title and Badges */}
      <div className="p-4 pb-2">
        <h3 className="line-clamp-2 font-bold text-lg text-white leading-snug">
          {submission.title}
        </h3>
        {submission.tracks && submission.tracks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {submission.tracks.map(({ id, name }) => {
              const win = submission.trackWins.find((w) => w.trackId === id);
              if (win) {
                return (
                  <Badge
                    key={id}
                    className={`rounded-none border px-2 py-0.5 text-[10px] uppercase tracking-wide ${PLACE_STYLE[win.place] ?? PLACE_STYLE[3]}`}
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    {placeLabel(win.place)} in {name}
                  </Badge>
                );
              }
              return (
                <Badge
                  key={id}
                  className="rounded-none border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-300 uppercase tracking-wide"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {name}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="grow px-4 py-2">
        {submission.tagline && (
          <p className="line-clamp-3 text-neutral-400 text-sm">
            {submission.tagline}
          </p>
        )}
      </div>

      {/* Links */}
      <div className="p-4 pt-0">
        <div className="flex w-full items-center justify-between gap-3">
          <ProjectLinks
            githubURL={submission.githubUrl ?? null}
            ytVideo={submission.videoUrl ?? null}
          />
          <div className="ml-auto flex items-center gap-2">
            {onLike ? (
              <button
                type="button"
                className={`inline-flex items-center gap-1 border px-2 py-1.5 text-xs transition-colors hover:cursor-pointer ${
                  isLiked
                    ? "border-rose-500/30 bg-rose-500/20 text-rose-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(submission.id);
                }}
              >
                <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                {likeCount}
              </button>
            ) : likeCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-neutral-500 text-xs">
                <Heart className="h-3.5 w-3.5" />
                {likeCount}
              </span>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  );
}
