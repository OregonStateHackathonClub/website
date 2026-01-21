"use client";

import { useSession, signOut, redirectToLogin } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";

export function AuthButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <Button
        onClick={async () => {
          await signOut();
          window.location.href = "/";
        }}
        className="hover:cursor-pointer bg-orange-500 hover:bg-orange-300 text-white hover:text-black"
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      onClick={() => redirectToLogin()}
      className="bg-orange-500 hover:bg-orange-300 text-white hover:text-black"
    >
      Sign In
    </Button>
  );
}
