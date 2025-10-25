import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { prisma } from "@repo/database";
import { Prisma } from "@repo/database";
import { ProjectLinks } from "@/components/projectLinks";
import { ImageCarousel } from "@/components/imageCarousel";
import Image from "next/image";

// Define the reusable 'include' object for our query
const submissionInclude = {
  submissionTracks: { include: { track: true } },
  team: {
    include: {
      members: {
        include: {
          participant: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  },
};

// Infer the TypeScript type directly from the include object
type SubmissionWithDetails = Prisma.SubmissionGetPayload<{
  include: typeof submissionInclude;
}>;

// This is an async Server Component (no "use client")
export default async function ProjectPage(props: {
  params: Promise<{ year: string; id: string }>;
}) {
  const params = await props.params;
  const submission: SubmissionWithDetails | null =
    await prisma.submission.findUnique({
      where: { id: params.id },
      include: submissionInclude, // Use the constant for the query
    });

  if (!submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-red-500">
        Project not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <Link
            href={`/${params.year}`}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 transition hover:border-orange-500/50 hover:text-orange-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {params.year} Projects
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {submission.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {submission.submissionTracks.map(
              (link: SubmissionWithDetails["submissionTracks"][number]) => (
                <Badge
                  key={link.trackId}
                  className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  {link.track.name}
                </Badge>
              ),
            )}
          </div>
          {submission.tagline && (
            <p className="mt-6 max-w-3xl text-base text-neutral-300">
              {submission.tagline}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            {submission.team && (
              <div className="inline-flex items-center gap-2 text-neutral-400">
                <Users className="h-4 w-4" />
                Team: {submission.team.name}
              </div>
            )}
            <ProjectLinks
              githubURL={submission.githubUrl}
              ytVideo={submission.videoUrl}
            />
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <ImageCarousel
            altText={`${submission.name} showcase`}
            imageUrls={
              submission.images?.length > 0
                ? submission.images
                : ["/beaver.png"]
            }
          />
        </div>

        <div className="space-y-8">
          <Card className="rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                About This Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-neutral-300">
                {submission.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-2">
            {submission.team?.members && submission.team.members.length > 0 && (
              <Card className="rounded-2xl border border-neutral-800 bg-neutral-900/60">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {submission.team.members.map((member, idx) => (
                      <li
                        key={member.id ?? idx}
                        className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
                      >
                        <Image
                          src={member.participant.user?.image || "/beaver.png"}
                          alt={member.participant.user?.name || "Team member"}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {member.participant.user?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {member.participant.user?.email}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
