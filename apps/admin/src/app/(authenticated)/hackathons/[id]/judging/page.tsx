import { getJudgingData } from "@/app/actions/judging";
import { JudgingClient } from "./judging-client";

interface JudgingPageProps {
  params: Promise<{ id: string }>;
}

export default async function JudgingPage({ params }: JudgingPageProps) {
  const { id } = await params;
  const { tracks, judges } = await getJudgingData(id);

  return <JudgingClient hackathonId={id} tracks={tracks} judges={judges} />;
}
