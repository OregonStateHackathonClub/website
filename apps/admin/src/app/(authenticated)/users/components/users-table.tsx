"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@repo/database";
import Image from "next/image";
import {
  MoreHorizontal,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  User,
  X,
  Calendar,
  FileText,
  Users,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUsers,
  getUserById,
  setUserRole,
  deleteUser,
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
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      toast.success(
        newRole === UserRole.ADMIN
          ? "User promoted to admin"
          : "Admin role removed"
      );
    } else {
      toast.error(result.error || "Failed to update role");
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    setOpenDropdown(null);
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This cannot be undone.`
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

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            Searching...
          </span>
        )}
      </div>

      {/* Table */}
      <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Hackathons
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user.id)}
                  className="border-b border-neutral-800 last:border-0 cursor-pointer hover:bg-neutral-900/50 transition-colors"
                >
                  <td className="px-6 py-4">
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
                        <p className="text-sm font-medium text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${
                        user.role === UserRole.ADMIN
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          : "bg-neutral-800/50 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {user._count.hackathonParticipants}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === user.id ? null : user.id
                          )
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
                                onClick={() =>
                                  handleRoleChange(user.id, UserRole.USER)
                                }
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
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete user
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {(selectedUser || isLoadingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => !isLoadingUser && setSelectedUser(null)}
          />
          <div className="relative bg-neutral-950 border border-neutral-800 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {isLoadingUser ? (
              <div className="p-12 text-center text-neutral-500">
                Loading user details...
              </div>
            ) : selectedUser ? (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-neutral-950 border-b border-neutral-800 p-6 flex items-start justify-between">
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
                      <h3 className="text-lg font-medium text-white">
                        {selectedUser.name}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-1 text-neutral-500 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

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
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
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
                          <div key={app.id} className="border border-neutral-800 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white">
                                {app.hackathon.name}
                              </p>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${
                                  app.status === "CHECKED_IN"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                }`}
                              >
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
                                <p className="text-neutral-300">{app.university}</p>
                              </div>
                              <div>
                                <p className="text-neutral-500">Graduation</p>
                                <p className="text-neutral-300">{app.graduationYear}</p>
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
          </div>
        </div>
      )}
    </div>
  );
}
