"use client";

import { Input } from "@repo/ui/components/input";
import { Search } from "lucide-react";

interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  isProcessing: boolean;
  onBulkSendLinks: () => void;
  onBulkRemove: () => void;
}

export function Toolbar({
  searchValue,
  onSearchChange,
  selectedCount,
  isProcessing,
  onBulkSendLinks,
  onBulkRemove,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64 h-9 pl-10 pr-4 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0 bg-transparent dark:bg-transparent"
        />
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">{selectedCount} selected</span>
          <button
            onClick={onBulkSendLinks}
            disabled={isProcessing}
            className="h-8 px-3 bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
          >
            Send Links
          </button>
          <button
            onClick={onBulkRemove}
            disabled={isProcessing}
            className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
