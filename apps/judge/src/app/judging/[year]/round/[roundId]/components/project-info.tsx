"use client";

import { ExternalLink, Github, Users, Video } from "lucide-react";
import Image from "next/image";
import type { Submission } from "../../../types";

interface ProjectInfoProps {
  submission: Submission;
  currentIndex: number;
  totalCount: number;
  selectedImage: number;
  onSelectImage: (index: number) => void;
}

export function ProjectInfo({
  submission,
  currentIndex,
  totalCount,
  selectedImage,
  onSelectImage,
}: ProjectInfoProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {submission.tableNumber && (
            <span className="text-xs font-mono px-1.5 py-0.5 bg-neutral-800 text-neutral-400">
              TABLE {submission.tableNumber}
            </span>
          )}
          <span className="text-xs text-neutral-600">
            {currentIndex + 1} of {totalCount}
          </span>
        </div>
        <h1 className="text-2xl font-medium text-white">{submission.name}</h1>
        <p className="text-neutral-400 mt-1">{submission.tagline}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-sm text-neutral-500">
            <Users className="h-4 w-4" />
            {submission.teamName}
          </span>
          {submission.githubUrl && (
            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              Code
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {submission.videoUrl && (
            <a
              href={submission.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors"
            >
              <Video className="h-4 w-4" />
              Demo
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Media */}
      {submission.images.length > 0 && (
        <div className="mb-6">
          <div className="aspect-video bg-neutral-900 border border-neutral-800 relative">
            <Image
              src={submission.images[selectedImage] || submission.images[0]}
              alt="Project screenshot"
              fill
              className="object-contain"
              style={{ borderRadius: 0 }}
            />
          </div>
          {submission.images.length > 1 && (
            <div className="flex gap-2 mt-2">
              {submission.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => onSelectImage(i)}
                  className={`w-20 h-14 relative border transition-colors ${
                    selectedImage === i
                      ? "border-white"
                      : "border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    style={{ borderRadius: 0 }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
          Description
        </h3>
        <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
          {submission.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}
