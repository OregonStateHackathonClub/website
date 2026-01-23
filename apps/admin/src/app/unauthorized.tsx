"use client";

import { ShieldX } from "lucide-react";
import Link from "next/link";
import { signOut } from "@repo/auth/client";

export default function Unauthorized() {
  const handleSwitchAccount = async () => {
    await signOut();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000";
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3004";
    window.location.href = `${authUrl}/login?callbackURL=${encodeURIComponent(`${adminUrl}/dashboard`)}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>

        <h1 className="text-xl font-semibold text-white mb-2">Access Denied</h1>
        <p className="text-sm text-neutral-500 max-w-sm mb-8">
          You don&apos;t have permission to access this page.
          Only administrators can access the admin dashboard.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="https://beaverhacks.org"
            className="h-10 px-4 border border-neutral-800 bg-transparent text-white text-sm font-medium flex items-center justify-center hover:bg-neutral-900 transition-colors"
          >
            Go to Main Site
          </Link>
          <button
            onClick={handleSwitchAccount}
            className="h-10 px-4 bg-white text-black text-sm font-medium flex items-center justify-center hover:bg-neutral-200 transition-colors"
          >
            Try Different Account
          </button>
        </div>
      </div>
    </div>
  );
}
