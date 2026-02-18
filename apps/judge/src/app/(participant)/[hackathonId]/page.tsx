import { Skeleton } from "@repo/ui/components/skeleton";
import { ChevronDown, Filter, Heart, Trophy } from "lucide-react";
import { Suspense } from "react";
import { GalleryContent } from "./components/gallery-content";

function GallerySkeleton() {
  return (
    <div className="min-h-screen text-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Skeleton className="h-7 w-48 rounded-none bg-neutral-800" />
          <Skeleton className="mt-2 h-4 w-72 rounded-none bg-neutral-800" />
        </div>

        {/* Filter bar — static text, no loading state */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center border border-neutral-800 bg-neutral-950/80 text-sm text-neutral-200">
            <div className="flex items-center gap-2 px-4 py-2">
              <Filter className="h-4 w-4" />
              <span className="whitespace-nowrap">Filter by track:</span>
            </div>
            <div className="h-5 w-px bg-neutral-800" />
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400">
              <span>All Tracks</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 border border-neutral-800 bg-neutral-950/80 px-4 py-2 text-sm text-neutral-200">
            <Trophy className="h-4 w-4" />
            Winners
          </div>

          <div className="inline-flex items-center gap-2 border border-neutral-800 bg-neutral-950/80 px-4 py-2 text-sm text-neutral-200">
            <Heart className="h-4 w-4" />
            Most Liked
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-full flex-col overflow-hidden border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm"
            >
              <Skeleton className="aspect-video w-full rounded-none bg-neutral-900" />

              <div className="p-4 pb-2">
                <Skeleton className="h-[27px] w-3/4 rounded-none bg-neutral-800" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Skeleton className="h-[22px] w-24 rounded-none bg-neutral-800" />
                </div>
              </div>

              <div className="grow px-4 py-2">
                <Skeleton className="h-5 w-full rounded-none bg-neutral-800" />
              </div>

              <div className="p-4 pt-0">
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-[30px] w-[82px] rounded-none bg-neutral-800" />
                    <Skeleton className="h-[30px] w-[90px] rounded-none bg-neutral-800" />
                  </div>
                  <Skeleton className="h-[30px] w-[42px] rounded-none bg-neutral-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function Page(props: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = await props.params;

  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryContent hackathonId={hackathonId} />
    </Suspense>
  );
}
