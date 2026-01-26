import { getHackathonTracks } from "@/app/actions/hackathons";
import { TracksManager } from "./components/tracks-manager";

interface TracksPageProps {
  params: Promise<{ id: string }>;
}

export default async function TracksPage({ params }: TracksPageProps) {
  const { id } = await params;
  const tracks = await getHackathonTracks(id);

  return <TracksManager hackathonId={id} tracks={tracks} />;
}
