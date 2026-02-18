import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProjectContent } from "./components/project-content";

function ProjectSkeleton() {
  return (
    <>
      <div className="h-7 w-64 animate-pulse bg-neutral-800 sm:h-8" />
      <div className="mt-2 mb-4 h-4 w-96 max-w-full animate-pulse bg-neutral-800" />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-4">
          <div className="aspect-video w-full animate-pulse border border-neutral-800 bg-neutral-800" />
          <div className="border border-neutral-800 bg-neutral-950/80 p-6">
            <div className="mb-4 h-6 w-40 animate-pulse bg-neutral-800" />
            <div className="space-y-2.5">
              <div className="h-4 w-full animate-pulse bg-neutral-800" />
              <div className="h-4 w-full animate-pulse bg-neutral-800" />
              <div className="h-4 w-5/6 animate-pulse bg-neutral-800" />
              <div className="h-4 w-3/4 animate-pulse bg-neutral-800" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 animate-pulse bg-neutral-800" />
            <div className="h-6 w-20 animate-pulse bg-neutral-800" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-5 w-32 animate-pulse bg-neutral-800" />
            <div className="h-8 w-8 animate-pulse bg-neutral-800" />
          </div>
          <div className="border border-neutral-800 bg-neutral-950/80 p-6">
            <div className="mb-4 h-6 w-32 animate-pulse bg-neutral-800" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border border-neutral-800 bg-neutral-900 px-3 py-2"
                >
                  <div className="h-10 w-10 animate-pulse bg-neutral-800" />
                  <div className="h-4 w-24 animate-pulse bg-neutral-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default async function ProjectPage(props: {
  params: Promise<{ hackathonId: string; id: string }>;
}) {
  const { hackathonId, id } = await props.params;

  return (
    <div className="min-h-screen text-neutral-200">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Link
          href={`/${hackathonId}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>

        <Suspense fallback={<ProjectSkeleton />}>
          <ProjectContent hackathonId={hackathonId} submissionId={id} />
        </Suspense>
      </main>
    </div>
  );
}
