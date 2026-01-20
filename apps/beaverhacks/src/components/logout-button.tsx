"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@repo/auth/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
