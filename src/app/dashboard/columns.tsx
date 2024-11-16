"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, File } from "lucide-react"

export type Application = {
  createdAt: Date
  university: string
  graduationYear: number
  resumePath: string
  user: {
    name: string, email: string
  }
}

const handleDownload = async(path: string) => {
  const res = await fetch(`/api/download/${path}`, { method: "GET" })
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a")
  link.href = url
  link.download = path
  link.click()
  window.URL.revokeObjectURL(url);
}

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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc" )}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
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
    accessorKey: "resumePath",
    header: "Resume",
    cell: ({ cell }) => {
      return <Button variant="ghost" size="icon" onClick={() => handleDownload(cell.getValue() as string)}><File /></Button>
    }
  },
]
