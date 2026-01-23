"use client";

import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
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
  ClipboardList,
  Mail,
  Plus,
  Search,
  Send,
  Star,
  Trash2,
  User,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { addJudgeByEmail, removeJudge } from "@/app/actions/hackathons";
import { sendJudgeMagicLink } from "@/app/actions/judging";

type Judge = {
  id: string;
  name: string;
  email: string;
  trackAssignments: {
    track: {
      id: string;
      name: string;
    };
  }[];
  _count: {
    roundAssignments: number;
    scores: number;
  };
};

interface JudgesClientProps {
  hackathonId: string;
  judges: Judge[];
}

export function JudgesClient({ hackathonId, judges }: JudgesClientProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingLinkTo, setSendingLinkTo] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
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

    // Check if any selected judges have scores
    const judgesWithScores = selectedRows.filter(
      (row) => row.original._count.scores > 0,
    );
    if (judgesWithScores.length > 0) {
      toast.error(
        `Cannot remove ${judgesWithScores.length} judge(s) with existing scores`,
      );
      return;
    }

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

  function handleDialogOpenChange(open: boolean) {
    if (!open && !isSubmitting) {
      setIsAddDialogOpen(false);
      setEmail("");
      setName("");
    }
  }

  const columns: ColumnDef<Judge>[] = [
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
      header: "Judge",
      cell: ({ row }) => {
        const judge = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-neutral-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{judge.name}</p>
              <p className="text-xs text-neutral-500">{judge.email}</p>
            </div>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const judge = row.original;
        const searchLower = filterValue.toLowerCase();
        return (
          judge.name.toLowerCase().includes(searchLower) ||
          judge.email.toLowerCase().includes(searchLower)
        );
      },
    },
    {
      id: "tracks",
      header: "Tracks",
      cell: ({ row }) => {
        const judge = row.original;
        return (
          <div className="text-sm text-neutral-400">
            {judge.trackAssignments.length === 0 ? (
              <span className="text-neutral-600">None</span>
            ) : (
              judge.trackAssignments.map((ta) => ta.track.name).join(", ")
            )}
          </div>
        );
      },
    },
    {
      id: "assignments",
      header: "Assignments",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-neutral-400">
          <ClipboardList className="h-4 w-4 text-neutral-600" />
          {row.original._count.roundAssignments}
        </div>
      ),
    },
    {
      id: "scores",
      header: "Scores",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-neutral-400">
          <Star className="h-4 w-4 text-neutral-600" />
          {row.original._count.scores}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const judge = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleSendMagicLink(judge.email)}
              disabled={sendingLinkTo === judge.email}
              className="p-2 text-neutral-500 hover:text-white disabled:opacity-50 transition-colors"
              title="Send magic link"
            >
              {sendingLinkTo === judge.email ? (
                <Mail className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleRemoveJudge(judge.id, judge.name)}
              disabled={judge._count.scores > 0}
              className="p-2 text-neutral-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={
                judge._count.scores > 0
                  ? "Cannot remove judge with scores"
                  : "Remove judge"
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

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
          {/* Search and bulk actions */}
          <div className="flex items-center justify-between gap-4">
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

            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">
                  {selectedCount} selected
                </span>
                <button
                  onClick={handleBulkSendMagicLinks}
                  disabled={isProcessing}
                  className="h-8 px-3 bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
                >
                  Send Links
                </button>
                <button
                  onClick={handleBulkRemove}
                  disabled={isProcessing}
                  className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
                >
                  Remove
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
                      className="h-24 text-center text-neutral-500"
                    >
                      No judges found.
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
        </>
      )}

      {/* Add Judge Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="bg-neutral-950 border-neutral-800 rounded-none max-w-md gap-0 [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none"
          onPointerDownOutside={(e: Event) =>
            isSubmitting && e.preventDefault()
          }
          onEscapeKeyDown={(e: KeyboardEvent) =>
            isSubmitting && e.preventDefault()
          }
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-medium text-white">
              Add Judge
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Judge name"
                className="bg-transparent dark:bg-transparent border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="judge@example.com"
                className="bg-transparent dark:bg-transparent border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-neutral-800 text-white hover:bg-neutral-900 rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddJudge}
              disabled={isSubmitting || !email.trim() || !name.trim()}
              className="bg-white text-black hover:bg-neutral-200 rounded-none"
            >
              {isSubmitting ? "Adding..." : "Add Judge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
