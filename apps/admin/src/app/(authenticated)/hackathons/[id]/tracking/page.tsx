import { getTrackingData } from "@/app/actions/tracking";
import { Tracker } from "./components/tracker";

interface TrackingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ round?: string; track?: string }>;
}

export default async function TrackingPage({
  params,
  searchParams,
}: TrackingPageProps) {
  const { id } = await params;
  const { round, track } = await searchParams;
  const data = await getTrackingData(id, round, track);

  return <Tracker hackathonId={id} data={data} />;
}
