"use client";

import { useSession, signOut, redirectToLogin } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { LogOut } from "lucide-react";

export function AuthButton() {
  const { data: session, isPending } = useSession();

  if (session?.user) {
    return (
      <Button
        onClick={async () => {
          await signOut();
          window.location.href = "/";
        }}
        variant="ghost"
        className="w-26 rounded-none flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-white border border-neutral-800 hover:bg-neutral-900 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => redirectToLogin()}
      disabled={isPending}
      className={cn(
        isPending && "opacity-50 cursor-not-allowed",
        "w-26 rounded-none bg-white text-black hover:bg-neutral-200",
      )}
    >
      Sign In
    </Button>
  );
}
