import { auth } from "@repo/auth";
import { type Prisma, prisma } from "@repo/database";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/hover-card";
import { Users } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProjectLinks } from "../../../components/project-links";
import { ImageCarousel } from "./image-carousel";

const submissionInclude = {
  tracks: {
    include: {
      sponsor: true,
    },
  },
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

type SubmissionWithDetails = Prisma.SubmissionGetPayload<{
  include: typeof submissionInclude;
}>;

export async function ProjectContent({
  hackathonId,
  submissionId,
}: {
  hackathonId: string;
  submissionId: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;

  const submission: SubmissionWithDetails | null =
    await prisma.submission.findUnique({
      where: { id: submissionId },
      include: submissionInclude,
    });

  if (!submission) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-red-500">
        Project not found.
      </div>
    );
  }

  const isTeamMember =
    userId &&
    submission.team?.members.some(
      (member) => member.participant.user.id === userId,
    );

  return (
    <>
      <h1 className="font-bold text-xl text-white sm:text-2xl">
        {submission.title}
      </h1>
      {submission.tagline && (
        <p className="mt-1 mb-4 max-w-3xl text-sm text-neutral-300">
          {submission.tagline}
        </p>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-4">
          <div className="w-full border border-neutral-800 bg-neutral-900">
            <ImageCarousel
              altText={`${submission.title} showcase`}
              imageUrls={
                submission.images?.length > 0
                  ? submission.images
                  : ["/placeholder_project.png"]
              }
              videoUrl={submission.videoUrl}
            />
          </div>
          <Card className="rounded-none border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                About This Project
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert prose-sm max-w-none leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {submission.description}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {submission.tracks.map(
              (link: SubmissionWithDetails["tracks"][number]) => (
                <HoverCard key={link.id}>
                  <HoverCardTrigger asChild>
                    <Badge className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:cursor-pointer">
                      {link.name}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-neutral-950 border-neutral-800 p-4 rounded-none">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">
                        {link.name}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {link.description}
                      </p>
                      {link.prize && (
                        <div className="flex items-center pt-2">
                          <span className="text-xs font-semibold text-neutral-400 mr-2">
                            Prize:
                          </span>
                          <span className="text-xs text-neutral-300">
                            {link.prize}
                          </span>
                        </div>
                      )}
                      {link.sponsor && (
                        <div className="pt-2 border-t border-neutral-800 mt-2">
                          <p className="text-xs text-neutral-500 mb-1">
                            Sponsored by
                          </p>
                          <div className="flex items-center gap-2 p-1">
                            {link.sponsor.logoUrl && (
                              <div className="relative h-6 w-6 rounded overflow-hidden bg-white">
                                <Image
                                  src={link.sponsor.logoUrl}
                                  alt={link.sponsor.name}
                                  fill
                                  className="object-contain p-0.5"
                                />
                              </div>
                            )}
                            <span className="text-sm font-medium text-white">
                              {link.sponsor.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ),
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {submission.team && (
                <div className="inline-flex items-center gap-2 text-neutral-400">
                  <Users className="h-4 w-4" />
                  Team: {submission.team.name}
                </div>
              )}
              <ProjectLinks
                githubURL={submission.githubUrl}
                ytVideo={null}
              />
            </div>

            {isTeamMember && (
              <Link
                href={`/${hackathonId}/submission`}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full hover:cursor-pointer rounded-none border-neutral-800 text-white hover:bg-neutral-900"
                >
                  Edit Submission
                </Button>
              </Link>
            )}
          </div>

          {submission.team?.members &&
            submission.team.members.length > 0 && (
              <Card className="rounded-none border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {submission.team?.members.map((member, idx) => (
                      <li
                        key={member.participant.user.id ?? idx}
                        className="flex items-center gap-3 border border-neutral-800 bg-neutral-900 px-3 py-2"
                      >
                        <Image
                          src={
                            member.participant.user?.image ||
                            "/beaverhacks_white.png"
                          }
                          alt={
                            member.participant.user?.name || "Team member"
                          }
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm text-white">
                            {member.participant.user?.name || "Unknown"}
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
    </>
  );
}
