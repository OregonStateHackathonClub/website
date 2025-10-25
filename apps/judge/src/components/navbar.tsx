"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { signOut, authClient } from "@repo/auth/client";

export const Navbar = () => {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex justify-between items-center px-8 h-20 bg-gray-100">
      <Link href="/" className="flex gap-5 items-center p-5 hover:bg-gray-200">
        <div className="w-10 h-10 relative">
          <Image src="/beaver.png" alt="beaver" fill />
        </div>
        <h1>BeaverHacks Official Judging Platform</h1>
      </Link>
      {session?.user ? (
        <Button
          onClick={async () => {
            await signOut();
          }}
        >
          Sign Out
        </Button>
      ) : (
        <div>
          <Button asChild className="m-1 bg-orange-500 hover:bg-orange-300">
            <Link href="/log-in" className="flex items-center px-5">
              Login
            </Link>
          </Button>
          <Button asChild className="m-1 bg-orange-500 hover:bg-orange-300">
            <Link href="/sign-up" className="flex items-center px-5">
              Sign Up
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
