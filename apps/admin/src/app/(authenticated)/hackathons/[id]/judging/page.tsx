import { getJudgingData } from "@/app/actions/judging";
import { JudgingConfig } from "./components/config";

interface JudgingPageProps {
  params: Promise<{ id: string }>;
}

export default async function JudgingPage({ params }: JudgingPageProps) {
  const { id } = await params;
  const { tracks, judges } = await getJudgingData(id);

  return <JudgingConfig hackathonId={id} tracks={tracks} judges={judges} />;
}
