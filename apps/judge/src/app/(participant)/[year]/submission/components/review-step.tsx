"use client";

import { Button } from "@repo/ui/components/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SubmissionInput } from "../schema";

interface Track {
  id: string;
  name: string;
}

interface ReviewStepProps {
  data: SubmissionInput;
  tracks: Track[];
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
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to editing
      </button>

      <div className="border border-neutral-800 bg-neutral-950/80 p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-500">
          Review Your Submission
        </h2>

        <div className="space-y-6">
          <div>
            <p className="text-xs text-neutral-500">Title</p>
            <p className="text-lg font-medium text-white">
              {data.title || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-500">Tagline</p>
            <p className="text-neutral-300">{data.tagline || "—"}</p>
          </div>

          <div>
            <p className="text-xs text-neutral-500">Description</p>
            <div className="prose prose-sm prose-invert mt-1 max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.description || "*No description*"}
              </ReactMarkdown>
            </div>
          </div>

          <div>
            <p className="text-xs text-neutral-500">Demo Video</p>
            <a
              href={data.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {data.videoUrl || "—"}
            </a>
          </div>

          <div>
            <p className="text-xs text-neutral-500">
              Images ({data.images.length})
            </p>
            {data.images.length > 0 ? (
              <div className="mt-2 flex gap-2">
                {data.images.map((url, i) => (
                  <div
                    key={url}
                    className="relative h-20 w-32 overflow-hidden bg-black"
                  >
                    <Image
                      src={url}
                      alt={`Image ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">No images</p>
            )}
          </div>

          <div>
            <p className="text-xs text-neutral-500">GitHub</p>
            <a
              href={data.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {data.githubUrl || "—"}
            </a>
          </div>

          {data.deploymentUrl && (
            <div>
              <p className="text-xs text-neutral-500">Deployment</p>
              <a
                href={data.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {data.deploymentUrl}
              </a>
            </div>
          )}

          {data.otherLinks.length > 0 && (
            <div>
              <p className="text-xs text-neutral-500">Other Links</p>
              <ul className="mt-1 space-y-1">
                {data.otherLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs text-neutral-500">Tracks</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {selectedTracks.map((track) => (
                <span
                  key={track.id}
                  className="border border-neutral-700 px-2 py-1 text-sm text-neutral-300"
                >
                  {track.name}
                </span>
              ))}
              {selectedTracks.length === 0 && (
                <p className="text-neutral-500">No tracks selected</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-neutral-700"
        >
          Edit
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-white text-black hover:bg-neutral-200"
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
