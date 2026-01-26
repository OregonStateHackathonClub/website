"use client";

import type { Prisma } from "@repo/database";
import { Button } from "@repo/ui/components/button";
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
import { Plus, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { addJudgeByEmail, removeJudge } from "@/app/actions/hackathons";
import { sendJudgeMagicLink } from "@/app/actions/judging";
import { AddJudgeModal } from "./add-judge-modal";
import { createColumns } from "./columns";
import { Toolbar } from "./toolbar";

export type Judge = Prisma.JudgeGetPayload<{
  include: {
    trackAssignments: { include: { track: true } };
    _count: { select: { roundAssignments: true } };
  };
}>;

interface JudgesTableProps {
  hackathonId: string;
  judges: Judge[];
}

export function JudgesTable({ hackathonId, judges }: JudgesTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingLinkTo, setSendingLinkTo] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleAddJudge() {
    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsSubmitting(true);
    const result = await addJudgeByEmail(
      hackathonId,
      email.trim(),
      name.trim(),
    );
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Judge added successfully");
      setIsAddDialogOpen(false);
      setEmail("");
      setName("");
    } else {
      toast.error(result.error || "Failed to add judge");
    }
  }

  async function handleRemoveJudge(judgeId: string, judgeName: string) {
    if (!confirm(`Remove ${judgeName} as a judge?`)) return;

    const result = await removeJudge(hackathonId, judgeId);
    if (result.success) {
      toast.success("Judge removed");
    } else {
      toast.error(result.error || "Failed to remove judge");
    }
  }

  async function handleSendMagicLink(judgeEmail: string) {
    setSendingLinkTo(judgeEmail);
    const result = await sendJudgeMagicLink(hackathonId, judgeEmail);
    setSendingLinkTo(null);

    if (result.success) {
      toast.success(`Magic link sent to ${judgeEmail}`);
    } else {
      toast.error(result.error || "Failed to send magic link");
    }
  }

  async function handleBulkSendMagicLinks() {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of selectedRows) {
      const result = await sendJudgeMagicLink(hackathonId, row.original.email);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setRowSelection({});
    setIsProcessing(false);

    if (successCount > 0) {
      toast.success(`Sent magic links to ${successCount} judge(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to send to ${errorCount} judge(s)`);
    }
  }

  async function handleBulkRemove() {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    // Let server action handle validation for judges with completed assignments

    if (
      !confirm(`Remove ${selectedRows.length} judge(s)? This cannot be undone.`)
    ) {
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of selectedRows) {
      const result = await removeJudge(hackathonId, row.original.id);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setRowSelection({});
    setIsProcessing(false);

    if (successCount > 0) {
      toast.success(`Removed ${successCount} judge(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to remove ${errorCount} judge(s)`);
    }
  }

  function handleDialogClose() {
    setIsAddDialogOpen(false);
    setEmail("");
    setName("");
  }

  const columns = useMemo(
    () =>
      createColumns({
        onSendMagicLink: handleSendMagicLink,
        onRemove: handleRemoveJudge,
        sendingLinkTo,
      }),
    [sendingLinkTo],
  );

  const table = useReactTable({
    data: judges,
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Judges</h2>
          <p className="text-sm text-neutral-500">
            {judges.length} judge{judges.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-white text-black hover:bg-neutral-200 rounded-none flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Judge
        </Button>
      </div>

      {judges.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No judges yet</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Add judges by email to allow scoring of submissions.
          </p>
        </div>
      ) : (
        <>
          <Toolbar
            searchValue={searchValue}
            onSearchChange={(value) =>
              table.getColumn("name")?.setFilterValue(value)
            }
            selectedCount={selectedCount}
            isProcessing={isProcessing}
            onBulkSendLinks={handleBulkSendMagicLinks}
            onBulkRemove={handleBulkRemove}
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
                      className="h-24 text-center text-neutral-500"
                    >
                      No judges found.
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
        </>
      )}

      <AddJudgeModal
        isOpen={isAddDialogOpen}
        onClose={handleDialogClose}
        name={name}
        onNameChange={setName}
        email={email}
        onEmailChange={setEmail}
        onSubmit={handleAddJudge}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
