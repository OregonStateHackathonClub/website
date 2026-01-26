"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardList, Mail, Send, Star, Trash2, User } from "lucide-react";
import type { Judge } from "./table";

interface ColumnActions {
  onSendMagicLink: (email: string) => void;
  onRemove: (judgeId: string, judgeName: string) => void;
  sendingLinkTo: string | null;
}

export function createColumns(actions: ColumnActions): ColumnDef<Judge>[] {
  const { onSendMagicLink, onRemove, sendingLinkTo } = actions;

  return [
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
            <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
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
              onClick={() => onSendMagicLink(judge.email)}
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
              onClick={() => onRemove(judge.id, judge.name)}
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
}
