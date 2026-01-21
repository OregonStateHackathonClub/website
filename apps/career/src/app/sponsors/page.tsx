"use client";

import type {
  Application,
  Hackathon,
  HackathonParticipant,
  Submission,
  Team,
  TeamMember,
  Track,
  User,
} from "@repo/database";
import {
  ChevronDown,
  Download,
  ExternalLink,
  Github,
  Loader2,
  Mail,
  Search,
  Users,
  GraduationCap,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";

type TeamWithSubmission = Team & {
  submission:
    | (Submission & {
        tracks: Track[];
      })
    | null;
};

type TeamMemberWithTeam = TeamMember & {
  team: TeamWithSubmission;
};

type HackathonParticipantWithDetails = HackathonParticipant & {
  hackathon: Hackathon;
  teamMember: TeamMemberWithTeam | null;
};

type UserWithDetails = User & {
  applications: Application[];
  hackathonParticipants: HackathonParticipantWithDetails[];
};

const ITEMS_PER_PAGE = 12;

export default function SponsorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [winnerFilter, setWinnerFilter] = useState<
    "all" | "winners" | "non-winners"
  >("all");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(
    null,
  );
  const [winnerOpen, setWinnerOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const tracks = useMemo(() => {
    const map = new Map<string, Track>();
    users.forEach((user) =>
      user.hackathonParticipants.forEach((participant) => {
        const submission = participant.teamMember?.team?.submission;
        if (!submission) return;
        submission.tracks.forEach((track) => {
          if (track.id) map.set(track.id, track);
        });
      }),
    );
    return Array.from(map.values());
  }, [users]);

  const filteredUsers = useMemo(() => {
    const isUserWinner = (user: UserWithDetails) => {
      return user.hackathonParticipants.some((participant) => {
        const submission = participant.teamMember?.team?.submission;
        if (!submission) return false;
        return submission.tracks.some((track) => !!track.prize);
      });
    };

    let base = users;
    if (searchTerm) {
      base = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (winnerFilter !== "all") {
      const wantWinners = winnerFilter === "winners";
      base = base.filter((u) => (isUserWinner(u) ? wantWinners : !wantWinners));
    }

    if (trackFilter !== "all") {
      base = base.filter((user) =>
        user.hackathonParticipants.some((participant) => {
          const submission = participant.teamMember?.team?.submission;
          if (!submission) return false;
          return submission.tracks.some((track) => track.id === trackFilter);
        }),
      );
    }

    return base;
  }, [users, searchTerm, winnerFilter, trackFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <Users className="h-5 w-5 text-neutral-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Attendees</h1>
              <p className="text-sm text-neutral-500">
                {filteredUsers.length} participant
                {filteredUsers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <a
            href="/api/resumes"
            download
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download All Resumes
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-neutral-900 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
            />
          </div>

          {/* Winner Filter */}
          <div className="relative">
            <button
              onClick={() => setWinnerOpen(!winnerOpen)}
              className="flex items-center gap-2 h-9 px-3 border border-neutral-800 bg-neutral-900 text-sm text-white min-w-[140px] justify-between"
            >
              <span>
                {winnerFilter === "all"
                  ? "All"
                  : winnerFilter === "winners"
                    ? "Winners"
                    : "Non-winners"}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </button>
            {winnerOpen && (
              <div className="absolute z-10 mt-1 w-full bg-neutral-900 border border-neutral-700 shadow-lg">
                {(["all", "winners", "non-winners"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setWinnerFilter(option);
                      setWinnerOpen(false);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm text-left text-white hover:bg-neutral-800"
                  >
                    {option === "all"
                      ? "All"
                      : option === "winners"
                        ? "Winners"
                        : "Non-winners"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Track Filter */}
          <div className="relative">
            <button
              onClick={() => setTrackOpen(!trackOpen)}
              className="flex items-center gap-2 h-9 px-3 border border-neutral-800 bg-neutral-900 text-sm text-white min-w-[160px] justify-between"
            >
              <span className="truncate">
                {trackFilter === "all"
                  ? "All Tracks"
                  : tracks.find((t) => t.id === trackFilter)?.name}
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </button>
            {trackOpen && (
              <div className="absolute z-10 mt-1 w-full bg-neutral-900 border border-neutral-700 shadow-lg max-h-60 overflow-auto">
                <button
                  onClick={() => {
                    setTrackFilter("all");
                    setTrackOpen(false);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-sm text-left text-white hover:bg-neutral-800"
                >
                  All Tracks
                </button>
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setTrackFilter(track.id);
                      setTrackOpen(false);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm text-left text-white hover:bg-neutral-800"
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-neutral-500">
              {searchTerm
                ? "No attendees found matching your search."
                : "No attendees available."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {paginatedUsers.map((user) => {
                const application = user.applications[0];
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="border border-neutral-800 bg-neutral-950/80 p-4 hover:border-neutral-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-white truncate">
                          {user.name}
                        </h3>
                        <p className="text-sm text-neutral-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {application && (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                          <span className="truncate">
                            {application.university}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-400">
                          <GraduationCap className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Class of {application.graduationYear}</span>
                        </div>
                      </div>
                    )}

                    {/* Project badges */}
                    {user.hackathonParticipants.some(
                      (p) => p.teamMember?.team?.submission,
                    ) && (
                      <div className="mt-3 pt-3 border-t border-neutral-800">
                        <div className="flex flex-wrap gap-1">
                          {user.hackathonParticipants
                            .filter((p) => p.teamMember?.team?.submission)
                            .slice(0, 2)
                            .map((participant) => (
                              <span
                                key={participant.id}
                                className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-300 truncate max-w-[120px]"
                              >
                                {participant.teamMember?.team?.submission?.name}
                              </span>
                            ))}
                          {user.hackathonParticipants.filter(
                            (p) => p.teamMember?.team?.submission,
                          ).length > 2 && (
                            <span className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-500">
                              +
                              {user.hackathonParticipants.filter(
                                (p) => p.teamMember?.team?.submission,
                              ).length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm text-neutral-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-neutral-950 border border-neutral-800">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
              <h2 className="text-lg font-semibold text-white">
                {selectedUser.name}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Contact Info */}
              <div className="flex items-center gap-2 text-neutral-400 mb-4">
                <Mail className="h-4 w-4" />
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="hover:text-white transition-colors"
                >
                  {selectedUser.email}
                </a>
              </div>

              {/* Application Details */}
              {selectedUser.applications[0] && (
                <div className="mb-6 p-4 border border-neutral-800 bg-neutral-900/50">
                  <h3 className="text-sm font-medium text-neutral-400 mb-3">
                    Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">University</p>
                      <p className="text-white">
                        {selectedUser.applications[0].university}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Graduation</p>
                      <p className="text-white">
                        {selectedUser.applications[0].graduationYear}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/resumes/${selectedUser.applications[0].resumePath}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Resume
                  </a>
                </div>
              )}

              {/* Projects */}
              {selectedUser.hackathonParticipants.some(
                (p) => p.teamMember?.team?.submission,
              ) && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-400 mb-3">
                    Projects
                  </h3>
                  <div className="space-y-4">
                    {selectedUser.hackathonParticipants.map((participant) => {
                      const team = participant.teamMember?.team;
                      const submission = team?.submission;
                      if (!submission) return null;

                      return (
                        <div
                          key={participant.id}
                          className="p-4 border border-neutral-800 bg-neutral-900/50"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h4 className="font-medium text-white">
                                {submission.name}
                              </h4>
                              <p className="text-sm text-neutral-500">
                                Team: {team.name}
                              </p>
                            </div>
                            <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1">
                              {participant.hackathon.name}
                            </span>
                          </div>

                          {submission.tagline && (
                            <p className="text-sm italic text-neutral-400 mb-3">
                              {submission.tagline}
                            </p>
                          )}

                          {submission.description && (
                            <p className="text-sm text-neutral-400 mb-3 line-clamp-3">
                              {submission.description}
                            </p>
                          )}

                          {/* Images */}
                          {submission.images &&
                            submission.images.length > 0 && (
                              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                {submission.images
                                  .slice(0, 3)
                                  .map((img, idx) => (
                                    <div
                                      key={idx}
                                      className="w-24 h-16 flex-shrink-0 bg-neutral-800 overflow-hidden"
                                    >
                                      <Image
                                        src={img}
                                        alt={`${submission.name} screenshot`}
                                        width={96}
                                        height={64}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                              </div>
                            )}

                          {/* Tracks */}
                          {submission.tracks.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {submission.tracks.map((track) => (
                                <span
                                  key={track.id}
                                  className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                >
                                  {track.name}
                                  {track.prize && ` - ${track.prize}`}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex gap-2">
                            {submission.githubUrl && (
                              <a
                                href={submission.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-neutral-700 hover:bg-neutral-800 transition-colors"
                              >
                                <Github className="h-3.5 w-3.5" />
                                Code
                              </a>
                            )}
                            {submission.videoUrl && (
                              <a
                                href={submission.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-neutral-700 hover:bg-neutral-800 transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Demo
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
