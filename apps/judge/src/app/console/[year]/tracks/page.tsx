// admin only
// see the tracks, create new tracks, add rubrics to tracks (each track can have one rubric)
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
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
    <div className="flex min-h-screen w-full flex-col bg-white">
      <Navbar />
      <div className="flex-1 p-10 text-black">
        <h1 className="mb-6 text-center font-bold text-4xl text-black-900">
          Tracks
        </h1>
        <Table>
          <TableCaption>
            Create or view current tracks, and add rubrics to tracks.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Prize</TableHead>
              <TableHead className="w-[120px]">Rubric</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track) => (
              <TableRow key={track.id}>
                <TableCell className="font-medium">{track.name}</TableCell>
                <TableCell>{track.description}</TableCell>
                <TableCell>{track.prize || "N/A"}</TableCell>
                <TableCell>
                  <RubricDialog
                    trackId={track.id}
                    trackName={track.name}
                    createRubric={createRubric}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TrackDialog yearParam={yearParam} createTrack={createTrack} />
      </div>
    </div>
  );
}
