"use client";

import { Input } from "@repo/ui/components/input";
import { Search } from "lucide-react";

interface ToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  isPending: boolean;
  selectedCount: number;
  isProcessing: boolean;
  onBulkMakeAdmin: () => void;
  onBulkRemoveAdmin: () => void;
  onBulkDelete: () => void;
}

export function Toolbar({
  search,
  onSearch,
  isPending,
  selectedCount,
  isProcessing,
  onBulkMakeAdmin,
  onBulkRemoveAdmin,
  onBulkDelete,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 pr-4 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0 bg-transparent dark:bg-transparent"
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            Searching...
          </span>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            {selectedCount} selected
          </span>
          <button
            onClick={onBulkMakeAdmin}
            disabled={isProcessing}
            className="h-8 px-3 bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
          >
            Make Admin
          </button>
          <button
            onClick={onBulkRemoveAdmin}
            disabled={isProcessing}
            className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
          >
            Remove Admin
          </button>
          <button
            onClick={onBulkDelete}
            disabled={isProcessing}
            className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
