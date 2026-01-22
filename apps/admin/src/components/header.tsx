"use client";

import { signOut } from "@repo/auth/client";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import type { AdminUser } from "@/app/actions/auth";

interface HeaderProps {
  user: AdminUser;
}

export function Header({ user }: HeaderProps) {
  const handleSignOut = async () => {
    await signOut();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000";
    const adminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3004";
    window.location.href = `${authUrl}/login?callbackURL=${encodeURIComponent(`${adminUrl}/dashboard`)}`;
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm px-6">
      <div />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
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
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-white border border-neutral-800 hover:bg-neutral-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
