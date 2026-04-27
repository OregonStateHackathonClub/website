"use client";

import { Input } from "@repo/ui/components/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { getTeamsLookingForMembers } from "@/app/actions/participant";

type Team = Awaited<ReturnType<typeof getTeamsLookingForMembers>>[number];

interface TeamsListProps {
  teams: Team[];
  hackathonId: string;
}

export function TeamsList({ teams, hackathonId }: TeamsListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((team) => {
      if (team.name.toLowerCase().includes(q)) return true;
      return team.members.some((m) =>
        (m.participant?.user?.name ?? "").toLowerCase().includes(q),
      );
    });
  }, [teams, query]);

  return (
    <>
      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          type="text"
          placeholder="Search by team or member name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-none h-10 border-neutral-800 bg-neutral-950/80 pl-9 text-white placeholder:text-neutral-600 focus-visible:border-neutral-700 focus-visible:ring-0"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950/80 p-12 text-center">
          <p className="text-neutral-500">
            {query
              ? "No teams match your search."
              : "No teams are currently looking for teammates."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((team) => (
            <Link
              key={team.id}
              href={`/${hackathonId}/team/${team.id}`}
              className="border border-neutral-800 bg-neutral-950/80 p-4 transition-colors hover:border-neutral-700"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-medium text-white">{team.name}</h3>
                <span className="shrink-0 text-sm text-neutral-500">
                  {team._count.members}/4
                </span>
              </div>
              {team.description && (
                <p className="mt-1 text-sm text-neutral-400 line-clamp-2">
                  {team.description}
                </p>
              )}
              {team.members.length > 0 && (
                <p className="mt-3 text-xs text-neutral-500">
                  {team.members
                    .map((m) => m.participant?.user?.name)
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
