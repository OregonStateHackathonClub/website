"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Github, ExternalLink, ImageIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/select";

import { Navbar } from "@/components/navbar";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@repo/ui/components/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/carousel";
import {
  User,
  Application,
  HackathonParticipant,
  TeamMember,
  Team,
  Submission,
  Track,
  Hackathon,
} from "@repo/database";

// Ensure Submission type includes images if not already inferred correctly
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
  application: Application | null;
  hackathonParticipants: HackathonParticipantWithDetails[];
};

const ITEMS_PER_PAGE = 9;

export default function SponsorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  // filter state
  const [winnerFilter, setWinnerFilter] = useState<
    "all" | "winners" | "non-winners"
  >("all");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchusers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        console.log(data);
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchusers();
  }, []);

  const tracks = useMemo(() => {
    const map = new Map<string, Track>();
    users.forEach((user) =>
      user.hackathonParticipants.forEach((participant) => {
        const team = participant.teamMember?.team;
        const submission = team?.submission;
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
        const team = participant.teamMember?.team;
        const submission = team?.submission;
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
          const team = participant.teamMember?.team;
          const submission = team?.submission;
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="px-6 pb-8">
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="px-4 md:px-6 py-8 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            BeaverHacks Attendees
          </h1>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 rounded-full h-10 w-full"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select
                value={winnerFilter}
                onValueChange={(v) => {
                  setWinnerFilter(v as "all" | "winners" | "non-winners");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-40 h-10">
                  <SelectValue>
                    {winnerFilter === "all"
                      ? "All"
                      : winnerFilter === "winners"
                        ? "Winners"
                        : "Non-winners"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="winners">Winners</SelectItem>
                  <SelectItem value="non-winners">Non-winners</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={trackFilter}
                onValueChange={(v) => {
                  setTrackFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48 h-10">
                  <SelectValue>
                    {trackFilter === "all"
                      ? "All Tracks"
                      : tracks.find((t) => t.id === trackFilter)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              asChild
              className="bg-osu-orange hover:bg-osu-orange/90 h-10 px-6 w-full md:w-auto"
            >
              <a href="/api/resumes" download>
                Download All
              </a>
            </Button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center flex-1 py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No users found matching your search."
                : "No users available."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col bg-card hover:bg-card/80 border border-border rounded-lg p-6 transition-colors duration-200"
                >
                  <div className="flex flex-col mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl mb-2 truncate">
                        {user.name}
                      </h3>
                      {user.application && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-sm mb-4">
                          <p className="truncate">
                            <span className="font-medium">Email: </span>
                            <span className="text-muted-foreground">
                              {user.email}
                            </span>
                          </p>
                          <p className="truncate">
                            <span className="font-medium">Univ: </span>
                            <span className="text-muted-foreground">
                              {user.application.university}
                            </span>
                          </p>
                          <p className="truncate">
                            <span className="font-medium">Grad: </span>
                            <span className="text-muted-foreground">
                              {user.application.graduationYear}
                            </span>
                          </p>
                        </div>
                      )}
                      <Button
                        asChild
                        className="bg-osu-orange hover:bg-osu-orange/90 w-full sm:w-auto"
                        size="sm"
                      >
                        <a
                          href={`/api/resumes/${user.application?.resumePath}`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download Resume
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Hackathon Projects Section */}
                  {user.hackathonParticipants.length > 0 && (
                    <div className="border-t border-border pt-4 mt-auto">
                      <div className="space-y-4">
                        {user.hackathonParticipants.map((participant) => {
                          const team = participant.teamMember?.team;
                          const submission = team?.submission;

                          if (!team || !submission) return null;

                          return (
                            <Dialog key={participant.id}>
                              <DialogTrigger asChild>
                                <div className="bg-secondary/30 rounded-lg p-4 cursor-pointer hover:bg-secondary/50 transition-colors group">
                                  <div className="flex flex-wrap items-start justify-between mb-2 gap-2">
                                    <div>
                                      <h5 className="font-semibold text-base break-words group-hover:text-osu-orange transition-colors">
                                        {submission.name}
                                      </h5>
                                      <p className="text-sm text-muted-foreground">
                                        Team: {team.name}
                                      </p>
                                    </div>
                                    <div className="text-xs bg-background/50 px-2 py-1 rounded-full text-muted-foreground">
                                      View Details
                                    </div>
                                  </div>
                                  {submission.tagline && (
                                    <p className="text-sm italic mb-2 line-clamp-2">
                                      {submission.tagline}
                                    </p>
                                  )}

                                  {submission.tracks.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {submission.tracks.map((track) => (
                                        <span
                                          key={track.id}
                                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-osu-orange/20 text-osu-orange"
                                        >
                                          {track.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </DialogTrigger>

                              {/* Popup Window Content */}
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                {/* Centered Header */}
                                <DialogHeader className="flex flex-col items-center text-center">
                                  <DialogTitle className="text-2xl font-bold">
                                    {submission.name}
                                  </DialogTitle>
                                  {submission.tagline && (
                                    <DialogDescription className="text-lg italic text-muted-foreground mt-2 text-center">
                                      {submission.tagline}
                                    </DialogDescription>
                                  )}
                                </DialogHeader>

                                {/* Images Slideshow - Centered by mx-auto */}
                                <div className="mt-4">
                                  {submission.images &&
                                  submission.images.length > 0 ? (
                                    <Carousel className="w-full max-w-lg mx-auto">
                                      <CarouselContent>
                                        {submission.images.map((img, index) => (
                                          <CarouselItem key={index}>
                                            <div className="p-1">
                                              <div className="flex aspect-video items-center justify-center rounded-lg overflow-hidden bg-muted relative">
                                                {/* Replace this div with Next/Image if you have real URLs */}
                                                <img
                                                  src={img}
                                                  alt={`${submission.name} screenshot ${index + 1}`}
                                                  className="object-cover w-full h-full"
                                                />
                                              </div>
                                            </div>
                                          </CarouselItem>
                                        ))}
                                      </CarouselContent>
                                      <CarouselPrevious className="left-2" />
                                      <CarouselNext className="right-2" />
                                    </Carousel>
                                  ) : (
                                    <div className="flex aspect-video items-center justify-center rounded-lg bg-secondary/20 border border-dashed border-muted-foreground/30 mx-auto max-w-lg">
                                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ImageIcon className="w-10 h-10 opacity-50" />
                                        <p>No images available</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Full Description - Centered Text */}
                                <div className="mt-6 space-y-4 text-center">
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      About the Project
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed mt-1">
                                      {submission.description ||
                                        "No description provided."}
                                    </p>
                                  </div>

                                  {/* Tracks / Tags - Centered */}
                                  {submission.tracks.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-sm mb-2">
                                        Tracks & Prizes
                                      </h3>
                                      <div className="flex flex-wrap justify-center gap-2">
                                        {submission.tracks.map((track) => (
                                          <span
                                            key={track.id}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-osu-orange/10 text-osu-orange border border-osu-orange/20"
                                          >
                                            {track.name}
                                            {track.prize &&
                                              ` - ${track.prize}`}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Footer Buttons - Centered */}
                                <DialogFooter className="mt-8 gap-2 sm:justify-center">
                                  {submission.githubUrl && (
                                    <Button asChild variant="default">
                                      <a
                                        href={submission.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="gap-2"
                                      >
                                        <Github className="w-4 h-4" />
                                        View Code
                                      </a>
                                    </Button>
                                  )}
                                  {submission.videoUrl && (
                                    <Button asChild variant="outline">
                                      <a
                                        href={submission.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="gap-2"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                        Watch Demo
                                      </a>
                                    </Button>
                                  )}
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-auto pt-8 pb-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => page > 1 && handlePageChange(page - 1)}
                        className={
                          page === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const showPage =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1);

                      if (
                        (pageNum === page - 2 && page > 3) ||
                        (pageNum === page + 2 && page < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          page < totalPages && handlePageChange(page + 1)
                        }
                        className={
                          page === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}