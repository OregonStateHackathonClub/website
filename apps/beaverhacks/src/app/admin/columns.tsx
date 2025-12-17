"use client";

import { ApplicationStatus, type Prisma } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, File, XCircle } from "lucide-react";
import { useState } from "react";

export type Application = Prisma.ApplicationGetPayload<{
  include: {
    user: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}>;

const handleDownload = async (path: string) => {
  const res = await fetch(`/api/download/${path}`, { method: "GET" });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = path;
  link.click();
  window.URL.revokeObjectURL(url);
};

const CheckInButton = ({ application }: { application: Application }) => {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [isLoading, setIsLoading] = useState(false);

  const checkIn = async () => {
    if (status === ApplicationStatus.CHECKED_IN) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: application.id,
          status: ApplicationStatus.CHECKED_IN,
        }),
      });

      if (res.ok) {
        setStatus(ApplicationStatus.CHECKED_IN);
      } else {
        console.error("Failed to check in applicant");
      }
    } catch (error) {
      console.error("Error checking in applicant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={status === ApplicationStatus.CHECKED_IN ? "default" : "outline"}
      size="sm"
      onClick={checkIn}
      disabled={isLoading || status === ApplicationStatus.CHECKED_IN}
      className={
        status === ApplicationStatus.CHECKED_IN
          ? "bg-green-600 cursor-default"
          : ""
      }
    >
      {status === ApplicationStatus.CHECKED_IN ? (
        <>
          <CheckCircle className="mr-1 h-4 w-4" />
          Checked In
        </>
      ) : (
        <>
          <CheckCircle className="mr-1 h-4 w-4" />
          Check In
        </>
      )}
    </Button>
  );
};

export const columns: ColumnDef<Application>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "user.name",
    header: "Name",
  },
  {
    id: "email",
    accessorKey: "user.email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "university",
    header: "University",
  },
  {
    accessorKey: "graduationYear",
    header: "Graduation",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ApplicationStatus;
      return (
        <div className="flex items-center">
          {status === ApplicationStatus.CHECKED_IN ? (
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-600/20 text-green-500 rounded-full">
              <CheckCircle className="h-3 w-3" /> Checked In
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-orange-600/20 text-orange-500 rounded-full">
              <XCircle className="h-3 w-3" /> Not Checked In
            </span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value === row.getValue(id);
    },
    enableSorting: true,
  },
  {
    accessorKey: "resumePath",
    header: "Resume",
    cell: ({ cell }) => {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDownload(cell.getValue() as string)}
        >
          <File />
        </Button>
      );
    },
  },
  {
    id: "checkIn",
    header: "Check In",
    cell: ({ row }) => {
      return <CheckInButton application={row.original} />;
    },
  },
];
