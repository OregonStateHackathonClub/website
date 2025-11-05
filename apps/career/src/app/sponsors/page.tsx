"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, User as UserIcon, Github, ExternalLink } from "lucide-react";

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
  User,
  Application,
  HackathonParticipant,
  TeamMember,
  Team,
  Submission,
  SubmissionTrack,
  Track,
  Hackathon,
} from "@repo/database";

type TeamWithSubmission = Team & {
  submission:
    | (Submission & {
        submissionTracks: (SubmissionTrack & {
          track: Track;
        })[];
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

const ITEMS_PER_PAGE = 8;

export default function SponsorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchusers() {
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

    fetchusers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    return users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

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
    <div className="min-h-screen">
      <Navbar />

      <main className="px-6 pb-8 pt-8">
        <div className="flex items-center justify-between mb-8 gap-6">
          <h1 className="text-4xl font-bold">BeaverHacks Attendees</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 rounded-full h-12"
              />
            </div>
            <Button
              asChild
              className="bg-osu-orange hover:bg-osu-orange/90 h-12 px-6"
            >
              <a href="/api/resumes" download>
                Bulk Download Resumes
              </a>
            </Button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No users found matching your search."
                : "No users available."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 mb-8">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="relative bg-card hover:bg-card/80 border border-border rounded-lg p-6 transition-colors duration-200"
                >
                  <div className="flex gap-4 mb-6">
                    {user.image ? (
                      <Image
                        src={user.image || "/placeholder.svg"}
                        alt={user.name}
                        className="w-16 h-16 rounded-full shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center shrink-0">
                        <UserIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">{user.name}</h3>
                      {user.application && (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-4">
                          <p>
                            <span className="font-medium">Email: </span>
                            <span className="text-muted-foreground">
                              {user.email}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">University: </span>
                            <span className="text-muted-foreground">
                              {user.application.university}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Graduation: </span>
                            <span className="text-muted-foreground">
                              {user.application.graduationYear}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Shirt Size: </span>
                            <span className="text-muted-foreground">
                              {user.application.shirtSize}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Status: </span>
                            <span className="text-muted-foreground">
                              {user.application.status}
                            </span>
                          </p>
                        </div>
                      )}
                      <Button
                        asChild
                        className="bg-osu-orange hover:bg-osu-orange/90"
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
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold text-lg mb-3">
                        Hackathon Projects
                      </h4>
                      <div className="space-y-4">
                        {user.hackathonParticipants.map((participant) => {
                          const team = participant.teamMember?.team;
                          const submission = team?.submission;

                          if (!team || !submission) return null;

                          return (
                            <div
                              key={participant.id}
                              className="bg-secondary/30 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-base">
                                    {submission.name}
                                  </h5>
                                  <p className="text-sm text-muted-foreground">
                                    {participant.hackathon.name} • Team:{" "}
                                    {team.name}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {submission.githubUrl && (
                                    <Button asChild variant="outline" size="sm">
                                      <a
                                        href={submission.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Github className="w-4 h-4" />
                                      </a>
                                    </Button>
                                  )}
                                  {submission.videoUrl && (
                                    <Button asChild variant="outline" size="sm">
                                      <a
                                        href={submission.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {submission.tagline && (
                                <p className="text-sm italic mb-2">
                                  {submission.tagline}
                                </p>
                              )}
                              {submission.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {submission.description}
                                </p>
                              )}
                              {submission.submissionTracks.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {submission.submissionTracks.map((st) => (
                                    <span
                                      key={st.trackId}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-osu-orange/20 text-osu-orange"
                                    >
                                      {st.track.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
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

                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1);

                    // Show ellipsis
                    const showEllipsisBefore = pageNum === page - 2 && page > 3;
                    const showEllipsisAfter =
                      pageNum === page + 2 && page < totalPages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
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
            )}
          </>
        )}
      </main>
    </div>
  );
}
