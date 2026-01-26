"use client";

import { Textarea } from "@repo/ui/components/textarea";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DescriptionEditor({
  value,
  onChange,
  error,
}: DescriptionEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="border border-neutral-800 bg-neutral-950/80 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Description (Markdown)
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
            target="_blank"
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-400"
          >
            <ExternalLink className="h-3 w-3" />
            Guide
          </Link>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-neutral-500 hover:text-neutral-400"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="prose prose-sm prose-invert min-h-[200px] max-w-none border border-neutral-800 bg-transparent p-4">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="italic text-neutral-500">No description yet</p>
          )}
        </div>
      ) : (
        <div>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe your project in detail..."
            className="min-h-[200px] resize-y border-neutral-800 bg-transparent dark:bg-transparent rounded-none focus-visible:ring-0 placeholder:text-neutral-600"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
