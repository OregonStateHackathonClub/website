"use client";

import { useSession, signOut, redirectToLogin } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { LogOut } from "lucide-react";

export function AuthButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <Button
        onClick={async () => {
          await signOut();
          window.location.href = "/";
        }}
        variant="ghost"
        className="rounded-none flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-white border border-neutral-800 hover:bg-neutral-900 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => redirectToLogin()}
      className="rounded-none bg-white text-black hover:bg-neutral-200"
    >
      Sign In
    </Button>
  );
}
