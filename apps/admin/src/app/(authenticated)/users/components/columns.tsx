"use client";

import { UserRole } from "@repo/database";
import { Checkbox } from "@repo/ui/components/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import type { UserListItem } from "@/app/actions/users";

interface ColumnActions {
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onDelete: (userId: string, userName: string) => void;
}

export function createColumns(
  actions: ColumnActions,
): ColumnDef<UserListItem>[] {
  const { openDropdown, setOpenDropdown, onRoleChange, onDelete } = actions;

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
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-neutral-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 relative overflow-hidden">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-neutral-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${
              user.role === UserRole.ADMIN
                ? "bg-neutral-800 text-white border-neutral-600"
                : "bg-neutral-800/50 text-neutral-400 border-neutral-700"
            }`}
          >
            {user.role}
          </span>
        );
      },
    },
    {
      id: "hackathons",
      header: "Hackathons",
      cell: ({ row }) => (
        <span className="text-sm text-neutral-400">
          {row.original._count.hackathonParticipants}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-neutral-400">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div
            className="flex items-center justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === user.id ? null : user.id)
                }
                className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {openDropdown === user.id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 w-48 border border-neutral-800 bg-neutral-900 shadow-lg">
                    {user.role === UserRole.ADMIN ? (
                      <button
                        onClick={() => onRoleChange(user.id, UserRole.USER)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                      >
                        <ShieldOff className="h-4 w-4" />
                        Remove admin
                      </button>
                    ) : (
                      <button
                        onClick={() => onRoleChange(user.id, UserRole.ADMIN)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Make admin
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user.id, user.name)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete user
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      },
    },
  ];
}
