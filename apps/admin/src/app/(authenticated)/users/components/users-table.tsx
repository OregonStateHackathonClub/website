"use client";

import { UserRole } from "@repo/database";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
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
  Calendar,
  FileText,
  MoreHorizontal,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Trophy,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteUser,
  getUserById,
  getUsers,
  setUserRole,
  type UserListItem,
} from "@/app/actions/users";

type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  applications: {
    id: string;
    name: string;
    university: string;
    graduationYear: number;
    status: string;
    createdAt: Date;
    hackathon: {
      id: string;
      name: string;
    };
  }[];
  hackathonParticipants: {
    id: string;
    joinedAt: Date;
    hackathon: {
      id: string;
      name: string;
    };
    teamMember: {
      team: {
        id: string;
        name: string;
      };
    } | null;
  }[];
};

interface UsersTableProps {
  initialUsers: UserListItem[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(async () => {
      const { users } = await getUsers({ search: value, limit: 50 });
      setUsers(users);
    });
  };

  const handleRowClick = async (userId: string) => {
    setIsLoadingUser(true);
    const user = await getUserById(userId);
    setSelectedUser(user as UserDetail);
    setIsLoadingUser(false);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setOpenDropdown(null);
    const result = await setUserRole(userId, newRole);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      toast.success(
        newRole === UserRole.ADMIN
          ? "User promoted to admin"
          : "Admin role removed",
      );
    } else {
      toast.error(result.error || "Failed to update role");
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    setOpenDropdown(null);
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This cannot be undone.`,
      )
    ) {
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      toast.success("User deleted");
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const handleBulkMakeAdmin = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of selectedRows) {
      if (row.original.role !== UserRole.ADMIN) {
        const result = await setUserRole(row.original.id, UserRole.ADMIN);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    // Refresh the users list
    const { users: refreshedUsers } = await getUsers({ search, limit: 50 });
    setUsers(refreshedUsers);
    setRowSelection({});
    setIsProcessing(false);

    if (successCount > 0) {
      toast.success(`Made ${successCount} user(s) admin`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} user(s)`);
    }
  };

  const handleBulkRemoveAdmin = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of selectedRows) {
      if (row.original.role === UserRole.ADMIN) {
        const result = await setUserRole(row.original.id, UserRole.USER);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    // Refresh the users list
    const { users: refreshedUsers } = await getUsers({ search, limit: 50 });
    setUsers(refreshedUsers);
    setRowSelection({});
    setIsProcessing(false);

    if (successCount > 0) {
      toast.success(`Removed admin from ${successCount} user(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to update ${errorCount} user(s)`);
    }
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedRows.length} user(s)? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of selectedRows) {
      const result = await deleteUser(row.original.id);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    // Refresh the users list
    const { users: refreshedUsers } = await getUsers({ search, limit: 50 });
    setUsers(refreshedUsers);
    setRowSelection({});
    setIsProcessing(false);

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} user(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} user(s)`);
    }
  };

  const columns: ColumnDef<UserListItem>[] = [
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
            <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
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
                        onClick={() => handleRoleChange(user.id, UserRole.USER)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                      >
                        <ShieldOff className="h-4 w-4" />
                        Remove admin
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleRoleChange(user.id, UserRole.ADMIN)
                        }
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Make admin
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
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

  const table = useReactTable({
    data: users,
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
      {/* Search and bulk actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0 bg-transparent dark:bg-transparent"
          />
          {isPending && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
              Searching...
            </span>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">
              {selectedCount} selected
            </span>
            <button
              onClick={handleBulkMakeAdmin}
              disabled={isProcessing}
              className="h-8 px-3 bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
            >
              Make Admin
            </button>
            <button
              onClick={handleBulkRemoveAdmin}
              disabled={isProcessing}
              className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
            >
              Remove Admin
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="h-8 px-3 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-colors"
            >
              Delete
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
                  onClick={() => handleRowClick(row.original.id)}
                  className="border-neutral-800 cursor-pointer hover:bg-neutral-900/50 data-[state=selected]:bg-neutral-900/50"
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
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-neutral-500"
                >
                  No users found
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

      {/* User Detail Modal */}
      <Dialog
        open={selectedUser !== null || isLoadingUser}
        onOpenChange={(open) => {
          if (!open && !isLoadingUser) {
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent
          className="bg-neutral-950 border-neutral-800 rounded-none max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none [&>button]:top-6 [&>button]:right-6"
          onPointerDownOutside={(e: Event) =>
            isLoadingUser && e.preventDefault()
          }
          onEscapeKeyDown={(e: KeyboardEvent) =>
            isLoadingUser && e.preventDefault()
          }
        >
          {isLoadingUser ? (
            <div className="p-12 text-center text-neutral-500">
              Loading user details...
            </div>
          ) : selectedUser ? (
            <>
              {/* Header */}
              <DialogHeader className="sticky top-0 bg-neutral-950 border-b border-neutral-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {selectedUser.image ? (
                      <Image
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-neutral-500" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-medium text-white">
                      {selectedUser.name}
                    </DialogTitle>
                    <p className="text-sm text-neutral-500">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">
                      Role
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${
                        selectedUser.role === UserRole.ADMIN
                          ? "bg-neutral-800 text-white border-neutral-600"
                          : "bg-neutral-800/50 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">
                      Account Created
                    </p>
                    <p className="text-sm text-neutral-300 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-neutral-600" />
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Applications */}
                {selectedUser.applications.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      <FileText className="h-4 w-4" />
                      Applications ({selectedUser.applications.length})
                    </div>
                    <div className="space-y-2">
                      {selectedUser.applications.map((app) => (
                        <div
                          key={app.id}
                          className="border border-neutral-800 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">
                              {app.hackathon.name}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium border bg-neutral-800 text-neutral-300 border-neutral-700">
                              {app.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-neutral-500">Name</p>
                              <p className="text-neutral-300">{app.name}</p>
                            </div>
                            <div>
                              <p className="text-neutral-500">University</p>
                              <p className="text-neutral-300">
                                {app.university}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-500">Graduation</p>
                              <p className="text-neutral-300">
                                {app.graduationYear}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-500">Applied</p>
                              <p className="text-neutral-300">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hackathon Participation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    <Trophy className="h-4 w-4" />
                    Hackathon Participation (
                    {selectedUser.hackathonParticipants.length})
                  </div>
                  {selectedUser.hackathonParticipants.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No hackathon participation
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.hackathonParticipants.map((hp) => (
                        <div
                          key={hp.id}
                          className="border border-neutral-800 p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {hp.hackathon.name}
                            </p>
                            {hp.teamMember && (
                              <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                                <Users className="h-3 w-3" />
                                {hp.teamMember.team.name}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">
                            {new Date(hp.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
