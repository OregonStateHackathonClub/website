"use client";

import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Search } from "lucide-react";
import type { ApplicationStatus } from "./table";

interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: ApplicationStatus | "ALL";
  onStatusFilterChange: (value: ApplicationStatus | "ALL") => void;
  selectedCount: number;
  isProcessing: boolean;
  onBulkAccept: () => void;
  onBulkWaitlist: () => void;
  onBulkReject: () => void;
  onBulkCheckIn: () => void;
}

export function Toolbar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedCount,
  isProcessing,
  onBulkAccept,
  onBulkWaitlist,
  onBulkReject,
  onBulkCheckIn,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
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

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            onStatusFilterChange(value as ApplicationStatus | "ALL")
          }
        >
          <SelectTrigger className="w-40 h-9 rounded-none border-neutral-800 bg-transparent text-neutral-400 ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:border-neutral-600">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-neutral-800 bg-neutral-900">
            <SelectItem value="ALL" className="rounded-none text-neutral-300">
              All Statuses
            </SelectItem>
            <SelectItem
              value="APPLIED"
              className="rounded-none text-neutral-300"
            >
              Applied
            </SelectItem>
            <SelectItem
              value="ACCEPTED"
              className="rounded-none text-neutral-300"
            >
              Accepted
            </SelectItem>
            <SelectItem
              value="WAITLISTED"
              className="rounded-none text-neutral-300"
            >
              Waitlisted
            </SelectItem>
            <SelectItem
              value="REJECTED"
              className="rounded-none text-neutral-300"
            >
              Rejected
            </SelectItem>
            <SelectItem
              value="CHECKED_IN"
              className="rounded-none text-neutral-300"
            >
              Checked In
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            {selectedCount} selected
          </span>
          <button
            onClick={onBulkAccept}
            disabled={isProcessing}
            className="h-8 px-3 bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={onBulkWaitlist}
            disabled={isProcessing}
            className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
          >
            Waitlist
          </button>
          <button
            onClick={onBulkReject}
            disabled={isProcessing}
            className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={onBulkCheckIn}
            disabled={isProcessing}
            className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
          >
            Check In
          </button>
        </div>
      )}
    </div>
  );
}
