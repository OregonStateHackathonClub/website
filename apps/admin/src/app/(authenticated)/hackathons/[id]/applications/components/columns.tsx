"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, FileText, User } from "lucide-react";
import Image from "next/image";
import type { ApplicationStatus, ApplicationWithParticipant } from "./table";

interface ColumnActions {
  onStatusChange: (appId: string, newStatus: ApplicationStatus) => void;
  isProcessing: boolean;
}

export function createColumns(
  actions: ColumnActions,
): ColumnDef<ApplicationWithParticipant>[] {
  const { onStatusChange, isProcessing } = actions;

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
      header: "Applicant",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 relative overflow-hidden">
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
          <Select
            value={app.status}
            onValueChange={(value) =>
              onStatusChange(app.id, value as ApplicationStatus)
            }
            disabled={isProcessing}
          >
            <SelectTrigger className="w-32 h-8 rounded-none border-neutral-700 bg-neutral-900 text-neutral-300 text-xs ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:border-neutral-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-neutral-800 bg-neutral-900">
              <SelectItem
                value="APPLIED"
                className="rounded-none text-neutral-300 text-xs"
              >
                Applied
              </SelectItem>
              <SelectItem
                value="ACCEPTED"
                className="rounded-none text-neutral-300 text-xs"
              >
                Accepted
              </SelectItem>
              <SelectItem
                value="WAITLISTED"
                className="rounded-none text-neutral-300 text-xs"
              >
                Waitlisted
              </SelectItem>
              <SelectItem
                value="REJECTED"
                className="rounded-none text-neutral-300 text-xs"
              >
                Rejected
              </SelectItem>
              <SelectItem
                value="CHECKED_IN"
                className="rounded-none text-neutral-300 text-xs"
              >
                Checked In
              </SelectItem>
            </SelectContent>
          </Select>
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
}
