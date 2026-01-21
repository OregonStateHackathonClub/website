"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ExternalLink,
  Mail,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Hackathons", href: "/hackathons", icon: Calendar },
  { name: "Email", href: "/email", icon: Mail },
];

const externalLinks = [
  { name: "beaverhacks.org", href: "https://beaverhacks.org" },
  { name: "judge.beaverhacks.org", href: "https://judge.beaverhacks.org" },
  { name: "career.beaverhacks.org", href: "https://career.beaverhacks.org" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-2 border-b border-neutral-800 px-6">
        <span className="text-lg font-semibold text-white">BeaverHacks</span>
        <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
          Admin
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neutral-800/80 text-white"
                  : "text-neutral-500 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-800 p-4">
        <p className="mb-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
          Other Apps
        </p>
        <div className="space-y-1">
          {externalLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-white"
            >
              {link.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
