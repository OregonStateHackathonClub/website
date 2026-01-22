"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  User,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  CheckSquare,
  Square,
  XCircle,
  ThumbsUp,
  ListTodo,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
} from "@/app/actions/hackathons";

type ApplicationStatus = "APPLIED" | "ACCEPTED" | "REJECTED" | "WAITLISTED" | "CHECKED_IN";

type ApplicationWithParticipant = {
  id: string;
  createdAt: Date;
  userId: string;
  hackathonId: string;
  name: string;
  university: string;
  graduationYear: number;
  resumePath: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  participant?: {
    id: string;
    teamMember?: {
      team: {
        id: string;
        name: string;
      };
    } | null;
  };
};

interface ApplicationsTableProps {
  applications: ApplicationWithParticipant[];
  hackathonId: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  APPLIED: { label: "Applied", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Clock },
  ACCEPTED: { label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: ThumbsUp },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: XCircle },
  WAITLISTED: { label: "Waitlisted", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: ListTodo },
  CHECKED_IN: { label: "Checked In", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", icon: CheckCircle },
};

export function ApplicationsTable({
  applications,
  hackathonId,
}: ApplicationsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = applications.filter((app) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      app.name.toLowerCase().includes(searchLower) ||
      app.user.email.toLowerCase().includes(searchLower) ||
      app.university.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
    waitlisted: applications.filter((a) => a.status === "WAITLISTED").length,
    checkedIn: applications.filter((a) => a.status === "CHECKED_IN").length,
  };

  function toggleSelect(appId: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((app) => app.id)));
    }
  }

  async function handleStatusChange(appId: string, newStatus: ApplicationStatus) {
    setIsProcessing(true);
    const result = await updateApplicationStatus(hackathonId, appId, newStatus);
    setIsProcessing(false);

    if (result.success) {
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
    } else {
      toast.error(result.error || "Failed to update status");
    }
  }

  async function handleBulkAction(status: ApplicationStatus) {
    if (selectedIds.size === 0) return;

    setIsProcessing(true);
    const result = await bulkUpdateApplicationStatus(
      hackathonId,
      Array.from(selectedIds),
      status as "ACCEPTED" | "REJECTED" | "WAITLISTED" | "CHECKED_IN"
    );
    setIsProcessing(false);

    if (result.success) {
      toast.success(`Updated ${result.count} application(s) to ${STATUS_CONFIG[status].label}`);
      setSelectedIds(new Set());
    } else {
      toast.error(result.error || "Failed to update applications");
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
          Total: {stats.total}
        </span>
        <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
          Applied: {stats.applied}
        </span>
        <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          Accepted: {stats.accepted}
        </span>
        <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400">
          Waitlisted: {stats.waitlisted}
        </span>
        <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400">
          Rejected: {stats.rejected}
        </span>
        <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          Checked In: {stats.checkedIn}
        </span>
      </div>

      {/* Filters and bulk actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-9 pl-10 pr-4 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "ALL")}
            className="h-9 px-3 bg-transparent border border-neutral-800 text-neutral-400 text-sm focus:outline-none focus:border-neutral-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHECKED_IN">Checked In</option>
          </select>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">{selectedIds.size} selected</span>
            <button
              onClick={() => handleBulkAction("ACCEPTED")}
              disabled={isProcessing}
              className="h-8 px-3 bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleBulkAction("WAITLISTED")}
              disabled={isProcessing}
              className="h-8 px-3 bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Waitlist
            </button>
            <button
              onClick={() => handleBulkAction("REJECTED")}
              disabled={isProcessing}
              className="h-8 px-3 bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => handleBulkAction("CHECKED_IN")}
              disabled={isProcessing}
              className="h-8 px-3 bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              Check In
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={toggleSelectAll}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  {selectedIds.size === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                University
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Resume
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  No applications found
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const isSelected = selectedIds.has(app.id);
                const statusConfig = STATUS_CONFIG[app.status as ApplicationStatus] || STATUS_CONFIG.APPLIED;

                return (
                  <tr
                    key={app.id}
                    className={`border-b border-neutral-800 last:border-0 ${isSelected ? "bg-neutral-900/50" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(app.id)}
                        className="text-neutral-500 hover:text-white transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-white" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                          {app.user.image ? (
                            <Image
                              src={app.user.image}
                              alt={app.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-neutral-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{app.name}</p>
                          <p className="text-xs text-neutral-500">{app.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          disabled={isProcessing}
                          className={`appearance-none pr-7 pl-2 py-1 text-xs font-medium border cursor-pointer ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="WAITLISTED">Waitlisted</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="CHECKED_IN">Checked In</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {app.university}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">
                      {app.participant?.teamMember?.team.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {app.resumePath ? (
                        <a
                          href={app.resumePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
