"use client";

import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "./auth-button";

interface NavbarProps {
  currentHackathonId: string;
  userTeamId?: string | null;
  teamSubmissionId?: string | null;
}

export const Navbar = ({
  currentHackathonId,
  userTeamId,
  teamSubmissionId,
}: NavbarProps) => {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-neutral-800 bg-neutral-900/75 px-4 backdrop-blur-lg md:px-8">
      <div className="flex h-16 w-full items-center justify-between max-w-7xl mx-auto">
        <HackathonHomepageButton link={`/${currentHackathonId}`} />

        <div className="flex items-center gap-4">
          <Link href={`/${currentHackathonId}/sponsors`}>
            <Button variant="ghost" className="hover:cursor-pointer">Sponsors</Button>
          </Link>
          {/* Conditional Team/Submission Buttons */}
          {userTeamId && (
            <>
              {!teamSubmissionId ? (
                <Link
                  href={`/${currentHackathonId}/submission?teamId=${userTeamId}`}
                >
                  <Button
                    variant="outline"
                    className="hidden sm:flex border-orange-500/50 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 hover:cursor-pointer"
                  >
                    Create Submission
                  </Button>
                </Link>
              ) : (
                <Link
                  href={`/${currentHackathonId}/projects/${teamSubmissionId}`}
                >
                  <Button
                    variant="outline"
                    className="hidden sm:flex border-orange-500/50 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 hover:cursor-pointer"
                  >
                    View Submission
                  </Button>
                </Link>
              )}
            </>
          )}
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

const HackathonHomepageButton = ({ link = "/" }: { link?: string }) => (
  <Link href={{ pathname: link }} className="group flex items-center gap-5">
    <div className="relative h-10 w-10">
      {/* 1. The default gradient image (bottom layer) */}
      <Image
        src="/beaverhacks_gradient.png"
        alt="BeaverHacks Gradient Logo"
        fill
        className="transition-opacity duration-300 ease-in-out"
      />
      {/* 2. The white hover image (top layer) */}
      <Image
        src="/beaverhacks_white.png"
        alt="BeaverHacks White Logo"
        fill
        className="opacity-0 transition-opacity duration-800 ease-in-out group-hover:opacity-100"
      />
    </div>
    <h1>BeaverHacks Official Judging Platform</h1>
  </Link>
);
