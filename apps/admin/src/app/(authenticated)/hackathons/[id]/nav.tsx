"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Overview", href: "" },
  { name: "Applications", href: "/applications" },
  { name: "Teams", href: "/teams" },
  { name: "Submissions", href: "/submissions" },
  { name: "Judges", href: "/judges" },
  { name: "Tracks", href: "/tracks" },
  { name: "Judging", href: "/judging" },
];

interface HackathonNavProps {
  hackathonId: string;
}

export function HackathonNav({ hackathonId }: HackathonNavProps) {
  const pathname = usePathname();
  const basePath = `/hackathons/${hackathonId}`;

  return (
    <nav className="flex gap-1 border-b border-neutral-800">
      {tabs.map((tab) => {
        const href = `${basePath}${tab.href}`;
        const isActive =
          tab.href === ""
            ? pathname === basePath
            : pathname.startsWith(href);

        return (
          <Link
            key={tab.name}
            href={href}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
              isActive
                ? "border-white text-white"
                : "border-transparent text-neutral-500 hover:text-white"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
