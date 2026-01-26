"use client";

import { UserRole } from "@repo/database";
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
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteUser,
  getUserById,
  getUsers,
  setUserRole,
  type UserListItem,
} from "@/app/actions/users";
import { createColumns } from "./columns";
import { UserDetailModal, UserDetail } from "./user-detail-modal";
import { Toolbar } from "./toolbar";

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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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

  const refreshUsers = async () => {
    const { users: refreshedUsers } = await getUsers({ search, limit: 50 });
    setUsers(refreshedUsers);
    setRowSelection({});
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
        if (result.success) successCount++;
        else errorCount++;
      }
    }

    await refreshUsers();
    setIsProcessing(false);

    if (successCount > 0) toast.success(`Made ${successCount} user(s) admin`);
    if (errorCount > 0) toast.error(`Failed to update ${errorCount} user(s)`);
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
        if (result.success) successCount++;
        else errorCount++;
      }
    }

    await refreshUsers();
    setIsProcessing(false);

    if (successCount > 0)
      toast.success(`Removed admin from ${successCount} user(s)`);
    if (errorCount > 0) toast.error(`Failed to update ${errorCount} user(s)`);
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
      if (result.success) successCount++;
      else errorCount++;
    }

    await refreshUsers();
    setIsProcessing(false);

    if (successCount > 0) toast.success(`Deleted ${successCount} user(s)`);
    if (errorCount > 0) toast.error(`Failed to delete ${errorCount} user(s)`);
  };

  const columns = useMemo(
    () =>
      createColumns({
        openDropdown,
        setOpenDropdown,
        onRoleChange: handleRoleChange,
        onDelete: handleDelete,
      }),
    [openDropdown, handleRoleChange, handleDelete],
  );

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
      <Toolbar
        search={search}
        onSearch={handleSearch}
        isPending={isPending}
        selectedCount={selectedCount}
        isProcessing={isProcessing}
        onBulkMakeAdmin={handleBulkMakeAdmin}
        onBulkRemoveAdmin={handleBulkRemoveAdmin}
        onBulkDelete={handleBulkDelete}
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

      <div className="text-sm text-neutral-500">
        {selectedCount} of {table.getFilteredRowModel().rows.length} row(s)
        selected.
      </div>

      <UserDetailModal
        user={selectedUser}
        isLoading={isLoadingUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
