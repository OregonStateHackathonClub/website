"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Search,
  User,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  bulkUpdateApplicationStatus,
  updateApplicationStatus,
} from "@/app/actions/hackathons";

type ApplicationStatus =
  | "APPLIED"
  | "ACCEPTED"
  | "REJECTED"
  | "WAITLISTED"
  | "CHECKED_IN";

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

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WAITLISTED: "Waitlisted",
  CHECKED_IN: "Checked In",
};

export function ApplicationsTable({
  applications,
  hackathonId,
}: ApplicationsTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredData = React.useMemo(() => {
    if (statusFilter === "ALL") return applications;
    return applications.filter((app) => app.status === statusFilter);
  }, [applications, statusFilter]);

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
    waitlisted: applications.filter((a) => a.status === "WAITLISTED").length,
    checkedIn: applications.filter((a) => a.status === "CHECKED_IN").length,
  };

  async function handleStatusChange(
    appId: string,
    newStatus: ApplicationStatus,
  ) {
    setIsProcessing(true);
    const result = await updateApplicationStatus(hackathonId, appId, newStatus);
    setIsProcessing(false);

    if (result.success) {
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
    } else {
      toast.error(result.error || "Failed to update status");
    }
  }

  async function handleBulkAction(status: ApplicationStatus) {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const selectedIds = selectedRows.map((row) => row.original.id);

    setIsProcessing(true);
    const result = await bulkUpdateApplicationStatus(
      hackathonId,
      selectedIds,
      status as "ACCEPTED" | "REJECTED" | "WAITLISTED" | "CHECKED_IN",
    );
    setIsProcessing(false);

    if (result.success) {
      toast.success(
        `Updated ${result.count} application(s) to ${STATUS_LABELS[status]}`,
      );
      setRowSelection({});
    } else {
      toast.error(result.error || "Failed to update applications");
    }
  }

  const columns: ColumnDef<ApplicationWithParticipant>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-neutral-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-neutral-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Applicant",
      cell: ({ row }) => {
        const app = row.original;
        return (
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
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const app = row.original;
        const searchLower = filterValue.toLowerCase();
        return (
          app.name.toLowerCase().includes(searchLower) ||
          app.user.email.toLowerCase().includes(searchLower) ||
          app.university.toLowerCase().includes(searchLower)
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="relative inline-block">
            <select
              value={app.status}
              onChange={(e) =>
                handleStatusChange(app.id, e.target.value as ApplicationStatus)
              }
              disabled={isProcessing}
              className="appearance-none pr-7 pl-2 py-1 text-xs font-medium border cursor-pointer bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-600 focus:outline-none"
            >
              <option value="APPLIED">Applied</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WAITLISTED">Waitlisted</option>
              <option value="REJECTED">Rejected</option>
              <option value="CHECKED_IN">Checked In</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-neutral-500" />
          </div>
        );
      },
    },
    {
      accessorKey: "university",
      header: "University",
      cell: ({ row }) => (
        <span className="text-sm text-neutral-400">
          {row.original.university}
        </span>
      ),
    },
    {
      id: "team",
      header: "Team",
      cell: ({ row }) => (
        <span className="text-sm text-neutral-400">
          {row.original.participant?.teamMember?.team.name || "—"}
        </span>
      ),
    },
    {
      id: "resume",
      header: "Resume",
      cell: ({ row }) => {
        const app = row.original;
        return app.resumePath ? (
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
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      rowSelection,
    },
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
          Total: {stats.total}
        </span>
        <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
          Applied: {stats.applied}
        </span>
        <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
          Accepted: {stats.accepted}
        </span>
        <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
          Waitlisted: {stats.waitlisted}
        </span>
        <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
          Rejected: {stats.rejected}
        </span>
        <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
          Checked In: {stats.checkedIn}
        </span>
      </div>

      {/* Filters and bulk actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
            <Input
              type="text"
              placeholder="Search..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("name")?.setFilterValue(e.target.value)
              }
              className="w-64 h-9 pl-10 pr-4 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0 bg-transparent dark:bg-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ApplicationStatus | "ALL")
            }
            className="h-9 px-3 border border-neutral-800 bg-transparent text-neutral-400 text-sm focus:outline-none focus:border-neutral-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHECKED_IN">Checked In</option>
          </select>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">
              {selectedCount} selected
            </span>
            <button
              onClick={() => handleBulkAction("ACCEPTED")}
              disabled={isProcessing}
              className="h-8 px-3 bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleBulkAction("WAITLISTED")}
              disabled={isProcessing}
              className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
            >
              Waitlist
            </button>
            <button
              onClick={() => handleBulkAction("REJECTED")}
              disabled={isProcessing}
              className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => handleBulkAction("CHECKED_IN")}
              disabled={isProcessing}
              className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
            >
              Check In
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-neutral-800 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-neutral-500 px-4 py-3"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-neutral-800 hover:bg-neutral-900/50 data-[state=selected]:bg-neutral-900/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  No applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Selection count */}
      <div className="text-sm text-neutral-500">
        {selectedCount} of {table.getFilteredRowModel().rows.length} row(s)
        selected.
      </div>
    </div>
  );
}
