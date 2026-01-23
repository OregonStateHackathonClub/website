"use client";

import type { Track } from "@repo/database";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { type UserWithDetails, getUsers } from "../actions/users";

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
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(
    null,
  );

  const fetchUsersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-neutral-400">{error}</p>
            <Button
              onClick={fetchUsersData}
              variant="outline"
              className="rounded-none border-neutral-800 hover:bg-neutral-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
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

          <Button
            asChild
            className="rounded-none bg-white text-black hover:bg-neutral-200"
          >
            <a href="/api/resumes" download>
              <Download className="h-4 w-4" />
              Download All Resumes
            </a>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 z-10" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-none h-9 pl-9 pr-4 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:border-neutral-700 focus-visible:ring-0"
            />
          </div>

          {/* Winner Filter */}
          <Select
            value={winnerFilter}
            onValueChange={(value: "all" | "winners" | "non-winners") => {
              setWinnerFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-none h-9 min-w-[140px] border-neutral-800 bg-neutral-900 text-white">
              <SelectValue>
                {winnerFilter === "all"
                  ? "All"
                  : winnerFilter === "winners"
                    ? "Winners"
                    : "Non-winners"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-none bg-neutral-900 border-neutral-700">
              <SelectItem
                value="all"
                className="rounded-none text-white hover:bg-neutral-800"
              >
                All
              </SelectItem>
              <SelectItem
                value="winners"
                className="rounded-none text-white hover:bg-neutral-800"
              >
                Winners
              </SelectItem>
              <SelectItem
                value="non-winners"
                className="rounded-none text-white hover:bg-neutral-800"
              >
                Non-winners
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Track Filter */}
          <Select
            value={trackFilter}
            onValueChange={(value) => {
              setTrackFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-none h-9 min-w-[160px] border-neutral-800 bg-neutral-900 text-white">
              <SelectValue>
                {trackFilter === "all"
                  ? "All Tracks"
                  : tracks.find((t) => t.id === trackFilter)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-none bg-neutral-900 border-neutral-700 max-h-60">
              <SelectItem
                value="all"
                className="rounded-none text-white hover:bg-neutral-800"
              >
                All Tracks
              </SelectItem>
              {tracks.map((track) => (
                <SelectItem
                  key={track.id}
                  value={track.id}
                  className="rounded-none text-white hover:bg-neutral-800"
                >
                  {track.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                const application = user.applications?.[0];
                return (
                  <Card
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="rounded-none border-neutral-800 bg-neutral-950/80 hover:border-neutral-700 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 rounded-none">
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
                                <Badge
                                  key={participant.id}
                                  variant="secondary"
                                  className="rounded-none bg-neutral-800 text-neutral-300 hover:bg-neutral-800 truncate max-w-[120px]"
                                >
                                  {
                                    participant.teamMember?.team?.submission
                                      ?.name
                                  }
                                </Badge>
                              ))}
                            {user.hackathonParticipants.filter(
                              (p) => p.teamMember?.team?.submission,
                            ).length > 2 && (
                              <Badge
                                variant="secondary"
                                className="rounded-none bg-neutral-800 text-neutral-500 hover:bg-neutral-800"
                              >
                                +
                                {user.hackathonParticipants.filter(
                                  (p) => p.teamMember?.team?.submission,
                                ).length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-none border-neutral-800 hover:bg-neutral-800 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-sm text-neutral-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-none border-neutral-800 hover:bg-neutral-800 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="rounded-none max-w-2xl max-h-[90vh] overflow-auto bg-neutral-950 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="flex items-center gap-2 text-neutral-400">
                <Mail className="h-4 w-4" />
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="hover:text-white transition-colors"
                >
                  {selectedUser.email}
                </a>
              </div>

              {/* Application Details */}
              {selectedUser.applications?.[0] && (
                <Card className="rounded-none border-neutral-800 bg-neutral-900/50">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-neutral-400">
                      Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    <Button
                      asChild
                      className="rounded-none bg-white text-black hover:bg-neutral-200"
                    >
                      <a
                        href={`/api/resumes/${selectedUser.applications[0].resumePath}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                        Download Resume
                      </a>
                    </Button>
                  </CardContent>
                </Card>
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
                        <Card
                          key={participant.id}
                          className="rounded-none border-neutral-800 bg-neutral-900/50"
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-medium text-white">
                                  {submission.name}
                                </h4>
                                <p className="text-sm text-neutral-500">
                                  Team: {team.name}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="rounded-none bg-neutral-800 text-neutral-500 hover:bg-neutral-800"
                              >
                                {participant.hackathon.name}
                              </Badge>
                            </div>

                            {submission.tagline && (
                              <p className="text-sm italic text-neutral-400">
                                {submission.tagline}
                              </p>
                            )}

                            {submission.description && (
                              <p className="text-sm text-neutral-400 line-clamp-3">
                                {submission.description}
                              </p>
                            )}

                            {/* Images */}
                            {submission.images &&
                              submission.images.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {submission.images
                                    .slice(0, 3)
                                    .map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="w-24 h-16 flex-shrink-0 bg-neutral-800 overflow-hidden rounded-none"
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
                              <div className="flex flex-wrap gap-2">
                                {submission.tracks.map((track) => (
                                  <Badge
                                    key={track.id}
                                    className="rounded-none bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20"
                                  >
                                    {track.name}
                                    {track.prize && ` - ${track.prize}`}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Links */}
                            <div className="flex gap-2">
                              {submission.githubUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="rounded-none border-neutral-700 hover:bg-neutral-800"
                                >
                                  <a
                                    href={submission.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Github className="h-3.5 w-3.5" />
                                    Code
                                  </a>
                                </Button>
                              )}
                              {submission.videoUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="rounded-none border-neutral-700 hover:bg-neutral-800"
                                >
                                  <a
                                    href={submission.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Demo
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
