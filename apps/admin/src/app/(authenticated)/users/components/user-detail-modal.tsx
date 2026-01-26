"use client";

import { UserRole } from "@repo/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Calendar, FileText, Trophy, User, Users } from "lucide-react";
import Image from "next/image";

export type UserDetail = {
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

interface UserDetailModalProps {
  user: UserDetail | null;
  isLoading: boolean;
  onClose: () => void;
}

export function UserDetailModal({
  user,
  isLoading,
  onClose,
}: UserDetailModalProps) {
  return (
    <Dialog
      open={user !== null || isLoading}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="bg-neutral-950 border-neutral-800 rounded-none max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none [&>button]:top-6 [&>button]:right-6"
        onPointerDownOutside={(e: Event) => isLoading && e.preventDefault()}
        onEscapeKeyDown={(e: KeyboardEvent) => isLoading && e.preventDefault()}
      >
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500">
            Loading user details...
          </div>
        ) : user ? (
          <>
            {/* Header */}
            <DialogHeader className="sticky top-0 bg-neutral-950 border-b border-neutral-800 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 relative overflow-hidden">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-neutral-500" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-lg font-medium text-white">
                    {user.name}
                  </DialogTitle>
                  <p className="text-sm text-neutral-500">{user.email}</p>
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
                      user.role === UserRole.ADMIN
                        ? "bg-neutral-800 text-white border-neutral-600"
                        : "bg-neutral-800/50 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">
                    Account Created
                  </p>
                  <p className="text-sm text-neutral-300 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-600" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Applications */}
              {user.applications.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    <FileText className="h-4 w-4" />
                    Applications ({user.applications.length})
                  </div>
                  <div className="space-y-2">
                    {user.applications.map((app) => (
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
                            <p className="text-neutral-300">{app.university}</p>
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
                  Hackathon Participation ({user.hackathonParticipants.length})
                </div>
                {user.hackathonParticipants.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No hackathon participation
                  </p>
                ) : (
                  <div className="space-y-2">
                    {user.hackathonParticipants.map((hp) => (
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
  );
}
