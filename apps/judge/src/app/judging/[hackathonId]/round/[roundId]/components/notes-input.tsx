"use client";

import { Textarea } from "@repo/ui/components/textarea";
import { useState } from "react";

interface NotesInputProps {
  value: string;
  onChange: (notes: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function NotesInput({
  value,
  onChange,
  disabled,
  placeholder = "Add private notes (optional)...",
}: NotesInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        rows={isFocused || value ? 3 : 1}
        className="border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none resize-none focus-visible:ring-0"
        placeholder={placeholder}
      />
      <p className="text-xs text-neutral-600">
        Only visible to you. Not shared with other judges or participants.
      </p>
    </div>
  );
}
