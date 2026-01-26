"use client";

import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { useEffect, useRef } from "react";

interface EditorProps {
  subject: string;
  onSubjectChange: (subject: string) => void;
  html: string;
  onHtmlChange: (html: string) => void;
  showPreview: boolean;
}

export function Editor({
  subject,
  onSubjectChange,
  html,
  onHtmlChange,
  showPreview,
}: EditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html, showPreview]);

  return (
    <>
      {/* Subject Line */}
      <div className="px-6 py-3 border-b border-neutral-800">
        <Input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email subject..."
          className="w-full border-0 text-white text-lg font-medium placeholder:text-neutral-600 focus:border-0 rounded-none focus-visible:ring-0 px-0 shadow-none bg-transparent dark:bg-transparent"
        />
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 flex min-h-0">
        {/* HTML Editor */}
        <div
          className={`${showPreview ? "w-1/2" : "w-full"} min-h-0 border-r border-neutral-800`}
        >
          <Textarea
            value={html}
            onChange={(e) => onHtmlChange(e.target.value)}
            className="w-full h-full p-4 border-0 text-neutral-300 text-sm font-mono resize-none rounded-none focus-visible:ring-0 leading-relaxed bg-transparent dark:bg-transparent"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 min-h-0 bg-neutral-100 overflow-auto">
            <iframe
              ref={iframeRef}
              title="Email Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>
    </>
  );
}
