"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@repo/ui/components/card";
import { Tag } from "lucide-react";
import { ProjectLinks } from "@/components/projectLinks";
import Image from "next/image";

// Define a type for the data this card needs
type Submission = {
  id: string;
  name: string;
  images?: string[];
  miniDescription?: string;
  githubURL?: string | null;
  ytVideo?: string | null;
  trackLinks?: { track: { name: string } }[];
};

type SubmissionCardProps = {
  submission: Submission;
  onClick: () => void;
  index: number;
};

export default function SubmissionCard({
  submission,
  onClick,
  index,
}: SubmissionCardProps) {
  const img = submission.images?.[0] || "/beaver.png";

  return (
    <Card
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-neutral-800 bg-neutral-900/60 backdrop-blur transition hover:border-orange-500/50 hover:bg-neutral-900 hover:shadow-lg hover:shadow-orange-500/10 supports-backdrop-filter:bg-neutral-900/50"
      onClick={onClick}
    >
      {/* Top Section: Title and Badges */}
      <CardHeader className="p-1">
        <CardTitle className="text-lg font-bold leading-snug text-white line-clamp-2">
          {submission.name}
        </CardTitle>
        {submission.trackLinks && submission.trackLinks.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {submission.trackLinks.map(
              (link: { track: { name: string } }, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-300"
                >
                  <Tag className="h-3 w-3" />
                  {link.track?.name}
                </span>
              ),
            )}
          </div>
        )}
      </CardHeader>

      {/* Middle Section: Image */}
      <div className="relative w-full aspect-video">
        <Image
          src={img}
          alt={`${submission.name} cover`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          priority={index < 7}
        />
      </div>

      {/* Bottom Section: Description and Links */}
      <CardContent className="px-2 pt-1 pb-0 grow">
        {submission.miniDescription && (
          <CardDescription className="text-sm text-neutral-400 line-clamp-2">
            {submission.miniDescription}
          </CardDescription>
        )}
      </CardContent>
      <CardFooter className="p-2">
        <div className="flex w-full items-center justify-between gap-3">
          <ProjectLinks
            githubURL={submission.githubURL ?? null}
            ytVideo={submission.ytVideo ?? null}
          />
          <button
            className="ml-auto inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-200 transition hover:border-orange-500/50 hover:bg-neutral-800 hover:cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Open →
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
