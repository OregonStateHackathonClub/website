"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-white">BeaverHacks</span>
        <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Sponsors
        </span>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-white border border-neutral-800 hover:bg-neutral-900 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </header>
  );
}
