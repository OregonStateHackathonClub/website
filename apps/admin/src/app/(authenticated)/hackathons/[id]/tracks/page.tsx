import { getHackathonTracks } from "@/app/actions/hackathons";
import { TracksClient } from "./tracks-client";

interface TracksPageProps {
  params: Promise<{ id: string }>;
}

export default async function TracksPage({ params }: TracksPageProps) {
  const { id } = await params;
  const tracks = await getHackathonTracks(id);

  return <TracksClient hackathonId={id} tracks={tracks} />;
}
