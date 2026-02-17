"use client";

import type { Prisma } from "@repo/database";
import { Badge } from "@repo/ui/components/badge";
import { Tag } from "lucide-react";
import Image from "next/image";
import { ProjectLinks } from "../components/project-links";

type Submission = Prisma.SubmissionGetPayload<{
  include: { tracks: true };
}>;

interface SubmissionCardProps {
  submission: Submission;
  index: number;
  onClick: () => void;
  showOpenButton: boolean;
}

export function SubmissionCard({
  submission,
  onClick,
  index,
  showOpenButton,
}: SubmissionCardProps) {
  const img = submission.images?.[0] || "/placeholder_project.png";

  return (
    <div
      className="group flex h-full cursor-pointer flex-col overflow-hidden border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm transition-colors hover:border-neutral-700"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={img}
          alt={`${submission.title} cover`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
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
            {submission.tracks.map(({ id, name }) => (
              <Badge
                key={id}
                className="rounded-none border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-300 uppercase tracking-wide"
              >
                <Tag className="h-3 w-3 mr-1" />
                {name}
              </Badge>
            ))}
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
          {showOpenButton && (
            <button
              type="button"
              className="ml-auto inline-flex items-center border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-200 text-xs transition-colors hover:cursor-pointer hover:border-neutral-700 hover:bg-neutral-800"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Open →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
