// admin only
// see the tracks, create new tracks, add rubrics to tracks (each track can have one rubric)
import { Navbar } from "@/components/navbar";
import { prisma } from "@repo/database";
import { createTrack } from "./server-action";
import { TrackDialog } from "./createTrack";
import { RubricDialog } from "./createRubric";
import { createRubric } from "./server-action";

export default async function Page(props: {
  params: Promise<{ year: string }>;
}) {
  const params = await props.params;
  const yearParam = params.year;

  const tracks = await prisma.track.findMany({
    where: { hackathonId: yearParam },
    select: {
      id: true,
      name: true,
      description: true,
      prize: true,
    },
  });
  return (
    <div className="flex min-h-screen w-full flex-col bg-neutral-50">
      <Navbar />
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-medium text-2xl text-neutral-900 tracking-tight">
              Tracks
            </h1>
            <p className="ml-1 mt-1 text-neutral-500 text-sm">
              {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            </p>
          </div>
          <TrackDialog yearParam={yearParam} createTrack={createTrack} />
        </div>

        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white py-16 text-center">
            <p className="text-neutral-500 text-sm">No tracks yet</p>
            <p className="mt-1 text-neutral-400 text-xs">
              Create your first track to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="group rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium text-neutral-900 text-sm">
                      {track.name}
                    </h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {track.description}
                    </p>
                    {track.prize && (
                      <p className="text-neutral-500 text-xs">
                        Prize: {track.prize}
                      </p>
                    )}
                  </div>
                  <RubricDialog
                    trackId={track.id}
                    trackName={track.name}
                    createRubric={createRubric}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
