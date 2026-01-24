"use client";

import { Github, Youtube } from "lucide-react";

type ProjectLinksProps = {
  githubURL: string | null;
  ytVideo: string | null;
};

export function ProjectLinks({ githubURL, ytVideo }: ProjectLinksProps) {
  return (
    <div className="flex items-center gap-3">
      {githubURL && (
        <a
          href={githubURL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-200 text-xs transition-colors duration-200 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
          onClick={(e) => e.stopPropagation()}
          title="View source"
        >
          <Github className="h-4 w-5 text-neutral-200 transition-colors duration-200 group-hover:text-blue-500" />
          GitHub
        </a>
      )}
      {ytVideo && (
        <a
          href={ytVideo}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-200 text-xs transition-colors duration-200 hover:border-red-600 hover:bg-red-900/10 hover:text-red-600"
          onClick={(e) => e.stopPropagation()}
          title="Watch demo"
        >
          <Youtube className="h-4 w-5 text-neutral-200 transition-colors duration-200 group-hover:text-red-600" />
          YouTube
        </a>
      )}
    </div>
  );
}
