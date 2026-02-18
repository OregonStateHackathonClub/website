"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { ExternalLink, Globe, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProjectLinks } from "../../components/project-links";
import { ImageCarousel } from "../../projects/[id]/components/image-carousel";
import type { SubmissionInput } from "../schema";

interface ReviewStepProps {
  data: SubmissionInput;
  tracks: { id: string; name: string }[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  hasSubmission: boolean;
}

export function ReviewStep({
  data,
  tracks,
  onBack,
  onSubmit,
  isSubmitting,
  hasSubmission,
}: ReviewStepProps) {
  const selectedTracks = tracks.filter((t) => data.trackIds.includes(t.id));

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-xl text-white sm:text-2xl">
        {data.title || "Untitled Project"}
      </h1>
      {data.tagline && (
        <p className="mt-1 mb-4 max-w-3xl text-sm text-neutral-300">
          {data.tagline}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {selectedTracks.length > 0 && (
          <>
            {selectedTracks.map((track) => (
              <Badge
                key={track.id}
                className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              >
                {track.name}
              </Badge>
            ))}
            <div className="h-4 w-px bg-neutral-700" />
          </>
        )}

        <ProjectLinks
          githubURL={data.githubUrl}
          ytVideo={data.videoUrl}
        />

        {data.deploymentUrl && (
          <a
            href={data.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-200 text-xs transition-colors duration-200 hover:border-neutral-700 hover:text-white"
          >
            <Globe className="h-4 w-5 text-neutral-200 transition-colors duration-200 group-hover:text-white" />
            Live Demo
          </a>
        )}

        {data.otherLinks.map((link, i) => (
          <a
            key={i}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-200 text-xs transition-colors duration-200 hover:border-neutral-700 hover:text-white"
          >
            <ExternalLink className="h-4 w-5 text-neutral-200 transition-colors duration-200 group-hover:text-white" />
            {(() => {
              try {
                return new URL(link).hostname;
              } catch {
                return link;
              }
            })()}
          </a>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="w-full border border-neutral-800 bg-neutral-900">
          <ImageCarousel
            altText={`${data.title} showcase`}
            imageUrls={
              data.images.length > 0
                ? data.images
                : ["/placeholder_project.png"]
            }
            videoUrl={data.videoUrl}
          />
        </div>
        <Card className="rounded-none border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              About This Project
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert prose-sm max-w-none leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.description || "*No description*"}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-neutral-700 rounded-none"
        >
          Edit
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-white text-black hover:bg-neutral-200 rounded-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : hasSubmission ? (
            "Update Submission"
          ) : (
            "Submit Project"
          )}
        </Button>
      </div>
    </div>
  );
}
