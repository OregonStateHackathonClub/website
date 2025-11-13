"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { ModeToggle } from "@/components/mode-toggle";

export const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isSponsorPage = pathname === "/sponsors";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        <Link
          href={isSponsorPage ? "/sponsors" : "/"}
          className="flex items-center gap-3"
        >
          <Image
            src="/logo.png"
            width={48}
            height={48}
            alt="BeaverHacks Logo"
            className="rounded"
          />
          <span className="text-xl font-bold">BeaverHacks Career</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="https://www.instagram.com/beaverhacks"
              target="_blank"
              rel="noopener noreferrer"
            >
              {mounted && (
                <img
                  src={
                    resolvedTheme === "dark"
                      ? "/instagram-white.svg"
                      : "/instagram-black.svg"
                  }
                  width={20}
                  height={20}
                  alt="Instagram Logo"
                  className="w-5 h-5 hover:opacity-80 transition"
                />
              )}
            </Link>
            <Link
              href="https://www.youtube.com/@osubehaverhacks"
              target="_blank"
              rel="noopener noreferrer"
            >
              {mounted && (
                <img
                  src={
                    resolvedTheme === "dark"
                      ? "/youtube-white.svg"
                      : "/youtube-black.svg"
                  }
                  width={20}
                  height={20}
                  alt="Youtube logo"
                  className="w-5 h-5 hover:opacity-80 transition"
                />
              )}
            </Link>
            <Link
              href="https://discord.com/invite/vuepffJxub"
              target="_blank"
              rel="noopener noreferrer"
            >
              {mounted && (
                <img
                  src={
                    resolvedTheme === "dark"
                      ? "/discord-white.svg"
                      : "/discord-black.svg"
                  }
                  width={20}
                  height={20}
                  alt="Discord logo"
                  className="w-5 h-5 hover:opacity-80 transition"
                />
              )}
            </Link>
          </div>

          <ModeToggle />
          {isSponsorPage && (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
