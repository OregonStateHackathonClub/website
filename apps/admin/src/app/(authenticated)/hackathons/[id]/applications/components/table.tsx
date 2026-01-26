"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  bulkUpdateApplicationStatus,
  updateApplicationStatus,
} from "@/app/actions/hackathons";
import { Stats } from "./stats";
import { Toolbar } from "./toolbar";
import { createColumns } from "./columns";

export type ApplicationStatus =
  | "APPLIED"
  | "ACCEPTED"
  | "REJECTED"
  | "WAITLISTED"
  | "CHECKED_IN";

export type ApplicationWithParticipant = {
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

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WAITLISTED: "Waitlisted",
  CHECKED_IN: "Checked In",
};

interface ApplicationsTableProps {
  applications: ApplicationWithParticipant[];
  hackathonId: string;
}

export function ApplicationsTable({
  applications,
  hackathonId,
}: ApplicationsTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredData = useMemo(() => {
    if (statusFilter === "ALL") return applications;
    return applications.filter((app) => app.status === statusFilter);
  }, [applications, statusFilter]);

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

  const columns = useMemo(
    () =>
      createColumns({
        onStatusChange: handleStatusChange,
        isProcessing,
      }),
    [isProcessing],
  );

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
  const searchValue =
    (table.getColumn("name")?.getFilterValue() as string) ?? "";

  return (
    <div className="space-y-4">
      <Stats applications={applications} />

      <Toolbar
        searchValue={searchValue}
        onSearchChange={(value) =>
          table.getColumn("name")?.setFilterValue(value)
        }
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedCount={selectedCount}
        isProcessing={isProcessing}
        onBulkAccept={() => handleBulkAction("ACCEPTED")}
        onBulkWaitlist={() => handleBulkAction("WAITLISTED")}
        onBulkReject={() => handleBulkAction("REJECTED")}
        onBulkCheckIn={() => handleBulkAction("CHECKED_IN")}
      />

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

      <div className="text-sm text-neutral-500">
        {selectedCount} of {table.getFilteredRowModel().rows.length} row(s)
        selected.
      </div>
    </div>
  );
}
