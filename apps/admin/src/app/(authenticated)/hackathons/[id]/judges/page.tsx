import { getHackathonJudges } from "@/app/actions/hackathons";
import { JudgesClient } from "./components/judges-table";

interface JudgesPageProps {
  params: Promise<{ id: string }>;
}

export default async function JudgesPage({ params }: JudgesPageProps) {
  const { id } = await params;
  const judges = await getHackathonJudges(id);

  return <JudgesClient hackathonId={id} judges={judges} />;
}
